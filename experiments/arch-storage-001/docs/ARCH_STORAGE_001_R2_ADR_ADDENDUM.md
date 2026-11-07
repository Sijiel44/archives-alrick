# ARCH-STORAGE-001.R2 — Addendum à ADR-001 : lecture atomique, A renforcé vs B

**État : proposition / prototype isolé / non arbitré DG** · 6 novembre 2026 · 01 BUILDER. **BASE IMMUTABLE** : PR #104 `f84f8c54361b3701ebb0251700f2d0d09d4acf4d`. Le présent addendum *complète* `ADR-001_STORAGE_OPTIONS.md` ; il ne remplace ni les contrats DG003, ni le P0 PR #95, ni le travail de 04 ARCHIVES.

## 1. Défectuosité initiale et correction bornée

| Dimension | Avant #104 | Après R2 | Preuve attendue |
|---|---|---|---|
| Export `Campaign` / `EventJournal` | `Promise.all([txReadCampaign(id),getEvents(id)])`, **deux transactions** `readonly` indépendantes ; un commit entre elles pouvait donner deux révisions incompatibles ou un refus `JOURNAL_INCONSISTENT`. | `readConsistentSnapshot(id)` lance `campaigns.get(id)` et `events.getAll(range)` dans **une transaction `readonly` unique couvrant les deux object stores**. Les deux résultats sont clonés et retournés à `tx.oncomplete`, puis SHA/archivage hors transaction. | Navigateur, deuxième onglet qui commet *pendant* l'export : archive à l'ancienne révision et journal associé, ou erreur explicite avant production d'octets ; jamais un mélange silencieux. |
| Panne avant `readwrite` | Abort de `campaigns`+`events` déjà prouvé B03 | Invariant conservé | B03 et nouvelle recette de quota simulé |
| Accusé perdu après commit | Idempotence via `eventId` déjà prouvée B04 | Invariant conservé | B04 sur le même checkout final |
| Ancien onglet et version DB | `db.onversionchange=()=>db.close()` sans état local explicite | `closed=true` avant fermeture ; les appels de l'ancienne connexion retournent `DB_CLOSED`, pas de write silencieux. `DB_VERSION=1` reste figé pour ce banc ; une base passée à 2 refuse la réouverture en 1 (`VersionError`). | Upgrade réel avec deux connexions coopératives ; puis connexion ancienne *non coopérative* bloquant volontairement l'upgrade jusqu'à fermeture explicite, sans `deleteDatabase`. |
| Quota | Pas de scénario quantifiable | `injectFailure:'quota'` provoque un abort forcé de la transaction `readwrite`; aucune suppression de l'agrégat ; retour `QUOTA_EXCEEDED_SIMULATED`. | Intégrité avant/après dans les **deux stores** ; **pas** un test de disque réellement plein. |
| Export transportable hors profil | B08 transférait des octets entre contextes Chrome | R2 écrit de **vrais octets dans un fichier de test temporaire** sur disque de la CI, puis lit dans un autre contexte Chrome vierge, importe en confirmation et réexporte octet-exact. | Protocole B17. Pas de vraie campagne, ni partage externe. |

**Frontière transactionnelle exacte.** `readConsistentSnapshot` ouvre `db.transaction(['campaigns','events'],'readonly')`, enfile **immédiatement** `get` + `getAll`, ne fait aucun `await` entre les deux requêtes, puis livre `{campaign,journal,dbVersion}` à `tx.oncomplete`. La transaction est fermée avant l'opération SHA256. Une écriture ayant commencé après la fermeture peut rendre le résultat *ancien* mais ne peut le rendre contradictoire. Les tests de concurrence créent intentionnellement cette fenêtre, avec un hook de synchronisation **injecté seulement dans l'essai**, sans modifier le protocole de commit. Une erreur pendant lecture/refus de cohérence empêche l'export.

## 2. A renforcé et B : mêmes commandes/fixtures, pas une simulation de l'interface historique

La **référence A de production** reste le stockage L003/DG004 (enveloppe privée, sources brutes et adaptateurs ARCHIVES). Pour une comparaison *reproductible* des invariants, `src/a-guard.mjs` propose un **banc A renforcé**, non un remplacement de L003 : `localStorage` contient un seul JSON `{schema,campaign,journal}` par clé. Le `setItem` de l'enveloppe entière est indivisible au niveau de cette clé. Il possède contrôle de révision au début de la commande, journal et retour d'erreur quota. **Il ne possède aucun compare-and-swap atomique entre onglets.** Ce défaut est volontairement laissé visible dans le test, plutôt que maquillé en garantie.

| Contrôle sur fixtures IDENTIQUES (2 PJ, créature, 2 scènes, note privée, stat 14) | A renforcé (banc localStorage) | B (IndexedDB) |
|---|---|---|
| Commandes séquentielles et snapshot R7 | Attendues égales | Attendues égales |
| Journal 7 entrées | Attendues égales | Attendues égales |
| Archive SHA/bytes sur fixture initiale | Attendues égales | Attendues égales |
| Événement déjà appliqué | `duplicate` | `duplicate` |
| Quota simulé | `setItem` rejeté, ancienne valeur encore lisible | `abort` unique des deux stores, ancienne valeur intacte |
| Deux onglets avec même `expectedRevision`, interleaving forcé | **Échec de sûreté démontrable** : deux retours `committed`, une mise à jour écrasée | Un `committed`, l'autre `STALE_REVISION` |
| Export pendant écriture de l'autre onglet | Enveloppe unique = cohérente **pour une lecture instantanée** mais *non garantie* face à des écritures concurrentes non sérialisées | Snapshot transactionnel cohérent au moment du read, même si sa révision est antérieure |
| Future migration des fichiers officiels | La référence A actuelle est la seule source de vérité legacy | Non réalisée ; n'importer l'historique qu'après certification ARCHIVES |

L'option C (nouvelle fondation) demeure hors périmètre R2. **Avis technique 01 BUILDER** : garder A comme chemin de lecture et retour arrière, ne faire progresser B que par protocole de compatibilité et contre-audit. La documentation de 20 STUDIO (#101) demande également A et B sur un banc identique. **Avis conjoint 04 ARCHIVES : en attente de réponse explicite sur R2**, et non présumé acquis. Les notes précédentes d'ARCHIVES privilégient déjà conservation des originaux, validations de SHA, refus de suppression et absence de migration imposée ; cela ne constitue pas un accord sur le modèle R2.

## 3. Détails de preuve et risques résiduels

Exécution minimale **dans un clone descendant du HEAD R2 exact** :

```sh
npm ci
npm test
node --test experiments/arch-storage-001/tests/contracts.test.mjs experiments/arch-storage-001/tests/r2-contracts.test.mjs
CHROMIUM_PATH=/chemin/vers/google-chrome-stable python experiments/arch-storage-001/tests/browser.spec.py
CHROMIUM_PATH=/chemin/vers/google-chrome-stable python experiments/arch-storage-001/tests/browser-r2.spec.py
```

`browser-r2.spec.py` exige le serveur loopback propre à la fixture, n'ajoute aucun `unsafe-eval` et n'ouvre aucun service public. Les packages Python Playwright sont des dépendances **du harnais CI uniquement**, pas du site ou du dépôt npm.

- **Risque quota réel / éviction** : non couvert par injection ; quota plein et suppression par navigateur doivent être testés sur profil jetable, jamais celui du créateur. Les mutations refusées ne doivent pas appeler `deleteDatabase` ou `localStorage.clear`.
- **Risque crash disque / durabilité** : `durability:'strict'` ne prouve pas une panne d'alimentation ; tester via une campagne fictive sur OS/navigateurs ciblés, et préserver une archive hors profil.
- **Risque upgrade DB** : nouvelle version à migrer par étapes, verrou inter-onglets et signal `versionchange`; un onglet qui ignore cet événement bloque effectivement l'upgrade. Aucun upgrade automatique de données historiques par ce banc.
- **Risque export/permissions** : l'archive est CONFIDENTIELLE, JSON non chiffré. Le SHA détecte l'altération mais n'authentifie pas l'origine ni les droits d'accès ; aucune intégration joueur dans le banc.
- **Risque import** : `commitImport` contrôle l'identité d'un preview en mémoire et refuse les collisions ; ce n'est pas un validateur de documents historiques ni un moteur de migration. La version finale doit conserver octets bruts, inconnus et états de restitution différenciés (propositions/jeu/canon).
- **Risque A vs B** : un test A simulé n'est pas une mesure de tous les adaptateurs L003, dont l'ordre de sérialisation des inconnus doit être certifié indépendamment. A n'est pas considéré globalement « mauvais » : il peut être consolidé pour un périmètre mono-onglet/transition explicite, mais doit refuser le multi-éditeur sans mécanisme de verrou éprouvé.
- **Risque OPFS** : inchangé ; hors scope. Aucun couplage de commit IDB/OPFS sans protocole de staging et compensation.

## 4. Conditions d'arbitrage DG et contre-avis d'ARCHIVES

1. 04 ARCHIVES certifie l'inventaire des schémas réels, la source brute, la compatibilité des SHA et les règles de restauration/collision, et donne un **avis daté et signé sur A renforcé vs B**, acceptant ou réfutant les limites ci-dessus.
2. 02 QA / 03 REVUE répètent les cas R2 sur SHA gelé, y compris ancien onglet, quota réel si possible, export dans un **autre navigateur** et volume représentatif de sources sans fuite ; expliciter NON EXÉCUTÉ.
3. 20 STUDIO arbitre messages de conflits/versionchange/retry, preuve de persistance avant état « Sauvegardé », comportement lecteur privé et fenêtre joueur.
4. 21 ATELIERS confirme l'absence de duplication `pendingStudioOp` et le lien définition→variante→instance dans une transaction effectivement délimitée ; tout geste numérique demeure délégué MATH/INDEX.
5. DG choisit A/B/C ou hybride **après** ces contributions, et ouvre un mandat distinct pour tout basculement. Aucune migration ni suppression automatique d'anciens magasins.

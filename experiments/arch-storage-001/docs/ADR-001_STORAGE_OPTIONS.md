# ADR-001 — ARCH-STORAGE-001 — Architectures de persistance (PROPOSITION, NON ARBITRÉE)

**6 novembre 2026 · 01 BUILDER / P1-A**. À examiner avec **04 ARCHIVES**, **20 STUDIO**, **10 MATH**, **11 INDEX**, **02 QA**, puis **00 DG**. Aucun changement de schéma canon, formule 5d6, dépôt public, PR #95, migration ni déploiement.

## 1. Sources examinées et limites de preuve

- Base applicative **PR #85 `2ab809ef5351940e0fc272b859d10f21de894d00`**, candidat d'intégration P0 séparé **PR #95 `b75e7f03af625fa1f09782cde4e480c2c6d21c84`** (non modifié).
- `experiments/dg-lot003/src/storage/storage.mjs` blob Git `be6a881018ae1709ecef71c3c5a155acfb94a658` : enveloppe `cer.studio.dg003.provisional.v0`, source v2/v3 SHA256, `previewImport/commitImport`, `exportPrivate/previewRestore/commitRestore`, source ≤2 Mio, export privé ≤16 Mio, sans persistance implicite.
- `experiments/dg-lot003/tools/runtime.mjs` : adaptateur de sauvegarde navigateur avec sérialisation, pointeur localStorage et IndexedDB au-delà de 4 Mio ; validation/restauration native et conservation d'octets bruts. **Cette persistance est propre à l'intégration L003, pas une couche transactionnelle commune entre tous les documents du monde.**
- `experiments/dg-lot003/src/studio/CONTRACT.md` blob `ef9b3d26c6660f7ff10d22f6186abed1c00a20e4` : `storage.load/save/previewRestore/restore/exportPrivate`, copié dans Studio, `Campaign` local, `Scene` et `privateNotes`, projection whitelist vers origine joueur 4174, aucune règle interne.
- `experiments/dg-lot003/src/ports/index.ts` blob `07154546e2258c3795f2608bc2ef93e20d5beac2` : ports `DocumentReader`, `RulesGateway`, `CatalogResolver`, `CharacterImport`, `BestiaryAdapter` sans duplication des moteurs.
- PR #95 : intégration des modules L004 XP/INDEX/créateurs ; le SHA cité demeurait **P0 non qualifié** au constat du lot précédent (Chrome scénarios XP et scène). La réussite de l'architecture P1 ne change pas ce statut.
- Guide et UX antérieurs réutilisés sans réinitialisation : `L004_REPAIR_BUILDER_20261105/GUIDE_PRISE_EN_MAIN_CREATEUR.md` et `PROPOSITION_UX_STUDIO_ATELIERS.md` dans le dossier local du projet.
- Informations navigateur externes : MDN IndexedDB / transactions, stockage/quota et OPFS (liens en fin). Ces propriétés de plateforme **ne démontrent pas** l'aptitude du produit actuel à migrer.

## 2. Comparatif A / B / C

| Critère | A — Consolider L003/L004 | B — Persistance web commune IndexedDB | C — Nouvelle fondation locale |
|---|---|---|---|
| Réemploi existant | Très élevé : enveloppe et adaptateur `createValidatedStorage` | Élevé : conserve adaptateurs, remplace seulement le commit local | Variable : réemploie moteurs et fichiers comme références via anti-corruption |
| Coût initial **estimatif relatif**, pas de devis | **Faible à moyen** ; corriger points de fuite et révision par interface | **Moyen** ; schéma versionné, transactions, journal, migrations, multi-onglets | **Élevé** ; nouvelle coque, interfaces et réintégration progressive |
| Maintenance long terme | **Moyenne à élevée** si couches locales particulières prolifèrent | **Moyenne** une fois contrats et migration stabilisés | **Élevée d'abord** ; potentiellement meilleure après amortissement |
| Transactions campagne + événements | Non garanties comme un agrégat commun dans l'existant | **Oui** via une même transaction `readwrite` sur stores visés, commit/abort | Dépend de la fondation choisie ; si B en dessous, même garanties |
| Concurrence multi-onglets | Risque de deux états concurrents sans contrat de révision transversal | Version attendue + journal d'idempotence, refus de révision obsolète | Doit réimplémenter/consommer une stratégie équivalente |
| Offline | Bon (local Storage/IndexedDB déjà), bornes et éviction à connaître | Bon si assets/ports locaux ; origine et quota à maîtriser | Bon **seulement si conçu hors ligne dès le départ** |
| Migration / compatibilité | Minimale en première phase, dette de formats | Adaptateurs versionnés + preview et double conservation | Plus coûteuse ; risque de casser les anciens usages |
| Retour arrière | Simple tant que format inchangé | Possible si old store non touché et export source intact | Plus complexe (deux interfaces et modèle) |
| Risque P0 confidentialité | LocalStorage non chiffré ; origin MJ doit rester distinct | IndexedDB **non chiffré** par l'application ; mêmes risques d'origine et de profil | Aucun gain sans modèle d'accès et protocole de projection |
| Gros fichiers / médias | Déjà stratégie IndexedDB pour grandes archives | Métadonnées IDB ; **OPFS uniquement après tests et seuils** | Libre, mais coûts de portabilité et sauvegarde accrus |
| Verdict à ce stade | **Référence minimale à préserver** | **Hypothèse prometteuse, banc P1-A réalisé** | **Option de repli/long terme, NON choisie** |

**Orientation de travail, pas décision DG :** conserver A comme référence importable/rollback et mettre B à l'épreuve par le banc isolé. Ne pas engager C ni migration de l'univers tant qu'une revue ARCHIVES/STUDIO et un inventaire de sauvegardes n'ont pas passé les critères de non-perte.

## 3. Proposition de modèle de domaine — 12 objets distincts

Ce sont des **types candidats**, non des schémas adoptés. `id` est une identité stable **à l'intérieur de sa portée** ; un code éditorial n'est jamais un identifiant d'instance.

| Type | Identité et rôle | Référence, frontière de propriété, état privé/public |
|---|---|---|
| `Campaign` | `campaignId`, `revision`, `rulesetRef` ; agrégat MJ | Possède sessions, personnages de campagne, scènes, notes, journaux ; données privées |
| `Session` | `sessionId`, `campaignId` ; séance jouée / interlude | Référence une campagne, journaux/résumés et participants ; hors statut canon |
| `Character` | `characterId`, `sourceRef`, `rawSnapshot` | Distingue fiche brute importée du profil de règles et de la copie MJ ; champs inconnus privés |
| `CatalogReference` | `catalogRefId`, `documentCode`, `definitionId`, `version`, `provenance` | Pointer une définition source immuable, avec SHA/version, sans la modifier |
| `CampaignInstance` | `instanceId`, `campaignId`, `catalogRefId`, `profileId` | Copie de créature/objet dans la campagne, provenance stable, état contextuel MJ |
| `Scene` | `sceneId`, `campaignId`, `sessionId?`, `revision` | Participants, description *candidate* publique, notes privées séparées |
| `Encounter` | `encounterId`, `sceneId`, `instanceIds` | Assemblage de rencontre ; aucun résultat de combat recalculé en persistance |
| `CreatorDraft` | `draftId`, `kind`, `status`, `sourceSnapshot`, `version` | Objet/capacité/sort/rite en atelier ; proposition locale non canonique |
| `PrivateNote` | `noteId`, `campaignId`, `sceneId?`, `text`, `scope:'mj'` | Sensible ; **jamais** dans le DTO joueur |
| `EventJournal` | `campaignId`, `eventId`, `seq`, `kind`, `payloadDigest/intent` | Commandes confirmées, révision et correction append-only ; audit des décisions sans pouvoir magique |
| `MediaAsset` | `assetId`, `sha256`, `mime`, `size`, `rights`, `alt`, `visibility` | Médias sous droit et quota ; stockage binaire optionnel distinct des références publiques |
| `ExportManifest` | `formatVersion`, `confidential`, `campaignId`, `sha256`, `sourceInventory` | Archive privée vérifiable, originaux octet-exact, provenance/versions ; contrôle de confidentialité |

La **source de vérité temporaire** dans le banc B est le couple atomique `Campaign` (snapshot revisionné) + `EventJournal` (intention idempotente). Les autres entités sont des champs du snapshot **uniquement pour la simulation** : il serait prématuré de figer la normalisation des stores ou relations avant avis ARCHIVES et STUDIO.

## 4. Frontières de transaction et règles de concurrence (option B)

1. Toutes les écritures de campagne passent par `applyEvent({campaignId,eventId,expectedRevision,kind,payload})`. Le navigateur ouvre une **transaction IndexedDB `readwrite` unique** couvrant `campaigns` **et** `events` ; les lectures/écritures se font dans la transaction, sans `await` réseau entre requêtes IDB. Les calculs de règles sont exclus.
2. **Idempotence :** même `eventId` et même commande => réponse `duplicate`, aucune réécriture ; même ID et contenu différent => `ID_COLLISION`. Les tentatives redémarrées après perte d'accusé sont sûres en fonction de cette clé.
3. **Optimistic concurrency :** nouvelle commande à `expectedRevision` obsolète => `STALE_REVISION` ; l'UI doit recharger/proposer un conflit, jamais écraser silencieusement. Deux onglets ont la même base, pas deux autorités.
4. **Échec atomique :** `abort()` avant commit annule à la fois le snapshot et la ligne d'événement ; une perte d'accusé *après* commit n'annule rien. Une coupure secteur au niveau disque reste hors du périmètre de cette simulation ; la durabilité `strict` est un **indice demandé au navigateur**, pas une certification matérielle.
5. **Journal minimal** : le banc conserve intention/signature et `seq`, pas les secrets verbatim en double. Pour vraie opération d'audit, discuter avec ARCHIVES journal chiffré ou redaction et retention ; le prototype ne résout pas l'audit forensique.
6. **Export** : lire `Campaign` + `EventJournal` puis vérifier cohérence `len(journal)==revision`, SHA256, format et bornes. Pour une édition concurrente pendant export, **la lecture multi-stores devra être dans une seule transaction `readonly`** en production ; le banc lit séquentiellement puis contrôle la révision, donc une nouvelle édition concurrente peut produire un `JOURNAL_INCONSISTENT` au lieu d'une copie cohérente. Ce cas est une **réserve explicite à corriger avant adoption B**.
7. **Import** : preview SHA256 + vérification de structure, puis **transaction de création sans remplacement** dans les deux stores ; collision de `campaignId` => refus, état ancien intact. La version finale devra invalider la preview si les octets changent avant commit (banc : le jeton de preview contient une copie, et aucune restauration distante).
8. **Schéma IDB** : `versionchange` doit fermer les anciens onglets. Exiger gestion claire des `blocked` et choix de stratégie de migration par version. Pas de suppression/renommage automatique de l'ancien store.

**Ne jamais prétendre** que SHA256 est une preuve d'authenticité ; c'est un contrôle d'intégrité. Pas d'authentification MJ, de chiffrement d'archive, de résolution automatique des conflits entre joueurs, de serveur réseau, ni de transaction commune à plusieurs origines.

## 5. OPFS : proposition très limitée, non implémentée

OPFS peut devenir pertinent pour des médias volumineux ou snapshots binaires récurrents : `MediaAsset` sous chemin privé au digest, métadonnées et droits dans IndexedDB. **Mais** une transaction IDB et une écriture OPFS ne partagent pas de commit atomique. Il faudrait un protocole *staging → hash → record `pending` → commit → reclamation* pour pouvoir réparer les fichiers orphelins et les références manquantes après panne. Donc **pas d'OPFS pour les petites campagnes du banc**, pas de dépendance directe des événements aux fichiers sans journal de récupération. OPFS n'est pas un répertoire partagé visible ni un remplacement d'export utilisateur ; il est soumis aux quotas/effacements de l'origine.

## 6. Confidentialité et confiance

- Séparer une origine **MJ** et une origine **joueur** dans la future interface ; uniquement DTO strictement construit par liste blanche, sans objet campagne, note, asset privé ou source en pièce jointe. Le prototype P1 utilise une **seule origine MJ** à 127.0.0.1:4181 et **n'implémente aucune fenêtre joueur** : aucune preuve de confidentialité inter-origines n'est revendiquée.
- CSP locale `connect-src 'none'`, `frame-ancestors 'none'`, liste fixe de fichiers servis, aucune API HTTP de modification, aucun serveur public. Le profil du navigateur reste une frontière de confiance **faible** : détenteur de la session peut lire IndexedDB ; ne jamais l'utiliser pour des secrets réels sans contrôle distinct.
- Toute source importée est non fiable : limite de taille, JSON pur (pas de getter/`__proto__`), jamais HTML injecté, aperçu en texte, confirmation et journal d'erreur sans secret.
- Les options offline et stockage persistent dépendent des quotas, du navigateur et des paramètres d'effacement : demander une archive utilisateur séparée et proposer `navigator.storage.estimate()` / `persist()` seulement avec consentement clair. **Offline = fonctionnement de la page servie sans appels réseau, pas garantie de disponibilité après arrêt de tout serveur local** ; proposer PWA/service worker seulement après revue sécurité.

## 7. Plan de transition sans pertes (aucune migration exécutée)

**T0 — Audit par 04 ARCHIVES :** inventorier les clés LocalStorage/IndexedDB de L003/L004, schémas `alrick.sheets.v1/v2/v3`, `alrick.campaign.v1/v2`, `alrick.grimoire.v1`, `alrick.bestiary.v1`, champs inconnus, média/licences et volumes réels. Ne pas considérer les données internes de ce banc comme un nouveau canon.

**T1 — Sauvegarde indépendante :** avant test, export binaire de chaque campagne / original de fiche, empreintes SHA256 et manifest de versions ; conserver un exemplaire hors du profil, vérifier restauration sur copie. Aucun nettoyage des clés existantes.

**T2 — Import en lecture seule :** adaptateurs `SourceDocumentReader`, `LegacyCampaignReader`, `CatalogResolver`; détecter type/version, identifier les éventuels 1–N fiches, préserver les octets bruts et les inconnus. Toutes conversions proposées en *preview* ; collisions bloquées et compteurs contrôlés. Aucun recalcul de moteur 5d6.

**T3 — Shadow write comparatif (données fictives) :** faire tourner A et B côte à côte à origines/profils isolés ; comparer snapshots, SHA, identités, revisions, journal, tailles, timing, coûts et latence 1280/768/390. Refuser promotion si perte d'un seul champ inconnu.

**T4 — Contrôles P0/P1 :** tests pannes avant/après commit, 2 onglets, rechargement, source bruts 14, archive ≥6 Mio, stockage plein, upgrade de version, quota, navigateur/tablette, canaris MJ, export joueur, indisponibilités. Recette QA/REVUE sur SHA exact.

**T5 — Décision DG seulement :** choisir A/B/C ou hybride et un format d'enveloppe, planifier migration opt-in par campagne avec sauvegarde vérifiée et rollback vers ancien code/ancien stockage. Pas de suppression automatique des anciennes données ; changement de code/Pages/serveur uniquement sur autre mandat.

## 8. Critères de recevabilité de la preuve du banc P1

B01 données **2 PJ**, 1 copie créature, 2 scènes, 1 note, score brut 14 ; B02 deux vrais onglets ; B03 panne et `abort()` ; B04 accusé perdu après commit et retry idempotent ; B05 un gagnant et un `STALE_REVISION` ; B06 persistance après reload ; B07 SHA/collision/tamper ; B08 export-import dans profil vierge et octets identiques ; B09 origin local uniquement ; B10 contrôle des largeurs 1280/768/390. Pannes disque, navigateur Safari/Firefox, quota réel, OPFS, lecteur d'écran : **NON EXÉCUTÉS** même si Chrome passe.

## Sources publiques de plateforme

- MDN IndexedDB, transactions : https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB
- MDN transaction durability : https://developer.mozilla.org/en-US/docs/Web/API/IDBDatabase/transaction
- MDN quotas/effacement : https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria
- MDN OPFS : https://developer.mozilla.org/en-US/docs/Web/API/File_System_API/Origin_private_file_system

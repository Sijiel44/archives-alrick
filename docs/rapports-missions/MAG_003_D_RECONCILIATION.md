# MAG-003.D — Réconciliation technique Grimoire G-001, rites et Tables T-001

**Audit du 1er novembre 2026** · **PR MAG-003.D :** [#72](https://github.com/Sijiel44/archives-alrick/pull/72) (DRAFT) · **Source :** branche #71 head `72e83c6e545db698cd06758d7ac5eca82b5c42b8` ; référence G-001 #55 head `76cabcd7423e83264099063c6e1ac76d80677027` ; T-001 #66 head `f4d8831304a93aaa1e2c8bb0e1dc08db59de87e4`.

## 1. Comparaison des fichiers de G-001 (#55) et de la branche expérimentale C/D

Comparaison des contenus **réellement récupérés des deux branches** par GitHub, blobs SHA et texte :

| Chemin | SHA dans #55 | SHA dans D | Constat |
| --- | --- | --- | --- |
| `quartz/components/Atelier5d6.tsx` | `91ead0255a9487e5a8c634c37e19a3be8531a834` | **identique** | Aucune refonte du panneau Grimoire G-001 |
| `scripts/test-5d6-grimoire.mjs` | `ed61bc047f63f633dc1cabd10007f96a8192f69c` | **identique** | Régressions d'origine conservées |
| `docs/GRIMOIRE_5D6_V1.md` | `874b3154c5fd75ccbf86812d8bdf301c3c6edb58` | **identique** | Règles et limites d'origine conservées |
| `scripts/fixtures/5d6-parity-v1.json` | `6fe5607ae41847834d89343d66768d308538486a` | **identique** | Références mathématiques M01/M03 conservées |
| `quartz/components/scripts/atelier5d6-grimoire.ts` | `1b98f2fed99f0b1cb63b240fad700b98e4f0cad1` | `4f6d97ce1a6e57b427be6a0d22651a8ec0db899f` | **Écart volontaire** : callback optionnel `onManaChanged` lors des consommations de sorts/entretiens |
| `quartz/components/scripts/atelier5d6.inline.ts` | `b43a0e6e156e3af638173d08335592d646791781` | `d7dcef7f1356294bcf3466e763643ac626f49e62` | **Écart volontaire** : extension de fiche `ritualWorkshop`, panneau, gestion du ledger et callbacks |

Les fichiers identiques sont vérifiés par **SHA de blob**, pas par ressemblance visuelle. L'audit porte sur les heads observés à cette date : un changement ultérieur de #55 doit déclencher un **nouveau diff à trois voies** avant toute fusion.

## 2. Conservation des invariants G-001

- Identité des sorts : `id`, `version`, origine/statut, apprentissage, préparation et prérequis conservés ; démonstrations toujours non canoniques.
- Cercles : distinction entre **concevoir, comprendre, assister, activer** ; activation MAG-050 par matrice préparée possible sans enseigner le Cercle de construction ; pratique IX non attribuée par niveau.
- Matrices : référence `itemId` pointant vers un **objet existant** ; `architectureCircle`, `activationCircle`, `energySource`, `charges` laissés intacts.
- Export/import : `alrick.grimoire.v1`, `alrick.sheets.v3`, `alrick.campaign.v2`, données `legacyOriginal` et avertissements de migration ; `ritualWorkshop` est une extension optionnelle **distincte**, et non un remplacement du Grimoire.
- Sorts et entretenus : le callback observe le mana **après** exécution G-001, puis inscrit une dépense personnelle dans MAG-003.A lorsqu'un registre compatible existe. Il ne remplace pas la transaction G-001 et n'écrit jamais la charge de matrice.

**Conflit ouvert :** G-001 consomme aujourd'hui une charge même avec `energySource="caster"`. La sémantique énergétique (réserve physique, nombre d'utilisations, usage combiné) **n'est pas décidée**. Aucune conversion automatique de `charges` vers `energyStored` ou `usesRemaining` ; documenter les originaux et effectuer une future migration **réversible, explicite, sous approbation du créateur**.

## 3. États d'import et anomalies non résolues

- Si la fiche et le ledger de récupération ont un mana différent, MAG-003.C/D bloque le gain suivant. Le système ne devine pas si la correction doit passer par un débit, une recharge, un jour supplémentaire ou une intervention MJ.
- Un import isolé réattribuant l'identifiant d'une fiche peut conserver un ledger lié à l'ancien personnage : **blocage intentionnel**, sans réassociation silencieuse.
- Une contribution B historique de type soutien sans rôle/compétence prouvés demeure en archive, mais ne valide plus un **nouveau** bonus ; les résultats passés ne sont pas réécrits.
- Des sauvegardes historiques réelles exhaustives, notamment matrices orphelines, modifications manuelles et imports de très anciennes fiches, **n'ont pas été échantillonnées humainement** ; un audit ciblé reste une condition d'intégration.

## 4. Limite des Tables #66 et futur contrat

Le contrat réel `docs/TABLES_IMPORT_VERSION_T001.md` de T-001 décrit `alrick.tables.local.v2`, `alrick.tables.character.v2`, `campaignInstanceId` distinct de `origin.sourceId`, imports **partiels** (statistiques, maîtrises, résistances et ressources) et exclusion du Grimoire, inventaire, sorts, matrices, journaux, signatures et pouvoirs. Il possède déjà `actionId` (reçus durables), `expectedRevision` (anti-conflit), ACL serveur PJ/MJ et jet 5d6 serveur, mais **aucune commande rituelle multi-participants**.

**Future API à concevoir et à valider avant exécution :**
1. `ritual_prepare` : références à une unique `campaignInstanceId`, `ritualInstanceId`, version de définition, participants propriétaires des fiches d'instance, contributions et ressources ; simulation sans aucun débit.
2. `ritual_review` : vérifier rôle/authenticité du MJ et consentement des joueurs, droits de Cercle, ressources et conditions de lieu ; rejeter les versions ou identités divergentes.
3. `ritual_commit` : commande `actionId` idempotente, `expectedRevision` sur chaque fiche, verrou/transaction atomique **tous participants ou aucun**, vérification et consommation serveur, publication des reçus après persistance.
4. `ritual_resume` / `ritual_cancel` : reprise après ACK perdu, interruption, rejeu, état de commit durable, refus si incomplet ; secrets MJ filtrés par rôle.
5. `ritual_export` / `ritual_import` : sauvegardes versionnées cohérentes (recettes, ressources, reçus, journaux, provenance), migrations vérifiées et restauration sans débit répété.

**Ce paragraphe est une spécification de travail, PAS du code livré ni une promesse de réseau.** Aucun transfert de mana, aucun effet, aucune synchronisation et aucun bouton « validation serveur » n'existent dans MAG-003.D.

## 5. Méthode recommandée pour une intégration ultérieure

1. Relever les heads exacts de #55, #66, #69, #70, #71 et #72 le jour de la revue ; geler des fixtures de sauvegarde.
2. Réconcilier A puis B puis C/D avec `main` à travers une PR **distincte autorisée** ; éviter toute substitution unilatérale de `Atelier5d6.tsx` ou `atelier5d6.inline.ts`.
3. Réappliquer de façon isolée les deux hooks G-001 et l'extension `ritualWorkshop` ; conserver tous les attributs inconnus, journaux et identifiants.
4. Exécuter `npm test`, les suites G-001 et MAG-003.A/B/C/D, la recette Chrome et les tests d'import/export sur **copies** de sauvegardes historiques.
5. **Ne pas intégrer de données de Tables en direct** sans mise en œuvre et audit d'une opération serveur transactionnelle ; ne pas migrer `charges` sans contrat énergétique approuvé.
6. Obtenir séparément l'accord éditorial/canonique, l'autorisation de fusion et l'autorisation de déploiement. Les résultats d'un test ne constituent aucun de ces accords.

## 6. Preuve d'audit et statut

Les corrections D sont testées par `scripts/test-mag003d.mjs` (46 assertions) et deux parcours Chrome supplémentaires, dans la [CI de code #41326549809, réussie](https://github.com/Sijiel44/archives-alrick/actions/runs/41326549809). Le dernier head documentaire et la recette humaine restent à vérifier avant acceptation par la Direction.

**Verdict :** pas de conflit destructif démontré avec G-001 sur les heads audités ; **conflit sémantique d'énergie non tranché** et **intégration transactionnelle Tables indisponible**. Ces sujets sont des blocages explicites de l'intégration définitive.

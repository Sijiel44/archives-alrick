# P1 STUDIO — passation DG, BUILDER, ARCHIVES, ATELIERS

**Date : 2026-11-06. Statut : conception P1 livrée ; aucun test navigateur P1 exécuté ; pas d'arbitrage A/B/C.** Source produit DG003/DG004 consultée ; contributions uniquement dans le sous-arbre `experiments/dg-lot004/tests/studio/p1/**` d'une branche distincte. Aucun toucher PR #95, PR #98, site public, canon ou formule.

## Livrables STUDIO

1. `ARCH_STORAGE_001_BESOINS_STUDIO.md` : parcours MJ, campagne/sessions/scènes/participants, notes privées, projection whitelist, interruption/reprise, ID local/offline et comparaison A/B/C + questions ouvertes.
2. `ARCH_STORAGE_001_SCENARIO_NAVIGATEUR.md` : recette **non exécutée** 2 PJ + créature + 2 scènes + 2 canaris + panne avant/après + deux onglets MJ + fenêtre joueur autre origine + export/import + offline/accessibilité.
3. `UX_STUDIO_001_PARCOURS.md` : deux modes guidé/avancé sur même modèle, navigation, erreurs et conflits, palette proposée ardoise/cuivre/or, clavier/tablette/contrastes/images/privé-public.

## Répartition proposée du travail et questions d'arbitrage

| Responsable | Travail et décision attendus | Dépendance de STUDIO |
|---|---|---|
| **01 BUILDER** (chef architecture) | Comparer A/B/C, écrire diagramme de données et contrats d'interface ; choisir seulement après preuves et coûts. Définir navigation/états d'un shell P1. | Restituer type d'accusé « durable » et politique deux onglets. |
| **04 ARCHIVES** (chef stockage) | Définir unité de transaction, mode/identité, versionnement, révisions, save/reload, CAS ou verrou, quota/éviction, migration non destructive, politique sauvegardes/médias. | Exposer `load` attesté et error codes, préserver octets/unknowns ; jamais suppression étrangère. |
| **21 ATELIERS** (créations) | Assurer `pendingStudioOp` privé avant effet et reprise durable du **même ID**. Valider conception des modes guidé/expert et événements créateurs sans effet numérique. | Corrélation des `operationId` encore non décidée ; blocage si restauration ancienne ambiguë. |
| **05 INTÉGRATION** (P0) | Finir la copie propriétaire, vrai ARCHIVES/ATELIERS, Chrome 4173/4174, CI au HEAD exact ; **ne pas intégrer les documents P1 comme du code P0**. | Livrer uniquement résultats P0 réels, sans reporter un PASS P1. |
| **02 QA / 03 REVUE** | QA indépendante P0 d'abord ; élaborer test P1 dérivé du scénario après arbitres, reproductibilité et preuve par SHA. | Exiger PASS/FAIL/NON EXÉCUTÉ et vérifier secrets/rollback. |
| **00 DG** | Arbitrer mode multi-onglets, A/B/C, portée de la session, seuil d'accessibilité et calendrier de conception après preuves. | Aucun changement de canon/site/outil actuel sans ordre distinct. |

## Comparatif de décision à soumettre à DG

- **A : stockage existant renforcé** → faible coût initial ; doit prouver non-perte sur concurrence et crash. Un wrapper seul ne suffit pas si la promesse est transactionnelle sur plusieurs clés.
- **B : IndexedDB commun** → candidat pertinent pour transaction d'une campagne, scénarios multi-onglets et données plus volumineuses ; exige migration progressive testée, non destructrice, et garde du profil local/offline.
- **C : nouvelle fondation** → considérer seulement si BUILDER/ARCHIVES établissent objectivement que A et B échouent aux invariants requis ; ne pas reconstruire pour les couleurs ni pour conserver à tout prix l'ancien schéma.

**Préférence d'étude STUDIO** : comparer A et B en petits prototypes réels avec le **même** banc de recette (document 2) ; garder C option de repli justifiée. **Décision finale au responsable et DG.**

## Critères d'acceptation transversaux

- Un état privé ne se retrouve jamais dans DTO/DOM/messages/stockage/export **joueur** ; aucune publication automatique au restore ou après switch de scène ; `PLAYER_CLEAR` correctement transmis.
- Exactement 2 PJ et 1 créature instance après rechargement et échec/réessai ; identités stables, sources brutes/unknowns conservés.
- 2 scènes distinctes, 2 notes privées distinctes, participants conservés ; choisir A après B persiste ; session P1 explicite si retenue.
- Deux onglets ne perdent pas silencieusement un changement ; message de conflit et issue de récupération.
- Une archive précédente sans journal ou avec deux instances candidates ne peut pas provoquer de lien auto ; aucune restauration destructrice de clé étrangère.
- Offline testé **après** disponibilité du shell local ; pas d'Internet ouvert ou d'assets distants ; note que l'application statique actuelle n'est pas un serveur de rôles.
- Contrastes, clavier, lecteur d'écran, reflow tablette et images : non considérés conformes sans recette instrumentée + humaine.

## Références de code/documentation consultées (SHA exacts)

- DG003 ARCHIVES `experiments/dg-lot003/src/storage/storage.mjs` blob `be6a881018ae1709ecef71c3c5a155acfb94a658` ; contrat `7390b1872db0d2199404c394d1df8e21c8af2678`.
- DG003 STUDIO `experiments/dg-lot003/src/studio/CONTRACT.md` blob `ef9b3d26c6660f7ff10d22f6186abed1c00a20e4` ; fenêtre joueur `src/player/index.mjs` blob `fed7091c044bac004521d9ff0ad0d632a37752ba`.
- DG004 STUDIO `src/studio/demo-storage.mjs` blob `57f38f946c9592e9bd75462ff7e4a91e25b0b756`, `src/studio/demo.mjs` blob `2f9f239af4dfcec8c790bec20d3b2533e9dba7b9`, proposition CSS `2083c9f5b050ff6133eeff61c891cad49f70bf8c`.
- BUILDER PR #96 HEAD `ee3f428843fea64a285366032e677c5bc7284b9d` : `builder/docs/PASSATIONS_STUDIO_INTEGRATION.md` blob `a701af5f6d625ec896760fa6b378008018f0ee1e`.
- ATELIERS PR #100 source de contrat de reprise étudiée `cycle-state.mjs` blob `5554b3b12728f0e63388beccec2c58b29b214281` ; vérifier le **HEAD le plus récent** au moment du futur banc, ne pas figer une ancienne version comme intégrée.
- `content/jouer/architecture-tables-multijoueur.md` blob `9f0154f21643ad6ec7848e53c9b8d850881cc592` ; `docs/CONTINUITE_SAUVEGARDES.md` blob `0b86aa53ce6c3718dd964120da427c3a50d081bf`.
- Pour les exigences DG, se référer à l'ordre de reprise de la conversation et au [commentaire DG #6675770853](https://github.com/Sijiel44/archives-alrick/pull/95#issuecomment-6675770853). **Ne pas considérer ces exigences comme une preuve d'implémentation.**

## Preuves et limites

- **Exécuté** : lecture des sources GitHub et production/relecture documentaire de ces quatre fichiers ; conformité des chemins et blobs à vérifier après commit.
- **NON EXÉCUTÉ** : prototype A/B/C, test navigateur isolé, tests multi-onglets, tablette/lecteur d'écran réels, migration, `npm test`, Chrome et CI P1. **Pas de chiffre PASS inventé.**
- **Non demandé/non fait** : migration de données historiques, mise en œuvre CSS, édition branche #95, merge, publication, serveur distant, révision canon/formules M01–M05.

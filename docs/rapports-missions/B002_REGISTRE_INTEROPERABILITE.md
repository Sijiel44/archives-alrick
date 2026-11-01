# ARCHIVES D'ALRICK — RAPPORT TECHNIQUE B-002

**Mission :** B-002 — Registre central et interopérabilité du Bestiaire  
**Date :** 31 octobre 2026 (Québec ; workflows datés du 1er novembre en UTC)  
**Référent :** registre documentaire et interopérabilité 5d6  
**Dépôt :** Sijiel44/archives-alrick  
**Branche :** bestiaire/b002-registre-interop  
**PR :** [#67](https://github.com/Sijiel44/archives-alrick/pull/67), **en brouillon**, sans fusion automatique  
**Base auditée :** merge de [#56](https://github.com/Sijiel44/archives-alrick/pull/56) dans main, commit **4ce058b6b18d553de36dbea356e968757efad71c**.

## 1. État de la dépendance, autorité et réserves

L'API GitHub confirme PR #56 **fusionnée**, et le commit main ci-dessus correspond à son merge. L'API des reviews de #56 a retourné **zéro revue formelle** : l'intégration technique est vérifiée, mais le rapport ne prétend pas démontrer une approbation éditoriale formelle hors GitHub. Le créateur commande expressément B-002 ; cela **n'approuve pas** les conventions de nouveaux codes, les publications MJ ou les relations biologiques.

Règles suivies : CONTRAT_EDITORIAL.md (sources CB précises, fiches à code stable, statut/état/visibilité indépendants, Rappelés distincts des Revenants, droit éditorial avant publication), documents B-001/B-001.1/B-001.2, M03–M05 et le contrat M05_CONTRAT_BESTIAIRE_DOCUMENTAIRE.md. Les sept prototypes restent des propositions ; aucun canon, code historique, niveau ou calcul 5d6 n'a été modifié.

## 2. Sources directement examinées et limites

- **Git :** arbre récursif du commit 4ce058b, non tronqué ; chemins de content/creatures, personnages, groupes, lieux, monde, modeles, docs, scripts et métadonnées du dépôt ; contenu de B001_REGISTRE_INITIAL.json ; contrats éditoriaux et de compatibilité B-001/M05 ; exemples de dragons, individus, index et prototypes ; configuration npm/CI.
- **Brut et consolidations :** aucune source primaire CB35–CB39 distincte n'apparaît dans les 750 blobs de ce commit. Des fiches dérivées citent CB35–CB39 (par exemple lions CB39, chroniques CB37/CB39 et personnages CB39), **sans constituer une relecture du brut original**. Les volumes privés V01–V06, l'index directeur privé et leurs originaux Atlas/Compendium ne sont pas présents comme fichiers sources de cet arbre ; leur mention antérieure en B-001 ne signifie pas nouvelle consultation en B-002.
- **Accès de travail :** le connecteur GitHub a permis les lectures et écritures ; clonage Git local impossible (résolution DNS github.com). Par conséquent, aucune exécution locale de npm ou Chrome n'est revendiquée. La CI de la PR, avec versions et SHA propres, sert de preuve d'exécution.

## 3. Inventaire Git et couverture vérifiable

| Mesure | Résultat constaté | Interprétation |
| --- | ---: | --- |
| Blobs de l'arbre Git source | **750** | Toutes extensions, instantané du main de base, hors nouveaux livrables B-002 |
| Fichiers dans les six racines cibles | **277** | 17 créatures, 135 personnages, 2 groupes, 76 lieux, 35 monde, 12 modèles |
| Fichiers Markdown de créatures | **17** | Comprend deux propositions hors sous-ensemble initial de 15 |
| Entrées historiques B-001 | **21** | Pas 21 espèces |
| Clés de registre B-001 | **21 distinctes** | Clés techniques, non codes canoniques |
| Codes historiques non nuls B-001 | **10 distincts** | DRG-01/02/03 ; IMP-13/48 ; REV-13/16 ; CRE-CB39-LIONS-EDRIC-MAELYA ; MAG-088/098 |
| Entrées B-001 sans code | **11** | Aucune attribution automatique |
| Liens source B-001 vers fichiers présents | **17** | Relations de fiche/dossier, **non** taxons, non profils 5d6 |
| Références B-001 avec fichier déclaré cassé | **0** | Sur les 17 références renseignées seulement |
| Entrées sans chemin principal | **4** | b001-018 à 021 : contrôle externe requis |
| Relations n:n 5d6 validées | **0** | Aucune sauvegarde ou instance documentaire représentative attestée |
| Doublons des 10 codes B-001 | **0** | Contrôle élargi : 195 codes de fiches distincts, zéro doublon |
| Frontmatters cibles lus par CI | **277** | 228 avec publish:true, 120 avec spoilers:true |
| Contrôle B-002 / liens explicites | **1 984 assertions, 0 doublon** | 1 089 liens wiki parcourus ; 0 cible explicite absente |

**Livrable de snapshot :** docs/bestiaire/B002_INVENTAIRE.json. Chaque blob porte son chemin, SHA Git, taille, périmètre ; les entrées reliées à B-001 conservent nom/code/statuts du relevé historique et leur provenance. Les autres champs sont explicitement marqués « arbre et nom de fichier uniquement » ; **code_candidat_nom_fichier n'est pas un code vérifié**.

**Enrichissement dynamique contrôlé :** scripts/test-b002-registre.mjs lit directement les frontmatters YAML et les renvois documentaires des **277 Markdown cibles** dans la CI, reconstitue leurs codes/noms/catégories/statuts, observe les doublons et les liens, et produit artifacts/b002/inventaire-enrichi.json (ou artefact Actions équivalent). Le snapshot n'est pas maquillé en relecture exhaustive de contenu ; le JSON enrichi de la CI est à conserver avec sa preuve d'exécution. Les relations issues de liens wiki sont des **renvois éditoriaux**, non preuves de parenté ou de classification.

## 4. Registre central et catégories de preuve

**Livrable :** docs/bestiaire/B002_REGISTRE_RELATIONS.json. Il reprend les **21 lignes de B-001**, codes et alias conservés, statut et sources sans les promouvoir. Ses 17 relations « fiche_ou_dossier_source » sont établies **au sens existence du chemin + correspondance B-001**, non au sens vérité zoologique de tous les paragraphes. Il a **zéro relation espèce–individu automatiquement approuvée et zéro correspondance profil 5d6 approuvée**.

| Degré de preuve | État B-002 | Exemples |
| --- | --- | --- |
| **Établi** | Identités B-001 relevées et chemins présents dans Git (17 associations) ; conservation des dix codes connus | DRG-01→thessoryn.md ; IMP-13→irindra.md, avec protections |
| **Probable** | Aucun lien biologique inscrit automatiquement ; indices nécessitant retour aux sources | Relations de lignée draconique sans code d'espèce et biomes de préférence |
| **Proposé** | Schéma n:n, futures familles/biomes/profils, conventions ESP/FAMT/INDC/BIO/P5C/VARC | Spécification extérieure au JSON M05, sans activation |
| **Impossible à vérifier ici** | Quatre entrées sans chemin principal et sources primaires absentes | Dros, chèvre projetée, MAG-088 et MAG-098 ; originaux CB35–CB39 |

Les codes historiques DRG, REV, IMP, CRE et MAG sont préservés ; FAM- des familles de personnages n'est pas reconverti en famille taxonomique. Les onze code:null sont conservés. Les candidats proposés ne sont **pas approuvés**.

## 5. Matrice des conflits et arbitrages

| ID | Situation / risque | État des preuves | Action / décision attendue |
| --- | --- | --- | --- |
| C01 | 11 entrées B-001 sans code permanent | Établi | Ne pas attribuer d'IDs ; arbitrer sujet par sujet |
| C02 | « Aldren le loup » (REV-16) et Aldren humain de Valbrume | Homonymie documentée par B-001 | Maintenir deux identités ; revoir index et alias |
| C03 | « Harald le lion » (REV-13) et Harald Forgecœur | Homonymie documentée | Aucun transfert d'identité ; ne pas confondre avec lions invoqués |
| C04 | « Phénix » (IMP-48) | Individu distinct, nom non probant biologiquement | Aucun nouveau taxon ; ne pas affirmer reproduction |
| C05 | Édril/Maërys dans un dossier CRE commun | Fiche dossier + deux individus sans code | Préserver code collectif ; séparer les personnalités sans inventer d'espèce |
| C06 | Sept prototypes MJ publiés / proposition_non_jouee | Conflit de politique évoqué en B-001 | Arbitrer publication d'aides jouables ; ne pas dépublier mécaniquement |
| C07 | Irindra IMP-13 / affinités propres / spoilers | Fiche à avertissement, code historique attesté | Ne pas déduire niveau 25 actuel, pouvoirs de lignée ou liens publics |
| C08 | CB35–CB39 mentionnées dans dérivés | Brut primaire absent du dépôt | Relecture obligatoire avant nouvel état canonique |
| C09 | MAG-088 / MAG-098 et Dros / chèvre sans fiche source directe | b001-018…021 ont fichier_principal:null | Ne pas inventer une page de destination ni une relation de profil |
| C10 | index-brouillons-cb42.md : canon_statut « brouillons » | **Détecté en CI** : valeur absente des statuts autorisés, publish:false | Exception héritée explicitement surveillée ; corriger uniquement après arbitrage éditorial |
| C11 | Deux dossiers de créatures hors liste initiale de 15 | 17 fichiers présents dans l'arbre | Contrôler propositions supplémentaires, aucun nouveau canon |
| C12 | Alias, titres de fiches et codes de brouillons du reste du corpus | Métadonnées complètes soumises au test B-002 | Examiner le rapport enrichi et désambiguïser sans écraser l'histoire |
| C13 | Lien public issu de documentaryLink seul | Contrat M05 interdit l'activation | Maintenir le refus ; tout pipeline exige autorisation réelle |

**Doublons avérés :** aucun doublon de code parmi les dix codes historiques B-001. Les homonymes C02/C03 et le dossier collectif C05 sont des **rapprochements à protéger**, pas des doublons de fiches à supprimer. Le contrôle transversal du contenu de la CI complète cette observation ; tout problème hors registre doit être remonté sans suppression automatique.

## 6. Interopérabilité 5d6 et navigation

**Spécification :** docs/bestiaire/B002_SPEC_INTEROPERABILITE.md. Le code permanent de l'encyclopédie, la clé technique b001 et l'ID local de BestiaryCard sont **trois identités distinctes**. Le futur lien n:n devrait porter documentaryId, profileNamespace (sauvegarde ou modèle distinct), profileId, version de lien, source, preuve, type et schéma/ruleset M03. Aucune statistique ou capacité ne circule automatiquement d'un individu vers une espèce.

M05 conserve **documentaryLink principal déclaratif** dans l'extension de alrick.bestiary.v1 ; readDocumentaryLink n'est pas muté ; canOfferDocumentaryLink reste faux. Les exemples d'export alrick.sheets.v3, ruleset m03-bestiary et bestiarySource ne sont pas réécrits. Le contrôle B-002 refuse tous les liens publics par défaut, y compris en présence d'un id, d'un statut documentaire favorable ou de publicPath. La preuve d'un droit de publication n'est pas un booléen déclaratif.

**Navigation recommandée, non implémentée** : index central consultable par espèce, individu, famille, biome, adaptation 5d6 et degré de preuve, sans déplacer les anciennes pages ; pages spoiler/unlisted exclues des listes publiques. Aucun changement massif de slug, aucune édition des biographies ni de la navigation actuellement publiée.

## 7. Tests, reproduction et preuves

**Commandes prévues dans la PR #67 :**
- npm ci ; npm test (dont check:content, TypeScript, build Quartz, check:site, M01–M05, B-001.1 et nouveau test:b002) ;
- npm run test:m04:browser, par le workflow de la PR ;
- test:b002 : unicité des clés et codes de registre, existence des chemins, intégrité du snapshot, comparaison frontmatter/registre, valeurs de statuts, exceptions héritées identifiées, spoilers/unlisted, absence de liens publics et d'association 5d6 implicite ; compatibilité de l'extension documentaire préservée par le contrat M05 existant.

**Première CI de diagnostic :** [Actions #41268115266](https://github.com/Sijiel44/archives-alrick/actions/runs/41268115266) — échec ciblé du nouveau test en raison de C10 ; npm ci, check:content (369 pages / 269 codes publiés uniques), TypeScript, build, check:site (1 111 pages / 64 434 liens), suites M01–M05 (dont 1 390 assertions M05) et B-001.1 (1 321) avaient réussi. Le navigateur est sauté sur ce run en échec. Le test a été affiné pour signaler C10 comme exception ancienne non publiée **sans l'effacer**.

**CI complète confirmée VERTE :** [workflow #41268362926](https://github.com/Sijiel44/archives-alrick/actions/runs/41268362926), commit **ee701034480c73c4f5d8ea3fe6354ef82ef3933f** : npm ci, npm test avec **1 984 assertions B-002**, **277 frontmatters**, **195 codes différents**, **0 code dupliqué**, **0 statut invalide non excepté**, **1 exception de brouillon historique contrôlée**, **0 protection spoiler manquante**, **1 089 liens wiki parcourus** dont **0 lien explicite absent** ; TypeScript/Quartz/site/M01–M05/B-001.1 réussis. npm run test:m04:browser a réussi **15 scénarios Chrome / 7 dialogues**. Artefacts : intégrité B-002 **#13068610066** et captures Chrome **#13068308205**. Les changements de rapport postérieurs au SHA de ce workflow ne modifient pas le code ni les tests ; vérifier la CI de tête avant fusion.

## 8. Livrables, limites et décisions de Direction

**Livrables déposés :** B002_INVENTAIRE.json ; B002_REGISTRE_RELATIONS.json ; B002_SPEC_INTEROPERABILITE.md ; scripts/test-b002-registre.mjs ; extension npm test et collecte CI ; présent B002_REGISTRE_INTEROPERABILITE.md ; FICHE_DIRECTION_B002.md ; fiche Word remise en conversation.

**Limites ouvertes** : relecture des sources brutes CB35–CB39 ; rapprochements Atlas/Compendium originaux ; attribution des onze codes nuls ; résolution des homonymes ; exceptions historiques de statuts ; statut de publication des sept prototypes ; définition/approuvation des noms futurs et de l'autorité de liens publics ; profils 5d6 réels et anciennes sauvegardes de test.

**Décisions requises du créateur et de la Direction** : (1) approuver ou rejeter les préfixes et la responsabilité du registre ; (2) arbitrer l'exposition des propositions MJ et spoilers ; (3) confirmer la méthodologie d'identification des espèces/individus/biomes ; (4) autoriser séparément toute future connexion publique, si souhaitée ; (5) fournir/vérifier les CB35–CB39 ; (6) valider la clôture B-002 avant B-003.

**Statut : TERMINÉE AVEC RÉSERVES — tests B-002, M01–M05 et recette Chrome confirmés verts sur le commit ee70103 ; validation éditoriale toujours requise.** La base technique existe et reste soumise à validation. **Aucune fusion automatique ; aucune mission B-003 lancée.**


## 9. Addendum de validation éditoriale du créateur — B-002.1 (31 octobre 2026)

**Décision expresse :** le créateur autorise l'intégration de la PR #67 et adopte pour les **nouvelles fiches** les préfixes `ESP-`, `FAMT-`, `INDC-`, `BIO-`, `P5C-`, `VARC-`. Les codes historiques restent inchangés. Cette décision n'autorise pas à attribuer automatiquement les onze codes absents de B-001 ni à transformer une proposition en canon.

**Mise en œuvre :** `CONTRAT_EDITORIAL.md` fixe la décision et le contrôle fiche par fiche ; `docs/bestiaire/B002_CODES_VALIDES.json` contient les six préfixes approuvés et la table d'attributions individuelles, initialement vide ; `B002_REGISTRE_RELATIONS.json` enregistre le statut adopté ; `B002_SPEC_INTEROPERABILITE.md` précise la différence entre adoption des préfixes et validation de chaque code ; les quatre modèles spécialisés renvoient au registre. Le test `test:b002` parcourt aussi les fiches réelles sous `content/` : toute nouvelle fiche utilisant ces préfixes doit avoir un code unique, un chemin identique au registre, sa source, les statuts conformes et une preuve de validation explicite du créateur. Ce contrôle de conformité ne remplace pas le jugement éditorial humain.

**Correction de métadonnée :** l'index CB42 non publié, auparavant `canon_statut: brouillons`, passe à `a_verifier` ; son contenu narratif, son code historique et `publish:false` ne changent pas. Cette opération retire l'exception héritée sans canoniser une fiche.

**Points délibérément laissés ouverts :** les sept prototypes MJ restent `proposition_non_jouee` sans modification automatique de publication ; les onze entrées sans code restent sans attribution ; l'accès aux sources primaires CB35–CB39, les liens n:n, les pouvoirs de créature, les tests de sauvegardes historiques, les playtests et les liens publics M05 restent à valider séparément. **Aucune fiche nouvelle codée, aucune règle M03 modifiée, aucune publication Pages déclenchée.**

**Validation technique :** reprendre les workflows GitHub Actions sur le dernier commit de la PR, puis consigner leur résultat avant fusion. L'autorisation du créateur porte sur ces changements documentaires et le mécanisme de validation ; tout changement ultérieur doit être recontrôlé.


### Preuve de recette après adoption éditoriale — commit `0ad2e0d`

[GitHub Actions #41269203598](https://github.com/Sijiel44/archives-alrick/actions/runs/41269203598) : **completed / success** sur `0ad2e0d1aea7f87ac8ad01d279368a0b6dfaee24`. `npm ci`, `npm test`, TypeScript, Quartz, contrôle de liens et `npm run test:m04:browser` réussis.

**Résultats de la CI :** **1 998 assertions B-002**, **1 321 assertions B-001.1/B-001.2**, **1 390 M05**, **277 fiches de périmètre**, **195 codes uniques**, **0 doublon**, **0 protection spoiler manquante**, **0 statut canonique invalide**, **0 exception `brouillons`**, **6 préfixes approuvés**, **0 attribution individuelle nouvelle**, **1 089 renvois wiki**, **0 cible explicite manquante**, **15 scénarios Chrome et 7 dialogues** réussis. Les résultats sont automatisés : aucun playtest humain revendiqué.

**Décision :** les six préfixes sont approuvés et la fusion de B-002 est autorisée par le créateur ; le registre n:n et les liens publics restent désactivés jusqu'à décision spécifique. Les codes attribués à chaque nouvelle fiche devront être validés avec source et preuve avant fusion. La CI de la tête documentaire finale et celle de `main` après fusion seront à distinguer.

# DG-REV-002 — Revue consolidée du lot DG-LOT-002

Mandat : lancement et validations étayées approuvés par le créateur. Gouvernance PR #78 à `82d6b4c1096c7faa12da6b80ff09b82e11b9f259`. Source applicative figée : `88f774f3d0d6d520d8d11443b72202b9caf4f94b`. Diagnostic et documents seulement ; aucune modification des formules de production, du canon ou du site public.

## Verdict et niveaux de preuve

Le diagnostic de non-application de l'effet structuré `absorption` M03 est validé techniquement. La protection ordinaire reste distincte et fonctionne dans les témoins observés. La sémantique d'une correction n'est pas adoptée par ce diagnostic. L'Alpha v0.1 n'est pas certifiée.

Les résultats des référents sont attribués à leurs auteurs. Une lecture de rapport n'est pas une nouvelle exécution. Les bancs Python et contrats isolés valident leur modèle ; ils ne certifient pas les importateurs, transactions ou interfaces de l'application.

| Mission | Validation possible | Réserve / blocage |
|---|---|---|
| MATH-001.R1 | Diagnostic M03 et méthode recevables ; rapport original lu | Banc MATH : M03 exact mais dépendances partielles ; recette UI et suite complète non exécutées par MATH |
| COMBAT-001 | Analyse des options et contre-exemple de pénétration recevables | Absorption réactive après pénétration recommandée, encore candidate ; propriétaire, durée et coût/réaction ouverts |
| INDEX-001.R1 | Reprise des fixtures, traçabilité et banc isolé | Schéma v0.2 trop permissif : bornes natives et coût « non applicable » ; parité mécanique, permissions et objet numérique non homologués |
| ARCH-001.R1 | Méthode et 12 scénarios synthétiques rapportés ; rapport original lu | Aucun importateur TS exécuté par ARCHIVES ; CI existante apporte une couverture partielle distincte ; pas de restauration Alrick |
| QA-001.R1/R2 | Plan de preuve et revue limitée du diagnostic ; 19 identifiants conservés comme 18 Alpha +1 publication | Pas de certification Alpha ; tests DOM/messages/stockage, appareils et partie réelle restent dus |
| MAG | Cartographie statique, séparation plan/débit ; rapport original lu | Débit fiche avant callback ledger non bloquant, anti-rejeu global et durabilité non démontrés |
| OBJETS | Analyse statique et contrat isolé recevables | 9 tests de modèle ne prouvent pas atomicité multi-fenêtre ; mana + charge pour caster est comportement observé, pas règle nouvellement adoptée |
| BUILDER / STUDIO | Orientation de réemploi et spécification locale, sans moteur concurrent | Contrats candidats ; cockpit, confidentialité applicative et restauration de bout en bout non homologués |

## Preuve directe de cette session

PR brouillon #79 : https://github.com/Sijiel44/archives-alrick/pull/79. Branche dédiée `audit/dg-lot-002-revue-4159dc16`, créée sur la référence applicative ; aucune branche propriétaire tierce modifiée.

Trois fichiers intégraux récupérés au commit figé, empreintes Git recalculées et conformes :
- M03 : `09929f1b852a971d73d40474847bae036bf11ffb` ;
- progression : `d2040829ea0da7c0f6eae08dc8c701226bfc53c5` ;
- probabilities : `bfee984fad47902623f7117e9f024a5b6e042d2d`.

Node v24.22.1, effacement natif des types TS, chargeur limité à la résolution des imports locaux. Aucune fonction mécanique réécrite.

```bash
node --experimental-loader ./scripts/dg-lot002-loader.mjs scripts/dg-lot002-reproduction.mjs
```

Résultat : effet absorption +2 approuvé et accepté ; résultats complets strictement identiques avec et sans effet (total33, seuil22, impact15, protection3, absorbé3, dégâts12). Témoin positif : impact+2 augmente les dégâts bruts de2. Code de sortie0. Sortie, versions et empreintes dans `DG_LOT_002_PREUVE_M03.json`.

Cette assertion décrit le défaut actuel. Elle ne constitue pas un test vert d'une correction ni l'homologation d'une règle future. MATH rapporte séparément 156 comparaisons sur six niveaux pondérées par 46656 issues ; leur banc est distinct et n'a pas été réexécuté par cette session.

## Décisions de revue dans le mandat approuvé

1. Diagnostic M03 accepté comme anomalie reproductible. Conserver les chemins legacy et M01–M05 ; aucune adoption MATH-002.
2. COMBAT recommande une réduction réactive après pénétration. Conserver cette option au dossier candidat ; la validation du diagnostic ne tranche pas une formule de gameplay.
3. INDEX v0.2 reste expérimental. Un JSON Schema accepté n'autorise pas une opération mécanique. Effet absorption et objet numérique bloqués jusqu'au contrat et validateur adéquats.
4. Les 12 scénarios ARCHIVES et la restauration synthétique sont acceptés dans leur portée. Aucune migration réelle ni restauration produit homologuée.
5. Prioriser le risque Grimoire/ledger et les reçus de dépense. Les rites collectifs restent des plans `applied:false` ; aucun débit serveur supposé. `energySource=caster` dépense mana+charge dans le code lu, sens des charges à préciser.
6. Conserver 19 IDs QA : 18 Alpha + QA-PUB-01. Magnitudes valides absorption : +1/+2 ; valeur négative = test de rejet, pas effet autorisé.
7. Le parcours local demeure campagne → PJ → référence/copie créature → scène → projection publique par liste blanche → export/restauration. Une fenêtre de même origine n'est pas une frontière de confidentialité suffisante.

## CI réellement observée

Au commit de preuve `c4ad7b3802d6dd0c70cd128351d4571a350755e3`, run https://github.com/Sijiel44/archives-alrick/actions/runs/41772114103 :
- `npm ci` : succès ;
- `npm test` : succès (suite existante ; le nouveau diagnostic n'y a pas été ajouté) ;
- `npm run test:m04:browser` : échec démarrage Chromium, « Impossible d'obtenir le port de Chromium », ligne160 du script ;
- aucune capture M04 produite ; build et contrôles ultérieurs non exécutés dans ce run.

Ce premier run global est en échec. Cette erreur d'amorçage ne prouve pas une régression mécanique.

Au commit documentaire suivant `e350fb430ce6fa56a9337cc9afa2c4b5d3e6132b`, run https://github.com/Sijiel44/archives-alrick/actions/runs/41773168794 : **succès global**, `npm ci`, `npm test` et `npm run test:m04:browser` réussis. Logs du job126387369400 lus : **22 scénarios Chrome, 10 dialogues**, notamment import/export Bestiaire, migration fiches v2/v3 et campagne v1/v2, extensions inconnues, récupération et cérémonie simulée. Artefact `recette-m041-ci`13296295278 produit (SHA2560207a0621d5a087c9cb6118beed9c6d51a5bd883b783fdc1390eaad566536e01).

Cette couverture applicative existante est une preuve supplémentaire directement vérifiée via la CI, distincte des essais ARCHIVES. Elle n'homologue ni les douze nouveaux scénarios sur tous les importateurs, ni une restauration indépendante Alrick, ni le futur cockpit Studio. Le nouveau diagnostic M03 n'est pas raccordé à npm test ; sa preuve est l'exécution locale documentée. Les étapes affichées ne permettent pas de revendiquer un build séparé supplémentaire. Le dernier SHA documentaire et son propre état CI sont consignés dans la transmission finale, sans assimiler le succès d'un autre SHA au sien.

## Complément de clôture — livrables finaux reçus

Les rapports originaux INDEX, BUILDER et STUDIO ont maintenant été lus, au-delà des réponses intermédiaires.

- **INDEX PR #81** : HEAD `db4238d271004516ea2edff210a0d6d05e733d84`, brouillon ouvert ; workflow41773261087 réussi. 89 correspondances structurelles et suites8/20/36 isolées. Deux tests PASS détectent des permissivités du schéma, ils n'homologuent pas les entrées invalides. `normalizeSpell` force version1/statut campagne : conserver la source brute avant toute normalisation et faire auditer la restitution.
- **BUILDER PR #80** : HEAD `499b6ee8317ee9dcbf1409c985a2741fea4d0667`, brouillon ouvert ; workflow41773233297 réussi. Deux documents seulement, banc27/27 de contrat, pas de cockpit implémenté.
- **STUDIO** : spécification et rapport originaux locaux reçus ; 28 tests Python et banc Chromium11 PASS/1 non exécuté sur `about:blank` avec contenu injecté, sans Quartz. Le contrôle non exécuté est celui de l'accès au stockage d'une origine réelle. Accepter les résultats dans ce banc, aucune certification de confidentialité applicative.
- **Écart d'interface explicite** : BUILDER propose `entre-rives.studio.project.v0-proposal`, STUDIO `cer.studio.campaign.v0-proposition`. Ce sont des noms candidats distincts ; aucune compatibilité ni adoption implicite. Une enveloppe unique doit être définie par STUDIO/ARCHIVES/INDEX avant intégration.
- **CI PR #79 documentaire** : au HEAD `2b32907ee9d4ad3e3872c89a30ac8dfaa2f709b4`, workflow41773448682 terminé en succès. Les ajouts de clôture ultérieurs exigent leur propre vérification et sont identifiés dans la transmission DG finale.

Les suites existantes vérifiées en CI renforcent une couverture partielle des imports natifs. Elles ne transforment pas les essais isolés des référents en recettes applicatives de leurs contrats nouveaux. Les avis croisés MATH/ARCHIVES/QA sont centralisés dans DG ; leur réception est déclarée uniquement après lecture.

## Portes de sortie restantes

| Porte | Propriétaires | Preuve attendue |
|---|---|---|
| Sémantique absorption | COMBAT, MATH, DG | Propriété défenseur, ordre de pénétration, cumul, durée et version ; test attendu approuvé avant correction |
| INDEX | INDEX, MATH, ARCHIVES, QA | Bornes natives, incohérences coût, permissions, adaptateurs et parité sur sources réelles |
| Sauvegardes | ARCHIVES, STUDIO, QA | Import/export/réimport officiels, champs inconnus, collisions et restauration indépendante réelle sur fixtures publiques |
| Dépenses | MAG, OBJETS, QA | Rejeu, collision, ledger divergent, crash/persistance et rapprochement ; pas de garantie atomique non démontrée |
| Studio | BUILDER, STUDIO, QA | Implémentation future autorisée séparément, canaris DOM/messages/stockage/export et contexte joueur isolé selon menace définie |
| Recette | QA, créateur | CI au SHA final, navigateurs/tablette/accessibilité et séance humaine ; aucune simulation ne les remplace |

## Sources originales de revue

Les rapports originaux MATH_001_R1_RAPPORT_TECHNIQUE.md, ARCH_001_R1_RAPPORT_TECHNIQUE.md, QA_001_R1_RAPPORT_TECHNIQUE.md et MAG_DG_LOT_002_RAPPORT_TECHNIQUE.md ont été consultés. Les références d'accès privées et les livrables des autres référents sont transmis uniquement dans le projet à DG, sans recopier les campagnes ou conversations dans le dépôt public.

Aucune donnée privée de campagne, secret MJ ou transcription privée n'est copiée dans ce rapport public. Les références identifient des livrables techniques sans en élargir les permissions. Passations et verdict final DG sont centralisés dans la conversation Direction générale ; ne pas présumer un envoi de chaque référent.

À revoir par : MATH, COMBAT, INDEX, ARCHIVES, QA, MAG, OBJETS, BUILDER, STUDIO.
À enregistrer par DG : validations limitées ci-dessus, réserves et plan de preuves. Aucune fusion, publication, canonisation ou correction de production autorisée par le présent rapport.

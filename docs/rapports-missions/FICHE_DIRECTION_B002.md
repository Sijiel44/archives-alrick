# ARCHIVES D'ALRICK — RAPPORT DE MISSION

**Identification :** B-002 — Registre central et interopérabilité du Bestiaire. Référent : Registre documentaire / moteur 5d6. **Date :** 31 octobre 2026 (Québec). **Branche :** bestiaire/b002-registre-interop. **PR :** [#67](https://github.com/Sijiel44/archives-alrick/pull/67), **brouillon, non fusionnée**. **Base :** main après fusion de #56, commit [4ce058b](https://github.com/Sijiel44/archives-alrick/commit/4ce058b6b18d553de36dbea356e968757efad71c). **Commit technique B-002 :** [a34f22c](https://github.com/Sijiel44/archives-alrick/commit/a34f22c2e6cb1d4f299bb06c719b59193f7ba24b) (tests et conservation de l'exception historique) ; travaux documentaires subséquents visibles dans #67.

**Statut : TERMINÉE AVEC RÉSERVES — CI complète VERTE ; validation éditoriale toujours requise.** PR #56 fusionnée sur main ; **aucune revue GitHub formelle de #56 identifiée**, ce qui ne démontre pas à soi seul une approbation du canon. B-002 ne crée aucune espèce, ne modifie ni biographie ni mathématiques 5d6 et n'active aucun lien public.

## Résultats vérifiés

| Indicateur | Résultat | Limite |
| --- | ---: | --- |
| Fichiers de la base Git (arbre non tronqué) | **750** | Instantané commit 4ce058b, hors nouveaux B-002 |
| Périmètre documentaire ciblé | **277** | 17 créatures, 135 personnages, 2 groupes, 76 lieux, 35 monde, 12 modèles |
| Entrées B-001 conservées | **21** | 10 codes distincts ; **11 sans code** |
| Relations B-001 vers source Git existante | **17** | Liens de dossier/fichier, **pas** preuves biologiques |
| Références à chemin déclaré cassé | **0** | Sur les 17 références B-001 renseignées |
| Entrées sans fichier principal | **4** | Dros, chèvre projetée, MAG-088, MAG-098 |
| Doubles codes parmi les 10 codes historiques | **0** | CI : **195 codes de fiches différents, 0 doublon** |
| Tests B-002 ciblés | **1 984** | **277 frontmatters** ; 228 pages publish:true ; 120 pages spoilers:true |
| Renvois wiki inspectés | **1 089** | 0 cible explicite inexistante ; 1 exception historique brouillon |
| Relations espèce–individu et profil 5d6 nouvelles validées | **0** | Adoption explicitement réservée |

**Livrables :** B002_INVENTAIRE.json (arbre et provenance), B002_REGISTRE_RELATIONS.json (identités historiques et 17 liens de provenance), B002_SPEC_INTEROPERABILITE.md (identifiants et relations n:n), script test-b002-registre.mjs, mise à jour npm test et workflow GitHub, rapport technique B002_REGISTRE_INTEROPERABILITE.md et présente fiche.

## Tests et preuves

- [CI diagnostic #41268115266](https://github.com/Sijiel44/archives-alrick/actions/runs/41268115266) : npm ci, contrôle de contenu (**369 pages / 269 codes publiés uniques**), TypeScript, Quartz (**1 111 pages HTML / 64 434 liens**), moteur M01–M05 (**1 390 assertions M05**) et B-001.1 (**1 321**) réussis ; le nouveau contrôle B-002 a **signalé une exception historique** : canon_statut=brouillons dans une page non publiée. Le navigateur a donc été sauté sur ce run. **Le workflow final #41268362926 a entièrement réussi** : npm test, les 1 984 assertions B-002, les 15 scénarios Chrome et 7 confirmations ; artefacts GitHub intégrité #13068610066 et recette #13068308205.
- Correctif de test : exception historique **explicitement surveillée**, sans changer la page ni élargir la liste des statuts canoniques ; CI réussie sur le commit **ee701034** ; les changements documentaires ultérieurs ne touchent pas l'exécutable. Revérifier la tête avant fusion. Le test B-002 vérifie codes uniques, fichiers existants, statuts, dossiers sensibles, refus de liens publics et sérialise un inventaire YAML enrichi de **277** fichiers dans les artefacts Actions.
- **Aucun npm test local revendiqué** : clonage Git local bloqué par l'accès DNS. Aucun playtest humain ni restauration exhaustive de sauvegardes effectués.

## Problèmes ouverts et décisions de Direction

**Conflits :** Aldren le loup ≠ Aldren humain ; Harald le lion ≠ Harald Forgecœur ; Phénix individu ≠ espèce ; Édril et Maërys partagent un dossier sans code individuel ; sept prototypes MJ publiés restent non canoniques ; Irindra protège ses révélations ; une valeur éditoriale héritée « brouillons » demeure sur un index non publié. Les originaux **CB35–CB39 ne sont pas présents dans l'arbre du dépôt** : seules des références dérivées ont été vues, sans prétendre relire ces bruts.

**Arbitrages indispensables :** (1) adopter ou refuser ESP-/FAMT-/INDC-/BIO-/P5C-/VARC- ; (2) préserver et désambiguïser codes et homonymes ; (3) définir la politique des aides MJ publiables et des spoilers ; (4) confirmer les sources et les relations d'espèces ; (5) autoriser séparément tout futur registre public de liens n:n. **documentaryLink demeure déclaratif et M05 conserve le refus des liens automatiques.**

**Recommandation :** conserver la PR #67 en brouillon jusqu'à relecture de l'inventaire enrichi et décision explicite du créateur. **Ne pas fusionner automatiquement ; ne pas lancer B-003 sans validation de la Direction.**

**Rapport permanent :** docs/rapports-missions/B002_REGISTRE_INTEROPERABILITE.md.


## ADDENDUM DIRECTION — Adoption des codes et autorisation de fusion

**Décision du créateur (31 octobre 2026) :** nomenclature `ESP-/FAMT-/INDC-/BIO-/P5C-/VARC-` adoptée pour les prochaines fiches, **sans attribution automatique**. Chaque nouveau code doit figurer dans `B002_CODES_VALIDES.json` avec sa fiche, sa source, son statut et sa preuve individuelle de validation, puis passer le contrôle CI. Les codes existants et les 11 entrées `null` restent inchangés.

**Corrections :** contrat éditorial, registre relationnel, spécification et quatre modèles mis à jour ; test automatisé des nouveaux identifiants ; statut non conforme de l'index CB42 non publié normalisé à `a_verifier`, sans canonisation. Les sept prototypes MJ restent explicitement non joués ; ni liens publics M05 ni nouvelle espèce canonique.

**Décision de Direction :** fusion de la PR #67 autorisée par le créateur **sous réserve d'une CI verte sur son dernier commit**, sans déclenchement manuel de publication GitHub Pages. Les décisions de lore, les profils n:n, les attributions individuelles futures et les playtests humains restent des chantiers distincts.

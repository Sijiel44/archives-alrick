# M05 — Contrat de lecture avec le moteur 5d6

**Statut :** adaptateur de lecture sur la branche M05, sans changement des équilibres publiés M01–M04.1. Base : `f026de00d5a6bb5d8b45d1103e28d813c08bc995`.

## 1. Source de vérité

| Valeur affichée | Fonction existante | Module |
| --- | --- | --- |
| Génération N1–25 | `generateCreatureProfileM03` | `atelier5d6-bestiary.ts` |
| PV de référence | `baseHealth` | `atelier5d6-bestiary.ts` |
| Bonus brut → effectif | `effectiveStat`, `effectiveMastery` | `atelier5d6-progression.ts` |
| Seuil physique/magique/mental | `resistanceScoreM03`, `defenseMasteryM03` | `atelier5d6-combat-m03.ts` |
| Protection innée/équipement/bonus MJ | `innateProtectionM03`, `equipmentProtectionM03`, `effectiveProtectionM03` | `atelier5d6-combat-m03.ts` |
| Impact de niveau | `impactBonusM03` | `atelier5d6-combat-m03.ts` |
| Résolution et chance réelle | `resolveCombatM03` via `attackMath` / `evaluateMatchup` | `atelier5d6-bestiary-workshop.ts` |
| Distribution | `sumOccurrences`, `TOTAL_OUTCOMES` | `atelier5d6-probabilities.ts` |
| Sauvegardes | `createBestiaryCard`, `validateBestiaryCard`, `exportBestiaryForAtelier` | `atelier5d6-bestiary-workshop.ts` |

**Pas de deuxième algorithme :** `deriveM05Sheet` lit ces fonctions, compose des valeurs dérivées et fournit des libellés. `renderM05Sheet` n'effectue aucun calcul alternatif de règles. Le modèle de lecture ne modifie pas l'objet reçu. L'interface ne lance ni dommages ni effets automatiques ; les capacités restent narratives.

## 2. Contrats de sauvegarde

- Format de la fiche : `schema:"alrick.bestiary.v1"`, `ruleset:"m03"`.
- Stockage local M04.1 : `archives-alrick-bestiary-v1`, sélection active séparée.
- Transfert atelier : `schema:"alrick.sheets.v3"`, feuille `ruleset:"m03-bestiary"`, historique intégral dans `bestiarySource`.
- Préservation de `legacyOriginal` sur les anciennes fiches — non modifié par M05.
- Champs étendus `documentaryLink` et `artwork` conservés par l'aller-retour JSON de la fiche, mais leur contenu déclaratif ne prouve pas le canon ou les droits.

Le bouton de régénération reconstruit les données numériques du générateur M03 tout en préservant les extensions existantes dans la fiche.

## 3. Référence Colosse N15

Génération officielle : `base = 3 + floor((15-1) × 0,55) = 10`, modificateurs `(+5,−3,−2,−2)`, caractéristiques **15/7/8/8**. Bonus effectifs : **+7/+5/+5/+5**. Base PV : **114**. PV : `round(114 × 1,7)` = **194**. Le test calcule ces valeurs par `createBestiaryCard(15,"colosse")` et l'adaptateur, sans fixer un tableau de résultats dans le code de production. Aucune espèce canonique créée.

## 4. Probabilités et hypothèses

L'Atelier existant énumère **26 sommes naturelles** (5–30), pondérées par leurs occurrences dans **7 776** combinaisons de 5d6. Le moteur distingue réussite, contact, blessure et dégâts attendus. Les naturels 5–7 restent des échecs forcés ; 27–30 ne permettent pas de traverser une impossibilité narrative.

La comparaison suppose combat de mêlée physique, une attaque par acteur par round, cible passive et aucun coût de ressources, effets spéciaux ou décision tactique. Le classement de danger est expérimental, **pas calibré par playtest**. Un MJ confirme explicitement les dégâts.

## 5. Test et non-régression

`scripts/test-5d6-m05.mjs` est ajouté à `npm test` via `npm run test:m05`. Il inspecte 5 archétypes × 25 niveaux, bonus, protections, seuils, PV, immutabilité, Colosse N15, import, erreurs documentaires, autorisation de portrait, distribution exacte et bundle DOM. **Exécution vérifiée :** [CI #41256890579](https://github.com/Sijiel44/archives-alrick/actions/runs/41256890579) sur le commit `6cfbaacac796aa49004665c1f3f111bb174b2388` : `npm test` **réussi** (compilation et build inclus), **1 390 assertions M05 réussies**. Recette Chrome : **15 scénarios M04.1+M05 réussis**, dont Colosse, prédateur, PNJ, clavier, impression PDF, sauvegardes, import/export, mobile émulé et combat MJ. Les tests n'équivalent pas à un playtest humain.

## 6. Tableau de transmission

| Besoin | Décision | Justification | Autorité | Échange | Limite | Validation |
| --- | --- | --- | --- | --- | --- | --- |
| Calcul et valeur affichée | Adaptateur dérivé M03 | Une seule vérité | M01/M03 | profil → lecture | Pas de nouveau pouvoir | Tests purs/CI |
| Combat de référence | Réemploi `evaluateMatchup` | 5d6 exacts | M03 / MJ | défense, PV, situation | Pas de tactique | Navigateur/playtest |
| PV/protection | Séparer seuil et absorption | Correction M04.1 | M03 | résistance/protection | Pas d'effet illégitime | Régression M04 |
| Import/export | Préserver schémas M04 | Compatibilité | M04.1 | JSON versionné | Pas d'import automatique | Recette fichiers |
| Adaptation documentaire | Extension facultative | Pas de nouveau moteur | B-002 | IDs, source, statut | Pas de canon | B-002 |

**Interdits maintenus :** aucune modification des puissances d'Orin, des cercles divins ou de la validation MJ ; aucune mise à jour automatique de données canoniques.

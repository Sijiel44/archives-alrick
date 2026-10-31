# M03 — Refonte du moteur de combat, oppositions, protections et bestiaire 5d6

**Projet :** Archives d'Alrick · **Dépôt :** [Sijiel44/archives-alrick](https://github.com/Sijiel44/archives-alrick)  
**Date :** 31 octobre 2026 · **Statut :** implémentation expérimentale sur PR **DRAFT** ; validation humaine et M04 restantes.  
**Branche :** `rules/m03-combat-bestiary-5d6-20261031`  
**PR :** [#60](https://github.com/Sijiel44/archives-alrick/pull/60), base [M02 #59](https://github.com/Sijiel44/archives-alrick/pull/59). **Aucune fusion, aucun déploiement.**

## 1. Résumé exécutif, limites et décisions

M03 branche enfin les jets d'opposition des fiches modernes M02 sur les mêmes fonctions mathématiques que les jets ordinaires M01/M02 : bonus logarithmique de caractéristique, bonus logarithmique de maîtrise, situation limitée et 21 échecs forcés parmi les 7 776 issues de cinq d6. Un module pur distingue la faisabilité, le franchissement du seuil de résistance, l'absorption et l'effet; il ne retire **aucun PV** ni ne prononce une mort. L'Atelier continue d'exiger une confirmation du MJ pour appliquer un dommage proposé.

Le modèle historique d'opposition et ses anciennes règles restent **inchangés** pour les fiches `legacy`. Une confrontation mixte M02/legacy est refusée plutôt que de convertir silencieusement une fiche. Le générateur de bestiaire moderne est séparé du générateur historique et accepte des caractéristiques brutes supérieures à 12, selon les archétypes.

**Portée exacte :** livraison d'un modèle expérimental testé par calcul, non d'un équilibrage définitivement validé par des joueurs. Le catalogue de capacités, les Autorités, les Cercles, les états temporaires en partie, l'économie d'actions et la persistance de durées d'effets ne sont pas finalisés.

## 2. Sources et chaîne GitHub

- [#57](https://github.com/Sijiel44/archives-alrick/pull/57), `rules/5d6-audit-probabilites-20261031` : distributions et audit initial, encore ouverte.
- [#58](https://github.com/Sijiel44/archives-alrick/pull/58), `rules/m01-progression-5d6-20261031` : progression sans cap et fonctions `effectiveStat` / `effectiveMastery`, base #57, encore ouverte.
- [#59](https://github.com/Sijiel44/archives-alrick/pull/59), `rules/m02-atelier-capacites-5d6-20261031`, base #58, encore ouverte; **commit source M03 :** `2e9629789c5f9ce22c73ad094928198a0e596860`.
- [#60](https://github.com/Sijiel44/archives-alrick/pull/60), M03, base #59, brouillon. Il n'est pas destiné à `main` directement.

**Rapports d'amont :** `docs/rapports-missions/M01_PROGRESSION_5D6.md` et `M02_ATELIER_CAPACITES_5D6.md`. Ne pas détruire cette filiation lors de M04.

## 3. Fichiers effectivement inspectés et frontières

Ont été lus pour cette intervention : `atelier5d6-opposition.ts`, `atelier5d6-bestiary.ts`, `atelier5d6-progression.ts`, `atelier5d6-probabilities.ts`, `atelier5d6-m02.ts`, `atelier5d6-origins.ts`, `atelier5d6.inline.ts` (zones de résolution, résumé de défense, modes MJ et bestiaire), `Atelier5d6.tsx` (contrôles d'opposition), `scripts/test-5d6-opposition.mjs`, `scripts/test-5d6-balance.mjs`, `scripts/test-5d6-m02.mjs`, `package.json`, et les rapports M01/M02. Les tests historiques et leur contrat sont conservés. L'inspection des pages de grimoire et des fiches canoniques n'autorise aucune réécriture du lore; elles n'ont pas été modifiées.

## 4. État historique et raison mathématique de la refonte

L'ancien calcul de résistance utilisait `12 + caractéristique plafonnée à 12 + floor(maîtrise/6) + bonus de niveau + éventuel palier 21–25 + armure + bonus MJ`, borné globalement à 50. L'absorption cumulait une protection innée par niveau, l'équipement et un éventuel bonus MJ. Au niveau 25 équipé grade 5, **55 + 30 = 85** de protection physique, avant supplément MJ. L'ancien impact ajoutait notamment jusqu'à **68** points de puissance de niveau; l'exemple de l'audit #57 présentait **5 206,7 rounds attendus** pour deux N25 symétriques selon ses hypothèses restrictives. Il s'agit d'un modèle théorique, pas d'un compte rendu de partie.

À l'opposé, le jet ordinaire M02 obéissait déjà à `5d6 + E(caractéristique) + M(maîtrise) + situation`, tandis que M02 refusait encore le module d'opposition pour ne pas mélanger les calculs. Ces deux interprétations incompatibles sont maintenant séparées par version de fiche.

## 5. Formules et contrat M03 réellement implémentés

- **Distribution** : cinq d6, exactement 7 776 issues; naturels 5–7 échecs forcés; 27–30 critiques potentiels, jamais succès garanti.
- **Attribut brut sans plafond à 12** : `E(c) = floor(3 * log2(1 + c/3))`, avec `c` entier sûr positif.
- **Maîtrise une seule fois** : `M(m) = floor(log2(1 + m))`, avec rang entier naturel. Le jet additionne `naturel + E(c) + M(m) + situation(-2..2)` et, le cas échéant, **un effet structuré explicitement reconnu**; jamais la caractéristique brute.
- **Défense M03** : `15 + E(caractéristique défensive pertinente) + M(meilleure maîtrise défensive pertinente) + bonus MJ(0..8)`. Physique privilégie Physique/Agilité et esquive/parade/armes; magie privilégie Esprit et maîtrise de résistance magique/runes/magie; mental privilégie Esprit/Présence et volonté/négociation. L'équipement ne s'ajoute pas à la difficulté d'esquive : il est comptabilisé au stade d'absorption.
- **Seuil** : `max(difficulté(15..30), défense de cible, minimum MJ(0..45))`; le MJ peut déclarer l'action **infaisable**. Le jet peut alors être numériquement suffisant sans jamais produire d'effet.
- **Protection physique innée** : `floor((niveau-1)/6)`; moitié entière pour la magie, zéro pour le mental. Les niveaux restent 1–25, sans divinisation implicite.
- **Grade d'armure physique** : grades 0–5 => `[0,1,2,3,5,7]`. Pour la magie, 60 % arrondis à l'entier inférieur, pour le mental zéro.
- **Protection additionnelle MJ** : `min(6, floor(3 * log2(1 + bonus_brut/3)))`, avec `bonus_brut 0..60`. La réduction de rendement et le plafond **ne portent que sur cette protection ponctuelle**, pas sur les caractéristiques.
- **Impact** : `base(1..12) + floor(0.7 * niveau_attaquant) + M(maîtrise) + effet reconnu éventuel`; une Affinité n'ajoute un montant que dans une attaque magique autorisée. **Pénétration** `0..8` si explicitement fournie, puis absorption `max(0,protection-pénétration)`; dégâts = `max(0,impact - absorption)` après succès effectif.
- **Contact critique sans défense franchie** : peut être narrativement décrit mais **0 PV**, contrairement au cas très exceptionnel de 1 PV de l'ancien moteur; aucun effet mental ou cosmologique.
- **Influence mentale** : résultat et effet proposés au MJ, **aucun dégât PV automatique**.
- **Riposte** : simple proposition si échec et écart significatif; exige un nouveau jet. Pas d'action gratuite créée.
- **Entrées invalides** : valeurs non entières, `NaN`, scores négatifs, bornes dépassées et niveaux hors 1–25 sont rejetés par les fonctions pures.

## 6. Comparaison des approches examinées

| Approche | Avantage | Risque / décision |
|---|---|---|
| Garder anciennes résistances et armures | Aucun changement apparent | Rend impossible la compatibilité numérique M02; rejeté pour M03 |
| Additionner caractéristique brute à l'attaque | Progression spectaculaire | Saturation de précision et double comptage; rejeté |
| Conserver défense + absorption énormes | Tanks solides | Impasses N25; rejeté pour M03 |
| Réduire les PV de tous les personnages | Abrège les combats | Migration lourde des fiches et bestiaire; **non fait** |
| **Défense logarithmique + absorption faible et distincte + impact croissant** | Précision cohérente, armure utile, durée N25 résoluble sans toucher aux PV | **Retenu pour essais**, à confirmer en M04 et par tables réelles |

Aucun plafond arbitraire n'est ajouté aux caractéristiques brutes. Les plafonds d'équipement, d'effets et de circonstances sont **des contraintes mécaniques distinctes**, pas un retour au cap 12.

## 7. Tableau des dix confrontations exactes

Hypothèses de banc d'essai : un **attaquant offensif** contre un **défenseur spécialisé**; attribut de base `3+floor(0.55*(niveau-1))`, +3 sur la caractéristique privilégiée, maîtrise `floor(0.45*(niveau-1))`, défenseur +3 d'esquive, grade physique `min(5,floor(niveau/5))`, arme 6, difficulté 21, situation 0, sans effet spécial ni bonus MJ; attaquant seul, une attaque tentée par round contre la cible passive, PV de `baseHealth` historique. Les calculs de toucher et dégâts exploitent les 7 776 issues exactes; **la colonne rounds = PV / dégâts moyens par attaque** est une approximation de débit (pas une médiane humaine, ni un combat à deux offensives).

| Attaquant | Défenseur | Toucher | Blesser | Dégâts / tentative | Rounds théoriques |
|---:|---:|---:|---:|---:|---:|
| N5 | N5 | 69,5 % | 69,5 % | 6,25 | 5,8 |
| N10 | N10 | 69,5 % | 69,5 % | 8,34 | 7,9 |
| N15 | N15 | 69,5 % | 69,5 % | 9,03 | 12,6 |
| N20 | N20 | 77,9 % | 77,9 % | 11,68 | 14,9 |
| N25 | N25 | 77,9 % | 77,9 % | 11,68 | 26,2 |
| N5 | N10 | 50,0 % | 50,0 % | 3,50 | 18,9 |
| N10 | N15 | 60,0 % | 60,0 % | 6,00 | 19,0 |
| N15 | N20 | 69,5 % | 69,5 % | 6,95 | 25,0 |
| N20 | N25 | 69,5 % | 69,5 % | 8,34 | 36,7 |
| N5 | N25 | 30,5 % | 0 % | 0,00 | **Blocage offensif volontaire** |

**Lecture :** les adversaires de niveau comparable sortent du cas extrême de 5 207 rounds. N5 contre N25 sans équipement particulier ne blesse pas le défenseur très protégé : ce contraste **extrême** est une décision de modèle à valider, pas une invulnérabilité entre égaux. Le contact n'est pas une blessure. Ces mesures restent dépendantes des profils et conditions choisies.

## 8. Survie, dispersion et combats de groupe

`scripts/test-5d6-m03.mjs` réalise, en plus de l'énumération exacte, **360 séries à graine fixe par confrontation** sur une cible passive, au plus 300 rounds, avec médiane, quantiles 10 %/90 % et fréquence d'expiration. Un test de groupe **2v2** (deux N10 contre deux N10, ciblage concentré) et un test de **surnombre 3v1** (trois N10 contre un N15) exécutent chacun 240 simulations à graine fixe. Il s'agit d'une simplification : pas de mouvement tactique, de changement de couverture, de moral, de représailles automatiques, de manœuvres de repli ni de consommation de capacités. Les distributions imprimées par le test sont vérifiables dans le journal CI.

**Cibles expérimentales** : N5 comparables 4–10 rounds, N10 5–12, N15 8–20, N20 10–25, N25 15–45 selon armure, préparation et objectifs. Ce sont des repères de discussion, non des durées imposées. Combat arrêté par reddition, fuite, prise d'objet ou objectif scénaristique reste possible sur décision du MJ.

## 9. Protections, PV et ressources

Les **PV historiques ne sont pas migrés**. `baseHealth(1)=12`, `baseHealth(25)=306`. La durée comparable N25 tient à la modification du seuil de défense, du bonus d'impact et surtout de l'absorption. Une armure grade 5 contribue maintenant 7 points physiques et 4 magiques; l'innée physique N25 contribue 4. Sans supplément MJ, ce sont **11 points** physiques au lieu des 85 points de l'ancien modèle. La maîtrise renforce l'impact sans addition de son rang brut. Aucune perte automatique de mana n'est effectuée par le jet de combat M03; l'Atelier conserve ses contrôles de capacités magiques existants.

## 10. Capacités M02 — interface mécanique sûre

Le registre M02 stocke `slot` ou `defined`, texte d'effet, limitations, provenance et approbation. La fonction `validateM03AbilityEffect` n'autorise un effet numérique fourni **explicitement sous forme structurée** que lorsque la capacité source correspond à l'ID, est définie, approuvée par le MJ, avec effet, description et limites non vides. Catégories neutres de référence : `precision`, `defense`, `absorption`, `impact`, `penetration`; amplitude 1–2, durée 1–3, déclencheur attaque/défense. Les bonus reconnus ne s'empilent pas, seul le maximum de chaque catégorie agit.

**Important :** ce n'est pas un interpréteur de la propriété narrative `effect`. Une propriété texte, un slot, un pouvoir ambigu ou non approuvé ne modifient pas les chiffres. Le branchement UI des capacités M02 vers ces effets structurés, les compteurs de durée et la dépense de ressources sont **à développer après un contrat de gameplay validé**, pas à inventer silencieusement dans M03.

Pour la magie dans l'interface, M03 requiert une capacité du registre existant des pouvoirs, décrite, approuvée MJ et dotée du mana requis; cela préserve un contrôle conservateur. La sélection **ne dépense pas automatiquement** le mana et ne crée aucun nouveau pouvoir.

## 11. Bestiaire

`generateCreatureProfileM03` crée cinq profils fonctionnels : **faune** mobile peu résistante, **prédateur** agile, **gardien** robuste et équipé, **mystique** orienté Esprit/mana, **colosse** puissant et lent. La courbe de base ne plafonne plus à 12 pour M03; les PV et ratios historiques sont conservés. Ce sont des créatures de jeu, pas des constructions PJ soumises au budget de création M01. Le contrôle de validation de budget PJ est donc distinct du cas des créatures générées. `generateCreatureProfile` historique est conservé pour la rétrocompatibilité et les anciennes suites.

Aucune fiche encyclopédique, identité canonique, récompense ou espèce existante n'a été remplacée. Les capacités spéciales de créatures restent des choix et effets explicites du MJ : **non générées automatiquement**.

## 12. Interface et autorité du MJ

L'Atelier affiche désormais l'opposition M03 pour les fiches modernes, avec un choix explicite de **faisabilité**. Il continue de montrer la caractéristique choisie, la maîtrise, le seuil, les dés, le résultat, la résistance, l'absorption et la proposition de dégâts. Les modes M02 et `legacy` dispatchent vers les moteurs appropriés; le croisement est refusé. L'application des PV par bouton est cachée en mode PJ, réservée au mode MJ et soumise à confirmation `window.confirm`. **0 PV = hors de combat, pas mort automatiquement.**

Il n'y a pas eu d'essai humain certifié de l'interface sur navigateur ou mobile pendant M03. La présence de contrôles a été testée statiquement; M04 doit effectuer le parcours interactif avec captures et tests de régression.

## 13. Compatibilité et formats conservés

**Intacts :** `alrick.sheets.v1`, `alrick.sheets.v2`, `alrick.sheets.v3`, `alrick.campaign.v1`, `alrick.campaign.v2`, clés de stockage `archives-alrick-atelier-5d6-v1` et `archives-alrick-atelier-5d6-v2`, `legacyOriginal`. Aucune migration implicite, aucun changement de schéma, aucune mutation des objets originaux pour appliquer un combat. M03 n'a pas retouché les fonctions M02 de migration et d'XP.

## 14. Tests automatisés et compilation

- `scripts/test-5d6-m03.mjs` : énumération complète des 7 776 quintuplets, dix comparaisons exactes, configurations niveaux 1–25, normes E et M, naturels critiques et échecs, action impossible, protections/armures, différence brut/effectif, mental sans PV, effets structurés approuvés/refusés, entrées invalides, bestiaire et simulation de groupe.
- Suite héritée : `scripts/test-5d6-opposition.mjs`, `test-5d6-balance.mjs`, `test-5d6-probabilities.mjs`, `test-5d6-progression.mjs`, `test-5d6-m02.mjs`.
- `npm test` lance explicitement contenu, `tsc --noEmit`, build Quartz, vérification site, toutes les anciennes suites et M03. **Premier passage sur PR #60 : CI verte** [run #41240990878](https://github.com/Sijiel44/archives-alrick/actions/runs/41240990878), incluant `npm ci` et `npm test`, avant l'extension des distributions. Les commits ultérieurs doivent être validés par leur propre CI avant fusion.
- Tests d'interface **manuels non réalisés** : aucun succès de navigateur/mobile ne doit être revendiqué.

## 15. Inventaire des fichiers modifiés ou créés

**Créé :**
- `quartz/components/scripts/atelier5d6-combat-m03.ts` — moteur pur et effets mécaniques reconnus.
- `scripts/test-5d6-m03.mjs` — calculs exacts et simulations déterministes.
- `docs/rapports-missions/M03_COMBAT_BESTIAIRE_5D6.md` — présent rapport.

**Modifié :**
- `quartz/components/scripts/atelier5d6.inline.ts` — sélection de moteur moderne/historique, opposition, faisabilité, magie MJ, créatures.
- `quartz/components/scripts/atelier5d6-bestiary.ts` — ajout d'un générateur M03, sans remplacer l'historique.
- `quartz/components/Atelier5d6.tsx` — indication M03 et contrôle de faisabilité.
- `package.json` — `test:m03` et inclusion dans `npm test`.

**Non modifiés :** schémas de sauvegarde, origine/progression M01, migrations M02, grimoire, bestiaire documentaire, multijoueur, lore et canon d'Orin.

## 16. Références Git et transmission

Branche M03 créée depuis `2e9629789c5f9ce22c73ad094928198a0e596860` (M02); PR brouillon [#60](https://github.com/Sijiel44/archives-alrick/pull/60), base `rules/m02-atelier-capacites-5d6-20261031`. Les commits sont consultables dans l'onglet **Commits** de #60. L'ancienne PR #59 ne doit pas être retargetée vers `main` prématurément; M04 doit vérifier toute la pile #57→#58→#59→#60.

## 17. Points non résolus / choix créateur

1. Définir avec le créateur les plages souhaitées de durée par type de combat et les conditions de victoire non létales; ajuster après playtests.
2. Évaluer les extrêmes : N5 contre N25 blindé peut toucher sans blesser; certains archétypes hors équipement possèdent d'autres options narratives, mais rien d'automatique.
3. Les défenses utilisent la meilleure maîtrise défensive pertinente sans action consommée; concevoir parade/esquive actives, couverture, flanc et préparation en M04 ou ultérieurement.
4. Les ressources magiques, coûts, durées, conditions et temps de recharge des capacités ont une interface de référence mais **pas de runtime universel**. Ne pas interpréter automatiquement du texte narratif.
5. Les simulations n'étudient pas le jeu coopératif réel, le ciblage adaptatif, l'ordre des tours, les effets de terrain ou la guérison; elles n'équivalent pas à un test de table.
6. Les fichiers de bestiaire en cours sur d'autres branches n'ont pas été fusionnés ni écrasés; conflits éventuels à arbitrer en M04.

## 18. Instructions précises pour M04

1. Relever les **commits de tête** et l'état CI de #57, #58, #59 et #60; vérifier que les bases reflètent la dépendance réelle. Ne pas fusionner sans contrôle.
2. Exécuter `npm ci && npm test` sur la tête M03; vérifier spécifiquement TypeScript, build et `test:m03`. Examiner la sortie statistique (médiane, p10, p90, blocage).
3. Effectuer des tests **manuels** navigateur + mobile : création M02, jet ordinaire, opposition N5/N25, créature, cible legacy, résistance magique/mentale, faisabilité décochée, armure, sélection de maîtrise et confirmation des PV en mode MJ.
4. Contrôler les sauvegardes v1/v2/v3 en import/export, les copies de migration et `legacyOriginal`; valider que rien ne change sans accord et que les inventaires et pouvoirs survivent au cycle.
5. Évaluer la séparation entre technique d'arme, défense active, positions, ressources, protection d'allié, fuite et objectifs non létaux. Recueillir des playtests humains avant tout recalibrage des courbes.
6. Définir un **contrat explicite** d'effets M02 avec le créateur, et son stockage/versionnage éventuel, sans inventer de magie ni d'Autorités.
7. Comparer les contrats techniques du grimoire, du bestiaire parallèle et des tables multijoueurs avant résolution des conflits. Ne jamais réécrire le canon d'Alrick pour épouser les statistiques.
8. Proposer un ordre de fusion propre de la pile **#57 → #58 → #59 → #60**, après validation, et ne déclencher la publication du site que sur demande expresse du créateur.

## 19. Bilan honnête

**Implémenté :** moteur M03 pur, armure/défense modernes, branchement des fiches M02, maintien de legacy, générateur bestiaire moderne, contrôle MJ, test M03 et branche/PR brouillon.  
**Vérifié automatiquement :** tests de probabilités et d'intégration du code, suite npm, compilation TS/build Quartz sur le commit documenté; vérifier ensuite la dernière tête CI.  
**Proposé mais non validé par humains :** courbes de combat, durée souhaitable, choix tactiques et limites de défense.  
**Réservé au créateur/MJ :** faisabilité, effets des capacités, choix narratifs, modifications de PV, résultats définitifs d'une confrontation et toute Autorité cosmologique.

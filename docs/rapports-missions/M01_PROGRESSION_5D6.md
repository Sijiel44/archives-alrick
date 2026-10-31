# M01 — Refonte mathématique du moteur 5d6 et de la progression 1–25

**Date :** 31 octobre 2026 · **Dépôt :** [Sijiel44/archives-alrick](https://github.com/Sijiel44/archives-alrick) · **Statut :** module isolé implémenté et tests CI verts, intégration de l’Atelier différée. **Prototype non canonique.**

**Branche :** `rules/m01-progression-5d6-20261031` · **Base :** `rules/5d6-audit-probabilites-20261031` ([PR #57](https://github.com/Sijiel44/archives-alrick/pull/57)) · **PR mission :** [#58, brouillon](https://github.com/Sijiel44/archives-alrick/pull/58) · **Code testé :** `de650866dfddca41be5be92ccc314c9c45db23b7` · **CI réussie :** [run #41236231451](https://github.com/Sijiel44/archives-alrick/actions/runs/41236231451). **Aucune fusion ni publication.**

## 1. Résumé et décisions du créateur

**12 n’est pas un maximum définitif des caractéristiques.** Physique, Agilité, Esprit et Présence peuvent progresser au-delà de 12 et ne reçoivent **aucun plafond de jeu de remplacement**. N1–4 représentent d’abord la population et les périodes de développement ordinaires ; N5 constitue l’entrée typique de l’aventurier formé ; N21–25 signalent des exploits rares, **sans statut divin automatique**.

Modèle retenu : **budget partagé + coûts croissants + rendement logarithmique des caractéristiques dans les jets**. Il permet de privilégier une seule compétence brute, d’investir largement dans plusieurs attributs, ou d’acheter maîtrises et options spéciales. Les personnages ne reçoivent automatiquement ni Autorité, ni Cercle, ni Affinité, ni capacité canonique. Aucune fiche d’Orin ou autre personnage n’a été modifiée.

## 2. Diagnostic initial et fichiers audités

- `content/jouer/systeme-5d6-base12.md`, `echelle-existences-niveaux-affinites.md`, `progression-voies-incidents.md`, `parcours-de-vie-affinites.md`, `playtest-5d6-probabilites.md` et le guide de l'aventurier.
- `docs/EQUILIBRAGE_ATELIER_5D6_24_NIVEAUX.md` et l’audit mathématique lié à la PR #57.
- `quartz/components/scripts/atelier5d6.inline.ts`, `atelier5d6-origins.ts`, `atelier5d6-opposition.ts` et `atelier5d6-probabilities.ts` (PR #57).

**Ancien :** 12 points de base, +6 crédits de caractéristiques par niveau et +2 maîtrises par niveau. Les quatre scores plafonnent à 12 ; 48 crédits cumulés sont disponibles dès **N7**, soit 12/12/12/12. Les maîtres ne se distinguent donc plus par les scores. Les jets de l’Atelier sont `5d6 + brut + spécialité(0..2) + situation(-2..+2)`. Le module d’opposition ajoute indépendamment résistance et absorption ; les dégâts N25 contre N25 illustrent un cas pathologique estimé à **5 206,7 rounds** dans l’audit PR #57 (hypothèses strictes de test, non simulation d’une partie).

**Ancienne XP :** `5(n−1)³`, soit 69 120 au N25 et 8 285 XP du N24 au N25. Avec au plus 120 XP par contrat de rang 12, cette progression encourage les répétitions. Les 12 indices de groupe restent distincts des 25 niveaux individuels.

## 3. Les 7 776 combinaisons exactes de 5d6

Cinq dés indépendants : `6^5=7776`, moyenne **17,5** ; histogramme symétrique. Convolution et énumération indépendante concordent.

| Somme naturelle | Combinaisons | Probabilité |
|---:|---:|---:|
| 5 | 1 | 0.0129 % |
| 6 | 5 | 0.0643 % |
| 7 | 15 | 0.1929 % |
| 8 | 35 | 0.4501 % |
| 9 | 70 | 0.9002 % |
| 10 | 126 | 1.6204 % |
| 11 | 205 | 2.6363 % |
| 12 | 305 | 3.9223 % |
| 13 | 420 | 5.4012 % |
| 14 | 540 | 6.9444 % |
| 15 | 651 | 8.3719 % |
| 16 | 735 | 9.4522 % |
| 17 | 780 | 10.0309 % |
| 18 | 780 | 10.0309 % |
| 19 | 735 | 9.4522 % |
| 20 | 651 | 8.3719 % |
| 21 | 540 | 6.9444 % |
| 22 | 420 | 5.4012 % |
| 23 | 305 | 3.9223 % |
| 24 | 205 | 2.6363 % |
| 25 | 126 | 1.6204 % |
| 26 | 70 | 0.9002 % |
| 27 | 35 | 0.4501 % |
| 28 | 15 | 0.1929 % |
| 29 | 5 | 0.0643 % |
| 30 | 1 | 0.0129 % |

**Critiques naturels inchangés :** 5 : 1/7 776 (échec exceptionnel) ; 6–7 : 20/7 776 (échecs mineurs) ; tous 5–7 : **21/7 776 = 0,27006 %** d’échecs forcés ; 27–29 : 55/7 776 ; 30 : 1/7 776. Les critiques 27–30 sont **potentiels** : seule une action faisable ayant franchi son seuil peut obtenir un effet.

Formule : `P = (1/7776) Σ_{n=8}^{30} occurrences(n) × 1[n + bonus >= seuil]`, avec **P=0 si l’action est infaisable**. Les bonus ne peuvent jamais convertir les 21 échecs naturels en réussites.

| Bonus | Seuil 21 | Seuil 24 | Seuil 27 | Seuil 30 | Seuil 40 |
|---:|---:|---:|---:|---:|---:|
| +3 | 50.00 % | 22.15 % | 5.88 % | 0.72 % | 0.00 % |
| +6 | 77.85 % | 50.00 % | 22.15 % | 5.88 % | 0.00 % |
| +8 | 90.20 % | 69.48 % | 39.97 % | 15.20 % | 0.00 % |
| +11 | 98.38 % | 90.20 % | 69.48 % | 39.97 % | 0.08 % |
| +12 | 99.28 % | 94.12 % | 77.85 % | 50.00 % | 0.27 % |
| +16 | 99.73 % | 99.73 % | 96.76 % | 84.80 % | 5.88 % |
| +24 | 99.73 % | 99.73 % | 99.73 % | 99.73 % | 69.48 % |

Avec un bonus arbitrairement puissant, plafond probabiliste de réussite numérique **7 755/7 776 = 99,72994 %**, jamais 100 %. Le score brut n’est plus ajouté directement au jet.

## 4. Modèles comparés

| Modèle | Résultat | Décision |
|---|---|---|
| A. Linéaire (+6 brut/niveau) | Compression des profils si cap 12 ; quasi-certitude des jets sans cap | Rejet |
| B. Coût croissant seul | Rend la spécialisation coûteuse, mais la précision peut saturer | Insuffisant seul |
| C. Rendement logarithmique seul | Précision maîtrisée, pas de choix de domaine | Insuffisant seul |
| **D. Budget partagé + coût + bonus effectif** | Caractéristiques brutes libres, nombreuses priorités réelles, progression mesurable | **Retenu pour playtest** |

## 5. Formules après refonte (module pur)

- Base de création : 12 points entre 4 valeurs initiales 1–5 ; référence neutre **3/3/3/3**.
- Budget de développement à Nn : **`B(n)=6(n−1)`** points communs, sans +2 maîtrises gratuites en parallèle.
- Coût d’achat du point de caractéristique atteignant le rang `r` : **`1+floor((r−1)/8)`**, sans limite supérieure de jeu. Acheter de `a` à `b` coûte `C(b,8)−C(a,8)`.
- Coût d’achat du rang de maîtrise `r` : **`1+floor((r−1)/6)`**. Acheter de `a` à `b` coûte `C(b,6)−C(a,6)`.
- Fonction analytique : **`C(r,w)=w*q*(q+1)/2 + (q+1)*s`**, `q=floor(r/w)`, `s=r mod w`.
- Bonus de caractéristique **`E(c)=floor(3*log2(1+c/3))`** ; bonus de maîtrise **`M(m)=floor(log2(1+m))`**. Leurs plateaux sont intentionnels ; aucun plafond fixe.
- Jet envisagé **`5d6 + E(caractéristique brute) + M(maîtrise du domaine) + situation(-2..2)`**, avec `naturel>7`, seuil et faisabilité ; les 27–30 ne garantissent pas la pénétration.
- Aptitude : **3** points, dès N3. Technique : **6** points, dès N5. Signature : **9** points, dès N17 et avec validation MJ. Le contenu exact est conditionnel à une permission narrative.
- XP cumulés proposés : **`25(n−1)²`** ; jalons N21…N25 distincts et validés par le MJ.
- XP d’événement : **`floor(20 × difficulté(1..12) × facteur de portée / facteur de répétition)`**. Portées ordinaire **×1**, majeure **×3**, légendaire **×8**. Répétitions du même `pattern` : facteurs 1, 2, 4, 4, puis **aucune récompense** à partir de la cinquième. Même ID : 0. Majeur/légendaire exigent validation MJ.

**Les caractéristiques, les maîtrises et les aptitudes évoluent sans transformer une valeur brute en Autorité cosmologique.** Une très forte valeur n’accorde aucun sort/Cercle ni droit social.

## 6. Tableau complet des niveaux 1 à 25

La progression ancienne et les PV hérités restent affichés uniquement comme références. **Les PV et le mana n’ont pas été modifiés.**

| Niveau | XP avant | XP M01 | XP jusqu'au niveau | Budget M01 | Crédits carac. anciens | Maîtrises anciennes | PV hérités |
|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 0 | 12 | 0 | 12 |
| 2 | 5 | 25 | 25 | 6 | 18 | 2 | 18 |
| 3 | 40 | 100 | 75 | 12 | 24 | 4 | 24 |
| 4 | 135 | 225 | 125 | 18 | 30 | 6 | 30 |
| 5 | 320 | 400 | 175 | 24 | 36 | 8 | 36 |
| 6 | 625 | 625 | 225 | 30 | 42 | 10 | 42 |
| 7 | 1 080 | 900 | 275 | 36 | 48 | 12 | 48 |
| 8 | 1 715 | 1 225 | 325 | 42 | 54 | 14 | 54 |
| 9 | 2 560 | 1 600 | 375 | 48 | 60 | 16 | 60 |
| 10 | 3 645 | 2 025 | 425 | 54 | 66 | 18 | 66 |
| 11 | 5 000 | 2 500 | 475 | 60 | 72 | 20 | 72 |
| 12 | 6 655 | 3 025 | 525 | 66 | 78 | 22 | 78 |
| 13 | 8 640 | 3 600 | 575 | 72 | 84 | 24 | 90 |
| 14 | 10 985 | 4 225 | 625 | 78 | 90 | 26 | 102 |
| 15 | 13 720 | 4 900 | 675 | 84 | 96 | 28 | 114 |
| 16 | 16 875 | 5 625 | 725 | 90 | 102 | 30 | 126 |
| 17 | 20 480 | 6 400 | 775 | 96 | 108 | 32 | 138 |
| 18 | 24 565 | 7 225 | 825 | 102 | 114 | 34 | 150 |
| 19 | 29 160 | 8 100 | 875 | 108 | 120 | 36 | 162 |
| 20 | 34 295 | 9 025 | 925 | 114 | 126 | 38 | 174 |
| 21 | 40 000 | 10 000 | 975 | 120 | 132 | 40 | 198 |
| 22 | 46 305 | 11 025 | 1 025 | 126 | 138 | 42 | 222 |
| 23 | 53 240 | 12 100 | 1 075 | 132 | 144 | 44 | 246 |
| 24 | 60 835 | 13 225 | 1 125 | 138 | 150 | 46 | 270 |
| 25 | 69 120 | 14 400 | 1 175 | 144 | 156 | 48 | 306 |

Au N25, budget M01 = **144** points en plus des 12 de création ; XP M01 = **14 400** ; passage N24→N25 = **1 175** XP **et** validation exceptionnelle. La puissance légale reste distincte de la puissance mythique.

## 7. Personnages spécialisés et polyvalents

**Protocole reproductible** : départ 3/3/3/3 ; spécialiste avec au plus 80 % du budget en Physique et le reliquat en aptitudes ; polyvalent avec au plus 70 % répartis en rotation sur les quatre attributs et le reliquat en aptitudes. Tous ces profils sont des **constructions théoriques**, jamais des valeurs canoniques.

| Niveau | Budget | Spécialiste Phys/Agi/Esp/Pré | Aptitudes sp. | Bonus Phys sp. | Polyvalent Phys/Agi/Esp/Pré | Aptitudes poly. | Bonus max poly. |
|---:|---:|---|---:|---:|---|---:|---:|
| 5 | 24 | 15/3/3/3 | 1 | +7 | 7/7/7/7 | 2 | +5 |
| 10 | 54 | 23/3/3/3 | 4 | +9 | 10/10/10/10 | 6 | +6 |
| 15 | 84 | 29/3/3/3 | 6 | +10 | 13/13/13/12 | 8 | +7 |
| 20 | 114 | 34/3/3/3 | 9 | +10 | 16/15/15/15 | 12 | +7 |
| 25 | 144 | 39/3/3/3 | 10 | +11 | 18/17/17/17 | 15 | +8 |

Au N25 : spécialiste **39/3/3/3**, bonus d’action Phys **+11** ; polyvalent **18/17/17/17**, bonus effectif maximal **+8**. Les 39 points ne donnent pas +39 au jet. Le même protocole est utilisable pour érudit (Esprit), diplomate (Présence), explorateur (Agilité) ou mage ; les maîtres artisans investissent leurs maîtrises/aptitudes de fabrication. Les résultats dépendent des conditions et permissions.

## 8. Étendue vérifiée des tests et résultat réel

**CI GitHub exécutée et verte le 31 octobre 2026 :** [workflow #41236231451](https://github.com/Sijiel44/archives-alrick/actions/runs/41236231451), commit `de650866dfddca41be5be92ccc314c9c45db23b7`. Les étapes **`npm ci`** et **`npm test`** ont toutes deux `success` ; `npm test` inclut `check:content`, TypeScript, build, contrôle du site, tests 5d6 existants et nouveau `test:progression`.

Sortie vérifiée du test M01 :

```json
{"result":"OK","diceOutcomes":7776,"configurations":540,"exactEvaluations":4199040,"levelsTested":25,"specialistLevels":[5,10,15,20,25],"specialistRaw":[15,23,29,34,39],"testedDomains":8,"forcedFailures":21,"potentialCriticalOutcomes":56}
```

La grille comprend **10 scores bruts × 6 maîtrises × 9 difficultés = 540 configurations**, soit **4 199 040 issues pondérées**, recroisées avec le comptage indépendant des quintuplets. Les 25 niveaux, profils extrêmes et polyvalents, valeurs >12, signatures autorisées/refusées, actions impossibles et huit domaines XP sont inclus. Le test de probabilités PR #57 confirme également **1 044 cas seuil/bonus** et un audit de duel N25. **Aucun playtest humain n’est revendiqué.** Le clonage direct n’a pas pu être exécuté dans cet environnement, mais le workflow GitHub a réellement exécuté la source de la PR.

## 9. Fichiers, commits, PR

| Élément | Action |
|---|---|
| `quartz/components/scripts/atelier5d6-progression.ts` | Nouveau module de règles indépendant |
| `scripts/test-5d6-progression.mjs` | Nouveau test exhaustif et tests de profils |
| `package.json` | `test:progression` ajouté à `npm test` |
| `docs/rapports-missions/M01_PROGRESSION_5D6.md` | Présent rapport |
| Commit module | `7b04753ce9f227f6ea6b292cf5b7d692bc580732` |
| Commit tests | `768ebf9f0846b8a7dafa503b7c745791b36b0e3d` |
| Commit script de test | `de650866dfddca41be5be92ccc314c9c45db23b7` |
| PR GitHub | [#58](https://github.com/Sijiel44/archives-alrick/pull/58) — **DRAFT**, base PR #57, non fusionnée |

## 10. Limites et transmissions aux missions suivantes

1. **Ne pas relier maintenant le module à l’Atelier** : celui-ci additionne encore les scores bruts et borne à 12 dans les formulaires/validations. Il faudra changer UI et tests de sauvegardes de façon coordonnée.
2. Les données `alrick.sheets.v1/v2`, `alrick.campaign.v1` et la clé locale `archives-alrick-atelier-5d6-v1` demeurent **intactes** ; migration et garanties d’imports/export nécessaires avant activation. Le N5 hérité (36 crédits de caractéristique + 8 maîtrises) n’est **pas équivalent** au N5 M01 (12 initiaux + 24 développement partagés) : aucune conversion silencieuse.
3. **L’équilibrage haut niveau des combats reste ouvert** : le diagnostic N25 de >5 200 rounds n’est pas résolu ici. Résistance, absorption, équipement et dégâts doivent être étudiés séparément, sans toucher au bestiaire en cours.
4. Vérifier en jeu les seuils N5, les domaines non martiaux, le coût/impact narratif des signatures, la réserve de mana, les préconditions, le combat et les créatures.
5. **Les niveaux 21–25 ne confèrent jamais automatiquement de statut divin**, même si le niveau simule une manifestation exceptionnelle. Les statuts ★–★★★★, les Affinités, Autorités et Cercles ne sont pas une progression de points.
6. **Aucune rétroactivité** sur les capacités établies d’Orin et des personnages joués ; pas de modification des branches de grimoire, bestiaire ou multijoueur.

## 11. Conclusion / condition d’achèvement

Le **module pur de progression 1–25 est défini, écrit, testé en CI et documenté**. Il est prêt pour **revue et intégration contrôlée**, pas pour activation immédiate de l’Atelier. **PR #58 conservée en brouillon ; ne pas fusionner/publier avant achèvement de la mission 4.**

**Références :** [PR #57 — probabilités](https://github.com/Sijiel44/archives-alrick/pull/57) · [PR #58 — progression](https://github.com/Sijiel44/archives-alrick/pull/58) · [CI 41236231451](https://github.com/Sijiel44/archives-alrick/actions/runs/41236231451).

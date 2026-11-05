# DG-LOT-004 / L004-B.R2 — Étude ciblée et prototype XP pour MJ

Statut : **deux modèles de recommandations expérimentales, aucun barème homologué**. D'après la directive 00 DG du 5 novembre 2026, [issue #93, commentaire 6659005380](https://github.com/Sijiel44/archives-alrick/issues/93#issuecomment-6659005380). Base applicative propriétaire PR #99, issue de PR #85 @ `2ab809ef5351940e0fc272b859d10f21de894d00`. Aucune règle officielle M01–M05 changée ; pas de `M02.grantAward`.

## 1. Source native et frontière conceptuelle

M01, `atelier5d6-progression.ts`, Git blob `d2040829ea0da7c0f6eae08dc8c701226bfc53c5` : `experienceAward(event, history)` propose un montant en fonction de `difficulty` **entier 1–12** (indice d'accomplissement), `scope` ordinaire/majeur/légendaire (coefficients **natifs M01** 1/3/8), approbation explicite pour les deux dernières portées et répétitions du même `pattern`. `experienceRequired(n)=25(n−1)²` s'applique au **niveau de PJ 1–25**, non à la menace. L'ennemi N25 n'est **jamais** un accomplissement d'indice 25. Les niveaux de menace, le danger réel, la taille du groupe, l'assistance PNJ et la réussite pacifique sont des **faits de contexte**, pas des multiplicateurs homologués.

Conserver les ports livrés PR #99 : `suggestXpFromM01`, `recordXpMjDecision`, `previewXpProgression` et leur schéma `cer.math.xp-decision.provisional.v1`. Le nouveau module `src/encounter-recommendations.ts` ne modifie pas ces fonctions.

## 2. Modèle A — à privilégier pour étude, non adopté

L'UI recueille la difficulté vécue par le MJ (`facile`, `moderee`, `difficile`, `heroique`) et propose **visiblement**, à titre d'essai, les indices M01 **3 / 6 / 9 / 12**. Ce rapprochement d'étiquettes et d'indices est une **hypothèse d'interface**, pas une règle M01. Le MJ peut saisir un indice explicite entier **1–12**, qui prime sans ajustement caché. L'indice ne découle jamais mécaniquement du niveau de l'ennemi ni d'une moyenne de niveaux PJ. Le module montre séparément le niveau maximal, le nombre et les notes de danger des ennemis, les niveaux des PJ et des PNJ.

**Assistance décisive** : si et seulement si un PNJ de la scène et une aide décisive sont attestés par le MJ, la proposition d'étiquette descend d'un cran (`difficile` → `moderee`), sauf si le MJ a lui-même déjà arrêté la difficulté réalisée ou l'indice. Un simple PNJ présent, même N20, n'entraîne aucune réduction. L'essai n'efface pas l'effort des PJ et ne déduit rien des dégâts qu'ils ont infligés. Cette réduction est une **convention simulée, à arbitrer**, jamais une modification de M01.

Le **boss** ne reçoit aucun multiplicateur gratuit. Le MJ choisit explicitement la portée de l'événement et doit confirmer l'accord déjà exigé par M01 pour `majeur`/`legendaire`. Le module transmet sans falsification `event.approved` au port natif `suggestXpFromM01`, par PJ et selon **son propre historique**. Le texte narratif n'est pas converti en chiffres. Un accomplissement pacifique/quête peut utiliser M01 exactement comme un combat, si le MJ l'atteste.

## 3. Modèle B — coefficient visible, pure sensibilité, non adopté

Comparaison indépendante : référence `experienceAward` M01 avec **indice 6, portée ordinaire**, puis coefficient hypothétique lié à la difficulté vécue : **0,75 / 1 / 1,25 / 1,5**. Pour une source M01 inédite, les montants B respectifs sont **90 / 120 / 150 / 180 XP**, à comparer au modèle A **60 / 120 / 180 / 240 XP**. L'affichage B n'ajoute PAS les multiplicateurs `majeur/legendaire`, afin d'éviter un double comptage. B n'est jamais ajouté à A, ne déclenche pas `recordXpMjDecision` et n'est pas proposé comme barème officiel. Le raccourci a des limites : il ne représente pas le boss, réagit plus faiblement aux extrêmes et risque de masquer la portée narrative. **Orientation MATH : A comme expérience prioritaire, B comme banc de sensibilité.**

## 4. Tableau XP natif et rythme hypothétique

| Niveau | XP cumulée M01 | XP pour prochain niveau | 120 XP ordinaires, équivalence approximative sans répétitions |
|---:|---:|---:|---:|
| 1 | 0 | 25 | 4,8× le seuil suivant |
| 5 | 400 | 225 | 53,3 % du palier suivant |
| 10 | 2 025 | 475 | 25,3 % |
| 15 | 4 900 | 725 | 16,6 % |
| 20 | 9 025 | 975 | 12,3 % |
| 25 | 14 400 | — | **aucune progression 25+ validée** |

Les équivalences de la dernière colonne sont une **mise en perspective de rythme**, non une règle de seuil ni une promesse de récompenses répétées. `experienceAward` diminue les récurrences du même motif : **120, 60, 30, 30, 0** pour cinq événements fictifs successifs de même `pattern`, même indice 6 et portée ordinaire, avec leurs décisions précédentes positives. Aucun automatisme XP pour le farming.

## 5. Simulations comparatives exécutées sur M01 officiel

Les détails sources/entrées/sorties sont dans [`L004_B_SIMULATIONS.json`](./L004_B_SIMULATIONS.json), régénérable par `node experiments/dg-lot004/math-xp/tests/generate-xp-simulations.mjs`.

| Scénario fictif | Indice A proposé | Montant A M01 par PJ sélectionné | B hypothétique | Observations |
|---|---:|---:|---:|---|
| Ennemi N2, PJ N1, difficulté modérée | 6 | 120 | 120 | Niveau ennemi ≠ indice M01 |
| Ennemi N15, PJ N5, difficile | 9 | 180 | 150 | Menace renseignée, pas d'équation de niveau→indice |
| Ennemi N20, PJ N15, difficile | 9 | 180 | 150 | Aucune majoration automatique |
| Ennemi N25, PJ N20, héroïque | 12 | 240 | 180 | Indice plafonné à 12 par M01 |
| Boss N20, portée majeure approuvée, difficile | 9 | 540 | 150 | Le coefficient ×3 est **natif M01** et peut accélérer très vite |
| Boss N25, portée légendaire approuvée, héroïque | 12 | 1 920 | 180 | ×8 M01 natif ; **risque de saut rapide**, pas de statut divin automatique |
| Cinq ennemis (3× N2 + 2× N15), difficile | 9 | 180 | 150 | **Aucun ×5 automatique** |
| Deux PJ N3, menace N15, aide décisive PNJ N20 | 6 au lieu de 9 | 120 au lieu de 180 | 120 | Réduction candidate explicite, PNJ exclu des XP |
| Quête pacifique/diplomatie, aucune créature | 6 | 120 | 120 | Aucun meurtre requis |
| PJ N1 et N20 dans le même groupe | 9 | 180 chacun | 150 chacun | Pas de division par 2, ajustement individuel MJ possible |
| One-shot, deux PJ prétirés N10 / XP0 | 3 | 60 | 90 | XP de départ distincts du niveau, pas de gain implicite |
| Ennemi N26 | — | **indisponible** | — | Hors niveaux 1–25 actuellement validés |

Ces montants ne prennent pas en compte des histories particulières sauf farming ; en session réelle, chaque PJ reçoit sa propre suggestion M01 par historique. De hautes portées ne peuvent être suggérées sans le drapeau d'approbation explicite MJ. Les niveaux 25+ restent hors contrat : **blocage, traitement narratif seulement**.

## 6. Décision et idempotence — jeu synthétique

`recordEncounterXpChoice(scene, allocation)` ne peut consigner une décision qu'après `approvedByMJ:true` explicitement fourni. La sortie est un **nouvel objet de journaux XP**, jamais une modification de fiche. Le MJ choisit `selectedPjIds` parmi les **PJ** présents. Montant `commonXp` commun à tous les PJ choisis (sans partage/division), avec exceptions possibles `overrides`, ou `individualXp` pour chacun. Montant 0 autorisé. Les PNJ ne sont jamais dans le jeu de bénéficiaires : même un PNJ N20 décisif n'obtient pas d'XP.

Événement partagé entre boss et quête : `accomplishmentId` stable par `campaignId/runId` ; même accomplissement = **même ID de source**. Le port existant bloque un crédit supplémentaire (`SOURCE_DUPLICATE`). Deux récompenses réellement distinctes exigent des IDs distincts et une justification MJ. Même commande rejouée = `duplicate` ; même ID avec montant différent = `ID_COLLISION` ; correction ultérieure séparée via `recordXpMjDecision` existant. Les résultats des journaux sont **atomiques au niveau du retour pur** : si un PJ échoue à la validation, aucun nouvel ensemble de journaux n'est retourné. Aucune promesse de transaction atomique de stockage tant qu'ARCHIVES/QA ne l'ont pas confirmée.

## 7. Risques et arbitrages DG

1. **Sélection d'indice** : adopter ou non la carte d'essai 3/6/9/12 et la baisse d'un cran en cas d'aide décisive. **Ni l'une ni l'autre n'est homologuée.** Ne pas transformer la présence d'un PNJ puissant en réduction aveugle.
2. **Portée** : choisir conditions concrètes pour `majeur/legendaire` ; le ×3/×8 natif M01 peut être très élevé face aux seuils des niveaux initiaux. Pas de cumul boss + coefficient B.
3. **Équité du groupe** : tous les PJ sélectionnés peuvent avoir le même montant sans division ; le MJ explique toute exception individuelle. La contribution n'est jamais calculée uniquement par les dégâts.
4. **Répétition et multi-récompenses** : statut et provenance de l'événement, identité commune boss/quête ; empêcher double crédit par run, mais autoriser des récompenses distinctes motivées.
5. **Indice INDEX / identités ARCHIVES** : `pj:l004-hero-fiction` est un ID d'instance natif ; INDEX PR #97 initial le refusait à cause d'un validateur de slug. Le module MATH préserve les deux points, **sans créer d'alias arbitraire**. INDEX doit fournir le contrat de correction, et 05/QA valider l'interopérabilité.
6. **Consentement et application** : le drapeau `approvedByMJ:true` est **local, non cryptographique**, sans preuve d'autorité. La seule opération existante `M02.grantAward` crédite le montant suggéré : **ne jamais l'appeler** depuis ce prototype. L'application réelle aux fiches, sauvegardes v2/v3 et contrôle d'identité restent hors périmètre.

**Conclusion :** privilégier A pour un prototype de recommandations MJ transparent et réversible ; traiter B comme comparaison numérique seulement. Arbitrage DG attendu sur les hypothèses d'indice, de portée et d'aide. Aucun changement de formule M01–M05, de canon, de PR #85/#91 ni du site Pages.
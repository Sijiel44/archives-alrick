# ANT-DECH-005 — Dix antagonistes de Déchéance, niveaux 2 à 20

**Responsable :** ANT. **Branche de mission :** `content/ant-dech-005-personnages`. **Décision créateur :** poursuivre le développement canonique direct et enrichir l'univers, les personnages et le Studio avec biographies, pactes, relations, réussites, luttes, PNJ subordonnés et niveaux variés.

## Sources, antériorité et portée

- MON-DECH-01 : cinq états, transformation surnaturelle réelle, croissance par Chutes liées ; ne pas confondre souffrance, emploi, capture ou foi avec Déchéance.
- ANT-DECH-01 : pyramides des trois Seigneurs et neuf Princes ; les nouveaux lieurs en relèvent sans ajouter de Seigneur ou Prince.
- SYS-DECH-01 : mini-système **2d6** ; les niveaux de référence des portraits ne sont **pas** ses valeurs Emprise ni une fiche 5d6.
- `lore/lab-dech-003` : six portraits A–F et pactes antérieurs. Séran, Maëline, Dorsel, Lysane et Terval sont adaptés ; Nérel, victime transformée de force, **n'est pas requalifié en coupable** ni ajouté aux dix antagonistes volontaires.
- `content/groupes/ORG-DECH-01...06` : organisations canoniques distinctes des pactisés individuels. Un collègue peut être non corrompu et une institution ne devient pas branche Déchue automatiquement.

Le créateur a demandé de canoniser directement les développements communs. Les récits de passé personnel dans les dix fiches sont donc des **biographies nouvelles d'univers**, pas des événements joués à une table. Les implantations générales sont fixées comme points de départ, sans imposer leur présence à Orin ni à toutes les campagnes.

## Matrice des personnages

| Code | Nom | Niveau narratif | Stade | Lien de Déchéance / dépendance | Principal ressort |
| --- | --- | ---: | --- | --- | --- |
| PER-DECH-01 | Ysilde | 2 | Tentation | Kelmor/Esmor, ruban de traversée | Secourir tout en gardant liberté |
| PER-DECH-02 | Séran | 3 | Tentation | Visiteuse masquée, borne de gué | Protection et surveillance |
| PER-DECH-03 | Maëline | 5 | Fêlure | Intermédiaire d'Halvéra, cahier | Guérir sans posséder |
| PER-DECH-04 | James Veyrel | 7 | Fêlure | Officier de Varnok, sceau | Preuve et pré-condamnation |
| PER-DECH-05 | Kelmor | 8 | Rupture | Esmor ; une Chute liée volontaire | Théâtre, adhésion, témoignage |
| PER-DECH-06 | Dorsel | 10 | Rupture | Caldria ; une Chute liée | Secours et dette perpétuelle |
| PER-DECH-07 | Rûna | 12 | Rupture | Mordhéan ; disciple devenu Chute liée | Forger et délier les chaînes |
| PER-DECH-08 | Lysane | 15 | Déchéance | Nérékhal ; deux branches, génération | Refuges utiles, loyautés contradictoires |
| PER-DECH-09 | Irveth | 17 | Déchéance | Seyrond ; deux branches dont lieurs | Noms et propriété des souvenirs |
| PER-DECH-10 | Terval | 20 | Abîme | Caldria ; trois branches, deux générations | Nourriture et monopole prédateur |

Sous leurs ordres ou à leurs côtés : Mara la batelière, Nalia l'aide-soignante, Eveline la greffière, Perri le machiniste, Géraud le charretier, Miren la serrurière, Tovan le lieur, Rime la receveuse, Dalia l'archiviste et Orenne la magasinière. Seul Tovan est explicitement une **Chute liée** de Rûna ; les travailleurs libres ne sont ni Déchus ni matière à Tribut. Ces personnages de soutien ont des fonctions et des possibilités de choix, mais **pas** de profil 5d6 arbitraire.

## Modifications apportées

- Dix pages canoniques `content/personnages/PER-DECH-01.md` à `10.md`, une page d'index et des liens de découverte depuis les groupes et menaces.
- Dix portraits graphiques SVG originaux dans `quartz/static/images/personnages-dechus/`, sans ressources distantes ni droits tiers.
- `studio-local/catalogue-antagonistes.json` : références publiques avec SHA de source et niveau indicatif ; adaptateur `bibliotheque.mjs` et action **Créer un PNJ de campagne** sur `CREATION_TYPES.npc`.
- Serveur local, assemblage Pages et politique CSP : catalogue et images listés, fenêtre joueur en liste blanche.
- Contrat technique ANT_DECH_005_CONTRAT_PORTRAITS_STUDIO, tests Node et Chrome, CI étendue, marqueur de publication approuvé.
- Dossier de secrets MJ séparé du dépôt public : conditions cachées, opérations, Ancrages et fronts ; **aucune donnée privée dans les pages publiques**.

## Contrôles à consigner au commit final

- **`npm run test:antagonistes` : réussi (3/3)** — identités/versions/stades et routes HTTP/CSP, aucun schéma de combat injecté.
- **`npm test` : réussi**, incluant les moteurs 5d6 M01–M05 et Grimoire/Bestiaire, compilation et tests de catalogue ; **387 pages publiables, 285 codes uniques**.
- **`npm run build` / `npm run check:site` : réussis**, **1 178 pages HTML et 68 796 liens et ressources internes** contrôlés.
- `studio-local/tests/antagonistes.test.mjs` : scénario navigateur **prévu en CI**, pas exécuté localement car Chromium du conteneur n'a pas le droit de créer une socket (restriction système constatée pour ANT-DECH-004).
- **`git diff --check` : réussi** ; absence de nouveaux profils M03/INDEX inventés et séparation de la projection MJ/joueur.

La publication et les résultats CI du **HEAD final** doivent être ajoutés à ce journal après le contrôle GitHub ; le succès du site assemblé ne suffit pas à annoncer Pages.

**Décisions ouvertes :** profil 5d6 calibré par PNJ/INDEX/MATH (niveaux 2/3/5/7/8/10/12/15/17/20), descriptions visuelles définitives, prix de privation en règles, identité de la visiteuse de Séran si le MJ veut la dévoiler dans une campagne. Le taux d'Emprise, les effets mécaniques et les failles ne sont pas déduits numériquement des biographies.

**À revoir par :** PNJ, LORE, INDEX, MATH, COMBAT, MAG, BEST, STUDIO, ARCHIVES, AVE, QTE, QA. **À valider par DG/créateur :** recette de publication et future conversion mécanique ; les nouveaux personnages co-développés sont adoptés dans l'univers selon la directive du créateur.

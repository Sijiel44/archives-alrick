# ANT-DECH-007 — Rapport technique de mission

**Objet :** Compagnie Dervaux et Kess, nouveaux personnages et illustrations, raccords à la bibliothèque du Studio. **Responsable :** ANT, 16 novembre 2026. **Nature :** création directe de monde partagé demandée par le créateur ; aucune scène de campagne ni profil 5d6 inventé.

## Périmètre et sources vérifiées

- Sources de canon : `content/monde/decheance-canon.md` (Tentation, Fêlure, Rupture/Chute liée, Déchéance et Abîme), `content/monde/dechus-hierarchie.md` (Caldria, trois Seigneurs et neuf Princes), `content/groupes/ORG-DECH-03.md`, `content/personnages/PER-DECH-06.md` et la galerie des vingt portraits existants.
- Contrats techniques : `studio-local/catalogue-organisations.json`, `studio-local/catalogue-antagonistes.json`, `studio-local/bibliotheque.mjs`, `studio-local/serve.mjs`, `studio-local/tests/*antagonistes*` et `*organisations*`. Le système de cartes, la copie locale de faction/PNJ et la projection contrôlée sont **réemployés**.
- Contrôle des homonymes : recherche exacte insensible à la casse dans les fiches `content/`, les rapports disponibles et les catalogues ; aucune occurrence antérieure des noms Dervaux, Kess, Orianne, Maren, Siva Norel, Perrin Havas, Mérine Solard ou Gabin Rosset trouvée avant l'ajout.
- La demande de « compagnie marchande » écarte volontairement les titres de noblesse, les noms descriptifs du mal et les toponymes obligatoires. L'enseigne choisie repose sur les noms des associés.

## Faits livrés et limites

1. `ORG-DECH-07` : activité de transport et vente avec moyens limités (deux barques, attelages loués), direction, sous-traitants, routes non monopolistiques, trois événements historiques nouveaux, quatre paliers de conflit et plusieurs issues.
2. `PER-DECH-21..26` : six biographies originales, niveaux de référence **17, 14, 6, 9, 4, 2**, relations internes et externes, scènes de découverte, réparations et options de repli ; trois personnes explicitement non Déchues.
3. **Illustrations :** six portraits originaux peints générés par ImageGen puis optimisés en WebP 800×1 066 ; enseigne SVG de la compagnie et six variantes SVG du portrait. Aucune illustration ne provient d'une banque tierce. Les alternatives textuelles restent lisibles sans média.
4. **Studio :** catalogues publics v2 et v4, intégrité de version SHA pour chaque Markdown, groupe « Maisons de négoce » séparé, MIME `image/webp`, copie locale `npc` et `faction` existante sans migration des sauvegardes.
5. **Secret MJ :** dossier de mission séparé hors dépôt. Le lien réel de Tribut, les substitutions d'originaux et les fronts d'inaction ne sont pas dans Pages ou les catalogues.
6. **Enrichissement éditorial :** les six biographies incluent désormais des habitudes de vie, des réussites et des erreurs récentes, des dilemmes concrets, des possibilités de négociation et des issues de retrait. Ces éléments construisent l'univers partagé sans raconter une aventure qui aurait été jouée.
7. **Réemploi libre en campagne :** les joueurs peuvent consulter les biographies publiques ; le MJ peut copier chaque référence dans son Studio, l'adapter et garder son historique de table indépendant du catalogue public. Lecture d'une page et savoir d'un personnage de joueur restent distincts.

## Contrôles et preuves

Le contrat de recette complet est dans [`ANT_DECH_007_CONTRAT_TECHNIQUE.md`](ANT_DECH_007_CONTRAT_TECHNIQUE.md). Le dépôt de référence est la [PR #134](https://github.com/Sijiel44/archives-alrick/pull/134). Sur son premier commit `9608878e26cd9dd08343116077b0c2e1a02e99d7`, la [CI #43867900319](https://github.com/Sijiel44/archives-alrick/actions/runs/43867900319) s'est terminée avec succès (build, liens, régressions et recette Chrome). Les enrichissements narratifs ultérieurs doivent être testés à nouveau ; leur résultat et le SHA final de fusion sont à consigner avant clôture.

## Vigilances restantes

- L'état `Non Déchu` dans le catalogue n'est pas une caractéristique 5d6 et ne confère ni immunité aux pactes ni résistance magique.
- Maren est un **Lieur de Rupture**, pas un dixième Prince. Son Tribut suppose une vraie Chute liée ; le personnel non pactisé ne vaut jamais comme ressource de progression.
- Les effets rituels sont volontairement bornés à des documents et scènes préparés. Rien ne crée un contrat, ne contraint un tiers non consentant ou ne révèle un coupable universellement.
- Les entreprises rivales peuvent rester utiles ; un blocus durable exige d'assurer le ravitaillement avant la fermeture d'un dépôt.
- Les portraits WebP remplacent l'image principale des six nouvelles fiches, sans supprimer les variantes SVG ni affecter les vingt références antérieures.

**À revoir par PNJ, LORE, MAG, INDEX, MATH, STUDIO, QA et ARCHIVES. À valider par DG/créateur :** les profils de combat éventuels, l'implantation exacte des dépôts et tout déclassement de secret MJ. Aucune passation n'est envoyée automatiquement.

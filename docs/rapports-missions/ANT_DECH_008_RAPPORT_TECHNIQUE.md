# ANT-DECH-008 — Rapport technique et éditorial

**Mission :** deux compagnies marchandes, développement de la Première Ancre, nouveaux PNJ illustrés et catalogue de futures institutions antagonistes. **Référent :** ANT. **Date :** 16 novembre 2026. **Décision du créateur :** créer du lore partagé et publier les fiches publiques directement, en laissant aux MJ la liberté des copies homebrew et aux joueurs la liberté de se renseigner.

## Périmètre et sources effectivement contrôlées

- `content/monde/decheance-canon.md`, `content/monde/dechus-hierarchie.md`, `content/groupes/organisations-decheance.md` et `ORG-DECH-01..07`, `content/personnages/personnages-dechus.md` et `PER-DECH-01..26` : états de Déchéance, pactes limités, cadre institutionnel, niveaux narratifs.
- `content/personnages/REV-02.md`, `content/groupes/GRP-01.md`, `content/monde/` et les synthèses de continuité consultées : Première Ancre composite, Régent lié à une branche, chevilles de seuil et causes non identifiées. **La certification intégrale des bruts historiques n'est pas revendiquée** ; ne pas déduire de nouvelles appartenances.
- `studio-local/catalogue-organisations.json`, `catalogue-antagonistes.json`, `bibliotheque.mjs`, `serve.mjs`, les tests de données et de navigateur : schémas existants réemployés sans adaptateur ni stockage parallèle.
- Contrôle des noms : recherche des nouveaux noms propres dans les pages et catalogues de `origin/main`; le nom de travail « Soren Bellame » a été remplacé par **Véridan Bellame** en raison du Sören/Soren déjà existant dans l'Odyssée. Vérifier les derniers ajouts concurrents avant fusion.

## Livrables publics

1. **Maison Varin et Cessac — `ORG-DECH-08`.** Deux bacs, atelier de réparation et cordages. Service utile : passage de secours. Risque : transformer la sécurité en monopole. Événements : secours après une crue, ponton rompu sans culpabilité magique établie, clause d'exclusivité contestée. Subalternes : Belan Ostre et Doria Fenel, sans fiche chiffrée.
2. **Comptoir Bellame et Juvan — `ORG-DECH-09`.** Papier, encre, copies et messagers. Service utile : préserver les actes. Risque : réserver la preuve à qui paie ou reçoit une autorisation. Événements : archives sauvées de l'eau, recours perdu parce qu'un document a été retenu, vérification rituelle contestée. Subalterne et partenaires ouverts, sans pouvoir judiciaire.
3. **Six biographies `PER-DECH-27..32`.** Édèle Cessac (N12, non Déchue), Jorien Varin (N8, Tentation), Nima Sarrel (N3, non Déchue), Véridan Bellame (N16, non Déchu), Orla Juvan (N10, Fêlure), Ilian Kerme (N5, non Déchu). Chacun a métier, passé, réussite, tort, intérêts, relations, risque de dérive et réparation possible.
4. **Première Ancre — `GRP-ANC-01`.** Une coalition aux intérêts distincts, ni royaume ni faction maléfique monolithique. Le Régent sans Couronne ne commande qu'une branche ; certains enlèvements de chevilles de seuil ont aggravé des déséquilibres, sans expliquer à eux seuls toutes les anomalies. Réfugiés, demandeurs d'Ancrage et négociateurs durs sont des **lignes de tension proposées**, pas des listes de membres attestés.
5. **Visuels originaux.** Six portraits peints WebP, six variations SVG et trois emblèmes vectoriels locaux ; fichier de provenance `studio-local/media/PROVENANCE.md`. Aucun lien d'image tiers ou licence empruntée.
6. **Studio.** Trois maisons dans « Maisons de négoce », Première Ancre dans « Coalitions et Ancrages », six institutions civiles conservées ; 32 biographies dans « Personnages et lieurs ». Copier une fiche crée une instance locale de campagne, pas un changement de canon ni un nouveau fait joué.
7. **Propositions futures.** Douze organisations et trois arcs prioritaires dans `ANT_DECH_008_PISTES_ORGANISATIONS.md`, **non canonisés et non publiés comme fiches Quartz**. L'institution peut soutenir des gens, puis perdre son cap, se réformer, refuser de changer ou faire face aux victimes.

## Diversité de résolution et conséquences

Le conflit de la première compagnie peut se résoudre par inspection, passage alternatif, grève négociée ou concurrence ; le second par recopie publique, arbitrage, protection des témoins ou retraite commerciale. La Première Ancre laisse place à un mandat partiel, une scission, un repli de branche, une réparation de seuil et une négociation conditionnelle. Les trajectoires de personnages incluent rival humain, retour après échec, rechute potentielle et **rédemption avec restitution et responsabilité**, jamais pardon obligé.

Les pactes restent descriptifs et matériels. **Aucune caractéristique, bonus, dégât, rang de combat ou autorité d'Ancrage nouvelle n'est créée.** Une personne de Fêlure n'est pas une Lieuse de Rupture ; aucune Chute liée n'est inventée pour les membres non Déchus.

## Tests, publication et limites

Voir `ANT_DECH_008_CONTRAT_TECHNIQUE.md` pour les commandes, les assertions et la recette humaine. Les résultats, liens PR, SHA final et CI seront ajoutés lors de la clôture. Le marqueur Pages autorise le déploiement après fusion sous contrôle CI ; la création d'un fichier ne démontre pas la disponibilité du site public.

**À revoir par LORE** (identité et branches de Première Ancre), **PNJ** (profils, subalternes), **MAG** (borne des pactes), **INDEX/MATH** (tout combat), **STUDIO/QA/ARCHIVES** (catalogues, copies, restauration), **AVENTURES/QUÊTES** (fronts et sorties). **À valider par DG/créateur :** institution suivante, portrait externe éventuel de nouveaux membres historiques et décision de donner un profil 5d6 à certains. Aucune passation envoyée automatiquement.

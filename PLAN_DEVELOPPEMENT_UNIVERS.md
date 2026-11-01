# Les Archives d'Alrick — audit et priorités de développement

**Actualisation du 30 octobre 2026 — dossiers du Compendium : 245 fiches codées approuvées (216 avant le lot de 40).** Vingt-huit pages vérifiées peuvent être consultées avec avertissement ; douze portraits ou candidatures restent non publiés. Voir [l'audit de la relecture](docs/AUDIT_COMPENDIUM_40_PERSONNAGES_2026-10-30.md). Les chiffres des lots précédents sont conservés comme historique, pas comme compteurs actuels.

**Compteur reproductible vérifié le 31 octobre 2026 :** `npm run check:content` trouve 369 pages sélectionnées pour génération et 269 codes uniques portés par ces pages. Ce compteur de fiches codées publiées est distinct des 645 sujets du registre directeur, des pages de navigation, des brouillons et des sources historiques non migrées.


Les paragraphes historiques du plan conservent les états successifs (177, 180, 198, 216 et 245) à leur date ; ils ne remplacent pas le compteur reproductible ci-dessus. Voir [le diagnostic des 645 sujets et la méthode d'Atlas](docs/RECONCILIATION_645_ET_ATLAS_2026-10-30.md). Restent à réconcilier notamment les alias des fiches de personnages et les cartes géographiques exactes.


**Audit éditorial : 29 octobre 2026, après PR #22 et publication du lot Bible MON-005 / MON-PASS-01.**

**Mise à jour du 30 octobre 2026 :** l'Atelier 5d6, sa progression expérimentale et ses profils JSON ont été publiés comme **outils de playtest** (PR24–25), sans passer le système général en canon. La page d'accueil a été réorganisée et le catalogue complet isolé. Une vérification des **331 fichiers Markdown** n'a trouvé **aucune fiche non publiée déjà `etat_editorial: valide`** ; la priorité suivante est donc une **validation éditoriale sourcée** des dossiers en chantier. Voir [AUDIT_SITE_2026-10-30.md](AUDIT_SITE_2026-10-30.md).

Ce document est un **plan de travail**, pas un récit de la campagne d'Orin, pas une loi du monde, pas une liste de contenus approuvés automatiquement pour la publication. Les codes CB désignent des **sessions sources**, pas des dates du calendrier.

## A. Ce qui est stabilisé

- **Quatre portes d'entrée** : Univers, Odyssée, Jouer, MJ assisté par IA.
- **13 rubriques thématiques** avec index publics, sans exposer les fiches rouges.
- **Déchéance** : loi de contre-ascension, Tribut des Chutes, **3 Seigneurs et 9 Princes**, mini-système optionnel 2d6, huit scénarios non joués (PR22). Les pages MJ portent spoilers et non-indexation. Les règles 2d6 ne sont **pas rétroactives** aux séances d'Orin.
- **Dix-Huit Grandes Puissances** : noms et domaines de référence tirés de B39-05/B39-06 ; profils encore inégaux.
- **Six passages entre Couronnes** : typologie de la Bible S09 et limites de la magie de la Faille.
- **Guilde des Aventuriers et secours mutuels** : projet **adopté mais à déploiement progressif** en CB32 ; ne pas le présenter comme une administration déjà installée partout.

**Publication approuvée : 180 fiches codées** (171 du lot initial, quatre Déchéance, deux Bible). Ne pas compter les index non codés comme fiches de registre. Le chiffre n'efface pas les sujets du registre directeur v2.4 (**645 sujets**) qui ne sont pas tous migrés.

## B. Priorités proposées pour les prochains chantiers

### P0 — Validation de la diffusion réelle

- Vérifier dans **GitHub Actions → Publier sur GitHub Pages** le succès du workflow déclenché par le marqueur `.github/pages-publication-approved.txt`.
- Contrôler depuis un **vrai navigateur public** l'accueil, `univers/`, `jouer/`, `monde/dix-huit-grandes-puissances`, `monde/passages-entre-couronnes`, `monde/decheance-canon`.
- Vérifier les avertissements **fermés** des pages `monde/dechus-hierarchie` et `jouer/decheance-aventures`, ainsi que leur absence des recherches et du sitemap.
- Les vérifications automatiques `npm test` constituent une preuve de **build et liens**, **pas** une vérification visuelle du service Pages.

### P1 — Bible du monde : douze profils à approfondir et six à étoffer

- **Astraë, Aionel, Nyméa, Orévan, Syrka, Dhoréa** : étoffer domaines, personnalité, symboles, traditions et limites **à partir de V01** ; signaler ce qui reste à inventer.
- **Brégan, Maëtra, Tairin** : consolider les relations avec Orin dans CB41–43, mais conserver des vies, désaccords et objectifs propres. Étendre ensuite aux autres profils fondateurs.
- **Les sept courants** : source V01, Grand Conseil ; les alliances et intentions sensibles ne doivent pas devenir une nouvelle « faction du mal » uniforme.
- **Drakon, Aurélion, Níðor** : trois fiches autonomes, plus un cadre pour les autres dragons ; ne pas les assimiler aux Déchus.

### P1 — Atlas utilisable indépendamment d'Orin

- Fiches régionales à développer après relecture de V02/CB : **Montagnes de l'Aube et leur Nord, Valbrume, Skalor, Mérien, Torngard, Entre-Rives**, avec carte, voies d'accès, métiers, institutions et communautés.
- Distinguer **ville attestée / route ou ouvrage construit / extension discutée / carte proposée**.
- Travailler les Failles comme **risque local possible**, pas comme réseau de brèches officiellement cartographié sans preuves.
- Donner des **régions de départ et des contrats de guilde** que d'autres groupes peuvent jouer sans rencontrer les héros de la campagne fondatrice.

### P1 — Failles, guildes et secours : formalisation du jeu

- Les **Failles existent** dans la Bible ; leur fréquence, les méthodes de fermeture, les dispositifs et la certification de menace demandent arbitrage et éventuellement scènes jouées.
- Proposer un **cadre d'alerte et d'intervention graduée** compatible avec le secours mutualisé de CB32 ; ne pas prétendre que les postes sont déjà opérationnels.
- Transformer les premiers **one-shots non joués** en modules autonomes avec fiches de mission et conséquences documentées séparément.
- Définir le **rôle ponctuel des Revenants** (Bram, Kelm, Torven) sans convertir les compagnons d'Orin en service public garanti.

### P2 — Bestiaire et antagonistes hors Déchéance

- Le bestiaire hostile, les mythes réinterprétés, les factions marchandes et les cultes de manipulation figurent dans des **brouillons non canoniques**. Prévoir arbitrage **fiche par fiche** avant promotion.
- Développer des **prédateurs non intelligents, créatures sous contrainte, adversaires responsables et êtres libres venus d'autres Couronnes** comme catégories différentes.
- Élaborer une démonologie qui n'identifie pas tous les « démons du Nord » à des Déchus ou à une seule espèce.
- Définir la continuité des organisations et des territoires sans attribuer automatiquement toutes les brèches à la Première Ancre.

### P2 — Déchéance : premiers essais de table

- Tester le 2d6 avec des personnages **débutants, lieurs, Princes et un Seigneur indirect**, en vérifiant : chances de réussite, guérison, longueur des combats, vitesse d'Emprise et intérêt réel du refus.
- Vérifier que les seuils **5→6, 8→9, 11→12** ne permettent pas de compter une victime captive comme Chute liée volontaire.
- Revoir les pouvoirs de **contrôle surnaturel** : résistance, durée, rupture d'Ancrage, refus des PJ et choix de campagne antagoniste.
- Ne pas déclarer une aventure de l'Odyssée jouée parce qu'un scénario est publié.

### P3 — Système général de jeu / MJ-IA

- Le module 2d6 de Déchéance est **optionnel**, et le Codex V04 décrit les Cercles et les contraintes de magie ; il n'existe **pas encore de système universel harmonisé** pour tout le monde.
- Établir les principes transversaux de création de PJ, progression, danger, recherche, sorts, combat et coordination avec les deux axes (ascension et Déchéance).
- Pour l'IA MJ : journal propre à chaque table, secrets séparés des connaissances des PJ, libre arbitre, réponses graduées et suivi des Ancrages.

## C. Critères de publication pour toute nouvelle fiche

1. Source vérifiée contre le **brut ou la Bible/Atlas/Codex appropriés**, ou **approbation explicite du créateur** pour le nouveau lore.
2. Statut `faits_joues` / `lore_valide` / `proposition_non_jouee` respecté ; **lore validé n'implique pas scène jouée**.
3. Identification des secrets ; si spoilers, **`spoilers:true`, `unlisted:true`** et avertissement fermé.
4. Aucun renvoi vers des brouillons non publiés et aucune géographie / chronologie / capacité ajoutée par déduction.
5. `npm test` réussi avant fusion et approbation explicite du **lot exact** dans le marqueur Pages.
6. Après fusion, contrôle **indépendant** de la réussite du déploiement et du rendu public.

**Sources principales du plan :** fichiers et CI du dépôt `Sijiel44/archives-alrick`, PR #20–22 ; V01 *Bible du monde et des puissances* v1.7 (B39-05/B39-06, S09 passages) ; V02 *Atlas* v1.8 ; INST-CB32-SECOURS-AVENTURIERS ; registres directeurs v2.4.


## D. Priorités techniques et de parcours (30 octobre 2026)

1. **P0 — Vérifier les quatre entrées et le catalogue en navigateur réel**, surtout sur mobile, après chaque déploiement. Les tests actuels vérifient la génération, les liens, le contenu public et les protections spoilers, pas tous les clics ni la performance perçue.
2. **P1 — Relire les brouillons prioritaires** : MAG-106, les sept courants, Failles et dossiers de lieux CB1–43 ; sélectionner les éléments véritablement approuvables sans attribuer des faits non joués à la campagne.
3. **P1 — Généraliser les modèles de fiches PJ/PNJ/créatures** autour de la progression expérimentale 1–25 et des voies libres **uniquement comme paramètres optionnels**, avec source et version. Les fichiers JSON d'essai n'ont aucune autorité canonique.
4. **P2 — Tester les combats, la magie et les incidents de 3 échecs**, puis décider d'un système général unique ou de modules distincts ; harmoniser la Déchéance 2d6 seulement après arbitrage.
5. **P2 — Audit ergonomique et d'accessibilité** : taille de typographie, longueur de navigation, formulation des filtres, clavier, repli mobile, profils et recherche. Ajouter un test automatique de l'accueil et de la bibliothèque séparée.


## E. Lot 02 achevé — Sources prioritaires (30 octobre 2026)

Trois fiches ont reçu une validation directe des documents et sont publiables : **MAG-106** (scène d'Elyra, accès avec avertissement), **MON-COUR-01** (sept courants et nuances politiques) et **MON-ARCH-01** (trois Archétypes et règles de consultation du Conseil). Le socle des **Failles**, déjà publié sous **MON-PASS-01**, est enrichi d'amorces non jouées. **Total de 180 fiches codées approuvées** après ce lot.

**À traiter ensuite :** fiches individuelles des six Grandes Puissances moins détaillées (Astraë, Aionel, Nyméa, Orévan, Syrka, Dhoréa), géographie de l'Atlas et institutions locales, puis profils de dragons contemporains. Les noms de nouvelles créations peuvent être décidés en cours de travail, mais vérifier à chaque fois qu'ils ne doublonnent pas un personnage ou lieu déjà attesté. Les prototypes de guérison mémorielle, les fermetures de Failles et les alliances diplomatiques non jouées restent des questions ouvertes.


## F. Chantier monde/guildes approfondi — 30 octobre 2026

**Livré dans le nouveau lot :** sept fiches de courants + sept sceaux graphiques, six portraits de Grandes Puissances, trois dragons individuels, un dossier de gravité et d'imprévisibilité des Failles, deux outils de jeu publiés (incidents facultatifs et missions de guilde), enrichissement de la Guilde/Heimdall et de la continuité d'Elyra/Orin. **Total actualisé : 198 fiches codées approuvées.**

**À vérifier ensuite, avant l'Atlas :**
1. **Niveaux de responsabilité des guildes et procédures de secours** — arbitrer contrats, financement, certifications et autorité politique locale.
2. **Veille cosmologique et limites techniques** — approfondir les méthodes possibles d'observation, de secours, d'étude, de stabilisation, et les exceptions imprévisibles.
3. **Déchus et Failles** — scénarios de sabotage établissant réellement les liens surnaturels et leurs coûts, pas simple collecte de tristesse.
4. **Portraits individuels et culture draconique** — nouvelles rencontres possibles, coutumes, décisions autonomes et limites.
5. **Passage Atlas** : seulement après fixation des routes, relais et compétences locales ; ne pas dessiner de réseau de Failles prévisibles prétendument exhaustif.

Les hypothèses reliant l'ancienne tragédie familiale d'Orin à une Faille majeure doivent rester **non jouées / à vérifier** tant que les archives de l'invasion n'en apportent pas la preuve.



## Corrections du créateur sur les 40 dossiers

Existence du groupe de huit profils de CB42 **canonique, sans rencontre ni emploi** ; Margha Trois-Mers **cuisinière de bord identifiée et engagée** ; quatre fonctions des gardiens d'Entre-Rives **validées** (Maelin Maintenir, Rudek Séparer, Sela Témoigner, Eren Transmettre). Ne créer ni nouveau rituel du pont, ni second cuisinier déjà recruté, ni rappel pour les deux profils décédés. Les huit biographies restent hors publication et la nouvelle page Margha protégée par spoilers porte le compte à **245**.

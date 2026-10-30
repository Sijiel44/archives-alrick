# Les Archives d'Alrick — audit et priorités de développement

**Audit éditorial : 29 octobre 2026, après PR #22 et publication du lot Bible MON-005 / MON-PASS-01.**

Ce document est un **plan de travail**, pas un récit de la campagne d'Orin, pas une loi du monde, pas une liste de contenus approuvés automatiquement pour la publication. Les codes CB désignent des **sessions sources**, pas des dates du calendrier.

## A. Ce qui est stabilisé

- **Quatre portes d'entrée** : Univers, Odyssée, Jouer, MJ assisté par IA.
- **13 rubriques thématiques** avec index publics, sans exposer les fiches rouges.
- **Déchéance** : loi de contre-ascension, Tribut des Chutes, **3 Seigneurs et 9 Princes**, mini-système optionnel 2d6, huit scénarios non joués (PR22). Les pages MJ portent spoilers et non-indexation. Les règles 2d6 ne sont **pas rétroactives** aux séances d'Orin.
- **Dix-Huit Grandes Puissances** : noms et domaines de référence tirés de B39-05/B39-06 ; profils encore inégaux.
- **Six passages entre Couronnes** : typologie de la Bible S09 et limites de la magie de la Faille.
- **Guilde des Aventuriers et secours mutuels** : projet **adopté mais à déploiement progressif** en CB32 ; ne pas le présenter comme une administration déjà installée partout.

**Publication approuvée : 177 fiches codées** (171 du lot initial, quatre Déchéance, deux Bible). Ne pas compter les index non codés comme fiches de registre. Le chiffre n'efface pas les sujets du registre directeur v2.4 (**645 sujets**) qui ne sont pas tous migrés.

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

# Les Archives d’Alrick — L’Odyssée d’Orin

Encyclopédie de jeu de rôle construite avec **Quartz 5**, dotée de quatre parcours : **Univers**, **Odyssée d’Orin**, **Jouer dans ce monde** et **MJ assisté par IA**. Le dépôt compte désormais **259 fiches codées approuvées**, dont quatre nouveaux dossiers Atlas détaillant l'Hiver, le Printemps, l'Été et l'Automne de l'Île des Divertissements. L’ancien décompte des fiches jaunes/rouges sur 285 entrées est un état historique, pas la classification actuelle des 645 sujets. L’index directeur documentaire v2.4 porte sur **645 sujets**, dont tous ne sont pas migrés au web.

**Publication active :** le workflow GitHub Pages déploie les lots explicitement approuvés après fusion sur `main` lorsque le marqueur de publication est modifié. Une PR seule ne publie rien.

## Continuité et sauvegardes

Le guide [Continuité, sauvegardes et reprise](docs/CONTINUITE_SAUVEGARDES.md) décrit les branches de checkpoint, l'archive Git automatique hebdomadaire dans Actions et le script de sauvegarde locale pour Windows (`scripts/Sauvegarde-Alrick.ps1`). **Les sources Word/Excel privées et les exports ChatGPT doivent rester hors de ce dépôt public**. Les artefacts GitHub expirent après 30 jours : conserver une copie indépendante.

## Démarrer sur Windows

Installer Node.js 24 et Git. Depuis ce dossier :

```powershell
npm.cmd ci
npm.cmd run dev
```

Ouvrir **http://localhost:8080/**. Garder le terminal ouvert ; `Ctrl+C` arrête l’aperçu. Une page HTML ouverte directement depuis l’Explorateur ne remplace pas le serveur Quartz.

Pour reproduire le sous-chemin du futur site GitHub Pages :

```powershell
npm.cmd run preview:pages
```

Ouvrir alors **http://localhost:8080/archives-alrick/**. Ne pas lancer les deux serveurs en même temps sur le port 8080. Le port peut être changé avec `npm.cmd run dev -- --port 8081`.

Sur macOS/Linux, utiliser `npm` à la place de `npm.cmd`.

## Vérifier et construire

```powershell
npm.cmd test
```

Cette commande vérifie les métadonnées, les codes uniques, les dossiers exclus, TypeScript, la génération Quartz, tous les liens et ressources internes sous `/archives-alrick/`, les avertissements MJ et leur exclusion de la recherche et du sitemap. Le résultat déployable se trouve dans `public/` ; ce dossier est généré et ignoré par Git.

Les plugins utilisés sont des paquets npm verrouillés par `package-lock.json` : `npm ci` suffit. Aucun clonage de plugin ou téléchargement de thème au moment de la consultation n’est nécessaire.

## Éditer l’encyclopédie

- Ouvrir **`content/`** comme coffre Obsidian. Les pages conservent les wikiliens.
- Partir d’un gabarit dans `modeles/`, avec `publish: false` pendant la rédaction.
- Après relecture, mettre `publish: true` pour inclure une page dans le build. Ce champ ne déploie rien sur Internet.
- Conserver codes, sources et statuts documentaires. Voir [le contrat éditorial](CONTRAT_EDITORIAL.md).
- Les pages choisies pour le MJ vont dans `content/mj/` avec `spoilers: true` et `unlisted: true`. Ne pas ajouter de tags ou d’alias qui révéleraient leur contenu ailleurs.

L’avertissement MJ est présent même sur une URL directe et fonctionne sans JavaScript. Il protège la découverte, **pas la confidentialité** : le contenu reste dans le HTML. Les bruts, Word, classeurs, notes personnelles et l’inventaire de 592 sujets ne sont pas inclus dans ce dépôt ni dans le site.

## Publier après validation

1. Relire les fiches modifiées, les guides publics et les pages à spoilers; vérifier les tests et approuver/fusionner seulement le lot concerné.
2. Dans **Settings → Pages**, vérifier que **GitHub Actions** est la source. **Le dépôt est actuellement public** : ne jamais y placer les documents bruts privés, secrets du MJ, sauvegardes personnelles ou contenus non approuvés. Les avertissements de spoilers n'assurent aucune confidentialité.
3. Si disponible, protéger l’environnement **`github-pages`** par une validation humaine et limiter les déploiements à `main`.
4. Vérifier la stratégie de déploiement des workflows avant fusion : un lot explicitement approuvé peut utiliser le marqueur `.github/pages-publication-approved.txt`; un déploiement manuel reste possible si le workflow le permet. Ne pas modifier le marqueur sans décision sur les fiches nouvellement approuvées.
5. Le workflow reconstruit, vérifie, puis déploie à **https://sijiel44.github.io/archives-alrick/**. Cette adresse est une destination prévue, pas une preuve de publication actuelle.

Les paramètres Pages et l’offre du compte doivent être vérifiés avant le premier lancement. Un dépôt privé ne garantit pas que son site Pages sera privé. Le workflow de CI n’a que `contents: read` ; seul le job de déploiement manuel reçoit `pages: write` et `id-token: write`.

## Accès GitHub et travail par PR

L’autorisation du connecteur GitHub et celle de Git local sont distinctes. Une connexion réussie dans ChatGPT/Codex n’authentifie pas automatiquement `git clone` ou `git push`. Cette première intégration peut être envoyée par le connecteur sans copier de jeton dans les fichiers.

## Corrections des 404 et du thème

- Accueil réel `content/index.md`, lecture des métadonnées activée et filtre `publish` explicite : le build ne peut plus réussir silencieusement sans accueil.
- Liens relatifs pour les rubriques et les fiches ; `baseUrl` inclut le nom du dépôt.
- Le mode `--baseDir` est propagé à la recherche globale. La page 404 utilise des chemins d’assets et de retour adaptés au préfixe local ou Pages.
- `its-theme.ttrpg-dnd` est une **variante**, pas un dépôt à cloner ni un fichier CSS distant. Configuration : `theme: its-theme`, `variation: ttrpg-dnd`, paquet `@quartz-themes/its-theme@1.0.1`. Les encadrés du thème sont conservés ; la mise en page et les couleurs sont propres aux Archives.

## Provenance et limites

Les huit fiches initiales proviennent du `Alrick_Kit_Demarrage_Quartz5_v0.1.zip`. **Depuis, le contenu a été largement enrichi** ; de nombreuses références CB42–43 ont été revues, mais l'audit exhaustif des bruts et des 645 sujets reste à mener. Les sujets restant à migrer ne sont pas encore migrés. Le décor montagneux est une évocation graphique hors canon. Voir [UPSTREAM.md](UPSTREAM.md) pour le moteur et les licences.

## Fiches enrichies et portraits

Les fiches **REV-06 — Heimdall** et **REV-16 — Aldren** proviennent de l'édition validée en octobre 2026. Le portrait de Heimdall, approuvé par le créateur, est rangé dans `content/images/personnages/` et référencé avec un chemin relatif. Les fichiers image approuvés (WebP, AVIF, PNG, JPG) sont autorisés sous `content/images/`, avec une limite de 3 Mio par fichier. Aucun autre format binaire ne doit entrer dans ce dossier. Les sources brutes et les notes privées demeurent en dehors de `content/`.

## Groupes et alliances

La septième rubrique, `content/groupes/`, rassemble les compagnies, coalitions, suites, conseils et autres collectifs. Première fiche : **GRP-01 — Les Revenants**. Les prochains dossiers envisagés sont la Première Ancre, la suite divine d’Orin et le Conseil des Dix-Huit. Ne jamais déduire l'appartenance à un groupe du seul fait d'avoir participé à ses missions, partagé son logement ou reçu son aide. Pour créer une fiche, utiliser `modeles/groupe.md`, renseigner les faits joués, les listes de membres effectivement attestées et les sources.

## Revenants — fiches individuelles en révision

Les sept nouvelles fiches `REV-01`, `REV-02`, `REV-03`, `REV-04`, `REV-05`, `REV-07`, `REV-08` complètent `REV-06` (Heimdall). La distinction Revenants/Rappelés reste explicite. Cinq portraits sont des **concepts artistiques provisoires**, et non des portraits officiels ; les études de Kelm et Vaëra ont été écartées pour incohérence physique avec les sources. La branche éditoriale doit rester en brouillon jusqu'à validation du contenu et des visuels. La fusion ne déclenche aucun déploiement public.


## Quatre portes d'entrée (édition du 29 octobre 2026)

- `content/univers/index.md` — socle du monde réutilisable.
- `content/odyssee/index.md` — histoire et continuité propres à Orin.
- `content/jouer/index.md` — démarrage de nouveaux héros et aides de table.
- `content/mj-ia/index.md` — méthode et prompt de MJ assisté par IA.

Les pages existantes ne sont **pas dupliquées**. Les métadonnées `portee`, `public_cible`, `usage_en_jeu` et `periode` sont conseillées pour les prochaines révisions ; elles ne modifient pas le niveau de preuve ni la visibilité. Voir `CONTRAT_EDITORIAL.md`.


## Rubriques d'univers consolidées — 29 octobre 2026

La porte `content/univers/index.md` dessert désormais les **treize index de domaines** : monde, lieux, cultures, institutions, magie, économie, objets, projets, créatures, personnages, groupes, Maison et chroniques. Les anciens index de travail de cultures, institutions, objets et projets ont été **réécrits pour être publiables** avec uniquement des renvois à des fiches déjà approuvées.

Le guide `content/univers/magie-pour-jouer.md` présente les distinctions du Codex (mana, maîtrise, Cercles, traditions, ingénierie), **sans ajouter de règle numérique ni prétendre que le bestiaire et la cosmologie sont entièrement migrés**.

Les titres des fiches non publiées peuvent être cités comme **sujets en chantier**, mais leurs pages `publish: false` ne sont pas ouvertes par les index publics. Les fiches à révélations conservent leur avertissement. Les guides/index **ne sont pas des fiches codées** et ne modifient pas les 171 codes du lot éditorial approuvé. Le statut des sujets à migrer demeure suivi séparément.


## Nouveau lore et module de jeu — Déchéance (29 octobre 2026)

Après la consolidation CB43, le créateur a validé un **nouveau principe d'univers** : la **Déchéance**, voie de contre-ascension et de dépendance pyramidale au *Tribut des Chutes*. Le premier répertoire de créatures et personnes antagonistes compte **3 Seigneurs Déchus et 9 Princes Déchus** (leur existence et leurs traits sont du **lore créé et approuvé**, **pas des rencontres déjà jouées**).

Quatre nouvelles pages **codées** s'ajoutent aux **171 fiches initialement approuvées**, soit **175 pages codées approuvées à ce stade** :
- `content/monde/decheance-canon.md` — **MON-DECH-01**, loi du monde, approuvée.
- `content/monde/dechus-hierarchie.md` — **ANT-DECH-01**, personnages majeurs, **spoilers + non répertorié**.
- `content/jouer/decheance-systeme.md` — **SYS-DECH-01**, mini-système **optionnel** à 2d6, non rétroactif.
- `content/jouer/decheance-aventures.md` — **Q-DECH-01**, huit aventures publiables comme **propositions non jouées**, **spoilers + non répertorié**.

Les autres dossiers de la branche concernant les Failles, les sociétés antagonistes, les créatures mythologiques ou les premières versions de Déchéance ne deviennent **pas automatiquement canoniques** et demeurent `publish: false` tant que leur statut n'est pas arbitré. Cette approbation n'ajoute aucune séance après CB43, ni un dix-neuvième siège parmi les Dix-Huit.

Les liens se trouvent depuis les rubriques `monde/index.md` et `jouer/index.md`. Les aventures indépendantes ne réécrivent jamais les conséquences de l'Odyssée d'Orin.


## Complément de la Bible publié après PR #22 (29 octobre 2026)

Deux **fiches canoniques sourcées** s'ajoutent aux 175 fiches codées déjà approuvées :
- **MON-005** `content/monde/dix-huit-grandes-puissances.md` — répertoire vérifié des **18 Grandes Puissances**, depuis V01 B39-05/B39-06.
- **MON-PASS-01** `content/monde/passages-entre-couronnes.md` — six catégories de passages décrites dans V01 S09, dont les Failles.

**Total : 180 fiches codées approuvées** (171 lot initial + quatre Déchéance + deux Bible). Les six Grandes Puissances moins détaillées restent à enrichir. Les hypothèses de Failles récurrentes, antagonistes hors Déchéance, bestiaire et démonologie restent des **chantiers non canoniques** tant que les arbitrages ne sont pas effectués.

Un audit éditorial et les prochaines priorités figurent dans [PLAN_DEVELOPPEMENT_UNIVERS.md](PLAN_DEVELOPPEMENT_UNIVERS.md). Le workflow Pages est déclenché uniquement après modification explicite du marqueur d'approbation ; un build réussi ne garantit pas à lui seul la disponibilité publique.


## Atelier 5d6 / Base 12 — pilote expérimental, deux pages publiques

Deux pages **non codées**, en `etat_editorial: en_cours` / `canon_statut: proposition_non_jouee`, s'ajoutent aux **180 fiches codées approuvées** (ce compteur ne change pas) :
- `content/jouer/systeme-5d6-base12.md` : explication du système **5d6 / Base 12** en test ; **ne remplace ni les jets CB historiques ni le module Déchéance 2d6**.
- `content/jouer/atelier-5d6.md` : interface PJ / MJ / MJ-IA, sauvegarde `localStorage`, fiches PNJ/créatures **importables en JSON**, profils fictifs, dés et journal, contexte IA à copier. **Sans backend ni accès automatique aux fiches de l'encyclopédie**.

Implémentation : `quartz/components/Atelier5d6.tsx` + `quartz/components/scripts/atelier5d6.inline.ts` ; test de structure intégré à `scripts/check-site.mjs`. Sur ordinateur partagé, **les notes locales ne sont pas des données secrètes protégées**. Le contenu est une version pilote à tester auprès d'un petit groupe avant canonisation mécanique.



## Atelier v1.1 — fiches évolutives et références publiques (pilote)

Le prototype 5d6 ajoute :
- une **réinitialisation confirmée de la fiche active**, préservant les autres fiches et le journal ;
- des champs **niveau 1–12, voies libres, talents, bénédictions, malédictions et objets narratifs** ;
- un suivi de **trois échecs** dans une même catégorie (magie, mêlée, tir, négociation), déclenchant un événement fictionnel optionnel **1d12**, parfois favorable ;
- une **recherche directe dans `static/contentIndex.json`**, filtrée aux fiches publiques Personnages / Créatures. Le bouton d'adaptation enregistre la **source** tout en précisant que les statistiques sont fictives ;
- trois **profils JSON d'essai** `quartz/static/atelier5d6-profils-demo.json` dont un est référencé à une fiche publique et **n'en prétend pas reproduire les valeurs canoniques** ;
- une évolution de l'export vers **`alrick.sheets.v2`**, tout en préservant l'import des profils v1.

Page d'explication : `content/jouer/progression-voies-incidents.md` — **proposition_non_jouee**, `en_cours`, publiée comme pilote. Le contenu ne transforme pas les capacités ou objets proposés en lore établi, ne canonise pas les niveaux des personnages CB et ne remplace pas encore le mini-système Déchéance 2d6.

Les notes MJ restent en stockage local, sans sécurisation sur appareil partagé. La recherche passe par **l'index public existant** qui exclut les fiches à spoilers ; elle n'ouvre pas les archives privées.


## Audit du site et nouvelle architecture de l'accueil (30 octobre 2026)

La page d'accueil `content/index.md` a été simplifiée : quatre parcours de navigation prioritaires, présentation du système 5d6 en test, puis renvoi vers la nouvelle page `content/bibliotheque.md` qui conserve la recherche et les filtres sur les fiches publiques. La navigation range les treize domaines dans un volet repliable ; les dossiers à révélations sont séparés.

L'inventaire a contrôlé **331 pages Markdown** dans `content/`. **Aucune fiche non publiée ne possède `etat_editorial: valide`** : aucune fiche encore masquée n'a été rendue publique sans nouvelle relecture. Les dossiers en chantier (dont MAG-106 et les courants divins) requièrent une comparaison avec les sources.

Voir [AUDIT_SITE_2026-10-30.md](AUDIT_SITE_2026-10-30.md) pour les constats, risques, décisions et priorités de travail. Le compteur 177 concerne les **fiches codées**, et non la somme de toutes les pages de navigation ou des brouillons.


## Relecture sourcée et publication ciblée (30 octobre 2026)

- `MAG-106` : essai de retrait d'existence d'Elyra en CB42, **faits joués**, mais **spoilers et non répertorié** ; vérification dans *Campagne Brut 4.2*, pages source 95–97.
- `MON-COUR-01` : `content/monde/courants-et-antagonismes.md`, **lore_valide**, courants et inclinations politiques de la Bible V01, Tome III v1.2.
- `MON-ARCH-01` : `content/monde/puissances-et-dragons.md`, **lore_valide**, Drakon, Aurélion, Níðor et limites du Conseil.
- `MON-PASS-01` : enrichi de méthodes d'observation et d'aventures **proposées, non jouées** ; le dossier composite `failles-entre-couronnes.md` reste `publish:false`.

**180 fiches codées approuvées** au total (177 existantes + 3). Les autres dossiers `en_chantier` ou `a_verifier` ne sont **pas** promus en bloc. Le nouveau canon décrit les principes vérifiés, tandis que les suggestions de jeu sont toujours labellisées comme telles.


## Lot éditorial — Failles, courants et nouveaux portraits (30 octobre 2026)

Au terme du **lot précédent**, le compte était de **198 fiches codées approuvées**, contre **180 avant ce lot**. Les nouveaux dossiers : sept courants (**7**), six Grandes Puissances (**6**), trois dragons (**3**), une fiche de Failles (**1**), et Elyra (**1**). Deux guides jouables sans codes sont également activés : `jouer/evenements-aleatoires-failles` et `jouer/protocole-failles-guildes`, tous deux `canon_statut: proposition_non_jouee`.

Les anciennes sections du README conservent les chiffres des **lots historiques** ; **255** est le total actualisé après le premier lot CB44. MAG-106 demeure un code interne, et son titre affiché est une formulation narrative. Les personnages d'Orin et les révélations restent exclus du répertoire public sans avertissement. Les sept symboles SVG sont des **emblèmes éditoriaux** et non des armes héraldiques établies. Les trois dragons sont des **créations originales de monde**, non des rencontres rétroactives.

Les Failles peuvent être totalement imprévisibles. Le système de guilde ne contrôle pas toutes les Failles ; les dieux et les Veilleurs n'ont aucune obligation d'intervenir en permanence. Aucun événement historique de l'Odyssée n'a été redéfini comme Faille sans preuve source.


## Réconciliation des 645 sujets et Atlas régional — 30 octobre 2026

**216 fiches codées approuvées** après ajout/relecture de **10 fiches de lieu** (neuf nouvelles cités/régions et Entre-Rives promue) et de **8 biographies** : les codes et liens sont vérifiés contre V02, V03, CB2, CB38 et CB43. Une page publique n'est pas une reproduction intégrale des volumes privés. Consulter [le diagnostic des 645 sujets](docs/RECONCILIATION_645_ET_ATLAS_2026-10-30.md) et [l'Atlas](content/lieux/index.md). Les anciennes statistiques couleur décrivent un inventaire partiel historique ; les **465 sujets sans correspondance automatique** ne sont **pas** automatiquement 465 fiches absentes. Les bruts et le CSV détaillé restent hors du dépôt public.

## Relecture des 40 biographies du Compendium V03 — 30 octobre 2026

La réconciliation nominative des 40 anciens brouillons aboutit à **28 fiches vérifiées et publiables derrière avertissement**, et **12 dossiers préparatoires conservés hors publication**. Le compteur des fiches codées approuvées passe de **216 à 244**. La relecture corrige notamment les engagements signés en CB43, les Rappelés sans emploi, les homonymes et l'identité de la charpentière associée au vieux pont. [Lire le bilan éditorial](docs/AUDIT_COMPENDIUM_40_PERSONNAGES_2026-10-30.md). Les statistiques jaunes/rouges de l'ancien inventaire (285 sujets) ne sont pas une nouvelle évaluation des 645 sujets.


## Arbitrages de canon après les 40 dossiers — 30 octobre 2026

Le créateur confirme huit personnes existantes malgré leur absence de rencontre ou d'emploi, et valide **Margha Trois-Mers comme cuisinière de bord recrutée**. Il fixe les quatre fonctions des gardiens d'Entre-Rives. Les **huit profils restent en chantier hors publication**, leurs biographies pouvant servir à de futures campagnes ; aucun nouveau Rappel, contrat ou scène n'est créé. La fiche de Margha est publiée avec avertissement, portant le total de **244 à 245 fiches codées**. Voir [la continuité sourcée](content/jdr-alrick/arbitrages-compendium-20261030.md).


## CB44 intégrée — mise à jour du 30 octobre 2026

Le dossier `jdr-alrick/cb44-bilan-et-reprise` fixe **la reprise exacte** de la campagne : Elyan attend la réponse d'Orin à une question personnelle. La première réconciliation de CB44 comprend **10 biographies** nouvelles (soit **255 fiches codées approuvées**), un dossier d'Atlas des îles, un journal de changements canoniques et une **chronique historisée** des scènes familiales. Les projets et les rôles encore indécis restent signalés. Le créateur a autorisé la publication volontaire des campagnes brutes : l'index et le Word intégral de CB44 ont été préparés à part pour dépôt dans `sources/campagnes/CB44/`, **sans prétendre qu'ils sont déjà poussés sur GitHub**. Voir [procédure](docs/SOURCES_CAMPAGNES_PUBLIQUES.md).


## Fiches des quatre saisons et protocole MJ (lot de consolidation)

Les quatre dossiers **GEO-CB44-HIVER, GEO-CB44-PRINTEMPS, GEO-CB44-ETE, GEO-CB44-AUTOMNE** enrichissent l'Atlas comme lieux réutilisables par les autres MJ, avec attractions, climat, techniques, limites, canards magiques et amorces de jeu. Pour la campagne fondatrice d'Orin, lire le **prompt exact de reprise après CB44** : `content/mj/reprise-cb44.md`. Le protocole **`docs/PROTOCOLE_RECHERCHE_AVANT_REPONSE_JDR.md`** impose de vérifier les sources effectivement accessibles avant de trancher les points matériels. L'inventaire des 15 Word bruts reçus se trouve dans `docs/INVENTAIRE_SOURCES_CB01_CB44_2026-10-30.md`; les bruts ne sont **pas** encore importés en totalité dans GitHub. Le total des fiches codées approuvées est désormais **259**.


## Les sources CB01 à CB44 et la prochaine séance

Les quinze Word de campagne distincts ont été reçus, leurs empreintes SHA-256 vérifiées et leurs transcriptions Markdown préparées dans un **paquet de transfert** (3 027 fichiers, disponible dans la conversation). Le [registre d'archivage](sources/campagnes/README.md) documente ce qui **n'a pas encore été téléversé** sur GitHub : les documents Word binaires et la transcription complète. Il ne faut pas les supposer présents dans la recherche du dépôt avant import par GitHub Desktop.

Pour rejouer l'**Odyssée d'Orin**, consulter [[jdr-alrick/verrous-de-reprise-apres-cb44|les verrous après CB44]] et [[mj/reprise-cb44|le prompt de reprise]], tous deux protégés contre les spoilers. La scène s'arrête **avant la réponse d'Orin à Elyan**. Les descriptions réutilisables de l'[[lieux/parc-des-quatre-saisons-services|Île des Divertissements]] sont indépendantes des intrigues fondatrices. Le compteur reste à **259 fiches codées approuvées**.


## Nouvelles références Atlas et essais 5d6 — lot thématique

L'Atlas comprend désormais la **Ligue des Trois-Fleuves**, **Vael-Sur** et **l'Empire de la Chaîne écarlate**, avec trois fiches de lieu codées, soit **262 fiches codées approuvées après ce lot**. La page publique sur les dragons clarifie leurs souverainetés et les limites des dragons artificiels. Une aventure locale indépendante à Keldrun et un dossier d'antagonistes non Déchus sont proposés **sans créer d'événements joués**.

Le nouveau [[jouer/playtest-5d6-probabilites|rapport 5d6]] donne les probabilités exactes des 7 776 résultats et un protocole PJ/MJ/MJ-IA, sans proclamer l'équilibrage final. Le module Déchéance 2d6 garde son statut de mini-système approuvé séparé.

Les **six Word reçus, après CB42**, sont répertoriés avec SHA-256 dans `docs/REGISTRE_SIX_VOLUMES_HISTORIQUES_CB42_2026-10-30.md` ; une sauvegarde ZIP des originaux existe dans la conversation, **pas encore en binaire dans ce dépôt**. Le lot ne remplace pas les volumes plus récents et ne change pas la reprise CB44 auprès d'Elyan.

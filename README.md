# Les Archives d’Alrick — L’Odyssée d’Orin

Encyclopédie de jeu de rôle construite avec **Quartz 5**, dotée de quatre parcours : **Univers**, **Odyssée d’Orin**, **Jouer dans ce monde** et **MJ assisté par IA**. Le dernier suivi éditorial compte **171 fiches codées approuvées** (109 vertes et 62 jaunes) parmi **285 entrées de travail**. L’index directeur documentaire v2.4 porte sur **645 sujets**, dont tous ne sont pas migrés au web.

**Cette branche prépare la publication. Aucun déploiement ne se déclenche sur une PR, un push ou une fusion.**

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

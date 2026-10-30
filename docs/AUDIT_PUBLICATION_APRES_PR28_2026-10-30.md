# Audit de publication après la PR n° 28 — 30 octobre 2026

**Objet :** revue des 18 fiches ajoutées, de leur provenance documentaire et du site généré, après la fusion de [la PR n° 28](https://github.com/Sijiel44/archives-alrick/pull/28).

**Commit fusionné dans `main` :** `6cc83fded9cfe4f6826c0b16f9101a50dd23ff41`.

## Résultat

- **PR n° 28 fusionnée** après succès de la CI de la branche. Des corrections ont été intégrées avant fusion : noms de domaines d'Astraë et de Nyméa alignés sur la Bible v1.7 ; textes alternatifs des sept symboles, titres internes des dragons et métadonnées/ponctuation d'Elyra.
- **CI de `main` : succès**, [exécution 41105145610](https://github.com/Sijiel44/archives-alrick/actions/runs/41105145610).
- **Sauvegarde automatique du dépôt : succès**, [exécution 41105145591](https://github.com/Sijiel44/archives-alrick/actions/runs/41105145591).
- **GitHub Pages : déploiement réussi**, [exécution 41105145501](https://github.com/Sijiel44/archives-alrick/actions/runs/41105145501).
- **Limite essentielle :** l'ouverture directe du domaine `sijiel44.github.io` n'était pas accessible à l'outil web. Les tests d'affichage décrits ci-dessous proviennent du **véritable artefact HTML généré par GitHub Actions**, ouvert localement dans Chromium avec CSS injectée ; ils ne constituent **pas** un test réseau complet du site hébergé ni une recette d'appareil réel.

## Vérification des sources et des 18 fiches

| Lot | Volume | Contrôle |
|---|---:|---|
| Sept courants divins `COUR-01` à `COUR-07` | 7 | Référentiel : Bible V01 v1.7, Grand Conseil Tome III v1.2, sections IV–XIV. Courants transversaux, sans allégeance obligatoire ; **Dévoreurs** dans la version détaillée, malgré une ancienne annexe évoquant les « Enfants du Silence ». |
| Grandes Puissances `DIV-13` à `DIV-18` | 6 | Domaines contrôlés à partir de la liste explicite de la Bible V01 ; ne créent aucune dix-neuvième Puissance. Les cultes locaux et quêtes d'exemple restent **proposés**. |
| Dragons `DRG-01` à `DRG-03` | 3 | Créations nouvelles déclarées ; aucune rencontre rétroactive avec Orin, souveraineté draconique préservée. |
| Failles et ruptures `MON-FAI-02` | 1 | Distingue calamité imprévisible, faille exploitée par un acteur et Déchéance ; les échelles sont narratives, non règles chiffrées. |
| `MAG-106`, événement Elyra | 1 | Confronté à l'atelier d'Elyra dans `Campagne Brut 4.2` : piqûre consentie, disparition de la blessure, effet mémoriel non consenti, Autorité d'Existence distincte de l'Autorité sur la Magie. Faits joués, non technique généralisable. |

**Total : 18/18 fiches présentes dans l'artefact post-fusion.** Les titres publics lus dans les fichiers HTML ne commencent pas par des codes techniques. Les 7 emblèmes SVG existent à leurs chemins attendus et passent une lecture XML.

Les sources privées complètes restent **hors dépôt public**. Une proposition locale n'est pas transformée en fait joué par sa publication. L'affirmation d'une création originale explicitement approuvée est fondée sur l'historique de la PR ; ce n'est pas une scène de campagne.

## Audit du site généré, ancienne et nouvelle publication

| Indicateur | Avant PR n° 28 | Après PR n° 28 |
|---|---:|---:|
| Documents HTML dans l'artefact | 758 | **808** |
| Liens internes analysés | 28 378 | **31 563** |
| Cartes de la bibliothèque publique | 83 | **100** |
| Pages nouvelles attendues | — | **18/18** |
| Symboles nouveaux | — | **7/7**, SVG lisibles |

Le contrôle de résolution des liens internes ne relève aucune cible inexistante parmi les pages ordinaires. **Trois fausses alertes** sont causées par la racine `/archives-alrick/` depuis la page `404.html` : le validateur hors ligne ne réécrit pas la base du projet. Les ancres internes testées sont valides.

### Accueil, quatre parcours et treize rubriques

Les pages **Accueil**, **Découvrir l'univers**, **Lire l'Odyssée**, **Jouer dans ce monde**, **MJ assisté par IA**, **Bibliothèque**, ainsi que les **treize domaines thématiques**, ont été examinées sur un rendu local Chromium en formats ordinateur (`1440×900`) et mobile (`390×844`).

- Les quatre portes figurent sur l'accueil ; la bibliothèque complète est sur une page distincte.
- Les treize domaines sont regroupés dans une navigation repliable.
- Aucun débordement horizontal n'a été détecté sur les vingt pages-écrans échantillonnées à ces deux largeurs.
- À partir des scripts compilés de l'artefact, le filtre de domaine et la recherche du catalogue ont été testés en format ordinateur et mobile : sélection de « Magie », recherche sans résultat, affichage du panneau vide, puis réinitialisation **fonctionnent**.
- Aucun incident JavaScript n'a été relevé dans **ces tests isolés**. Cela ne prouve pas le fonctionnement de tous les modules JS (navigation Quartz, recherche globale, atelier 5d6, import/export JSON) en ligne.

### Révélations et spoilers

Sur les pages canoniques **Elyra** (`personnages/per-cb31-elyra.html`) et **Une blessure disparue, un souvenir effacé** (`magie/mag-106.html`) :
- `details.spoiler-disclosure` est **fermé initialement** ;
- le corps de l'article est **invisible** avant l'action du lecteur ;
- il s'affiche après clic explicite sur l'avertissement ;
- la balise robots vaut `noindex, nofollow, nosnippet` ;
- ces fiches n'apparaissent pas dans les **100** cartes de la bibliothèque publique.

Le même mécanisme replié a été contrôlé sur les entrées `mj/index.html` et `jdr-alrick/index.html`.

**Attention :** ce garde-fou est narratif et éditorial, non un contrôle d'accès. La source reste dans un dépôt public et les pages peuvent être consultées par URL directe.

## Points ouverts pour une vraie recette publique

1. **Priorité P1 — Navigateur connecté :** ouvrir directement le domaine Pages sur Windows et sur téléphone, contrôler les URL et les redirections réelles, le chargement des sept SVG, le réseau, le clavier et les caches après mise en ligne. Le succès du déploiement GitHub Actions ne vaut pas preuve de lisibilité depuis chaque réseau.
2. **Priorité P1 — Ergonomie :** agrandir certaines descriptions, méta-informations et contrôles affichés autour de **11–13 px** ; évaluer le contraste cuivre/gris et les états de focus clavier.
3. **Priorité P1 — Mobile :** navigation supérieure dense, plusieurs liens répartis sur des rangées ; faire une recette à tailles réelles et avec zoom texte avant une refonte.
4. **Priorité P1 — Interactions complètes :** vraie navigation Quartz SPA, recherche globale, volet spoilers après changements de page, atelier 5d6, export/import JSON, conservation du profil local. Ces parcours n'ont pas été validés par un navigateur ayant chargé intégralement le site sur le réseau.
5. **Priorité P2 — Bibliothèque :** les 100 cartes sont affichées en longue liste sur mobile ; étudier le confort de la recherche et une éventuelle pagination/affichage progressif, sans perdre la recherche ni rendre les spoilers visibles.
6. **Priorité P2 — Restaurations :** conserver l'artefact de publication hors de GitHub, car celui de Pages expire rapidement ; les sauvegardes Git ne sont pas une copie indépendante du site rendu.

## Décision

**Publication documentaire et technique validée pour la PR n° 28.** Les 18 pages, leurs titres et emblèmes, la cohérence des statuts et le workflow Pages ont été vérifiés ; les garde-fous spoilers sont présents.

**Recette de production : partiellement validée, non clôturée.** Elle exige encore un parcours réel du domaine public et une vérification d'accessibilité/ergonomie sur appareils. Aucune nouvelle donnée de campagne n'est déclarée canonique par ce rapport.

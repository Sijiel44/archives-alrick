# DG-LOT-004 — démonstration locale intégrée (P0-A)

**Base immuable :** PR #85 @ `2ab809ef5351940e0fc272b859d10f21de894d00`. QA L003 de référence : PR #91 @ `20679f7bf5c744f29dd041413cc63801ce5daea1`. **Branche exclusive 05 :** `prototype/dg004-integrated`.

Ce dossier est un **assemblage d'intégration réversible**, pas une édition des modules STUDIO, BUILDER, MATH, INDEX, ARCHIVES ou ATELIERS. Le mode P0-A ci-dessous est un **pont d'intégration provisoire** utilisant leurs API du lot003 ; les livraisons dédiées des propriétaires sur les sous-arbres lot004 sont **en attente** et devront être contrôlées avant qualification du lot complet.

## Démarrer en local — données fictives uniquement

Depuis la racine du dépôt, avec Node.js 24 :

```sh
npm ci
node experiments/dg-lot004/tools/build.mjs
node --test experiments/dg-lot004/tests/integration/demo.test.mjs
node experiments/dg-lot004/tools/serve.mjs
```

Dans un **profil de navigateur vierge et isolé**, ouvrir **http://127.0.0.1:4173/**. La vue joueur est uniquement sur **http://127.0.0.1:4174/** ; ne pas utiliser une adresse réseau, un tunnel, GitHub Pages, une URL Internet ou `file://`. Le serveur refuse les requêtes hors des deux loopbacks et ne sert jamais le bundle privé à l'origine joueur.

Cliquer **« Démarrer la démonstration fictive »**. Une campagne fictive est créée avec un PJ fictif v2, une copie de créature fictive du banc existant et une scène fictive contenant une note canari privée. Les actions passent par les services réels STUDIO/ARCHIVES. Aucune fenêtre joueur n'est ouverte ou publiée automatiquement : sélectionner ensuite **« Ouvrir la fenêtre joueur »**, cocher **« Partager le titre de la scène »** et cliquer **« Publier uniquement la sélection »**. Le joueur ne reçoit que le titre explicitement autorisé.

Pour revenir à l'état initial, cliquer **« Quitter et effacer uniquement la démonstration »**, puis recharger la page. La fonction vérifie l'identité de la campagne DG004 avant suppression de sa sauvegarde et de son marqueur ; elle refuse toute suppression si une sauvegarde antérieure existe ou si l'identité n'est plus celle de la démo. Les autres clés restent inchangées. **Ne pas utiliser le mode P0-A pour des données de campagne réelles.** Pas de chiffrement promis ni de mécanisme d'accès Internet.

Arrêter `serve.mjs` avant la recette automatisée (ports 4173/4174 exclusifs) :

```sh
CHROMIUM_PATH=/usr/bin/google-chrome-stable node experiments/dg-lot004/tools/test-demo-browser.mjs
```

La recette lance son **propre Chrome**, avec profil temporaire et sandbox inchangé, vérifie l'opt-in, le refus de remplacer une sauvegarde préexistante, un parcours complet fictif, deux origines, les canaris de confidentialité puis la suppression sélective, et nettoie ses processus.

## Limites de qualification

- P0-A : **pont d'intégration fonctionnel à revalider en CI**, en attendant l'interface et les contrats propriétaires BUILDER/STUDIO : [#92](https://github.com/Sijiel44/archives-alrick/issues/92).
- P0-B : MATH et INDEX doivent livrer des contrats strictement non transactionnels, sans nouveau calcul ni XP appliquée : [#93](https://github.com/Sijiel44/archives-alrick/issues/93).
- P0-C : ATELIERS doit livrer le parcours objet fictif → capacité descriptive → créature → scène : [#94](https://github.com/Sijiel44/archives-alrick/issues/94).
- QA/REVUE : les sources du lot003 ont déjà été qualifiées par QA de référence, mais **aucune QA indépendante du lot004 n'est encore exécutée**. Toute évolution doit passer sur le SHA intégré exact.
- Aucune fusion, publication Pages, canonisation, mécanisme numérique non homologué, stockage MJ réel ou serveur public.

## Propriété des fichiers et transmission

Voir `manifest.json` pour les sous-arbres exclusifs, la référence QA, les blobs de base, les points d'attente et le statut. Les futurs modules propriétaires ne seront copiés qu'à partir de SHA de livraison contrôlés. L'intégrateur est responsable de `tools/**`, `tests/integration/**`, du manifeste, du guide et du workflow ; il n'édite pas `src/{ports,studio,rules,catalog,creators}/**` des autres rôles.

# Maintenance des dépendances de construction · 15 novembre 2026

Le lot Fiabilité reprend les trois alertes npm héritées de la version publiée. Il met à jour les dépendances concernées sans lancer de correction globale forcée ni modifier les règles de jeu, les contenus d’univers ou les données des campagnes.

## Versions retenues

| Dépendance | Verrou précédent | Verrou corrigé | Motif |
| --- | --- | --- | --- |
| `minimatch` | 10.2.6 | 11.0.8 | L’avis [GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249) affecte les versions de 7.0.0 à moins de 11.0.1. Le passage majeur est nécessaire ; 11.0.8 conserve l’appel `minimatch(path, pattern)` utilisé dans Quartz. |
| `sharp` | 0.35.4 | 0.35.5 | Version corrective indiquée par [GHSA-wq5f-xc86-pv6w](https://github.com/advisories/GHSA-wq5f-xc86-pv6w), avec les paquets natifs et libvips associés. Le module installé annonce librsvg 2.63.2. |
| `source-map-js` | 1.2.1 | 1.2.2 | Mise à jour transitive satisfaisant la plage existante, selon [GHSA-68fv-2mgg-jv7q](https://github.com/advisories/GHSA-68fv-2mgg-jv7q). Aucune nouvelle dépendance directe ou surcharge n’est ajoutée pour elle. |

`package.json` relève les minima déclarés à `^11.0.8` et `^0.35.5`. Le verrou ne change que ces dépendances, les binaires/libvips de Sharp, `source-map-js` et le helper transitif `@isaacs/nonrecursive-glob-match` requis par minimatch 11. Les autres versions verrouillées sont conservées.

Les moteurs déclarés par les paquets acceptent Node 24 : minimatch demande `20 || >=22`, Sharp `>=20.9.0` et source-map-js `>=0.10.0`. Le poste de recette utilise Node 24.22.1 et npm 11.19.1 ; le projet conserve son fichier `.node-version` à 24.

## Vérifications réalisées

- L’audit de départ retrouve trois alertes : une modérée et deux élevées.
- Après les mises à jour ciblées, `npm ci` réussit depuis le verrou corrigé.
- `npm audit --json` réussit et signale **0 alerte** à la date de ce contrôle. Ce résultat décrit la base d’avis npm consultée ; il ne constitue pas une qualification générale de sécurité du site.
- Les deux manifestes sont des JSON valides, sans octet NUL. Aucune restauration du manifeste n’a été nécessaire pendant cette exécution.
- `npm run check:types` réussit avec les nouveaux types.
- Un contrôle en mémoire exerce les sept motifs d’exclusion de `quartz.config.yaml` sur neuf chemins représentatifs, une conversion SVG vers PNG 32 × 24 avec Sharp, puis la lecture d’une source map simple avec `source-map-js` ; ces contrôles réussissent. Aucun média du projet n’est régénéré par cette vérification.

La suite complète `npm test`, les recettes navigateur du lot et le contrôle de la version publiée sont exécutés par le lot d’intégration après gel des fichiers. La séance humaine et l’essai sur appareil tactile réel restent des étapes distinctes de Fiabilité.

## Traces de travail

Les journaux locaux se trouvent dans le dossier temporaire du poste : `Fiabilite-Deps-Install-Cible.log`, `Fiabilite-Deps-Update-SourceMap.log`, `Fiabilite-Deps-Npm-Ci.log` et `Fiabilite-Deps-Types.log`. Ils ne sont pas ajoutés aux assets du Studio. Les manifestes de départ ont été conservés temporairement pour contrôler l’étendue exacte du changement de verrou.

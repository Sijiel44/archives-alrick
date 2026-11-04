# L003-INTEGRATED — rapport technique provisoire (05)
Date : 2026-11-04. Statut : **prototype partiel — non qualifié**.

## Traçabilité
- Source DG : PR #84 ; documents lus au commit `b5c59854b802dc25617d9bcd7c576495199a41dd`.
- Base code figée : `88f774f3d0d6d520d8d11443b72202b9caf4f94b`.
- Branche unique écrivain : `prototype/dg003-integrated`; PR brouillon #85.
- Aucune copie des six propriétaires : **aucun commit / blob / signature de leur part n'a été reçu dans cette session**.
- Manifeste de provenance propriétaire actuellement vide ; ne jamais déclarer leurs fichiers intégrés.

## Livré
- Pages statiques MJ et joueur distinctes ; build esbuild à commandes fixées ; serveurs HTTP loopback 4173 / 4174 ; séparation des routes et CSP restrictive.
- Manifeste descriptif, procédure de livraison contrôlée, scripts de tests Node et Chromium, workflow GitHub distinct des workflows Quartz/Pages.
- Aucun backend, aucune transaction mana/charge, aucune formule M01–M05 recopiée, aucun accès au content/, aucune projection non approuvée.

## Exécution et preuves
- GitHub : création de branche, neuf commits initiaux, PR #85 brouillon : **confirmés par le connecteur**.
- Checkout clone : **ÉCHEC**, `Could not resolve host: github.com` dans le conteneur de cette conversation.
- Node local : v22.16.0, **pas Node 24** ; dépendances dépôt non installées.
- `npm ci`, `npm test`, build esbuild sur dépôt, `test-unit`, `test-browser` : **NON EXÉCUTÉS** dans cette session.
- CI PR #85 : workflow créé, son issue/état d'exécution ne constitue pas un test réussi et doit être constaté par SHA final.
- Chromium et recette sur pages réellement servies : **NON EXÉCUTÉS**.
- Sortie L003-01 à L003-10 : **NON VALIDÉES**. Les scripts de tests échouent volontairement si les modules propriétaires ou scénarios QA manquent.

## Opérations d'assemblage à venir
1. Recevoir branche + commit et chemins autorisés, comparer SHA blob avec les sources de GitHub.
2. Copier chaque blob dans son chemin exclusif depuis le dépôt source, sans merge, sans reformater ni réécrire.
3. Enregistrer dans manifest les modules visuels disposant d'un export `mount`; ne pas monter automatiquement les ports/contrats comme écrans.
4. Adapter exclusivement le câblage sous outils d'intégration quand les vraies signatures sont connues.
5. Relancer les six commandes README, conserver sorties et CI du HEAD final ; QA sur ce HEAD et rapport séparé.

## Bloqueurs
P1 : parcours vertical absent, suites propriétaires absentes, recette navigateur réelle non réalisée. Tout écart de sécurité joueur serait P0. Pas d'Alpha validée avant preuves.

À revoir par : BUILDER, MATH, INDEX, ARCHIVES, STUDIO, ATELIERS, QA et REVUE.
À valider par DG/créateur : clôture après preuve sur HEAD, puis toute éventuelle fusion ou publication (non autorisées).

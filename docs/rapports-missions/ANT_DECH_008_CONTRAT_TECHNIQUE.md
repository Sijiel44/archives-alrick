# ANT-DECH-008 — Contrat d'intégration et recette reproductible

## Contrat de données

| Surface | Ajout | Contrat inchangé |
| --- | --- | --- |
| Quartz public | `ORG-DECH-08`, `ORG-DECH-09`, `GRP-ANC-01`, `PER-DECH-27..32` | Frontmatter `publish: true`, identifiants, état `lore_valide`, liens, illustrations et alt |
| Catalogue des organisations | 10 références, trois dans « Maisons de négoce », une dans « Coalitions et Ancrages » | `entre-rives/organisations-publiques/1` ; SHA `git hash-object` de chaque source ; descriptions sans secrets |
| Catalogue des antagonistes | 32 PNJ, dont sept non Déchus, niveaux narratifs 2–20 | `entre-rives/antagonistes-publics/1` ; pas de profil M03 implicite, `level` de l'instance non renseigné |
| Images | Six WebP et six SVG secondaires pour PNJ ; trois insignes SVG originaux | Chemins locaux autorisés, pas de scripts ni d'assets externes ; MIME `image/webp` et `image/svg+xml` |
| Studio MJ | Référence → copie locale `npc` ou `faction` → modification par le MJ | Notes locales privées, présentation joueur sur liste blanche, pas de migration de sauvegardes |
| Entités historiques | Première Ancre, coalition plurielle, Régent seulement pour une branche | Pas d'ajout de membres historiques non attestés ; pas d'attribution universelle des anomalies |

Les pistes d'institutions du fichier `ANT_DECH_008_PISTES_ORGANISATIONS.md` sont un **rapport de propositions**, non des références publiques canoniques ou des objets JSON du Studio.

## Commandes de vérification

Exécuter depuis la racine du dépôt, à la révision de mission :

```bash
npm ci
node --test studio-local/tests/organisations-data.test.mjs studio-local/tests/antagonistes-data.test.mjs
node --test studio-local/tests/antagonistes.test.mjs
npm test
git diff --check
```

Le test de navigateur utilise le serveur éphémère de la fixture et Chrome. Les tests de données vérifient 10/32 références, l'unicité des codes et sources, la concordance du SHA Git de toutes les fiches, les types et accès aux illustrations, les bornes des niveaux indicatifs et l'absence de secrets ou de statistiques inventées. La CI de la PR doit refaire les contrôles ; un résultat local n'est pas une CI.

## Recettes humaines à confirmer après publication

1. Ouvrir les index publics `groupes/`, `personnages/`, les deux maisons, la Première Ancre et six biographies ; toutes les images s'affichent et les liens internes aboutissent.
2. Dans le Studio sans campagne : consulter 3 maisons marchandes, 1 coalition, 6 institutions ; confirmer qu'aucune action de copie ne fonctionne sans campagne.
3. Créer une campagne locale ; copier `GRP-ANC-01` comme faction puis `PER-DECH-31` comme PNJ ; adapter ses objectifs et son niveau *sur la copie*, sans changer les références.
4. Ajouter une note privée de branche et une révélation ; afficher la fenêtre joueur, rechercher la chaîne canari : elle ne doit jamais y apparaître.
5. Exporter la campagne, fermer la session, restaurer et confirmer versions, images et notes locales ; deux onglets concurrents doivent respecter le verrou du Studio.
6. Contrôler que les fiches historiques `PER-DECH-01..26`, `ORG-DECH-01..07` et les liens de sauvegardes anciennes restent résolus.

## Invariants éditoriaux et mécaniques

- **Lore d'univers public :** les biographies et leurs fautes historiques peuvent être découvertes par les joueurs. Ce n'est pas une connaissance automatique des PJ. Les révélations propres à une campagne restent locales.
- **Déchéance :** Fêlure n'est pas Rupture ; la Rupture exige une vraie Chute liée. Le simple emploi, la concurrence, le désaccord ou la dette ne constituent pas une branche de Tribut.
- **Capacités :** Nœud de Relevé et Filigrane de Reprise sont des pactes de fiction aux observations limitées à un objet préparé ; aucune efficacité 5d6 n'est validée sans MAG/INDEX/MATH.
- **Équité :** une organisation peut être contrariée par un audit, une escorte, un témoignage libre, une grève négociée, une alliance, la fuite ou un secours rival. Les niveaux 2 à 20 représentent des intentions de rencontre, pas des bonus.
- **Première Ancre :** pas d'uniformisation sous le Régent, pas de liste de membres ajoutée et pas de rattachement global des anomalies.
- **Sauvegarde :** aucune écriture dans les sauvegardes ni migration invasive ; les catalogues sont de simples références versionnées.

## Résultats à renseigner sur SHA final

- SHA de branche et PR : à inscrire après création distante ; l'absence de PR ne vaut pas dépôt réussi.
- `npm test` : **réussi localement** le 16 novembre 2026. `check:content` (425 pages, 323 codes), `check:types`, build Quartz (512 entrées), `check:site` (1 339 pages HTML, 79 069 liens/ressources), catalogues, B-002 et M01–M05/MAG/Grimoire : tous verts.
- `node --test studio-local/tests/organisations-data.test.mjs studio-local/tests/antagonistes-data.test.mjs` : **6/6 verts** ; sources, images et CSP.
- Chrome : **indisponible dans le conteneur local**, test navigateur lancé et bloqué avant l'ouverture pour absence de `CHROME_BIN`. Son résultat fonctionnel doit être obtenu dans la CI GitHub avec Chrome ; ce blocage local n'est pas une régression du code.
- `git diff --check` : **réussi**, aucun défaut d'espacement détecté.
- CI et Pages : contrôler les runs et URL finale ; ne pas déclarer le site publié sur la seule existence des fichiers GitHub.

**À revoir par STUDIO, QA, ARCHIVES, INDEX, MATH, PNJ et LORE. À valider par DG/créateur :** tout usage mécanique, un membre historique supplémentaire de la Première Ancre, une transformation de pacte en règle et toute modification des droits de publication.

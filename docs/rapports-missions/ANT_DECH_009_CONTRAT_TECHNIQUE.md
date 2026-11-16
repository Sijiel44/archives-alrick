# ANT-DECH-009 — Contrat Studio, données et recette

## Périmètre additif

- Une institution civile nouvelle : `content/groupes/ORG-DECH-10.md`, publication Quartz, insigne SVG, entrée dans `studio-local/catalogue-organisations.json`.
- Quatre PNJ : `content/personnages/PER-DECH-33..36.md`, portraits originaux WebP et alternatives SVG, entrées dans `studio-local/catalogue-antagonistes.json`.
- Bibliothèque : **11 organisations** (7 institutions, 3 maisons marchandes, 1 coalition) et **36 personnages**. Le groupe de l'Office reste « Institutions et contre-pouvoirs » ; la Première Ancre reste « Coalitions et Ancrages ».
- Copie locale d'une faction ou d'un PNJ toujours explicite. Aucun nouveau type de fiche, adaptation destructive ou changement du stockage des campagnes.
- Statuts des nouveaux personnages : `Non Déchu`, `Fêlure`, `Tentation`, `Non Déchu`. Des erreurs humaines et des contrats de travail ne valent ni Tribut ni Chute liée.
- Pactes narratifs : **Ligne de veille** = traces effacées sur page personnellement préparée et matériellement présente ; **Pierre de halte** = comparaison ponctuelle d'une balise personnellement placée. Ni piste de personnes, ni lecture de pensée, ni réponse universelle ; règles chiffrées à définir séparément avec MAG/INDEX/MATH si elles sont un jour utilisées.

## Recette reproductible

Depuis la racine sur une branche de mission :

```bash
npm ci
node --test studio-local/tests/organisations-data.test.mjs studio-local/tests/antagonistes-data.test.mjs
node --test studio-local/tests/organisations.test.mjs studio-local/tests/antagonistes.test.mjs
npm test
git diff --check
```

**Contrôles automatisés :** identifiant et SHA `git hash-object` par source ; code/frontmatter ; `publish: true`, `lore_valide`, visibilité ; images locales sans script/externe ; MIME et liste blanche serveur ; niveaux 2–20 narratifs ; aucun score M03 ni secret ; références créables en `faction`/`npc` sans créer de capacité mécanique. Les tests Chrome vérifient consultation, création bloquée sans campagne, copie locale, `notes` privés et projection sans fuite de canari.

**Recette humaine à effectuer après déploiement :**

1. Ouvrir la fiche Office, ses quatre portraits et tous les liens depuis les index ; vérifier le rendu mobile et ordinateur, y compris les descriptions alternatives.
2. Dans le Studio sans campagne, afficher **7 institutions**, **3 maisons de négoce**, **1 coalition**, **36 PNJ** ; aucune copie de fiche n'est encore autorisée.
3. Créer une campagne fictive ; copier l'Office et Teron, puis faire évoluer son statut *dans la copie* sans toucher au lore public.
4. Ajouter une note privée contenant `CANARI_MJ_REFUGE`; afficher la fenêtre joueur et la projection, rechercher la chaîne ; elle ne doit jamais apparaître.
5. Exporter la campagne ; fermer puis réimporter, vérifier images, identifiants stables, version de provenance et note privée.
6. Vérifier que `ORG-DECH-01..09`, `GRP-ANC-01`, `PER-DECH-01..32`, M01–M05, bestiaire, Grimoire et anciennes sauvegardes continuent à fonctionner.

## Résultats et publication

- Tests Node de données : **6/6 verts** au premier contrôle local du 16 novembre 2026.
- Construction complète : **`npm test` réussi localement** le 16 novembre 2026 (433 pages `publish: true`, 331 codes uniques ; build 520 sources ; site assemblé 1 372 HTML et 81 280 liens/ressources internes vérifiés ; M01–M05, B-002, Grimoire et MAG régressions vertes). Le contrôle B-002 conserve des alertes de liens anciens à examiner séparément, sans échec de build. Chrome local non installé, recette CI GitHub requise.
- `git diff --check` : à confirmer au commit de mission ; aucune modification du moteur 5d6 ou de la sauvegarde.
- SHA de branche, PR, CI et fusion : **à inscrire** après publication distante ; ne pas déduire une publication Pages d'une PR seule.

**À revoir par STUDIO, QA, ARCHIVES, INDEX, MATH, MAG, PNJ et LORE. À valider par DG/créateur :** profils 5d6 éventuels, appartenance future à un autre réseau, et adaptation des scènes en aventures.

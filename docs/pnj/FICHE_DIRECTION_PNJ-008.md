# PNJ-008 — Raccord du catalogue public au Studio MJ

**Mission :** corriger le rayon « PNJ et personnages » qui n'affichait que trois dragons alors que six lots PNJ-001–006 avaient été préparés et livrés dans les Archives.

## Diagnostic vérifié

- `studio-local/catalogue-pnj.json` contenait uniquement `DRG-01`, `DRG-02`, `DRG-03`. Le Studio charge ce fichier dans son rayon PNJ ; il ne découvre pas automatiquement `content/personnages/`.
- Le Cabinet expérimental comporte **90 références historiques** pour les six premiers lots. Parmi elles, **77** sont marquées `publish: true`, mais **64** portent aussi les marqueurs `unlisted: true` et `spoilers: true`. **13 seulement** sont éligibles à un index public sans révélations.
- L'index public Quartz contient également des liens manuels et des pages supplémentaires ; **le nombre de pages Quartz n'est pas le nombre de références exposables dans le Studio**.

## Correction proposée

- Conserver sans mutation les trois fiches draconiques (ID, version, chemin et appartenance).
- Ajouter **13 PNJ documentés** au même rayon à partir des sources existantes, soit **16 personnages listés**.
- Reprendre leurs accroches et situations **comme exemples fictifs**, avec statut `reference`, sans chiffre 5d6 ni canonisation.
- Ajouter trois portraits conceptuels déjà hébergés dans les Archives (Sivra, Sariel, Mirelda), en précisant qu'aucun trait physique n'est canonisé.
- Fournir une génération déterministe et deux tests d'intégrité : `experiments/pnj-v01/build-studio-catalogue.mjs` et `experiments/pnj-v01/catalogue.test.mjs`.

## Confidentialité et dépendances

L'export JSON du Studio est techniquement public. **Aucun des 64 dossiers non listés et comportant des révélations** ne doit y être ajouté sans décision éditoriale séparée et contrôle des spoilers. Les 13 sources non publiées sont également exclues, même de l'index du Studio. Les illustrations distantes doivent avoir une URL HTTPS déterministe, être disponibles et porter un avertissement de concept non canonique.

**À revoir par :** STUDIO (affichage, variantes MJ et référence source), INDEX (codes et versionnement), LORE (statuts documentaires), QA (contrôle public/joueur et recettes).

**À valider par DG/créateur :** autorisation éventuelle d'une bibliothèque *révélations MJ* distincte, et priorité de l'intégration des lots PNJ-007 et suivants. Cette proposition ne canonise rien.

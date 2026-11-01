# Actualiser les Archives et le bestiaire de l'Atelier 5d6

**But :** intégrer périodiquement les nouvelles versions de la Bible, de l'Atlas, du Compendium, du Codex, de la Maison et de la Continuité, tout en protégeant les secrets du MJ et l'Odyssée d'Orin. Le dépôt GitHub est **public** : les bruts de campagne peuvent être archivés sous `sources/campagnes/` après contrôle des droits, données personnelles et vrais secrets MJ. Les éléments réellement confidentiels restent hors du dépôt; les copies locales sont conservées. `sources/` ne fait pas partie de la publication Quartz.

## Circuit avec validation humaine (et non publication automatique)

1. **Établir les sources de référence**, localement ou dans `sources/` après contrôle de diffusion : derniers bruts CB, six volumes consolidés, index directeur, registre de recherche, codes stables et corrections explicites. Vérifier les versions et l'instant réellement joué, sans inférer des faits à partir d'une synthèse.
2. **Comparer une nouvelle édition** aux fiches déjà indexées et publiées. Documenter chaque changement avec un code stable, une référence de section CB et sa nature : ajout, correction, complément, hypothèse ou projet.
3. **Produire un manifeste privé de revue** contenant les propositions de fiches et leur visibilité. Ne pas ajouter ce manifeste à GitHub. L'exemple de schéma ci-dessous ne contient aucune information secrète.
4. **Contrôler les candidats :** exécuter localement `node scripts/prepare-archives-review.mjs <chemin-prive/manifest.json>`. L'outil n'écrit aucun fichier public, ne publie rien et n'affiche jamais les titres ou notes des entrées bloquées. Une étiquette « candidat » **n'est pas une validation éditoriale**.
5. **Relecture indépendante** : contrôle d'identité, source primaire, révision explicite, statut canonique, faits joués/projets, équivoques et spoilers. Vérifier notamment Revenants ≠ Rappelés ; Maison Divine ≠ Palais Divin ; même personnage ≠ fiche nouvelle sous un alias.
6. **Préparer une PR GitHub** limitée aux pages Markdown expressément autorisées. Toute page `spoilers: true` publiée exige `unlisted: true` et une protection par avertissement ; les véritables secrets destinés à rester privés n'entrent jamais dans ce dépôt, **même avec `publish: false`**.
7. **Contrôles CI** : `npm test`, index public `static/contentIndex.json`, recherche sans pages MJ, sitemap sans secrets, images autorisées et codes stables. Examiner les écarts de publication, le site construit et les liens.
8. **Actualisation dans le jeu :** la recherche de l'Atelier charge le **dernier index public construit** des personnages et créatures. Une nouvelle fiche approuvée devient donc consultable en référence ; son adaptation 5d6 reste séparée, fictive et **ne déduit aucune statistique des biographies**.
9. **Traçabilité et sauvegarde** : PR, version documentaire source, auteur/validation, date et effets de migration, sauvegarde du code GitHub ; sauvegarde privée des sources et des campagnes locales séparément.

## Exemple de manifeste de travail PRIVÉ

Ce format est destiné à un poste de travail privé ; la commande ne traite pas directement les DOCX, elle suppose une extraction et une vérification préalable des différences.

```json
{
  "schema": "alrick.archive-review.v1",
  "sourceDocument": "compendium-version-suivante.docx",
  "sourceVersion": "après CB44 (exemple)",
  "entries": [
    {
      "code": "PER-EXEMPLE",
      "slug": "personnages/fiche-exemple",
      "sourceRef": "CB44, section précisément vérifiée",
      "spoilers": false,
      "approvedPublic": false,
      "mjOnly": false,
      "publicTitle": "Exemple non canonique",
      "publicSummary": "Description neutre à valider"
    }
  ]
}
```

L'entrée d'exemple reste bloquée (`approvedPublic: false`). La création d'une fiche publique exige une décision humaine et une PR contrôlée ; **changer le booléen dans un manifeste ne publie rien**.

## Barrières de publication

| Type d'information | Destination |
|---|---|
| Fait joué et approuvé, divulgable | Page publique liée à la source |
| Lore validé mais non encore joué | Page publique avec statut approprié, si divulgable |
| Proposition de jeu (quête, inventaire, fiche 5d6) | Espace Jouer, étiqueté « proposition non jouée » |
| Hypothèse / interprétation incertaine | Page explicitement hypothétique, si divulgable |
| Révélation volontairement consultable | Page `spoilers: true` et `unlisted: true` avec avertissement |
| Source brute autorisée | `sources/campagnes/` dans le dépôt public, hors génération Quartz ; conserver une copie locale indépendante |
| Vrai secret MJ ou contenu non diffusable | Hors GitHub public, pas d'URL ni d'index |
| Profil statistique inspiré d'une biographie | Adaptation de jeu fictive, jamais une statistique canonique par déduction |

## Contrôles d'acceptation de mise à jour

- Chaque nouveau code stable correspond à une identité réelle distincte dans le corpus source ; les alias n'ont pas créé de doublons.
- La chronologie ne transforme aucune intention ni aucun contrat non joué en fait établi.
- Toute citation canonique nouvelle est traçable par source, section et version ; aucune référence inventée.
- La recherche `Références des Archives` n'expose que les pages autorisées, sans téléchargement obligatoire et sans connaître les secrets MJ.
- Les anciennes fiches locales 5d6 continuent à fonctionner ; de nouveaux PNJ/créatures n'écrasent pas les adaptations de jeu déjà enregistrées.
- Après mise en ligne, vérifier la **publication GitHub Pages** séparément de la fusion du code : une PR fusionnée n'est pas une preuve que la version est disponible publiquement.

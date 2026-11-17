# Contributions aux Chroniques d’Entre-Rives

Lire [CONTRIBUTING.md](CONTRIBUTING.md) et [CONTRAT_EDITORIAL.md](CONTRAT_EDITORIAL.md) avant de modifier l’univers.

- Chercher les sources et les fiches liées dans le dépôt. Préserver les identifiants, les liens et les statuts documentaires existants.
- Préciser la destination : `portee: jdr_alrick` pour les Archives de L’Odyssée d’Orin, `portee: univers_partage` pour les Chroniques. Lire [la séparation des sites](docs/SEPARATION_SITES_2026-11-17.md). Pages ne publie que `public-archives/` ; le Studio et l’univers sont déployés sur le projet Sites existant, jamais sur un nouveau site.
- Préparer les ajouts non autorisés comme brouillons avec `publish: false`. Une autorisation éditoriale explicite du créateur dans la conversation permet la publication des travaux concernés. Un élément des Chroniques peut appartenir à l’univers sans avoir été joué par Orin. Signaler les hypothèses et les contradictions.
- Garder les sauvegardes de campagne, secrets MJ et paquets privés hors des commits. L’export du Studio pour Sites sélectionne ses fichiers depuis sa liste d’assets publics.
- Lancer `npm test` puis ouvrir une pull request sur une branche dédiée. Pour la mise en ligne, utiliser le workflow Pages après l’autorisation du créateur.

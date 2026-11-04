# Fiche Direction — L003-INTEGRATED
**Mission :** responsable de l'intégration du prototype local DG-LOT-003.
**Référence :** base `88f774f3d0d6d520d8d11443b72202b9caf4f94b` ; PR documentaire #84.
**Livraison :** [PR brouillon #85](https://github.com/Sijiel44/archives-alrick/pull/85), branche `prototype/dg003-integrated`.
**Statut :** PARTIEL — NON QUALIFIÉ.

Le socle de livraison est réellement écrit sur GitHub : pages MJ et joueur séparées, esbuild, serveur HTTP local sur deux origines, workflow sans Pages, scripts de tests et manifeste provenance. Aucun module propriétaire n'a encore été reçu ; aucune fonction métier n'est annoncée opérationnelle. La projection joueur reste interdite par défaut. Aucune fusion, publication, migration, modification Quartz ou M01–M05.

**Preuves d'exécution :** opérations GitHub confirmées ; clone bloqué par DNS, Node 24 et dépendances absentes localement ; `npm ci`, `npm test`, tests unitaires et Chromium : NON EXÉCUTÉS. Les tests sont écrits pour échouer sur composant manquant, pas pour afficher un succès artificiel.

**Prochain verrou :** réception des six SHA/interfaces, copie avec vérification des blobs, adaptation du wiring, vrai test du HEAD final et avis QA indépendant. Pas de validation Alpha sur les seuls fichiers d'ossature.

**À revoir par :** six propriétaires et QA.
**À valider par DG/créateur :** sortie du lot et tout changement au site public, non demandés ici.

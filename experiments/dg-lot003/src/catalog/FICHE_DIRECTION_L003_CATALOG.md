# FICHE_DIRECTION_L003_CATALOG — DG-LOT-003

**Mandat :** L003-CATALOG (INDEX). **Base Git visée :** `main@88f774f3d0d6d520d8d11443b72202b9caf4f94b`. **Ordre :** PR #84 à `b5c59854b802dc25617d9bcd7c576495199a41dd`. **Statut :** prototype exécutable local, non normatif et non intégré.

**Livré :** exports importables JavaScript ESM (`index.mjs`), factories descriptives capacité/sort/objet, validation strictement versionnée, lecteurs de références natives séparés, snapshots privés de sources inconnues, aperçu MJ whitelist, gestion des collisions d'alias et versions ; tests Node sur vrais fichiers, fixture originale copiée inchangée. Aucun calcul 5d6 ni chemin d'activation.

**Validé localement :** les tests de `tests/catalog/catalog.test.mjs` exécutés par `node --test`. Nombre, plateforme, commandes, résultats et SHA des fichiers : consulter `tests/catalog/EXECUTION_L003_CATALOG.txt` et le manifeste final.

**Bloqué exprès :** tout objet chiffré (bague), M03 absorption, injection `approved:true`, dépense mana/charges, application numérique ; les autres métadonnées numériques ne peuvent être ouvertes qu'avec option explicite `inertNumericMetadata:true`, uniquement pour lecture, toujours `executable:false`.

**Réservé :** intégration des ports BUILDER/MATH/ARCHIVES, sauvegarde octet-à-octet et confidentialité joueur (propriétaires ARCHIVES et STUDIO), vrais tests moteur TypeScript du clone complet, CI et navigateur sur SHA assemblé. Aucune signature des autres référents présumée.

**À 05 INTÉGRATION :** importer `src/catalog/index.mjs` directement; effectuer les trois factories, afficher `previewCatalogEntry` uniquement côté MJ ; ne pas envoyer un snapshot privé dans la projection joueur ; si `ok:false`, afficher les erreurs puis désactiver. Consommer `createNativeReference` comme clé, jamais comme permission. Ajouter ce test `.test.mjs` au runner de lot. Même SHA de module à vérifier avant intégration.

**À MATH :** vérifier que seul le RulesGateway officiel peut produire `AuthorizedM03Effect`. **À ARCHIVES :** stocker `createPrivateSnapshot` en zone MJ et hasher les octets source. **À QA :** tester métadonnées numériques interdites, alias collisions, DOM, sécurité des exports. **À DG :** maintenir aucun merge/site/canon avant recette intégrée complète.

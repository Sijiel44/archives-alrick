# Preuves L003-STORAGE

Commande réelle : `node --test experiments/dg-lot003/tests/storage/storage.test.mjs`

Environnement local : Node 22.16.0 ; base `main` complète non disponible (DNS github.com), donc pas de `npm ci`, `npm test` de la base, `esbuild` ou CI sur ce conteneur. Le module est **JavaScript ESM réel**, sans modèle Python, et importe directement le fichier testé.

Résultat : **16 tests / 16 PASS / 0 FAIL**. Journal exact `TEST_STORAGE.log` fourni hors sous-arbre pour intégration, avec SHA256 du rapport de livraison.

Les tests sont synthétiques uniquement. Ils prouvent la réversibilité locale de ce module, pas la compatibilité complète des importeurs officiels ni la confidentialité du Studio intégré. Pas de couverture navigateur, ni de restauration de données privées réelles.

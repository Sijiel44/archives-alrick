# L003-STORAGE — correction de régression Base64 longue

Source : `transfer/dg003-storage-source` commit `2459876b9f8bd0cf7f7a588e09b709bca3c221c3`, blob `storage.mjs` d'origine `f9d2f2194606b2d0ac3d2f3418ebcaedfc495837`.

Correction bornée : remplacer l'expression régulière à groupe quantifié de `fromB64` par un balayage linéaire borné de l'alphabet et du padding ; garder `atob`, la comparaison canonique `b64(bytes) === value`, les empreintes SHA256 et les limites 2 Mio/16 Mio. Aucun changement à la normalisation, aux migrations, à la persistance ou à M01–M05.

## Exécution réelle

Commande : `node --test experiments/dg-lot003/tests/storage/storage.test.mjs`
Environnement local : Node v22.16.0 (Node 24 non disponible ici). Résultat : **21 réussites, 0 échec**.

Tests 01–16 : non-régressions historiques inchangées.
Tests 17–21 : export/preview/commit/réexport d'un projet fictif de 6 Mio, limite exacte 16 Mio acceptée et 16 Mio+1 refusée, alphabet/padding/non-canonique rejetés sans mutation, SHA falsifié et collision refusés, frontière de source 2 Mio acceptée/2 Mio+1 refusée.

Le fichier `test.log` du paquet est la sortie brute. Les empreintes sont dans `SHA256SUMS.txt`. Aucune exécution npm/CI ou recette navigateur intégrée revendiquée. `git ls-remote` échoue dans le conteneur (DNS), donc aucun changement de branche distante n'a été réalisé ici.

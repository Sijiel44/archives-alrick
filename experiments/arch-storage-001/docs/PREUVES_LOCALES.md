# Preuves locales — 6 novembre 2026

- Commande : `node --test experiments/arch-storage-001/tests/contracts.test.mjs` → **13/13 PASS**, zéro échec, sortie originale `tests/TEST_NODE_LOCAL.tap` dans la branche.
- Commandes : `node --check` des `.mjs` → PASS.
- Test navigateur : `python experiments/arch-storage-001/tests/browser.spec.py` sur vrai serveur local 127.0.0.1:4181 → **NON EXÉCUTÉ comme parcours**, l'ouverture navigateur est bloquée dès `page.goto` : `net::ERR_BLOCKED_BY_ADMINISTRATOR`. Journal original `tests/TEST_BROWSER_LOCAL_BLOCKED.txt` ; aucun contournement.
- Accès clone : `git ls-remote https://github.com/Sijiel44/archives-alrick.git` → code 128, DNS `Could not resolve host: github.com`. Sources vérifiées via le connecteur GitHub, code P1 indépendant.
- Node `v22.16.0` dans le conteneur, navigateur installé `Chromium 144.0.7559.96` mais navigation loopback administrativement bloquée. Environnement du projet prescrit Node 24 pour l'intégration ; CI doit confirmer avec Node 24.
- CI indépendante P1 : **NON EXÉCUTÉE à la rédaction initiale**. Le verdict doit être mis à jour dans la PR après réussite/échec sur le HEAD final.

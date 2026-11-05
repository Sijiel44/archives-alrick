# L004-A — BUILDER : contrat de prévisualisation locale, lancement et navigation

**Lot :** DG-LOT-004, autorisation 00 DG du 5 novembre 2026. **Propriétaire :** 01 🧱 BUILDER. **Nature :** prototype réversible, non publié, sans canons ni données MJ réelles.  
**Source produit :** PR #85, commit exact `2ab809ef5351940e0fc272b859d10f21de894d00` (base Git de la branche L004). **QA de référence :** PR #91, commit exact `20679f7bf5c744f29dd041413cc63801ce5daea1`. **Lab :** `DG_LAB_REPRISE_20261105.md` fourni par le créateur, lecture de la synthèse uniquement, sans adoption de règles.  
**Périmètre de modification :** `experiments/dg-lot004/builder/**` et workflow isolé `.github/workflows/dg-lot004-builder-preview.yml`. Aucun fichier DG-LOT-003 n'est édité.

## 1. Résultat directement observé et réemploi

- PR #85 : deux origines serveur existantes `127.0.0.1:4173/4174`, fonctions `tools/build.mjs`, `tools/serve.mjs` et `tools/test-browser.mjs`, vue `mountStudio`, créateurs `mountCreators`, fenêtre `mountPlayer`, DTO whitelist et import/restitution ARCHIVES. Code GitHub **consulté** sur le SHA exact, non réimplémenté. Le manifeste temporaire `cer.dg003.integration-manifest.v0` contient 7 modules.
- PR #91 (résultat rapporté dans sa PR, non réexécuté par BUILDER) : 10/10 QA et E2E sur le candidat produit. L'avis n'homologue ni la publication, ni l'ergonomie tablette réelle, ni le stockage chiffré.
- Lab (source créative) : besoin de lancer rapidement le cockpit et les outils de création, en maintenant le contrôle MJ ; interludes, progression et exemple de flûte sont des **idées**, pas des règles nouvelles.
- Clone local : `git ls-remote https://github.com/Sijiel44/archives-alrick.git` → `fatal: Could not resolve host: github.com` (sortie Git 128). Aucun checkout intégral disponible dans ce conteneur. `node --version` → `v22.16.0`, `tsc` installé, `esbuild/ws` non installés localement dans la session ; pas de simulation d'un build du produit.

## 2. Fichiers et contrats

| Fichier | Export / responsabilité | Mutation |
|---|---|---|
| `src/contract.mjs` | `getPreviewPlan`, `classifyPreviewUrl`, constantes d'origines et SHA, 7 étapes `NAVIGATION` | Non |
| `src/navigation.mjs` | `mountPreviewNavigation(root,{view,select})` → `{node,dispose,stepIds}` ; focus/scroll, annonce d'indisponibilité | DOM guide facultatif seulement ; jamais campagne |
| `src/probe.mjs` | `probeLocalPreview({fetchImpl,plan,timeoutMs})` → `{ok,checks,...}` ; vérifie 8 routes avec `fetch` en GET, origine, status, MIME/CSP/cache/nosniff | Non |
| `src/launch-local.mjs` | CLI `--once` ou interactif, `--no-build` ; vérifie ascendance SHA et manifeste 7 modules, lance scripts L003 natifs, loopback uniquement | Crée `dist` temporaire par script L003 ; pas de source/canon |
| `src/browser-smoke.mjs` | Test Chrome CDP réel à 1280/768/390 pixels ; contrôles de présence/fonctionnement, données fictives, séparation joueur | Campagne **fictive** dans profil Chrome temporaire de recette |
| `tests/ports.test.mjs` | Tests Node de contrat/refus/sonde/mock DOM | Non |
| `.github/workflows/dg-lot004-builder-preview.yml` | CI sur HEAD exact : npm ci/test, tests ports, build/serve réel puis Chrome | Aucun Pages |

Le guide est **non autoritaire** : STUDIO garde les états, l'API de sauvegarde et la projection ; INTÉGRATION monte les composants et fournit le serveur. Aucun calcul 5d6 ni transaction locale n'est copié. Les champs non homologués restent désactivés dans le produit source.

## 3. Origine, destination, restrictions, retour arrière

- **Destination admise** : MJ `http://127.0.0.1:4173/`, joueur `http://127.0.0.1:4174/`. Host exact `127.0.0.1`, jamais `localhost`, `0.0.0.0`, LAN, Internet, `file:` ou redirection externe ; pas de tunnel.
- **Client joueur** : deux origines distinctes, pages et JS séparés. `player.html` et son bundle uniquement sur 4174, `index.html` et `mj.js` uniquement sur 4173 ; `manifest.json` non servi côté joueur. Aucune copie d'archive, note MJ, catalogue privé ou campagne brute introduite par BUILDER.
- **Données** : `probeLocalPreview` fait seulement des GET contrôlés et lit des en-têtes ; le lancement ne touche pas IndexedDB/localStorage ; le test de navigateur crée une campagne fictive dans un profil isolé, puis détruit ce profil. Les secrets MJ réels sont interdits : local loopback ne signifie pas authentification ou chiffrement.
- **Accès** : garder navigateur MJ sur la machine locale ; pas d'hébergement public autorisé, pas d'affichage joueur à une origine autre que 4174. Authentification réseau et proxy HTTPS restent hors lot.
- **Retour arrière** : arrêt SIGTERM/SIGINT des deux serveurs, `nav.dispose()`, fermeture du profil temporaire ; retour au produit PR #85 par suppression du seul répertoire L004/branche dédiée. Restaurer une campagne uniquement via la procédure `previewRestore`/confirmation ARCHIVES (pas d'effacement aveugle).

## 4. Critères d'acceptation et preuves

| Réf | Condition observable | État avant CI de la branche |
|---|---|---|
| L004-PORT-01 | Refus des origines et routes non autorisées | **PASS local** `node --test` |
| L004-PORT-02 | Guide accessible, non mutateur et démontable | **PASS local** tests sur DOM synthétique ; inspection réelle **NON EXÉCUTÉE** |
| L004-PORT-03 | Sonde des 8 routes avec CSP, cache, MIME et séparation | **PASS local** avec réponses simulées ; HTTP produit **NON EXÉCUTÉ localement** |
| L004-START-01 | Git descendant de PR85, build réel et deux serveurs actifs | **NON EXÉCUTÉ localement** (checkout bloqué) ; à éprouver en CI |
| L004-BROWSE-01 | Vraies pages Chrome 1280×800 / 768×1024 / 390×844, campagne et 7 étapes | **NON EXÉCUTÉ localement** (clone et bundles manquants) ; à éprouver en CI |
| L004-SEC-01 | Joueur distinct, pas de données privées ni accès aux routes MJ | **Partiel** : contrat validé, QA PR91 rapportée ; smoke local **NON EXÉCUTÉ** |
| L004-REG-01 | Aucune régression du moteur/site (`npm test`) | **NON EXÉCUTÉ localement** ; à éprouver en CI |

**PASS local attesté** : `node --test experiments/dg-lot004/builder/tests/ports.test.mjs` → 13 tests PASS / 0 FAIL, Node v22.16.0 ; `node --check` pour les fichiers `.mjs` → PASS. Les tests simulés ne prouvent pas les en-têtes du serveur réel.

Les résultats CI finals (run, SHA, PASS/FAIL) sont inscrits dans la **description de la PR** après exécution pour ne pas ajouter un commit post-test. Toute CI échouée reste signalée comme telle, même si un test local réussit. Les applications STUDIO/ATELIERS réelles demeurent hors des fichiers propriétaires BUILDER ; leur raccordement relève de 05 INTÉGRATION.

## 5. Décisions et passations

**À transmettre par la session centrale à 20 STUDIO :** vérifier sélecteurs, conteneur, focus et enchaînement 7 étapes ; confirmer conformité tablette et comportement des états vides.  
**À transmettre à 05 INTÉGRATION :** utiliser la couche builder comme ressource importable et le lanceur de test local ; monter le guide uniquement côté MJ sur branche d'intégration distincte ; ne jamais exposer les serveurs sur `0.0.0.0`.  
**À transmettre à 02 QA :** recetter interface tablette/desktop + confidentialité au SHA réel, vérifier éventuelles limitations Chromium/ARIA et autres navigateurs ; ne pas confondre tests BUILDER et QA indépendante.  
**À 00 DG/créateur :** arbitrer la destination d'une éventuelle prévisualisation hors machine plus tard — aucune autorisation d'hébergement Internet n'existe dans L004-A. Restent réservés : authentification, chiffrement, tests tablette réelle, lecteur d'écran, scénario de partie.

**Statut de conception :** réemploi validé, contrat local à tester sur source produit ; **aucune fusion, Pages, canonisation ni altération du moteur**.

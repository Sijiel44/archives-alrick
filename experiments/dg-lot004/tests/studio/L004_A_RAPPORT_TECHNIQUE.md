# DG-LOT-004 / L004-A — Rapport technique STUDIO

**Autorisation créateur/DG** : 05 novembre 2026, telle que notifiée dans le fil STUDIO. **Base obligatoire** : PR #85 `prototype/dg003-integrated` @ `2ab809ef5351940e0fc272b859d10f21de894d00`, vérifiée par connecteur GitHub ; PR #91 QA séparée, sans modification. Branche propriétaire : `prototype/dg004-studio`, créée **exactement** depuis ce commit. Statut : livrable code propriétaire ; intégration et recette finale à 05/QA.

## Résultat implémenté (nouvelles sources uniquement)

- `src/studio/demo.mjs` : `mountStudioDemo` monte le vrai `mountStudio` et le vrai `mountCreators` L003 (réutilisés en import), avec parcours guidé à confirmations séparées. Fabrique de ports spécifique à la campagne fictive, actions PJ preview/accept, référence/copie créature, scène et notes privées canari, explicit public/share/clear, export et prévisualisation/restauration native par l'API L003.
- `src/studio/demo-storage.mjs` : partition stricte des clés (`cer.dg004.demo.only.v0.*`), marque fictive, restriction de l'import PJ aux octets de la fixture v3, inventaire SHA256 des seuls exports de démo, refus des sauvegardes étrangères et délégation complète à l'adaptateur natif ARCHIVES. Petit volume : `indexedDB:null`, aucun accès au magasin privé IndexedDB existant.
- `src/studio/scene-bridge.mjs` : contrat strict privé et descriptif objet → capacité → instance de créature → scène, preview-only sans écriture, aucun effet numérique et aucun champ secret projeté.
- `src/studio/demo.css` : CSS autonome, scoping, focus visible, minimum tactile 44px, responsive mobile, pas de styles inline.
- `src/studio/CONTRACT.md` : signatures, limites, consignes de câblage isolé et sécurité. `tests/studio/GUIDE_SCENARIO_L004.md` : parcours MJ accessible en séance. `tests/studio/browser-scenario.py` : recette E2E future sur **vraies pages locales** de 05, sans mode de contournement de politique de navigateur.

## Sources prises en compte

- PR #85, état brouillon, SHA/arbres de sources confirmé par GitHub. Code réutilisé : `experiments/dg-lot003/src/studio/index.mjs` blob `5ce963e6120404f7cadbf6512cb0639c2adc888f`, `src/studio/projection.mjs` blob `114d7e062ae1bb39fe4373fcb2a233a16e866878`, `src/player/index.mjs`, `src/creators/index.mjs` blob `b53f1868baa8a5eb5ed4415000247a128e668846`, `tools/runtime.mjs` blob `444066ca6dbeaf59a9f8097e550bfff6105e47c7`, `tools/adapters.mjs` blob `aa8a28950b5ddab90fd8ba7b56c7934e489f45c5`, ARCHIVES `src/storage/storage.mjs` blob `be6a881018ae1709ecef71c3c5a155acfb94a658`.
- PR #91 rapporte QA 10/10 sur PR #85. **Résultats externes rapportés, non réexécutés ici**. La présente modification L004 ne bénéficie pas automatiquement de ce statut.

## Commandes / résultats observés dans cet environnement

| Action | Résultat |
|---|---|
| `git clone --depth 1 https://github.com/Sijiel44/archives-alrick.git repo` (timeout 18s) | **BLOQUÉ** : `Could not resolve host: github.com` ; aucune supposition de clone local |
| `node --test experiments/dg-lot004/tests/studio/*.test.mjs` | **PASS : 15/15** sous Node 22.16.0 ; tests sur nouveaux modules STUDIO, avec doubles pour ports externes |
| `node --check` (3 `.mjs`) / `python -m py_compile` | **PASS** |
| `Chromium.launch` par Playwright | **PASS** : Chromium 144.0.7559.96 démarré |
| Navigation vers serveur HTTP 127.0.0.1:4173 | **NON EXÉCUTÉ / BLOQUÉ** : `ERR_BLOCKED_BY_ADMINISTRATOR` ; aucun contournement tenté |
| `python tests/studio/browser-scenario.py` sur assemblage final 05 | **NON EXÉCUTÉ** : aucune page `dg004-demo.html` intégrée/servable dans cet environnement |
| `npm ci`, `npm test`, build L004, CI GitHub et QA indépendante sur HEAD final | **NON EXÉCUTÉS** localement : clone intégral absent ; à exécuter par 05/02 |

**Attention tests Node locaux** : pour charger l'import ES de `demo.mjs`, une **dépendance `src/creators/index.mjs` TEMPORAIRE et NON COMMITTÉE** a été placée dans le miroir local L003 extrait du ZIP antérieur (clone GitHub inaccessible). Ces tests Node ne montent pas les créateurs ni le DOM. Les vrais créateurs existent sur le SHA base #85, à reprendre par 05 pour la recette navigateur. Le code STUDIO d'origine a été vérifié byte-for-byte (Git blob) contre la PR #85.

## Tests refus et sécurité

Les 15 tests vérifient : partition de clés, impossibilité d'accéder aux clés réelles via la façade, suppression ciblée, refus sans adaptateur ARCHIVES, clonage/tag avant save, refus d'une campagne sans marque au load, SHA256 des backups autorisés, rejet d'un backup inconnu **avant** le preview natif, preview délégué, restauration refusée sans allowlist et sans marque, fixture v3 avec brute 14 et extension inconnue, DTO joueur sans sentinelle/provenance, lien de scène privé strict, refus d'effets numériques, absence de fabrique DEMO refusée sans changement DOM.

**Limites importantes** : la frontière de stockage préfixée est une isolation LOGIQUE de mode, pas une barrière de sécurité vis-à-vis du propriétaire du navigateur local. La restauration n'est **jamais réimplémentée** ; elle utilise uniquement le service ARCHIVES via le port L003. Un backup étranger est refusé volontairement en démonstration. Les archives démo >4 Mio peuvent échouer faute d'IndexedDB volontairement absent ; pas de secours destructif. Le raccord L004-C est un apercu en mémoire non persisté, non publié ni exporté : arbitrage de contrat INDEX/ATELIERS nécessaire avant promesse fonctionnelle.

## Matrice de preuves et critères

| Critère | État propriétaire | À valider sur HEAD intégré |
|---|---|---|
| Isolation de clés MJ/démo | **PASS Node** | navigateur local + stockage relu |
| Parcours campagne/PJ/créature/scène | Code, **NON EXÉCUTÉ** en navigateur L004 | QA E2E sur pages réelles |
| Créateurs descriptifs | Réemploi réel par import, **NON EXÉCUTÉ** en navigateur L004 | sauvegardes INDEX/ATELIERS |
| Liste blanche, absence de secret du DTO | **PASS Node** sur projection L003 | DOM, messages, stockage origine 4174 et CLEAR |
| Backup natif fictif/restauration | **PASS Node** sur façade avec doubles ; intégration **NON EXÉCUTÉE** | octets / SHA via vrai ARCHIVES |
| Guide / touches tactiles / focus | CODE CSS/GUIDE ; **NON EXÉCUTÉ** sur écran réel | mobile/tablette + clavier réel |
| L004-C chaînage descriptif | **PASS Node**, preview privé | adoption contrat INDEX / ATELIERS ; persistance NON EXÉCUTÉE |

## Passation concrète à 05 INTÉGRATION (préparée, non envoyée par ce fil)

1. Copier les blobs STUDIO de cette PR **sans modifier les fichiers originaux** dans son sous-arbre intégré ; aucune écriture sur #85 ou #91. Fixer une entrée HTML locale `dg004-demo.html` sur origine 4173 ; le serveur joueur 4174 demeure exclusivement celui de L003.
2. `storageFactory(area) = createValidatedStorage(owners.storage,area,{indexedDB:null})`, **jamais** la `localStorage` brute. `createDemoAdapters({getCampaign,storage})` doit reconstruire les adaptateurs L003 de façon contextuelle sur la campagne démo (voir `CONTRACT.md`) ; les adaptateurs capturant le Studio MJ réel sont **interdits**.
3. Le mode fictif et la fenêtre joueur ne partagent aucun objet campagne. Intégrer le CSS séparé, conserver CSP `style-src 'self'`, refuser tous effets numériques non homologués.
4. Après assemblage, lancer Node 24 `npm ci`, `npm test`, tests L003 existants, les tests L004, build et le `browser-scenario.py` sur les **vraies pages** aux deux origines ; enregistrer SHA du HEAD intégré exact, logs, capture, fuite canaris (DOM/messages/localStorage), refus backup réel et sauvegarde/reimport SHA.
5. Retourner à 00 DG : PASS/FAIL/NON EXÉCUTÉ sans transformer le résultat Node propriétaire en qualification Alpha. Revue L004-C par INDEX/ATELIERS/BUILDER avant toute persistance du lien.

**Verdict propre STUDIO** : fichiers de démonstration L004-A et précontrat L004-C produits ; validation Node isolée OK ; **qualification produit et navigateur réservée** à INTÉGRATION et QA. Aucun merge, publication, Internet, règle ni canon modifié.

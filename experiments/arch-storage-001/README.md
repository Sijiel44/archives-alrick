# ARCH-STORAGE-001 — P1-A prototype navigateur isolé

**BUILDER**, 6 novembre 2026 · **non canonique**, pas un remplacement du Studio, **données inventées**. Aucun appel aux moteurs M01–M05, aucun nouveau barème, aucune ouverture Internet ni mise à jour des PR #85/#95/#91. Le nom DB `cer.arch-storage001.fiction-only.v1` ne chevauche aucun ancien store L003/L004.

## Depuis la racine du dépôt contenant ce sous-arbre

Prévoir **Node 24** pour compatibilité projet (banc testé localement aussi sous Node 22). Aucun build ni nouvelle dépendance de production.

```sh
node --test experiments/arch-storage-001/tests/contracts.test.mjs
node experiments/arch-storage-001/tools/serve.mjs
# Ouvrir manuellement http://127.0.0.1:4181/ en profil de test vierge
# Ctrl+C pour arrêter
```

**Test automatisé Chromium réel** (optionnel, dépendance de test seulement) : Python + Playwright et Chromium local autorisé. Installer dans un environnement de tests indépendant, sans toucher au `package.json` du dépôt :

```sh
python3 -m venv /tmp/arch-storage-test-venv
/tmp/arch-storage-test-venv/bin/pip install playwright==1.56.0
CHROMIUM_PATH=/usr/bin/google-chrome-stable /tmp/arch-storage-test-venv/bin/python experiments/arch-storage-001/tests/browser.spec.py
```

Le test lance son propre serveur **127.0.0.1:4181**, deux onglets et un profil vierge séparé pour l'import ; ne pas laisser `serve.mjs` tourner en parallèle. **Aucun `--no-sandbox`, aucune installation silencieuse du navigateur ni contournement des restrictions**. Si le navigateur retourne `ERR_BLOCKED_BY_ADMINISTRATOR`, verdict `NON EXÉCUTÉ (environnement)`, et aucun PASS navigateur ne peut être réclamé sans une CI indépendante.

## Démonstration manuelle

1. Cliquer **Créer campagne fictive** : 2 PJ v3 synthétiques (caractéristique brute 14), source/document/profil séparés, 1 copie de créature, 2 scènes et 1 note `PRIVE_P1A_SENTINEL_NE_JAMAIS_PROJETER`.
2. **Recharger**. Dans un second onglet, observer le même état IndexedDB ; la lecture et les transactions restent sur la même origine MJ (aucune frontière de sécurité entre onglets).
3. **Injecter une panne avant commit** : l'opération avorte, ni campagne ni journal n'avancent. **Simuler accusé perdu puis reprise** : le premier commit a réussi ; un retry de même `eventId` retourne `duplicate` sans nouvelle note.
4. **Exporter archive CONFIDENTIELLE** ; lire le SHA256. Dans un autre profil vierge, choisir l'archive et **Prévisualiser**, puis **Confirmer import**. Si la campagne existe déjà, `CAMPAIGN_COLLISION` empêche l'écrasement. Le test vérifie la restitution des octets du fichier exporté dans le nouveau profil.
5. Arrêter le serveur avec `Ctrl+C`. La base n'est pas automatiquement purgée. Ne pas effacer les données de navigateur d'un profil utilisé pour d'autres activités.

**Validation d'import dans un profil vierge uniquement** : la procédure ne migre pas un dépôt réel. L'archive inclut la note MJ et est donc **CONFIDENTIELLE / non chiffrée** ; ne pas la publier, ni la montrer à des joueurs. Le SHA prouve l'intégrité, pas l'authenticité ou le secret.

## API importable

`src/idb-store.mjs`: `openStore({factory?,name?}) -> Promise<{readCampaign,listEvents,createCampaign,applyEvent,exportPrivate,previewImport,commitImport,close}>`; `seedFiction(store)`.

`src/contracts.mjs`: `CAMPAIGN_SCHEMA`, `EXPORT_SCHEMA`, `DEMO_ID`, `TYPES`, `initialCampaign`, `applyCommand`, `assertCampaign`, `assertPlainJSON`, `commandSignature`, `statusPublicOnly`.

`src/private-archive.mjs`: `makePrivateArchive({campaign,journal})`, `inspectPrivateArchive(Uint8Array)`.

`src/fixture.mjs`: `demoCommands()`, `demoInitial()`, `SENTINEL`.

**Transactions** : chaque `applyEvent` est une transaction unique `readwrite` couvrant campagne+événements, compare `expectedRevision`, rejette collision/commande non prise en charge, applique une opération narrative et incrémente la révision. Aucune valeur dXP, mana, capacité, attaque ou coût n'est exécutée. `injectFailure:'before-commit'` et `'ack-lost'` existent **uniquement pour le banc**.

## Limites importantes

- L'archive de ce banc n'est **pas** l'enveloppe ARCHIVES L003. Aucun import des vrais PJ/campagnes historiques n'est implémenté; l'origine `rawStat14` est seulement une **fixture fictive**, pas une preuve de conservation des octets v2/v3.
- `openStore` et `applyEvent` produisent un modèle candidat, **pas** le contrat adopté du monde/Studio ; `CreatorDraft`, `Session`, `Encounter`, `MediaAsset` ne sont pas tous modifiables dans le banc.
- Export : campagnes et journal lus séparément puis cohérence vérifiée; une lecture atomique commune multi-stores serait requise avant adoption. Pas de crash disque/puissance, quota plein, OPFS ni vrai downgrade.
- IndexedDB dans un profil d'origine n'est ni une solution de chiffrement ni une protection contre quiconque possède le profil. Pas d'authentification ni d'accès distant. Offline après chargement de l'onglet, mais le serveur local est requis pour la première ouverture/rechargement.
- Le serveur 4181 est volontairement séparé des ports Studio 4173/4174, refuse tous fichiers autres que la whitelist, et ne possède **aucun endpoint de modification HTTP**.

Lire `docs/ADR-001_STORAGE_OPTIONS.md`, `CORE-COMPAT-001.md`, `UX-STUDIO-001.md` et `PASSATIONS_DG_REFERENTS.md` avant tout choix d'architecture.

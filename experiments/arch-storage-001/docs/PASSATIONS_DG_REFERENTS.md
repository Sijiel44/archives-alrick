# Passations préparées — ARCH-STORAGE-001 / CORE-COMPAT-001 / UX-STUDIO-001

> **PAS ENVOYÉES AUTOMATIQUEMENT.** Le présent fichier est conçu pour que la session DG relaie les interfaces et le verdict avec les SHA exacts. Aucune prétention d'accord interchat.

## 04 ARCHIVES — relecture prioritaire

Comparer `storage.mjs` L003 et `createValidatedStorage` à la proposition `CampaignStore` sous `src/idb-store.mjs`. Revoir la conservation des originaux v2/v3 byte-exact, manifest privé, prise en charge des inconnus, collision sans écrasement, quota et sélection multi-fiches. **Réserves B identifiées :** snapshot/journal lus dans deux transactions lors de l'export, pas de protocole OPFS, pas de chiffrement, pas d'audit de migration. Proposer s'il faut une transaction de lecture commune et une preuve de reprise après interruption réelle du processus. Aucun ancien magasin n'a été modifié.

## 20 STUDIO — états et attentes UX

Examiner `readCampaign/applyEvent/previewImport/commitImport` : la vue devra garder le geste `preview→confirm`, différencier pending/committed/duplicate/STALE_REVISION, et construire seule sa projection joueur **en dehors** de ce banc MJ. Valider `Campaign` / `Scene` / `PrivateNote` / `CampaignInstance` et les champs versionnés. UX existante L004-REPAIR reprise dans `UX-STUDIO-001.md`.

## 10 MATH — CORE-COMPAT-001

Confirmer les exports M01–M05 réutilisables via `RulesGateway` natif et les SHA de référence; préciser les restrictions des effets non homologués et le contrat de prévisualisation. Aucun calcul 5d6 dans le banc P1-A, aucun `grant-xp` possible. Toute dépense atomique doit être un autre chantier et un autre arbitrage.

## 11 INDEX — CORE-COMPAT-001

Valider `CatalogReference` / `CampaignInstance` et leur distinction d'identité documentaire/definition/profil/copie de campagne. Spécifier comment version/provenance/SHA survivent aux sources absentes et à la migration ; les CreatorDraft restent descriptifs sans `approved:true` créé par stockage.

## 21 ATELIERS — UX-STUDIO-001

Réviser `CreatorDraft`, modes guidé/expert et messages de conflit/reprise, palette ardoise/cuivre/or, images/alt/licences, 44px/clavier/tablette. Ne pas traiter une revalidation visuelle comme exécution mécanique; garder les sources et champs inconnus privés.

## 02 QA / 03 REVUE

Rejouer `node --test .../tests/contracts.test.mjs` et `python .../tests/browser.spec.py` sur **le SHA de la branche P1** dans un environnement où Chromium est autorisé. Vérifier B01–B10, puis multi-browser (Firefox/Safari), panne réelle, export pendant commit, quota plein, migration version, lecteur d'écran et appareil tablette. Toute preuve de CI doit conserver le HEAD exact. Le test Chromium local de BUILDER est bloqué par `ERR_BLOCKED_BY_ADMINISTRATOR`; ce n'est pas un PASS.

## 00 DG — décision différée

A/B/C : ne choisir **aucune** option avant revue ARCHIVES/STUDIO, preuve navigateur et recette QA. Si B reste privilégiée, autoriser une tranche ultérieure de transition sans pertes et un prototype portant sur **copies de sauvegardes synthétiques** d'anciens formats. P0 #95 reste au seul 05 INTÉGRATION. Pas de merge, migration, canon ou publication.

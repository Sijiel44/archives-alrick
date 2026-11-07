# Passations croisées ARCH-STORAGE-001.R2 / UX-STUDIO-001.R2 — à transmettre

Émetteur : 01 BUILDER, le 6 novembre 2026. **Ne pas présenter ce document comme un accord des autres référents** : les demandes de contre-avis ci-dessous sont ouvertes. PR #104 à son HEAD `f84f8c54361b3701ebb0251700f2d0d09d4acf4d` reste intouchée ; R2 est isolé sur une nouvelle branche.

## 04 🗄️ ARCHIVES — contre-avis requis en priorité

Lire `ARCH_STORAGE_001_R2_ADR_ADDENDUM.md`, `src/idb-store.mjs` et les tests navigateur R2. Donner un avis explicite **A renforcé/B sur les mêmes fixtures** : `readConsistentSnapshot` une transaction `readonly`, journal complet et IDs, versionchange/blocked, quota simulé et archives hors profil. Dire si A peut être limité à un writer ou bénéficier d'un verrou prouvé. Vérifier que l'ancien storage officiel v2/v3, l'ordre des champs inconnus et les originaux bruts restent hors du banc et requièrent une preuve dédiée. Exiger une recette de quota réel, restauration sur profil externe, et rollback non destructif avant adoption. Fournir date + SHA/CI du contre-audit.

## 20 🎛️ STUDIO — UX et erreurs de durabilité

Lire `UX_STUDIO_001_R2_RECONCILIATION.md`, rapprocher avec #101. Confirmer les états `writing/committed/uncertain/stale/blocked`, les messages `DB_CLOSED/DB_BLOCKED/STALE_REVISION` et le maintien du focus après refus. Deux modes sur **même Campaign** ; la fenêtre joueur 4174 ne reçoit aucun nouveau droit du banc P1A 4181. Le changement de scène continue à révoquer toute publication (`CLEAR`). L'export contient des notes et n'a aucun bouton « partager ».

## 21 🎨 ATELIERS — contrôle des gestes et du modèle

Lire la matrice R2 et rapprocher avec #102. Confirmer `definition/variant/instance`, brouillon privé, source SHA, droit image, refus d'attachement répété après accusé ambigu (`pendingStudioOp`) et absence de calcul/XP/débit. Valider les étapes du mode guidé et l'inspecteur expert comme deux présentations d'une même structure de campagne, sans créer une seconde fiche canonique.

## 10 🧮 MATH / 11 🔗 INDEX

Les ports native-only et la matrice CORE-COMPAT de #104 restent inchangés. Vérifier que toute prévisualisation de XP/effets/rites/objets ne passe pas dans la transaction de sauvegarde comme calcul de règles ; ne pas dupliquer `experienceAward`, `resolveCombatM03` ni INDEX. Le JSON du banc P1 n'est pas une AbilityDefinition/BestiaryCard adoptée.

## 02 ✅ QA / 03 🔍 REVUE

Rejouer `node --test .../contracts.test.mjs .../r2-contracts.test.mjs`, `browser.spec.py`, `browser-r2.spec.py` sur **SHA final R2**, Chrome officiel sans `--no-sandbox` ni contournement CSP ; exiger les logs `PASS B01–B17` et noter le cas de *défaillance volontaire de A* comme résultat de comparaison, non comme « sécurité A validée ». Tester séparément quota physique, IndexedDB en navigation privée, Firefox/Safari, migration d'un historique ancien et lecteur écran ; laisser NON EXÉCUTÉ si ces tests manquent.

## 00 🧭 DG — arbitrage non demandé immédiatement

Le verdict BUILDER prouve seulement B expérimental avec export cohérent et le coût d'un A mono-onglet renforcé ; attend **avis explicite ARCHIVES** et synthèse STUDIO/ATELIERS avant décision. Maintenir PR #95 propriété de 05 INTÉGRATION ; aucune migration massive, Pages, merge, déploiement, canon ou changement des formules. Les fichiers R2 sont prêts à être transmis, mais aucun accusé de réception inter-chat n'est présumé.

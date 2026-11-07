# L004-A — Passations prêtes pour centralisation DG

**SOURCE PRODUIT** PR #85 `2ab809ef5351940e0fc272b859d10f21de894d00` ; **QA référence** PR #91 `20679f7bf5c744f29dd041413cc63801ce5daea1`. Aucun message envoyé aux autres chats par BUILDER.

## À transmettre à 20 STUDIO

Le nouveau module de navigation `experiments/dg-lot004/builder/src/navigation.mjs` expose `mountPreviewNavigation(root,{view,select}={})`, `dispose()` et les sept identifiants `campagne`, `fiches`, `creature`, `scene`, `projection`, `sauvegarde`, `createurs`. **Lecture seule et focus/scroll uniquement**, montable sur l'origine MJ. Les sélecteurs ciblent les champs actuels de `src/studio/index.mjs` (`Nom de la campagne`, `Fichier PJ v2/v3`, `Code ou référence créature`, `Titre de nouvelle scène`, `Aperçu public`, `Fichier de restauration confidentiel`) et `src/creators/index.mjs` (racine `Créateurs descriptifs DG-LOT-003`). À revoir : redessiner l'ordre pour tablette, vérifier les libellés et la navigation clavier/focus sans fuite MJ, indiquer les étapes débloquées après création d'une campagne. Pas de nouvelle mécanique ni stockage dans le guide. **STUDIO reste propriétaire des états de campagne, consentement et projection**. Décision demandée : sélectionner le conteneur de montage non destructif et critères ergonomiques.

## À transmettre à 05 INTÉGRATION

Récupérer **par copie vérifiée avec SHA** les fichiers `experiments/dg-lot004/builder/**` au commit de la PR L004-A. Utiliser les exports de `src/contract.mjs`, `src/probe.mjs`, `src/navigation.mjs` et le lanceur `src/launch-local.mjs` sans modifier leurs politiques de sécurité. `launch-local --once` bâtit le vrai produit L003, lance les origines loopback 4173/4174, contrôle 8 chemins HTTP et ferme les serveurs ; `browser-smoke.mjs` teste Chrome réel desktop/tablette/téléphone témoin, création campagne, présence du parcours, page joueur isolée. Une éventuelle insertion du guide dans la page MJ L003 relève du seul intégrateur. Conserver PR85/91 inchangées, ne pas modifier Pages ou `main`. **Blocage :** toute volonté de remplacer l'origine joueur par une URL publique n'est pas autorisée. Décision demandée : emplacement du montage et script README de lancement sans déclencher la suite E2E en conflit de ports.

## À transmettre à 02 QA / 00 DG

Vérifier sur le commit exact livré : `npm ci`, `npm test`, tests BUILDER, build L003, test `launch-local --once`, vrai Chrome trois viewports, suite navigateur produit; confirmer serveur 127.0.0.1 seul, échecs explicites, projection sans secret et restauration privée non mutée. Consolider résultat par SHA et garder `NON EXÉCUTÉ` pour toute étape indisponible. Aucun feu vert de publication implicite.

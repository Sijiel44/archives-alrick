# 03 🔁 Protocole de travail IA — missions et traçabilité

## 01 🪪 Identité
Toute mission indique **ID, rôle propriétaire, demandeur, objectif, branche, base SHA, périmètre, risques, dépendances, critères de sortie**. N'ouvrir aucun doublon si un dossier de mission existe déjà. Un chat référent n'est pas une branche Git, ni une délégation automatique à un agent.

## 02 🔍 Vérification initiale
Lire `main` exact, les contrats M01–M05, `CONTRAT_EDITORIAL.md`, les branches et les PR du périmètre. Rapporter **vérifié / rapporté / proposé / non vérifié**. Un résultat d'une autre conversation doit être réévalué contre les sources avant adoption.

## 03 🧰 Exécution
Changement de code ou de document uniquement sur une branche de mission distincte, PR brouillon, commits ciblés, tests sur le SHA final et revue indépendante. Ne pas écraser une branche d'un autre référent. Préserver Quartz, Markdown, les imports, le site public, les règles mathématiques validées et les champs inconnus.

## 04 📝 Compte rendu obligatoire
Pour tout travail substantiel :
- `docs/rapports-missions/<ID>_RAPPORT_TECHNIQUE.md` : contexte, fichiers, diff, SHA, PR, CI exactes, résultats, limites et risques.
- `docs/rapports-missions/FICHE_DIRECTION_<ID>.md` : synthèse indépendante, 1–2 pages, statut clair et arbitrages.
- Word `.docx` quand demandé ; indiquer explicitement s'il n'a pas été produit.
- Mettre à jour le [tableau de bord](./04_TABLEAU_DE_BORD.md) uniquement avec des faits vérifiés.

**Rapport local non committé ≠ rapport déposé dans GitHub.** Ne pas inventer de liens de PR, de commits, de CI ou de captures.

## 05 🛡️ Secrets et données
Ne publier aucun secret MJ réel, sauvegarde privée, personnage personnel confidentiel ou clé. Le site GitHub Pages est public. `unlisted` et `display:none` n'empêchent pas l'accès aux données ; la projection joueur doit être construite par liste blanche avant transmission. Les contenus importés ne deviennent pas du code exécutable.

## 06 🏛️ Décisions DG
Quatre verdicts : **VALIDÉ**, **VALIDÉ AVEC RÉSERVES**, **CORRECTIONS REQUISES**, **BLOQUÉ**. Préciser séparément l'état de conception, les tests, l'état éditorial et le déploiement. Aucune fusion, déploiement, canonisation, migration destructive, dépense ou action réseau sensible sans autorisation du créateur/DG.

## 07 🔀 Passations
Fin de travail : **À transmettre à [rôles]** + question précise + documents/source/PR + version de contrat + décision demandée. Le spécialiste destinataire lit et accuse réception ; le chat de la DG centralise la décision. Une passation n'est pas considérée reçue tant que le destinataire ne l'a pas consultée.

## 08 🧩 Limitations et reprises
Les fils ChatGPT ne s'échangent pas automatiquement leurs messages et ne constituent pas des agents permanents interconnectés. Si une action dans le Projet ChatGPT n'est pas techniquement accessible, fournir le message prêt à copier, marquer **non transmis** et ne pas revendiquer d'avoir créé/renommé un chat.

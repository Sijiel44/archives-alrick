# 06 🖥️ Consigne à utiliser dans ChatGPT Work

**Objet :** mise en place de l'interface du Projet ChatGPT. Cette consigne n'est pas une attestation que Work a été lancé ou que les chats ont été créés.

## 01 🧭 Périmètre
Ouvre le Projet ChatGPT existant nommé « Les Chroniques de l’Entre-Rives » ou son libellé exact. Ne crée **pas** un second projet. Inspecte les conversations déjà présentes avant de modifier quoi que ce soit.

Lis la PR documentaire [ORG-001 #78](https://github.com/Sijiel44/archives-alrick/pull/78), en particulier les fichiers :
- `docs/chroniques-v01/01_INDEX_DES_CONVERSATIONS.md`
- `docs/chroniques-v01/05_MESSAGES_DE_LANCEMENT.md`
- `docs/chroniques-v01/03_PROTOCOLE_RAPPORTS.md`

Les 21 prompts d'initialisation par rôle ont été fournis au créateur dans `Chroniques_Entre_Rives_Kit_IA_v01.zip`. Utilise-les seulement s'ils sont accessibles dans les pièces jointes du Projet ; sinon, n'invente pas leur contenu.

## 02 🔎 Recensement
Relève les titres existants, leurs missions et les réactions déjà reçues. Identifie spécifiquement DG, BUILDER, MATH, INDEX, STUDIO, LORE et les autres chats réellement présents. Les mentions « retrouvé » dans le registre ne prouvent pas que tous les chats sont visibles ; les mentions « à confirmer » ne signifient pas absents.

## 03 🏷️ Renommage
Dans la mesure où l'interface autorise le renommage, applique `NN emoji RÔLE — fonction` selon l'index, sans casser les conversations existantes ni écraser les noms des fils de mission. Les emojis doivent correspondre à la spécialité. Ne renomme pas un chat à un rôle différent de celui de son prompt.

## 04 ➕ Création sans doublon
Pour les rôles réellement manquants, crée dans **ce même Projet ChatGPT** une conversation spécialisée par rôle et colle son prompt complet du kit. Si l'interface ne permet pas de créer ou renommer certaines conversations, marque-les « non créés/non renommés » et propose l'action manuelle exacte ; n'affirme jamais les avoir modifiés.

## 05 📬 Premiers ordres de mission
Envoie dans chaque chat le message destiné à son rôle, extrait de `05_MESSAGES_DE_LANCEMENT.md`. Poursuis les missions déjà commencées (MATH-001/002, INDEX-001, STUDIO-001, LORE-001, BUILDER-001) sans les réinitialiser ni les dupliquer. L'objectif est d'obtenir un accusé de réception et, si pertinent, un premier plan ; ne demande pas l'exécution simultanée de travaux lourds dans 21 chats. Donne la priorité à DG, BUILDER, MATH, INDEX, STUDIO, QA et ARCHIVES.

## 06 🛡️ Contraintes
Aucune suppression du site historique, de fichiers, de branches ou de conversations. Aucune fusion de PR, publication Pages, modification du canon, création de Discord ni achat. Secrets MJ et archives personnelles hors du GitHub public. L'ancien dépôt demeure la référence : `Sijiel44/archives-alrick`.

## 07 📊 Rapport de sortie
Produis un tableau par chat : titre initial, titre final, rôle, existait/créé, ordre envoyé/non envoyé, réponse du chat obtenue/non obtenue, liens ou identifiants accessibles. Identifie tout point resté manuel ou bloqué. Dépose un rapport sur branche documentaire si la connexion GitHub et l'autorisation le permettent ; sinon donne le texte prêt à intégrer. N'interprète pas un simple envoi comme mission terminée.

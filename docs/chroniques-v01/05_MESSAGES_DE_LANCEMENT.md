# 05 📬 Messages de lancement prêts à transmettre aux chats

**Mode d'emploi :** ouvrir le chat correspondant dans le Projet « Les Chroniques d’Entre-Rives — v0.1 », vérifier qu'il existe déjà, puis copier uniquement son bloc. **Aucun de ces messages n'a été envoyé automatiquement.** Ces instructions reprennent les travaux existants et ne donnent pas de mandat de fusion ou de publication.

## 00 🧭 DG — Direction générale

> Mission ORG-001 — Prends connaissance du dossier `docs/chroniques-v01/` sur la branche documentaire `chore/chroniques-v01-organisation-ia`, et des discussions déjà ouvertes. Mets à jour le registre de missions, confirme les propriétaires et évite les doublons avec BUILDER-001, MATH-001/MATH-002, INDEX-001, STUDIO-001, LORE-001 et LORE-01.B. Priorité : architecture commune 5d6 + cockpit MJ local, avec Quartz et le site actuel conservés. Organise les audits MATH/INDEX/ARCHIVES/QA et présente les arbitrages avant toute implémentation transversale. Rapporte le SHA exact et les décisions ; aucune fusion, publication ou canonisation sans mandat explicite.

## 01 🧱 BUILDER — Architecture et missions

> Reprends BUILDER-001 là où tu l'avais laissé, sans réinitialiser l'inventaire. Consulte `docs/chroniques-v01/02_MISSIONS_INITIALES.md` et l'état réel du dépôt, PR et branches. Livre une carte de conservation/extraction/adaptation/nouveau pour Quartz, Markdown, M01–M05, Grimoire, Bestiaire, ateliers, sauvegardes, INDEX et Studio. Propose des frontières d'API et un parcours vertical minimal. Transmets à MATH, INDEX, STUDIO, ARCHIVES et DG ; branche et rapport préparatoires seulement, sauf mandat explicite de code.

## 10 🧮 MATH — Système 5d6

> Poursuis MATH-001, sans réouvrir MATH-002 ni adopter ses hypothèses. Audit transversal des formules réellement utilisées par progression, attaque, défense, dégâts, capacités, sorts, rites, objets et créatures. Identifie doublons hérités et fonctions sources, conserve 5d6 et caractéristiques >12. Propose invariants, interfaces et simulations d'impact, mais aucune formule modifiée avant arbitrage. Remets matrice de compatibilité à INDEX/COMBAT/MAG/OBJETS/STUDIO et dossier décisionnel à DG.

## 11 🔗 INDEX — Catalogue des capacités

> Reprends INDEX-001 et le dossier préparatoire existant (avec ses essais locaux, sans inventer une CI GitHub). Compare concrètement M02 AbilityDefinition, M03Effect, Spell, RitualDefinition, BestiaryCard et objets. Produis un contrat versionné avec identifiant, provenance, conditions, action, coût, durée, effets numériques ou descriptifs, restrictions, versions et adaptateurs. Décris cinq cas de test : attaque commune PJ/créature, sort, rite, objet de stockage non chiffré, bague à effet chiffré. Passe le dossier à MATH, ARCHIVES, COMBAT, MAG, ATELIERS, STUDIO et QA ; aucun canon automatique.

## 20 🎛️ STUDIO — Cockpit MJ

> Reprends STUDIO-001 et les tranches déjà identifiées. Le Studio est une priorité centrale de l'Alpha v0.1, pas un outil annexe. Prépare le parcours local campagne → import PJ → référence/copie de créature → scène/rencontre → modèle joueur whitelist → notes privées → sauvegarde/export/réimport. Décris les données contractuelles avec INDEX/ARCHIVES, les actions fréquentes, le design débutant/expert et les tests secrets MJ dans le DOM/messages de la fenêtre joueur. Pas de réseau autoritaire ni de modification des branches Bestiaire.

## 30 🌍 LORE — Univers partagé

> Reprends LORE-001, indépendant des certifications historiques LORE-01.B. Identifie les fondations de monde utiles à n'importe quel MJ, sans faire de l'Odyssée d'Orin une histoire obligatoire. L'époque +500 ans reste une piste de création, non une continuité adoptée. Propose un inventaire des invariants, des zones ouvertes et des gabarits de fiches compatibles avec Quartz et l'INDEX, en séparant faits joués, lore validé, hypothèses et adaptations de table. Rien à canoniser automatiquement.

## 02 ✅ QA — Audit et recette (si chat déjà existant, y poursuivre)

> Prends la mission QA-001. Construis les portes de sortie pour l'Alpha v0.1 : schéma commun des effets, cas 5d6, imports historiques, extensions inconnues, cohérence même effet dans PJ/créature/sort/objet, sauvegarde locale, protection des secrets MJ et accessibilité du cockpit. Distingue tests unitaires, CI sur SHA, recette navigateur, tablette réelle et parties humaines. N'annonce aucun test non exécuté. Rapport DG après revue du travail MATH/INDEX/STUDIO.

## 04 🗄️ ARCHIVES — Formats, données et sauvegardes

> Prends ARCH-001. Audite les schémas et les clés locales existants : fiches v1/v2/v3, campagnes, Bestiaire, Grimoire, rites, objets, médias et extensions inconnues. Prépare les adaptateurs non destructifs et un protocole d'import prévisualisé avec restauration. Vérifie qu'une version de fiche documentaire n'est pas écrasée par son profil mécanique. Ne publie aucune sauvegarde personnelle et n'opère aucune migration sans autorisation.

## 12 ⚔️ COMBAT — Capacités non magiques

> Prépare COMBAT-001 après lecture de M01–M05 et du dossier MATH/INDEX. Cataloguer les attaques, parades, esquives, ripostes, postures, soutiens et effets de contrôle ; distinguer effet chiffré, règle d'exception et narration. Décrire interfaces et limites, scénarios N1/N5/N10/N20/N25, sans réécrire M03 ni ajouter de bonus illimités. Transmettre aux responsables INDEX, MATH et QA.

## 13 ✨ MAG — Sorts, rites et artefacts

> Prépare une mission d'adaptation de MAG-003/Grimoire au langage INDEX, après contrôle du code sur main. Garder les Cercles séparés des niveaux et le IX non accordé automatiquement ; les sorts démo non canoniques, coûts de matrices et foi restent à arbitrer. Relier les effets à MATH/M03 sans dériver un second moteur. Préserver les sauvegardes et suspendre toute transaction magique collective serveur.

## 14 💍 OBJETS — Artisanat et équipement

> Prépare OBJ-001 : trois exemples précis (anneau de stockage narratif, bague augmentant les dégâts de feu, pièce d'équipement ordinaire), leurs conditions, limites, coûts éventuels et compatibilité INDEX. Les objets narratifs ne doivent pas recevoir de formule artificielle, et les effets calculables doivent réutiliser MATH. Proposer une création esthétique et ergonomique en lien avec ATELIERS.

## 21 🎨 ATELIERS — UX et création simplifiée

> Prépare ATELIERS-001 : examiner les parcours existants de l'Atelier 5d6, du Bestiaire et du Grimoire ; proposer une expérience cohérente pour créer PJ, créatures, attaques, sorts et objets. Même catalogue INDEX, mêmes moteurs MATH, interfaces guidées et expertes, prévisualisation et validations progressives. Livrer flux utilisateurs et maquettes, sans changer le site public ni la structure canonique avant revue DG.

## 35 🐉 BESTIAIRE — Créatures

> Poursuis tes missions Bestiaire propriétaires, notamment B-003 si encore active. Ne change pas l'architecture ni les identifiants documentaires par anticipation. Fournis à INDEX et STUDIO un exemple de fiche espèce/individu/profil et un cas de créature à plusieurs niveaux pour tester les adaptateurs. Garde distincts faits joués, profil mécanique et variantes MJ ; toute migration sera demandée séparément.

## 05 🚀 INTÉGRATION — GitHub et publication

> Après validation DG seulement : auditer les branches et PR de la v0.1, préparer stratégie d'intégration et publication réversible. Le site existant sur main et GitHub Pages reste intact. Ne fusionner, publier, supprimer ni rebaser aucune branche sans mandat ; consigner SHA exact et CI après chaque changement autorisé.

**Autres chats (AVENTURES, QUÊTES, PNJ, ANTAGONISTES, CHRONIQUES, COMMUNAUTÉ, REVUE)** : conserver/installer les prompts du kit IA déjà fourni ; lancer leurs missions éditoriales après cadrage des contrats INDEX, sauf demande créative indépendante du moteur.

# DG-001 — Missions spécialisées autonomes

Ces blocs peuvent être copiés dans des conversations spécialisées. Chaque mission doit démarrer par lecture de l'état réel de `main`, des issues/PR citées et des consignes du dépôt. L'état de départ noté ci-dessous est celui vérifié par DG-001 le 31 octobre 2026; il doit être rafraîchi avant exécution.

## Contexte à conserver dans chaque mission

Tu travailles pour **Les Archives d'Alrick**, dépôt public `Sijiel44/archives-alrick` (Quartz 5; site https://sijiel44.github.io/archives-alrick/). Le créateur est l'autorité finale sur le canon, les grandes orientations créatives, l'approbation éditoriale/artistique et les publications; ne fusionne pas et ne déploie pas sans autorisation applicable. Travaille sur une branche spécialisée et PR réduite, conserve les travaux en place, teste les modifications et distingue preuve faite, blocage d'accès et proposition.

Principes documentaires obligatoires : le monde partagé existe indépendamment de l'Odyssée d'Orin; une création peut devenir `lore_valide` après approbation sans avoir été jouée; un scénario public peut rester `proposition_non_jouee`; un événement joué ailleurs ne change pas automatiquement l'Odyssée ni le canon. Les statuts `faits_joues`, `lore_valide`, `declaration`, `projet_en_cours`, `hypothese`, `proposition_non_jouee`, `a_verifier` et `historique` sont distincts de `publish`, `spoilers` et `unlisted`. Les pages à spoilers publiées portent un avertissement et `unlisted: true`; les vrais secrets MJ restent protégés. Les sources brutes peuvent être déposées publiquement sous `sources/campagnes/` après contrôles des droits, données personnelles et secrets réels, et ne sont pas automatiquement intégrées à Quartz.

Compatibilité 5d6 : préserver les probabilités exactes, caractéristiques brutes et bonus effectifs distincts, progression 1–25 expérimentale, contrats M01/M02, défense/résistance/protection absorbante M03, JSON/import/export compatibles et fiches M04.1/M05. Un niveau ne confère pas un rang cosmologique; un profil de jeu ne canonise pas espèce ou capacité; la Déchéance 2d6 et les scènes historiques ne sont pas remplacées rétroactivement. Ne prétends pas avoir réalisé un playtest humain si tu n'as exécuté que des tests automatisés.

Livrable de chaque mission : rapport daté dans `docs/rapports-missions/` avec sources réellement lues, constat, risque, changements, fichiers, critères/tests exécutés et sorties, limites, décisions du créateur en attente, branche/PR et recommandation de revue. N'ajoute pas d'issue si une issue ouverte couvre déjà le travail; mets à jour son contenu uniquement si c'est nécessaire et traçable. Ne fais aucune modification au canon sans validation explicite.

---

## DG-01 — Sources de campagne et import CB

**Responsable :** référent Sources / Continuité. **Priorité : P0.** **État initial :** issue #39 ouverte; PR #35 ouverte en brouillon; le dépôt ne contient que le registre `sources/campagnes/README.md`, pas le paquet annoncé de 15 DOCX et transcriptions. **Dépendances :** réception du ZIP local CB01–CB04-04 et décisions de diffusion sur les cas particuliers.

**Prompt :**

> Exécute DG-01 pour `Sijiel44/archives-alrick`. Commence par vérifier #39, #35 et `sources/campagnes/README.md`, `docs/INVENTAIRE_SOURCES_CB01_CB44_2026-10-30.md`, `docs/SOURCES_CAMPAGNES_PUBLIQUES.md`, `.gitignore` et les scripts d'import. Les archives CB brutes ne sont pas confidentielles par défaut; l'archivage GitHub public est souhaité. N'invente aucun contenu et ne conclus pas que les binaires sont présents à partir d'un registre. Lorsque le ZIP est accessible, dresse la liste des formats et des 15 correspondances CB, vérifie originaux et transcriptions, recalcule tous les SHA-256, tailles, fichiers, chapitres/messages, doublons exacts/probables, recherche et limites Quartz; contrôle les éléments juridiquement/personallement sensibles et vrais secrets MJ passage par passage. Prépare une procédure/reproductibilité ou une PR d'import dédiée à `sources/campagnes/<CB>/`; ne place pas les transcriptions intégrales sous `content/`, n'active pas Pages et ne canonise rien. Vérifie les sauvegardes et la restauration depuis un clone. Si le paquet est absent, consigne précisément le blocage et laisse les étapes de hash/import en attente. Fournis une recommandation documentée sur #39 et adapte #35 uniquement si sa branche peut être modifiée sans écraser son travail. Tests attendus : tests d'extracteur, manifeste/hash, détection doublons, recherche GitHub si les fichiers sont présents, et preuve de restauration; indique séparément tout test impossible.

---

## DG-02 — Contrat éditorial et métadonnées des trois couches

**Responsable :** référent éditorial. **Priorité : P0.** **État initial :** première harmonisation préparée par DG-001; valider le contrat et identifier d'éventuels modèles à aligner. **Dépendances :** aucune pour la documentation; toute décision créative appartient au créateur.

**Prompt :**

> Revois le contrat des trois couches pour `Sijiel44/archives-alrick`. Lis `CONTRAT_EDITORIAL.md`, les gabarits de `modeles/`, `content/suivi-editorial.md`, les métadonnées actuelles et le rapport DG-001. Le monde partagé (`univers_partage`) vit indépendamment des campagnes; l'Odyssée d'Orin (`jdr_alrick`, campagne_id `odyssee_orin`) garde ses événements réellement joués; chaque autre table (`campagne_independante`) garde sa continuité propre. Un lore nouveau peut être approuvé sans passage en partie; une proposition non jouée peut être publiée si explicitement étiquetée et autorisée; publication, canon et fait joué sont trois validations séparées. Établis des valeurs et exemples pour `portee`, `campagne_id`, `canon_statut`, `etat_editorial`, `source_brute`, `publish`, `spoilers`, `unlisted`, `public_cible`, `usage_en_jeu` et `periode`, compatibles avec les anciennes fiches sans migration globale. Vérifie les contradictions dans les gabarits et corrige seulement celles qui sont établies. Ne promeus aucune fiche spécifique. Ajoute des exemples concrets (cité canonique non visitée par Orin; scénario public non joué; découverte d'une table indépendante) et vérifie le contenu avec les scripts existants. Rapporte toute validation créative en attente au créateur.

---

## DG-03 — Compteurs et références documentaires

**Responsable :** référent documentation / Quartz. **Priorité : P0.** **Dépendances :** méthode de calcul définie et rapport DG-001.

**Prompt :**

> Audite les compteurs du registre dans `README.md`, `PLAN_DEVELOPPEMENT_UNIVERS.md`, `content/suivi-editorial.md`, `docs/RECONCILIATION_645_ET_ATLAS_2026-10-30.md` et le programme `scripts/check-content.mjs`. Recalcule séparément sujets de registre, codes uniques publiés, nombre de pages publiées, pages non codées, brouillons, propositions facultatives et sources brutes non migrées. Confirme la règle de population avant d'actualiser les compteurs datés. Ne soustrais pas les 269 codes publiés vérifiés par DG-001 des 645 sujets: alias et regroupements ne s'apparient pas mécaniquement. Recherche toute mention d'un état courant contradictoire; laisse les journaux de lots en tant qu'historique explicitement daté. Vérifie les erreurs signalées dans `content/jouer/index.md`; ne corrige qu'une anomalie réellement reproduite. Actualise les références/guides obsolètes du moteur uniquement à partir de sources présentes. Ajoute ou réutilise un contrôle reproductible si nécessaire et teste-le. Ne modifie ni fiches canoniques ni règles créatives.

---

## DG-04 — Revue de compatibilité des PR 54, 55, 56

**Responsable :** référent intégration 5d6. **Priorité : P1.** **État initial :** PR #54 (tables locales), #55 (Grimoire), #56 (B-001) ouvertes en brouillon; #57–#62 fusionnées. **Dépendances :** dernière CI et revue humaine.

**Prompt :**

> Fais une revue indépendante et à jour des PR #54, #55 et #56 de `Sijiel44/archives-alrick`; n'en fusionne aucune. Examine les diffs complets, commentaires, checks CI, rapports M01–M05, sauvegardes et fichiers pertinents sur `main`. Pour #54, teste les sessions locales, rôles MJ, pseudonymes, invitations, persistance et synchronisation; distingue clairement un serveur local HTTP/WebSocket d'un service Internet sécurisé, sans présenter Pages comme authentification. Pour #55, vérifie la rétrocompatibilité JSON, mana/inventaire, Cercle, niveau, affinité, matrice, intensité/effet et autorité cosmologique; conserve les sorts d'exemple non canoniques. Pour #56, vérifie taxonomie espèce/individu/évolution/variante/profil, codes, modèles, registre et liaison prévue B-002; un profil chiffré ne canonise pas une espèce. Utilise les suites réelles et les scénarios manuels exigés; note chaque test non fait. Recommande les corrections par fichier et critères d'acceptation. Si tu corriges, branche/PR séparée par domaine, sans écraser le travail existant.

---

## DG-05 — Bestiaire B-001 / dépendances B-002

**Responsable :** référent Bestiaire documentaire. **Priorité : P1.** **Dépendances :** PR #56 et contrats M05.

**Prompt :**

> Audite B-001 dans la PR #56 et les contrats `M05_CONTRAT_BESTIAIRE_DOCUMENTAIRE.md`, `M05_CONTRAT_MOTEUR_5D6.md`, `M05_CONTRAT_DIRECTION_ARTISTIQUE.md`. Vérifie tous les chemins de créatures du dépôt et le caractère exhaustif de l'audit; compare schéma/registre/modèles à M04.1 et M05. Distingue espèce, individu, stade biologique, variante écologique, adaptation d'une table et profil 5d6. Vérifie unicité des codes, JSON et métadonnées/publish:false. Définis les dépendances nécessaires à B-002 pour relier un profil à zéro/une/plusieurs fiches documentaires avec preuve, sans lien ou canonisation automatiques. N'ajoute pas d'espèce. Lance les contrôles pertinents, documente les lacunes et ouvre une PR ciblée ou une revue détaillée de #56; l'approbation du créateur est requise pour adopter une nouvelle taxonomie normative.

---

## DG-06 — Playtests et contrats 5d6

**Responsable :** référent 5d6. **Priorité : P1.** **Dépendances :** M01–M05 sur `main`; joueurs/MJ volontaires pour protocole humain.

**Prompt :**

> Audite les contrats techniques entre M01 progression, M02 capacités, M03 combat, M04.1 bestiaire et M05 fiches vivantes. Lis leurs rapports, fonctions mathématiques, schémas JSON, imports/exports et tests. Cherche duplication des probabilités ou fonctions d'efficacité; vérifie les invariants exacts 5d6, valeurs brutes/bonus effectifs, niveaux 1–25 expérimentaux, seuils, défenses/résistances/protection, ressources, versions et compatibilité avec anciennes sauvegardes. N'altère pas le moteur sans anomalie reproductible. Lance les suites pertinentes et mesure les cas limites. Prépare en plus un protocole de playtest humain avec profils distincts, scénario, version testée, jets/marges/tours/mana/repos, consentement et grille de retour; ne le décris pas comme exécuté sans participants/résultats. Sépare les résultats automatisés, humains manquants et arbitrages créateur. Propose tests corrigés dans une branche propre.

---

## DG-07 — Réconciliation des 645 sujets

**Responsable :** référent Réconciliation / Registre. **Priorité : P1.** **État initial :** issue #41 ouverte; rapport public de méthode existant, données privées détaillées non dans le dépôt.

**Prompt :**

> Poursuis l'issue #41 entrée par entrée à partir du registre et des sources réelles remis pour cette mission. Vérifie la version et le SHA des sources, codes, alias, preuve, lien web exact et état éditorial. Ne fabrique pas une correspondance depuis un titre semblable; n'utilise pas les couleurs anciennes pour promouvoir. Traite explicitement les 12 biographies historiques et changements éventuels des scènes CB ultérieures. Distingue sujets 645, pages codées publiées et pages brouillons; documente les écarts. Les faits d'une campagne et les révélations doivent garder leur couche/source; toute décision de canon ou identité non résolue est présentée au créateur. Travaille par lots vérifiables, conserve les entrées anciennes et publie un rapport de couverture avec chaque ligne source/preuve/état/décision. Ne prétends pas avoir audité les 645 si seuls des échantillons sont accessibles. Teste les codes et liens sur chaque lot.

---

## DG-08 — Parcours de nouveau joueur

**Responsable :** référent UX / Jouabilité. **Priorité : P1.** **Dépendances :** guide Jouer et parcours 5d6.

**Prompt :**

> Teste un parcours complet pour une personne qui ne connaît pas Orin : comprendre le monde, choisir région, découvrir cultures/institutions, créer personnage, consulter capacités, trouver créatures/PNJ/quêtes, préparer séance, jouer avec MJ humain ou assisté par IA et sauvegarder une continuité indépendante. Utilise uniquement les pages et outils réellement présents sur le site/dépôt. Pour chaque étape, note URL, actions, résultat, obstacle, accessibilité clavier/mobile et fonctionnalité absente. Vérifie que les pages de tables locales sont bien distinguées d'un service Internet; les exports locaux ne sont pas des comptes cloud. Prépare un scénario de recette reproductible avec critères réussite/échec, puis classe les blocages par impact et effort. Corrige seulement les obstacles UX non controversés, sans inventer un lieu, une règle ou une fonctionnalité. Donne une preuve navigateur distincte du test de build.

---

## DG-09 — Atlas des Sept Cités

**Responsable :** référent Atlas. **Priorité : P2.** **État initial :** issue #45 ouverte; 14 villages candidats dans un cahier, aucun canonisé ou géolocalisé.

**Prompt :**

> Exécute l'issue #45 pour les villages des Sept Cités. Lis le cahier candidat, l'Atlas V02 et les cartes/sources accessibles; recherche d'abord les localités déjà attestées au bassin, col ou communauté concernés. Les villes établies sont Torngard, Aldhammar, Skalor, Forgeciel, Keldrun, Nacrecombe et Dornaël; préserver cet état et ne pas imposer de villages inventés. Pour chaque candidat, établis séparément la source, région hydrographique, relief, accès plausible, économie/institutions, relations, proposition de localisation et statut. Ne donne pas distances, frontières, routes, coordonnées ou horaires sans source. Les noms du cahier restent modifiables et `proposition_non_jouee` jusqu'à validation. Prépare des fiches et accroches ouvertes seulement après recherche; aucune quête proposée ne devient un fait joué d'Orin. Les cartes attendent validation spatiale. Fournis au créateur les décisions à trancher et tests de liens.

---

## DG-10 — Écosystèmes et civilisations

**Responsable :** référents Lore + Bestiaire. **Priorité : P2.** **Dépendances :** DG-02 et DG-05.

**Prompt :**

> Prépare un ensemble cohérent de créations possibles pour une région/écosystème du monde d'Alrick, en séparant explicitement lore existant, hypothèses de travail et créations proposées. Le monde ne dépend pas de la campagne d'Orin; une civilisation, religion, espèce ou activité économique peut être conçue avant toute rencontre en jeu et devient canon uniquement après approbation du créateur. Vérifie les sources et doublons du dépôt, les contrats de trois couches et la taxonomie B-001/M05. Ne copie pas le canon dans des fiches redondantes. Pour chaque proposition, indique fonction écologique/sociale, relations, limites, besoins de source et effets possibles sur les fiches existantes. N'ajoute pas de faits joués ni de capacités 5d6 déduites. Publie seulement le matériel de proposition dont la présentation et diffusion sont approuvées; requiert validation créateur pour promotion canonique. Donne critères de revue et tests de métadonnées/liens.

---

## DG-11 — Scénarios indépendants

**Responsable :** référent Scénarios / Jouer. **Priorité : P2.** **Dépendances :** DG-08, contrat éditorial.

**Prompt :**

> Crée ou révise un scénario jouable autonome dans l'univers d'Alrick destiné à une campagne indépendante. Il doit fournir une situation ouverte, des enjeux compréhensibles, plusieurs choix, des PNJ avec objectifs propres et des issues non imposées. Identifie les éléments de lore sourcés, les propositions non jouées et les options facultatives; n'introduis pas Orin comme personnage obligatoire et ne réécris jamais les faits de l'Odyssée. Ne canonise pas de lieux, espèces, règles ou résultats créés pour le scénario. Étiquette `portee: campagne_independante`, un `campagne_id` de scénario/collection approprié, `canon_statut: proposition_non_jouee`, usages et spoilers. Vérifie publication autorisée et avertissements. Teste liens, routes de jeu, accessibilité des informations au MJ et compréhension pour groupe débutant; conserve les choix du joueur.

---

## DG-12 — Accessibilité et présentation

**Responsable :** référent Interface / Accessibilité. **Priorité : P2.** **Dépendances :** déploiement actif et priorités UX.

**Prompt :**

> Audite le site Quartz déployé et son code pour les parcours d'accueil, recherche, fiches, images/cartes et outils 5d6. Mesure lisibilité, navigation clavier, focus, contrastes, textes alternatifs, structure des titres, responsive/mobile et avertissements spoilers. Distingue test automatisé, émulation et essai appareil réel/lecteur d'écran. N'affaiblis pas les protections de spoilers ni les limites de publication. Corrige uniquement les problèmes démontrés dans une branche ciblée; conserve licences et attribution d'image, et ne présente pas une étude conceptuelle comme géographie canonique. Exécute les tests Quartz et contrôles navigateur concernés, joins captures/URL et liste les points qui exigent un audit humain. Aucun déploiement sans décision.

---

## DG-13 — Tables persistantes sécurisées

**Responsable :** référent Tables + Sécurité. **Priorité : P3.** **Dépendances :** revue #54 et décision d'hébergement.

**Prompt :**

> À partir de la PR #54, produis une architecture et une preuve de concept séparant pilote local et service persistant accessible sur Internet. N'affirme pas que GitHub Pages ou un jeton local d'invitation fournit une authentification serveur. Définis identité/autorisation, invitations, permissions MJ, sauvegardes, chiffrement, journaux, rétention, export/suppression, limites de fréquence, validation serveur, résistance au rejeu et concurrence/transactions. N'envoie aucune donnée privée et ne crée aucun compte/service payant/public. Établis des menaces, modèle de données compatible M01–M05 et contrôles de sécurité testables; distingue données de personnage locales des journaux canoniques. Livrer d'abord une proposition vérifiable ou un prototype local sans publication. Toute infrastructure publique, conservation de données ou coût requiert arbitrage explicite du créateur.

---

## DG-14 — Assistance IA contrôlée

**Responsable :** référent IA documentaire + Continuité. **Priorité : P3.** **Dépendances :** DG-01, DG-02, DG-07 et DG-13.

**Prompt :**

> Concevoir une méthode d'assistance MJ par IA fondée sur un corpus explicitement fourni à chaque conversation, sans prétendre que l'agent connaît tout le site, les sources locales ou les secrets. Définis des paquets de contexte versionnés avec citations/paragraphes, campagne_id, portée, statut canon, visibilité et rôles (MJ/personnages). Sépare corpus d'univers partagé, Odyssée et campagne indépendante; empêche les révélations MJ dans le contexte joueur; indique ce qui est absent ou incertain. Les propositions de l'IA ne deviennent jamais faits joués ou canon sans confirmation humaine. Préserve l'historique et la sauvegarde indépendante, et ne transmets pas de sources au fournisseur/API sans autorisation explicite. Prépare un protocole de tests de récupération, citations, non-divulgation, continuité et fausses certitudes. N'implémente pas de service distant ni d'import massif avant revue de confidentialité, coûts et sécurité par le créateur.


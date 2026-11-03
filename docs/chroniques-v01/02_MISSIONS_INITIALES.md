# 02 🚦 Premières missions — plan de lancement v0.1

**Autorité :** créateur et DG. **Type :** ordres préparatoires, pas des résultats de test. **Règle :** reprendre les livrables déjà produits et éviter les doublons ; vérifier `main`, PR et SHA avant chaque travail. Les codes MATH-001, INDEX-001, STUDIO-001 et LORE-001 désignent les missions déjà proposées dans leurs chats ; le présent plan n'en recrée pas de concurrentes.

## 00 🧭 ORG-001 — Pilotage des conversations (DG)
**Objet :** valider l'organigramme et le contrat de passation, maintenir ce registre et trier les missions.  
**Entrées :** décisions du créateur, rapports des référents, statuts PR réels.  
**Sortie :** priorités et arbitrages explicites, registre daté, propriétaires et dépendances.  
**Limite :** ne pas annoncer de mission terminée sans preuves ; ne pas fusionner ou canoniser.

## 01 🧱 BUILDER-001 — Architecture transversale et inventaire (BUILDER)
**Objet :** reprendre l'inventaire déjà commencé de Quartz, fiches Markdown, M01–M05, Bestiaire, Grimoire, Ateliers, Tables et Studio.  
**Sortie :** diagramme des frontières, conservation/extraction/adaptation/nouveau, contrats d'interface, plan de branches, points de friction documentés.  
**Dépendances :** MATH, INDEX, ARCHIVES, STUDIO ; consultation QA avant adoption.  
**Limite :** conserver le site public et les branches propriétaires ; aucune refonte générale unilatérale.

## 10 🧮 MATH-001 — Noyau mathématique commun (MATH)
**Objet :** auditer les calculs effectivement utilisés, analyser la cohérence attaque/défense/dégâts/effets/ressources/fabrication et publier les invariants.  
**Sortie :** cartographie des fonctions sources, tests probabilistes exacts et simulations, contrat de résolution, divergences, arbitrages ouverts.  
**Dépendances :** INDEX, COMBAT, MAG, OBJETS, BEST, STUDIO.  
**Réserve :** MATH-002 reste étude de progression 21–25 et Autorités, *sans adoption ni correction implicite*. Conserver les 5d6 et les niveaux 1–25, caractéristiques brutes >12.

## 11 🔗 INDEX-001 — Registre commun des capacités (INDEX)
**Objet :** poursuivre l'étude et le dossier préparatoire existants ; rapprocher `AbilityDefinition` (M02), `M03Effect`, `Spell`, `RitualDefinition`, `BestiaryCard` et objets.  
**Sortie :** identifiants stables, provenance, versions, familles d'effets, contrats d'adaptation non destructifs, exemples utilisables dans différents ateliers et Studio.  
**Dépendances :** MATH valide les effets chiffrés ; COMBAT/MAG/OBJETS valident les domaines ; ARCHIVES valide le round-trip ; QA teste.  
**Limite :** ne pas transformer texte narratif en effet mécanique exécutable.

## 20 🎛️ STUDIO-001 — Cockpit MJ local (STUDIO)
**Objet :** poursuivre le cadrage existant, prototyper uniquement après alignement des contrats de source et de sauvegarde.  
**Parcours cible :** campagne locale → import PJ → référence et copie de créature → scène → présentation à liste blanche → notes privées → export/réimport.  
**Preuve attendue :** aucun secret dans DOM/messages joueur ; non-destruction des données, ouverture/fermeture fenêtres ; recette bureau/tablette ; moteur 5d6 réutilisé.  
**Limite :** pas de synchronisation serveur ; protéger les branches Bestiaire, Tables et Grimoire.

## 02 ✅ QA-001 — Stratégie de recette transversale (QA)
**Objet :** établir les contrôles bloquants et l'exigence de preuves pour toute branche v0.1.  
**Sortie :** matrice par fonctionnalité, menaces de fuite MJ, compatibilité v1/v2/v3, valeurs >12, tests navigateur et humains, attestations SHA/CI.  
**Limite :** un test unitaire réussi n'est ni un playtest ni un contrôle smartphone.

## 04 🗄️ ARCH-001 — Cartographie des sauvegardes (ARCHIVES)
**Objet :** inventorier les formats historiques, fiches, campagnes, Bestiaire, Grimoire, rites et extensions inconnues.  
**Sortie :** matrice d'adaptateurs, copie avant migration, export/réimport garanti, risques de collisions, protocole de restauration.  
**Limite :** pas de migration massive ni de sauvegardes personnelles dans GitHub public.

## 30 🌍 LORE-001 — Fondations du monde partagé (LORE)
**Objet :** poursuivre la proposition déjà ouverte ; inventorier les piliers de monde réutilisables pour tout MJ, sans obligation de connaître l'Odyssée.  
**Sortie :** atlas des invariants, faits joués vs propositions, premières pistes de l'époque +500 ans, questions à arbitrer.  
**Limite :** LORE-01.B, sa certification historique et ses sources restent un chantier distinct ; aucune succession d'Orin imposée au canon.

## 12–14 ⚔️✨💍 Vérifications spécialisées à ouvrir après MATH/INDEX
- **COMBAT-001 :** familles d'effets martiaux, soutien, défenses et scénarios de balance.
- **MAG-004 (code provisoire DG) :** adaptateurs de sorts/rites sans canoniser les coûts provisoires.
- **OBJ-001 :** distinguer objet descriptif, objet à paramètres et effet chiffré ; calculs via MATH.

## 21 🎨 ATELIERS-001 — Parcours commun de création
**Objet :** comparer les formulaires actuels, définir un flux partagé (personnage, créature, capacité, sort, objet) et les niveaux guidé/expert.  
**Sortie :** prototypes de parcours, accessibilité, contraintes JSON, intégration INDEX et STUDIO.  
**Limite :** pas de nouveau moteur mathématique dans l'UI.

## 35 🐉 BEST — Développement indépendant
Continuer B-003 et missions Bestiaire déjà propriétaires ; fournir à INDEX une fiche réelle et un profil mécanique de test **sans modifier la branche B-003**. Les nouvelles fiches doivent rester réutilisables par tout MJ.

## 90 🏁 Critère de lancement de l'intégration
La DG arbitre les contrats après revue MATH + INDEX + ARCHIVES + STUDIO + QA. Aucun de ces ordres ne vaut autorisation de merge, de publication ou de canonisation.

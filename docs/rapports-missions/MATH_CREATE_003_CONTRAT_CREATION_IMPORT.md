# MATH-CREATE-003 — Création, importation et variantes des fiches 5d6

**Date :** 16 novembre 2026 (heure de référence du créateur).  
**Responsable du prototype :** 10 MATH, avec passation à 35 BESTIAIRE, 11 INDEX, 20 STUDIO, 13 CAP, 12 MAG, 22 OBJETS, 04 ARCHIVES et 02 QA.  
**Statut :** prototype de compatibilité, non canonique et non publié. [Issue #164](https://github.com/Sijiel44/archives-alrick/issues/164).  
**Moteur mathématique :** M03 historique et extension expérimentale MATH-REF-002A [PR #163](https://github.com/Sijiel44/archives-alrick/pull/163) ; **aucun deuxième moteur de dégâts**.

## 1. Objectif pour les MJ

Un MJ doit pouvoir :

1. **Créer** un PNJ ou une créature à un niveau de 1 à 25 en réutilisant M04.
2. **Importer** une fiche de Bestiaire M03 et en faire une copie de travail.
3. **Choisir un autre niveau** sans détruire la source et en conservant ses spécialisations.
4. **Importer une fiche PJ M02** dans le sens PJ → copie PNJ M03, sans convertir le PNJ en PJ financé par le budget M02.
5. **Associer des références de catalogue** de capacités, sorts, rites et objets avec ID, révision et provenance ; ces liens ne sont pas des effets numériques.
6. **Prévisualiser** le profil, la touche, les protections et les dégâts, puis faire approuver l'application par le MJ.
7. **Réexporter** la fiche Bestiaire via l'export Atelier M03 existant, sans perdre sa provenance ni confondre l'export avec une fiche PJ M02.

### Parcours recommandé (Studio MJ)

| Écran / geste | Fonction attendue | Condition |
|---|---|---|
| **Importer** ou **Créer** | Vérifier schéma, statut et identité ; créer une copie | Aucun changement dans les sources |
| **Niveau cible** | Prévisualiser les statistiques M04 du N choisi ; conserver les écarts personnels | Interdiction N0 et N26 ; aucun nouveau rang d'école gratuit |
| **Capacités / Sorts / Objets** | Associer une définition versionnée, éventuellement ajouter une note MJ | Aucune activation depuis une description ; autorisation distincte |
| **Prévisualiser / Confirmer** | Calcul M03, ressource et conséquence puis approbation MJ | Deux gestes pour résoudre l'action après préparation, débit unique |
| **Sauvegarder / Exporter** | Instance/variante locale, référence d'origine et historique | Secrets MJ jamais visibles dans la fenêtre joueur |

## 2. Fonctions expérimentales disponibles

| Fonction M04 | Entrée | Sortie et garantie |
|---|---|---|
| `createBestiaryCard(level, archetype, kind, role)` **existante** | Niveau N1–N25, archétype, `pnj|creature` | Profil tactique fictif M03, brouillon |
| `validateBestiaryCard(raw)` **existante** | JSON Bestiaire | Contrôle du schéma, valeurs et extensions documentaires |
| **`createBestiaryLevelVariant(raw, targetLevel)`** | Fiche M03, niveau cible entier N1–N25 | **Nouvel ID**, statut brouillon, `variantOrigin`, écarts caractéristiques/maîtrises/PV conservés, anciennes validations d'effets remises à faux |
| **`createNPCFromM02Source(raw, targetLevel?)`** | PJ M02 de source vérifiée | **Nouveau PNJ M03 brouillon**, identité/profession/stats/maîtrises/PV/défenses, capacités sans approbation automatique ; pas de copie de notes personnelles |
| **`addBestiaryCatalogReference(raw, reference)`** | Fiche M03 et `type/id/revision/provenance` | Copie avec lien non habilité `approvedByGM:false`, remplacement de version par ID, aucune modification numérique |
| `exportBestiaryForAtelier(card)` **existante** | Carte PNJ/créature | Export de consultation `m03-bestiary`, **non compatible comme PJ `m02` jouable** |

### Principe de recalcul M04

Pour une caractéristique `s`, à archétype et rôle conservés :

`s_variante(Nc) = borne(s_modele(Nc) + [s_source - s_modele(Ns)])`

où `Ns` est le niveau source et `Nc` le niveau cible. Les mêmes **différences** sont conservées sur les maîtrises générales présentes dans le modèle, les PV et le mana. Les maîtrises propres à une école, un métier ou une exception restent **inchangées**, sans gain imposé. Une maîtrise absente de la source M02 est initialisée à **zéro** et ne se débloque pas à l'import. Les protections, grades, base de dégâts et pénétration personnalisés restent inchangés et doivent être revus selon le niveau de danger.

Ce modèle est **provisoire** : les niveaux de menace et les PV ordinaires/élites/boss restent sous arbitrage BEST/QA. Il ne revendique ni équivalence de budget entre PJ et créature ni autorisation divine.

## 3. Exemple fictif — Maëla, éclaireuse N10

- Source : PJ M02 N10, Physique 12, Agilité 14, Esprit 8, Présence 6 ; Lames 7, Esquive 9, Magie 3, maîtrise de l'école du **feu 15** ; PV max 66, mana max 36.
- Import MJ : devient un **PNJ M03 N10**, avec identité et défense réutilisables, sans effacer sa fiche PJ d'origine. Les maîtrises absentes (Runes, Survie, Volonté, Négociation) sont **0**, et la proposition de capacité « Pointe de feu » n'est plus réputée approuvée.
- Variante N15 : la partie générique des caractéristiques et maîtrises suit l'**écart par rapport au modèle M04**, tandis que la maîtrise spécifique du feu reste **15**, faute d'un entraînement explicite. La nouvelle fiche est un brouillon distinct et porte la provenance de Maëla N10.
- Si le MJ lui associe `MAG-SORT-001 Étincelle`, il ajoute un **lien de catalogue**, pas un permis de lancer, des dégâts ou un coût. Le sort est feu/Cercle I ; les chiffres de l'ancienne démo de foudre ne sont jamais importés.
- Une arme enchantée ou un rite reçoit de même une référence stable et un statut de proposition. L'effet n'est activé qu'après habilitation des ateliers propriétaires.

## 4. Cas fictif — Frelin des cendres

Un créateur peut préparer un profil de `creature` N5, puis produire des variantes N1/N10/N15/N20/N21/N25 pour comparer les rencontres, sans que cette opération **invente une espèce ou attribue un code documentaire**. Les particularités d'une créature précise ne deviennent pas des caractéristiques obligatoires de son espèce. Le nom sert ici uniquement d'exemple technique.

La variante porte `variantOrigin.sourceId`, `sourceLevel`, `targetLevel`, schéma et méthode. Une entrée d'univers future demanderait un **code unique validé** selon le contrat éditorial et les règles BEST/B-002, indépendamment de la fiche tactique locale.

## 5. Contrat de références et interdictions

- Références acceptées en prototype : `ability`, `spell`, `object`, `ritual`, avec `id` stable, `revision` positive et `provenance` non vide.
- Chaque ajout est réinitialisé à `approvedByGM:false`. Un import qui contient `approved:true` n'autorise aucune application mécanique.
- Les liens ne modifient **jamais** les champs `stats`, `pvMax`, `masteries`, `baseDamage`, `penetration` ou les sorties `attackMath`.
- Il faut ensuite un **adaptateur INDEX/MJ** attestant identité, habilitation, révision, disponibilité, prérequis, charges/coûts et bon détenteur de la ressource pour fournir un effet autorisé au résolveur M03.
- **Niveau du personnage, rang numérique, Cercle magique et degré narratif de l'école restent quatre champs distincts.**
- N20 = éveil ; N21–N25 = progression divine ; N25+ reste un **PNJ de niveau 25**, ses crédits exceptionnels sont réservés aux arbitrages du MJ, jamais créés par cette fonction.
- Garder les notes du MJ hors de toute liste blanche joueur. **La fonction de profil seule n'effectue aucune autorisation de diffusion.**

## 6. Tests et statut réel

**Commande :** `npm run test:mathcreate003` ; également ajoutée à `npm test`.

Couverture automatisée :

1. **490 variantes** : 2 types de fiches × 5 archétypes × 7 niveaux d'origine × 7 niveaux cibles.
2. Fidélité des spécialisations et extensions, création d'ID distinct, provenance, refus de N26, réimport/export JSON sans mutation source.
3. Import PJ M02 → PNJ M03, maîtrise absente maintenue à zéro, maîtrise du feu inchangée et approbation de capacité réinitialisée.
4. Références versionnées CAP/MAG/OBJETS/rites : **aucun effet automatique sur les dégâts**.
5. Compatibilité du calcul `attackMath` avec l'ancien moteur `resolveCombatM03`.

**Limite explicite :** tests unitaires et mathématiques, **pas** encore interface Studio câblée, ni recette humaine Chrome deux onglets, ni preuve de coût/charges/restauration ou contrôles de la fenêtre joueur.

## 7. Passations et jalons

| Référent / issue | Travail suivant |
|---|---|
| **BEST #158** | Valider la politique d'évolution des profils, PV/danger, effets des variantes, provenance de l'espèce et des individus ; ne pas migrer les fiches existantes sans revue |
| **INDEX #161** | Schéma stable définition/instance/variante ; refs typées et approbation attestée, jamais `approved:true` auto-déclaré |
| **MAG #156** | Adapter Étincelle feu et autres sorts, intensité, école, maîtrise, mana, Cercle, sans copie des statistiques démo |
| **CAP #160** | Règles de niveau et de maîtrise (progression visible), lien vers les capacités validées, prérequis |
| **OBJETS #159** | Fabrication, enchantement, type d'objet, charges, propriétés et provenance ; texte descriptif = pas de bonus |
| **STUDIO/ARCHIVES #157** | Parcours « Importer → Niveau → Prévisualiser → Confirmer », copies locales, sauvegarde, deux onglets, anti-doublon, secrets MJ |
| **QA #153** | Parité M03, tests de compatibilité d'import, outils physiques/tablette et niveau de difficulté réel |
| **DG / SITE #162** | Contre-audit et homologation de la référence ; publication de la documentation après accord exprès seulement |

**Livrable de cette branche :** couche de compatibilité **sans mutation des fiches sources**, première base concrète pour la création générale et les parcours de Studio. Aucun nouvel outil d'édition complet, aucune fusion, aucune canonisation et aucun changement de statut `publish:false`.

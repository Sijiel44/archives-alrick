# MATH-ACTOR-006 — Lot C — Raccord au Site Chroniques (plan d'intégration et recette)

**État : spécification de passation, non intégrée au Site.**  
**Site ciblé fourni par le créateur :** https://chroniques-entre-rives-studio.adaptableclove.chatgpt.site/  
**Source du contrat expérimental :** PR #181, `experiments/math-actor-006/`  
**Mandat initial et critères :** #180  
**Statut de déploiement :** **aucune modification du Site réalisée dans ce lot.**

## 0. Périmètre et preuves disponibles

Le Site cible est hébergé par ChatGPT Sites, distinct du dépôt `Sijiel44/archives-alrick` (Quartz). Le lien public transmis ne donne **pas accès, à lui seul, au code source, aux permissions, au schéma de données, aux migrations ou aux secrets du Site**. Sa page n'a pas pu être inspectée dans la session qui a créé ce document : toute description de son interface ou de son stockage est **à vérifier**, pas un état constaté.

La PR #181 fournit le contrat expérimental :
- `encounter-draft.mjs` : brouillon versionné, instances uniques, camps et rôles descriptifs, comparaison non homologuée ;
- `encounter-studio-bridge.mjs` : ports injectables `catalog.list/read`, `repository.read/compareAndSwap`, `resolveM03` et contrôles de versions ;
- `encounter-planner-ui.mjs` : UI de préparation consultative, cinq d6, prévisualisation sans consommation ;
- tests Node : 16 tests définis après le correctif B.1 (12 avant). L'archive locale mentionnée dans la passation B annonçait 24 tests ; ce **n'est pas** le décompte du dépôt.

**Ne pas** recopier le prototype dans le Site sans examiner son architecture réelle. Utiliser les ports comme contrat et adapter à ses primitives de stockage et d'autorisations.

## 1. Conditions préalables obligatoires

1. Depuis l'espace propriétaire du Site, ouvrir le projet éditable ou exporter le source depuis Codex, puis identifier framework, routes, données, authentification, autorisations MJ/joueur et moteur M03.
2. **Sauvegarder** le code/version existante et les données de campagne par un export effectivement vérifié, sans confondre réversion de code et restauration de base. Exécuter les essais destructifs sur des données synthétiques.
3. Identifier la vraie source d'autorité des identifiants de campagne, séance, scène et fiche, ainsi que les références et versions `sourceRef` / `profileRef`.
4. Vérifier que la lecture de fiches privées, même dans une UI cachée, est protégée **côté source de données**, pas seulement par un bouton masqué.
5. Interdire tout nouveau barème de danger ou de difficulté sans validation DG/MATH.

## 2. Parcours fonctionnel cible — MJ seulement

`Campagne → Préparer → Scène → Rencontre` :

1. Choisir une campagne et une scène **existantes** ; utiliser leur identifiant stable.
2. Parcourir le catalogue réellement autorisé : PJ, PNJ, créatures. N'afficher que les champs nécessaires à la sélection (ID, libellé, type, niveau), sans notes privées dans les données de sélection.
3. Ajouter une **instance** de chaque participant ; deux créatures de même espèce ont deux IDs différents. Le PNJ conserve ses liens, son histoire et ses références.
4. Attribuer camp et rôle (allié/adversaire/neutre ; défense/assaut/soutien/contrôle/éclaireur/boss/personnalisé) **descriptifs**, sans bonus de jeu.
5. Montrer niveaux, effectifs et médianes ; prévenir qu'il ne s'agit **pas** d'une difficulté ni d'un barème de menace officiel.
6. Prévisualiser une opposition par le **M03 natif**, sur exactement cinq dés 1–6 ; revalider les versions et accès de l'attaquant et de la cible.
7. Afficher explicitement `Prévisualisation — aucune application`. Ni PV, ni mana, ni charges, ni XP, ni effets INDEX ne changent à ce stade.

Une future application d'effet exige une opération explicite et distincte : autorisation MJ + règle INDEX approuvée + transaction ARCHIVES + journal d'événement + gestion des conflits. **Ce lot n'implémente pas cette application.**

## 3. Contrats et sécurité

- **Catalogue :** `list({campaignId})` / `read({campaignId,actorId})` ne renvoient que les fiches autorisées. Chaque lecture recontrôle l'appartenance à la campagne et le rôle effectif ; refus si fiche révoquée, supprimée ou version divergente.
- **M03 :** `resolveM03({attacker,defender,action:{dice}})` est injecté depuis le moteur approuvé ; ne jamais substituer un calcul local ou un résultat simulé à la vraie validation.
- **Sauvegarde :** `read` et `compareAndSwap` doivent offrir le même contrat de révision atomique **dans le stockage réel**. Si la base du Site n'est pas IndexedDB, conserver l'invariant d'atomicité et documenter son implémentation ; ne pas bricoler une séquence lecture puis écriture non atomique.
- **Identité/version :** `campaignId`, `encounterId`, `actorId`, `sourceRef`, `profileRef` et `revision` sont contrôlés au chargement, à l'ajout et avant le jet.
- **Projection joueur :** document à liste blanche indépendant. Ne **jamais** transmettre un objet campagne ou un brouillon MJ complet à la fenêtre joueur ; le JSON de diagnostic doit rester derrière les permissions MJ.
- **Secrets :** ne pas ajouter de données privées dans les journaux client, erreurs, résultats M03, export joueur, URLs ou requêtes du public.
- **Compatibilité :** aucune altération M01–M05, aucun écrasement des sauvegardes historiques, aucune migration silencieuse de règles `legacy` vers M03.

## 4. Recette exigée avant activation

| Réf. | Scénario | Attendu |
|---|---|---|
| C-01 | Créer/charger une rencontre dans une scène réelle | Identités scène/campagne et brouillon stables |
| C-02 | Même PNJ dans bibliothèque puis rencontre puis recharge | Un seul enregistrement source ; histoire inchangée |
| C-03 | Deux créatures de même espèce mais IDs distincts ; réajout même ID | Deux acceptées ; duplicat rejeté |
| C-04 | N1, N5, N10, N15, N20, N25 ; tentative N26 | Profils M03 cohérents ; N26 rejeté |
| C-05 | Dés non entiers, incomplets ou hors 1–6 | Jet refusé avant moteur |
| C-06 | Prévisualisation M03 ; états avant/après | Aucun débit, dégâts, effet, XP, charge ou mutation |
| C-07 | Profil/version/autorisation modifié après sélection | Prévisualisation refusée et revalidation demandée |
| C-08 | Deux onglets écrivent la même révision | Une seule écriture réussit ; conflit visible, sans écrasement |
| C-09 | Panne entre préparation et sauvegarde, puis recharge | Aucune corruption ni révision fantôme |
| C-10 | Export et import de campagne avec provenance | IDs, versions, liens et notes MJ autorisées conservés |
| C-11 | Fenêtre joueur + outils réseau + compte non MJ | Aucun champ privé, source, JSON ou résultat secret exposé |
| C-12 | Clavier seul, lecteurs d'écran, mobile/tablette | Labels, focus, erreurs lisibles, aucune action inaccessible |
| C-13 | Groupes hétérogènes, élite/boss, alliés PNJ, environnement | Raccord M03 natif ; pas de « danger officiel » inventé |
| C-14 | Retour arrière d'une version d'application | Données de campagne préservées ou migration explicitement gérée |

## 5. Gates d'intégration

- **Gate C0 — source :** accès au projet Site, cartographie des ports et preuve de sauvegarde/export ;
- **Gate C1 — données :** catalogues autorisés, référentiels, identités, CAS atomique et conflits ;
- **Gate C2 — mécanique :** résolution M03 native sans mutation et parité des tests ;
- **Gate C3 — UX :** Préparer → Rencontre dans la vraie navigation, consentement MJ, accessibilité ;
- **Gate C4 — QA :** tests C-01 à C-14, journal des résultats et captures expurgées ;
- **Gate C5 — DG :** feu vert explicite pour activer/publier. La PR #181 demeure DRAFT tant que ces gates ne sont pas prouvés.

## 6. Instructions de reprise dans ChatGPT Sites

Dans le projet propriétaire du Site, demander l'ouverture de la **version éditable du Site existant** (ne pas créer un nouveau Site), puis joindre la PR #181 et ce fichier. Faire d'abord **l'audit sans mutation**, en identifiant les ports réels et les mécanismes de permissions/stockage. Demander ensuite l'intégration sur une version de prévisualisation **non publiée**, la recette sur données fictives et une liste écrite des preuves ; publication uniquement après validation.

**Important :** une URL de consultation n'est pas une autorisation technique d'édition ; la conservation et la restauration des données doivent être vérifiées séparément de la sauvegarde du code.

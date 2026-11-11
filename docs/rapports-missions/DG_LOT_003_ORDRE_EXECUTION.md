# DG-LOT-003 — Ordre de réalisation, prototype local fini

**Décision DG :** lot opérationnel LANCÉ PAR MANDAT DU CRÉATEUR le 4 novembre 2026. Ce dossier fixe un ordre, pas la preuve que les chats spécialisés ont déjà exécuté le travail.
**Dépôt :** Sijiel44/archives-alrick.
**Base de toutes les branches techniques :** 88f774f3d0d6d520d8d11443b72202b9caf4f94b (main vérifié). **ORG :** PR #78 @ 82d6b4c1096c7faa12da6b80ff09b82e11b9f259.
**Sources de conception :** PR #79 diagnostic M03, #80 BUILDER, #81 INDEX. PR #76 Bestiaire comme source NON fusionnée, non canonique. #82 et #83 éditoriales, sans dépendance bloquante.
**Interdictions :** aucun merge de PR, publication Pages, canonisation, correction des formules M01–M05, écriture sur les branches propriétaires existantes, migration destructive, données MJ privées dans GitHub public ou autorité de transaction réseau.

## Résultat fini à livrer

Un démonstrateur exécutable **localement**, autonome du site public, appelé Studio DG-LOT-003. Il doit permettre de vérifier en navigateur, sur des données entièrement fictives, un parcours complet :

1. Créer une campagne locale, puis créer une scène privée.
2. Prévisualiser un import PJ historique v2 ou v3 **sans mutation**, accepter une copie, conserver les octets bruts et SHA256, préserver les champs inconnus et les valeurs brutes supérieures à 12.
3. Insérer une créature fictive par référence de source puis copie d'instance ; distinguer code documentaire, identifiant de profil, identifiant d'instance et règleset.
4. Ajouter des notes privées MJ et sélectionner explicitement les seuls champs publics.
5. Construire une projection joueur **par liste blanche avant transmission**, vers une origine navigateur distincte ; n'y placer aucun secret ni objet campagne entier (DOM, postMessage, stockage, journaux, export public).
6. Exporter la campagne en archive privée identifiée comme CONFIDENTIELLE, puis la réimporter en prévisualisation et vérifier la restitution et les empreintes des sources brutes ; export joueur distinct.
7. Créer une capacité **descriptive**, un sort **descriptif/non lancé** et un objet **descriptif** avec nom, provenance, limites, versions et fiches de prévisualisation. Les créations sont locales, non canoniques.
8. En mode avancé, prévisualiser les seuls calculs dont le moteur existant et l'autorisation native sont effectivement disponibles ; déléguer directement aux sources M01/M03/Grimoire de la base, jamais à une nouvelle formule.
9. Indiquer clairement « Indisponible — règle/validateur non homologué » pour l'effet M03 absorption, les objets à effets numériques, les Autorités 25+, les dépenses de mana/charges non atomiques et toute capacité sans chemin natif validé. Ne pas rendre ces champs actifs par défaut.

**Sortie du lot = un exécutable local + preuves navigateur sur le même SHA + rapport intégration + avis QA.** Une maquette ou un banc Python indépendant ne vaut pas sortie.

## Frontières techniques et versions

Répertoire de prototype : experiments/dg-lot003/ (nouveau, jamais sous content/ ni dans les pages publiques Quartz). Fichiers de test additionnels réservés à scripts/test-dg-lot003-*.mjs, uniquement si appartenant au lot. Aucun changement des anciens scripts 5d6 ni des configs de publication.
Protocole d'enveloppe TEMPORAIRE de ce seul prototype : cer.studio.dg003.provisional.v0. Cette convention d'essai ne choisit **ni** entre-rives.studio.project.v0-proposal (BUILDER) **ni** cer.studio.campaign.v0-proposition (STUDIO) comme norme définitive.
Deux serveurs locaux sur 127.0.0.1, ports 4173 (MJ) et 4174 (joueur), donc origines différentes. Les contrôles d'origine et le message DTO public doivent être testés. Si l'isolation effective manque, désactiver l'affichage joueur ; une fenêtre de même origine n'est jamais réputée sûre.
Utiliser Node 24 et les dépendances déjà installées (esbuild/tsx) si nécessaire ; ne pas ajouter de backend ou de nouvelle dépendance. Les sources officielles 5d6 sont **importées** par des ports délégataires, non recopiées. Tests en Node sur fichiers TS réels et tests navigateur sur les pages réellement servies, et non seulement sur about:blank.
Le texte des données importées est non fiable ; interface avec textContent/DOM sûr, validation de taille, schéma, identifiants et extensions. Aucune interprétation du contenu importé comme code. Jeu de fixtures 100 % fictif, sans médias non licenciés.

## Arborescence et propriété EXCLUSIVE

| Propriétaire | Sous-arbre autorisé | Sortie codée, pas audit supplémentaire |
|---|---|---|
| 01 BUILDER | experiments/dg-lot003/src/ports/ et tests/ports/ | Interfaces DocumentReader, RulesGateway, CatalogResolver, CharacterImport, BestiaryAdapter ; ports sans algorithmes 5d6 |
| 10 MATH | experiments/dg-lot003/src/rules/ et tests/rules/ | Passerelle pure vers sources officielles progression/M03 ; tests TS de parité et refus des familles non homologuées |
| 11 INDEX | experiments/dg-lot003/src/catalog/ et tests/catalog/ | Contrat exécutable versionné, validateur strict, références, permissions, conservation de provenance et familles descriptives/natives |
| 04 ARCHIVES | experiments/dg-lot003/src/storage/ et tests/storage/ | Enveloppe temporaire, import preview sans écriture, SHA des octets bruts, collisions, export privé, restore et extensions inconnues |
| 20 STUDIO | experiments/dg-lot003/src/studio/, src/player/ et tests/studio/ | Écrans campagne/PJ/créature/scène, confidentialité et projection whitelist ; aucune logique mathématique bis |
| 21 ATELIERS | experiments/dg-lot003/src/creators/ et tests/creators/ | Formulaires guidés/expert capacité, sort, objet descriptifs et prévisualisations natives autorisées |
| 05 INTÉGRATION | experiments/dg-lot003/index.html, player.html, tools/, README.md et workflow/manifest propre au lot | Assemblage et build locaux, entrée prototype, serveur des deux origines, manifest SHA, rapport d'intégration |
| 02 QA | experiments/dg-lot003/tests/e2e/ et rapport QA propre | Recette intégrée navigateur, sécurité, sauvegarde, refus des champs désactivés, preuves au SHA final |

Les tests unitaires restent sous les sous-arbres des propriétaires ; seul INTÉGRATION crée/modifie les fichiers d'assemblage et les entrées de commande. Personne ne modifie un fichier appartenant à un autre rôle. Consultation courte MAG/OBJETS pour ne pas activer de débit ; BESTIAIRE fournit une fixture fictive descriptive ; COMBAT conserve son dossier d'arbitrage sans bloquer la démonstration.

## Branches autorisées, une seule PR d'assemblage

Chacune commence **exactement** au SHA base fixé ci-dessus, garde ses fichiers exclusifs et ouvre au besoin une PR **brouillon** ; aucun merge.

- BUILDER : prototype/dg003-ports-builder
- MATH : prototype/dg003-rules-math
- INDEX : prototype/dg003-index-contract
- ARCHIVES : prototype/dg003-storage
- STUDIO : prototype/dg003-studio
- ATELIERS : prototype/dg003-creators
- INTÉGRATION : prototype/dg003-integrated (PR brouillon de démonstration)
- QA : test/dg003-qa (basée sur le **HEAD exact** de la PR d'intégration à recetter, sans modifier cette dernière).

**Règle d'intégration :** INTÉGRATION est **l'unique écrivain** sur prototype/dg003-integrated. Il importe les fichiers spécialisés par copie contrôlée ou commits reproduits, avec tableau provenance (branche, commit, blob SHA, chemin), **sans fusionner les PR**. Il relance les tests après chaque assemblage. Les auteurs ne travaillent pas concurremment sur la branche d'intégration. Si un morceau n'est pas livrable, afficher une indisponibilité claire, ne pas inventer un calcul de secours.

## Séquencement fini, sans nouveau cycle de cadrage

**Passe A — contrats exécutables** : BUILDER fixe les signatures de ports, MATH la délégation, INDEX la validation, ARCHIVES l'enveloppe et les tests réels. Avancer simultanément dans les sous-arbres exclusifs. Fixer un mini-contrat d'échange et un jeu de fixtures de référence, sans attendre adoption d'une API canonique.
**Passe B — écrans réels** : STUDIO et ATELIERS livrent les vues sur les ports, avec états désactivés explicites ; INTÉGRATION monte le build/serveur et assemble les composants livrés.
**Passe C — recette de fin** : QA vérifie l'intégration sur le HEAD assemblé avec Chromium et scripts réels ; INTÉGRATION corrige uniquement les défauts de câblage qui relèvent de ses chemins, renvoie aux propriétaires les corrections internes, recalcule le SHA après toute correction et exécute la recette finale. Pas de livraison « terminée » sans preuve du dernier SHA.

**Commandes de recette à rendre réellement exécutables dans README.md** :
- npm ci
- npm test (base de régression ; ne modifie pas la publication)
- node experiments/dg-lot003/tools/build.mjs
- node experiments/dg-lot003/tools/serve.mjs (serveur local MJ et joueur)
- node experiments/dg-lot003/tools/test-unit.mjs
- node experiments/dg-lot003/tools/test-browser.mjs

Ces chemins sont une **interface de livraison imposée** ; ne pas les annoncer opérationnels avant présence des scripts et exécution. Faire échouer un test lorsque sa précondition n'est pas satisfaite, pas de vert fictif. La CI GitHub sur la PR intégration doit référencer son SHA final et enregistrer commandes/résultats ; utiliser si possible un workflow indépendant sans déploiement Pages.

## Recette binaire de clôture

| ID | Résultat observable et preuve exigée |
|---|---|
| L003-01 | Le build du prototype se lance sans modifier Quartz/main et la page MJ s'ouvre réellement en navigateur |
| L003-02 | Création campagne + scène, modification locale, rechargement avec persistance explicite et contrôle d'accès |
| L003-03 | Imports PJ v2 et v3 synthétiques prévisualisés avant toute mutation, caractéristique 14 conservée, extension inconnue et octets originaux restituables avec SHA256 |
| L003-04 | Créature fictive référencée puis copiée ; référence intacte, copie isolée et collision d'ID refusée ou résolue explicitement |
| L003-05 | Fenêtre joueur sur origine différente : secrets sentinelles absents du DTO, postMessage, DOM, stockage et export public |
| L003-06 | Sauvegarde privée exportée/importée avec restitutions ; erreur ou collision n'écrase pas l'état antérieur |
| L003-07 | Trois formulaires descriptifs fonctionnels avec validation, provenance et aperçu : capacité, sort, objet |
| L003-08 | Un calcul M03 permis passe par le moteur officiel ; famille absorption, objet numérique et débit mana/charge non homologué restent BLOQUÉS et testés |
| L003-09 | Clavier et focus minimum fonctionnels, étiquettes champs, messages d'erreur et mode débutant/expert documentés |
| L003-10 | CI et tests exécutés sur **HEAD final** de la PR intégration, logs/échecs/limites publiés, vérification QA indépendante |

**P0 bloquants :** exposition de secret MJ, import/export destructif, exécution d'une règle non homologuée, calcul parallèle inventé, divulgation via page publique. **P1 bloquants :** parcours vertical indisponible, absence de recette navigateur réelle, incohérence de version/collision. Si un P0/P1 reste ouvert, la clôture est **prototype partiel — non qualifié**, jamais Alpha validée. Les fonctionnalités optionnelles rejetées ne bloquent pas si elles sont clairement désactivées et testées.

## Contrat des preuves et retour à DG

Chaque propriétaire fournit : branche + SHA, liste exacte des chemins, scripts/commandes, tests pass/fail/non exécutés, limites, fiche Direction ; la PR intégration ajoute un manifeste par blob source, CI finale, captures sans secrets et une démonstration d'import/export. QA remet un avis **VALIDÉ / VALIDÉ AVEC RÉSERVES / CORRECTIONS REQUISES / BLOQUÉ** sans confondre résultat local et déploiement.
Au retour à 00 DG : aucun « Alpha homologuée » du seul fait d'un prototype ; décision séparée du créateur requise pour tout merge, site, canon, adoption de nouvelles règles ou activation réseau.

**Statut de cet ordre :** mandat de réalisation autorisé ; documentation créée par DG, travail technique à exécuter par propriétaires et intégrateur.

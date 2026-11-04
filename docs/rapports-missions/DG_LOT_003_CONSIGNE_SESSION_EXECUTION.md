# DG-LOT-003 — Consigne de session exécutante / Work

## Mandat confirmé
Le créateur autorise **dès maintenant** la transmission des missions, la réalisation réversible de nouveaux fichiers de prototype sur branches propres et une revue finale. Il n'est pas demandé de redemander l'approbation pour des tests ou PR brouillon dans le périmètre. Les actes suivants demeurent **interdits** : fusion de PR, publication Pages, changement de canon ou de formule M01–M05, écriture dans les branches propriétaires historiques, transfert de secrets ou de sauvegardes personnelles au dépôt public, transactions réseau réelles.

## Sources
Lire la PR #84, en particulier DG_LOT_003_ORDRE_EXECUTION.md et DG_LOT_003_PASSATIONS_OPERATOIRES.md, plus les sources de réemploi PR #79 (M03), PR #80 (ports), PR #81 (INDEX). Code de référence immuable : main SHA 88f774f3d0d6d520d8d11443b72202b9caf4f94b. PR #76 non fusionnée : utiliser uniquement des fixtures synthétiques, sans images. Ne pas attendre les chantiers éditoriaux PR #82/#83 ni LORE-01.B.

## 1. Transmission réelle
Dans le Projet ChatGPT existant « Les Chroniques de l'Entre Rive », utiliser les chats 01 BUILDER, 10 MATH, 11 INDEX, 04 ARCHIVES, 20 STUDIO, 21 ATELIERS, 05 INTÉGRATION et 02 QA, sans création de doublons. Transmettre leurs blocs de DG_LOT_003_PASSATIONS_OPERATOIRES.md avec la source PR #84. Exiger des résultats livrés, non de simples accusés. Marquer, pour chaque rôle, date/message/lien et statut effectivement constatés. Si l'interface ne permet pas l'envoi dans un chat, marquer « non transmis » et expliquer le blocage ; ne pas prétendre avoir utilisé un outil non disponible.

## 2. Réalisation sans co-écriture
Le propriétaire code seulement son sous-arbre réservé et ses tests ; branche exclusive neuve démarrée de la base exacte ; PR brouillon si dépôt accessible. INTÉGRATION récupère les contributions et les regroupe par copie contrôlée et manifeste de provenance, sans merger les PR. Le chemin experiments/dg-lot003/ doit contenir de vrais fichiers exécutables, pas uniquement des rapports, avec des commandes Node/esbuild réelles dans le README.

La session peut avancer en parallèle : BUILDER/MATH/INDEX/ARCHIVES (contrats) et STUDIO/ATELIERS (UI) ; toute famille controversée est marquée indisponible, sans bloqueur inutile. Ne pas imposer d'attente sur BEST-001, CHRON-001 ou ANT-001 pour afficher la démo fictive. Après intégration, QA effectue une recette sur le SHA assemblé.

## 3. Porte de recette obligatoire
Exécuter sur le prototype réel et ses deux origines 127.0.0.1:4173 et 4174 : création campagne, import preview fiche v2/v3 avec caractéristique 14/champ inconnu, création scène, copie créature, vue joueur whitelist sans sentinelles MJ, export privé/public distincts et réimport sans perte, création capacité/sort/objet descriptifs, refus effectif de absorption/objet numérique/charge non homologuée. Vérifier DOM, postMessage, stockage, journaux/export, focus clavier et erreurs. Conserver captures uniquement sur données fictives.

La CI doit être associée au **dernier commit de la branche intégrée** ; ne pas attribuer les succès des PR #79/#80/#81/#84 au nouveau prototype. Distinguer tests locaux Node, suites npm officielles, Chromium, tests de vrais appareils et recettes humaines. Les derniers deux ne sont pas implicitement acquis.

## 4. Rapport final vers 00 🧭 DG
Revenir dans ce chat avec un compte rendu précis :
- tableau propriétaire / branche / PR / HEAD exact / fichiers / exécution / blocage ;
- commande d'installation/démarrage et résultat démontrable ;
- L003-01 à L003-10 : PASS, FAIL ou NON EXÉCUTÉ, preuve par lien/log/commit ;
- CI sur HEAD final et risques P0/P1 ;
- chemin de restauration, spécification des familles indisponibles ;
- décisions de gameplay encore ouvertes et non adoptées ;
- preuve que Quartz, main, site public, canon et branches historiques sont restés inchangés.

**Verdict terminal possible :** « prototype local qualifié pour revue DG » ou « prototype partiel, portes de sortie manquantes ». Jamais « Alpha publiée » ou « canon adopté ».

## 5. Règle de sincérité
Ne pas convertir un message de chat en exécution fictive, une simulation Python en test navigateur, une CI documentaire en CI produit ou une demande d'exécution en action automatique. Si un outil ne donne pas accès au navigateur ou au dépôt, terminer avec un inventaire exact des livrables produits et des fonctions non exécutées ; ne pas annoncer une livraison future.

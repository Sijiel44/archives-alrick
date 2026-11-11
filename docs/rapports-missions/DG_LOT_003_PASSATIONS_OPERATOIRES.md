# DG-LOT-003 — Ordres prêts à envoyer dans les fils existants

**Diffusion :** ces messages doivent être envoyés aux conversations indiquées par la session d'orchestration. Leur présence dans GitHub **ne prouve pas** qu'ils ont été lus ou exécutés. Le créateur a déjà autorisé les travaux réversibles et les prototypes propres de ce lot ; aucun nouvel accusé ou demande d'accord préalable n'est requis.

**Référence unique pour tous :** lire DG_LOT_003_ORDRE_EXECUTION.md dans la PR documentaire DG-LOT-003 ; base main 88f774f3d0d6d520d8d11443b72202b9caf4f94b. Périmètre fermé : prototype local, pas de merge, publication, canonisation, modification M01–M05 ni branches existantes. Le résultat demandé est du code et des tests avec SHA, pas un nouvel audit.

## 01 🧱 BUILDER — mission L003-PORTS
Tu es seul propriétaire de experiments/dg-lot003/src/ports/ et tests/ports/, branche prototype/dg003-ports-builder basée sur 88f774f3d0d6d520d8d11443b72202b9caf4f94b. Implémente les façades typées et non mutantes DocumentReader, RulesGateway, CatalogResolver, CharacterImport et BestiaryAdapter en conservant identité documentaire/source/profile/instance. N'écris aucune formule 5d6. Fournis fonctions exécutables, fixtures fictives et tests de ports réels ; spécifie les entrées/sorties minimales pour INDEX, ARCHIVES et STUDIO. Remets le SHA et les instructions d'intégration à 05 INTÉGRATION. Pas de refonte Quartz.

## 10 🧮 MATH — mission L003-RULES
Tu es seul propriétaire de experiments/dg-lot003/src/rules/ et tests/rules/, branche prototype/dg003-rules-math. Code une passerelle qui importe les sources officielles atelier5d6-progression.ts et atelier5d6-combat-m03.ts à la base figée, avec tests TypeScript réellement exécutés et un exemple de prévisualisation M03 native. Exige approbation native de capacité avant effet numérique ; respecte magnitude 1..2, durée 1..3, non-cumul ; rejette absorption, MATH-002 et tout objet chiffré non homologué. Ne corrige pas M03. Fournis preuve d'égalité du résultat natif appelé via port et directement ; SHA, commandes et logs.

## 11 🔗 INDEX — mission L003-CATALOG
Tu es seul propriétaire de experiments/dg-lot003/src/catalog/ et tests/catalog/, branche prototype/dg003-index-contract. Transforme v0.2 en un sous-contrat EXÉCUTABLE provisoire strict. Corrige magnitude 3 acceptée à tort, coût not-applicable avec montant, règles de provenance/version/alias et refus d'auto-application. Supporte définitions descriptives capacité/sort/objet et référence native validée ; aucun approved:true forgé, aucune absorption ou bague numérique appliquée. Préserve la version d'origine du sort et les champs non reconnus en snapshot privé. Tests réels aux bornes et cas invalides ; envoie interface et SHA à 05.

## 04 🗄️ ARCHIVES — mission L003-STORAGE
Tu es seul propriétaire de experiments/dg-lot003/src/storage/ et tests/storage/, branche prototype/dg003-storage. Implémente l'enveloppe provisoire cer.studio.dg003.provisional.v0 (NON canonique), preview import, originaux bruts octet à octet + SHA256, préservation v2/v3 et extensions, collisions et refus sans mutation, export privé puis restauration/reimport. Aucun accès aux secrets depuis la projection joueur. Tests d'import/export sur fixtures synthétiques réelles (pas seulement protocole Python), notamment caractère brut 14, champ inconnu, mauvaise version, collision, données tronquées. Rends interface et SHA à STUDIO et intégration.

## 20 🎛️ STUDIO — mission L003-COCKPIT
Tu es seul propriétaire de experiments/dg-lot003/src/studio/, src/player/ et tests/studio/, branche prototype/dg003-studio. Livre des écrans DOM réels : campagne locale → import PJ preview → créature fictive référencée/copiée → scène + notes privées → sélection publique → export/réimport. Construis une nouvelle DTO joueur par whitelist, **sans jamais envoyer le projet complet**, et interdis l'ouverture joueur si origine 4174 non vérifiée. Tests de refus, secrets sentinelles, focus et états vides ; pas de stockage d'une fenêtre privée en même origine que le joueur. Les schémas BUILDER/STUDIO précédents sont seulement des candidats. Transmets fichiers et SHA à 05.

## 21 🎨 ATELIERS — mission L003-CREATORS
Reprends le chat 21 sans attendre l'écran « Continuer dans ChatGPT Work ». Tu es seul propriétaire de experiments/dg-lot003/src/creators/ et tests/creators/, branche prototype/dg003-creators. Code et teste TROIS formulaires utilisables (capacité, sort, objet) avec création descriptive, limites, provenance, validation, aperçu et sauvegarde locale ; mode guidé/expert, clavier et erreurs. Prévisualisation mécanique exclusivement par ports INDEX/MATH et moteur natif autorisé, sinon affiche « indisponible ». Objets numériques/charges, absorption, coûts nouveaux et Autorités 25+ inactifs. Remets JS/TS, tests et SHA ; pas de nouveaux algorithmes 5d6.

## 05 🚀 INTÉGRATION — mission L003-INTEGRATED (chef de livraison produit)
Tu es l'UNIQUE écrivain de prototype/dg003-integrated, branche depuis 88f774f3d0d6d520d8d11443b72202b9caf4f94b. Tu possèdes experiments/dg-lot003/index.html, player.html, tools/, README, manifeste de provenance et wiring. Assemble les fichiers des propriétaires par copies contrôlées avec commit/blob SHA ; aucune fusion de PR ni modification de branches d'autres référents. Compile via esbuild existant, sers sur 127.0.0.1:4173 (MJ) et 4174 (joueur) réellement, puis exécute npm test, tests d'unité du lot et scénario navigateur entier. Fournis PR BROUILLON, HEAD exact, CI du dernier HEAD, logs, captures factices et démo. Si un composant non homologué bloque, désactive-le sans falsifier les tests. Aucun build sous content/ ou Pages.

## 02 ✅ QA — mission L003-E2E (recette indépendante)
Tu es seul propriétaire de experiments/dg-lot003/tests/e2e/ et rapport QA, branche test/dg003-qa calée sur le HEAD de l'intégrateur à recetter. Exécute pour de vrai L003-01 à L003-10 en Node + Chromium sur les pages servies, pas about:blank. Vérifie projection MJ/joueur origine distincte, canaris DOM/messages/stockage/export, round-trip et octets SHA, 5d6 natif, champs désactivés, accessibilité clavier. Signale P0/P1 sans faire passer les non-exécutés. Rebase/rafraîchis uniquement ta propre branche si intégration avance, ne modifie pas celle des autres. Remets avis final et SHA à DG.

## Consultations légères, sans nouvelles branches imposées
- 12 COMBAT : avis bref sur la restriction absorption, sans nouvelle formule.
- 13 MAG + 14 OBJETS : vérifier que les créateurs descriptifs ne débitent aucun mana/charge ; pas de correction ledger dans ce lot.
- 35 BESTIAIRE : fournir à STUDIO une fixture fictive espèce/instance/N5 à partir du dossier BEST-001, sans dépendre de la PR #76 non fusionnée ni des images.
- 03 REVUE : vérifier en fin de lot la compatibilité ports/INDEX/ARCHIVES/STUDIO, sans se substituer à QA.

## Retour final obligatoire
Les messages ne sont PAS des accusés de réception : exécuter immédiatement les artefacts autorisés dans le périmètre, puis transmettre PR/branche/SHA, commandes et résultats, captures, P0/P1 et décisions bloquées à 00 DG. Aucun travail en arrière-plan n'est annoncé par le présent dossier ; la session orchestratrice doit réellement parcourir les chats et faire constater la réception des ordres.

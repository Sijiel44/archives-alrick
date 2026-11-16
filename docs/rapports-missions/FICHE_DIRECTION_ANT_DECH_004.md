# FICHE DIRECTION — ANT-DECH-004

**Mission :** organisations canoniques publiables + références techniques pour le Studio MJ. **Responsable :** ANT. **Branche :** `content/ant-dech-004-organisations`. **Décision du créateur :** publication et statut canonique demandés explicitement le 15 novembre 2026.

## Réalisation

- **Six fiches d'organisation** `ORG-DECH-01` à `06` : soins, justice, secours, deuil, mémoire et coalition civile ; ressources, moyens, limites, antagonismes et réponses négociées. Elles ne présument ni Déchéance des employés ni appartenance à une campagne particulière.
- **Un index public** avec quatre intensités de conflit et des résolutions non violentes.
- **Six emblèmes SVG originaux**, identifiés, visibles depuis les fiches et dans le Studio MJ.
- **Un rayon Studio « Organisations et factions »** alimenté par six références publiques versionnées ; consultation, liens et copie de faction locale sur demande.
- **Un contrat technique** public/privé dans `ANT_DECH_004_CONTRAT_UNIVERS_STUDIO.md`, sans évolution forcée du moteur de règles ni des formats de sauvegarde.

## Preuves locales

- `npm test` : réussi, couvrant le moteur 5d6, la compilation et les contrôles existants.
- `npm run test:organisations` : 3 tests réussis, dont routes HTTP et refus d'un fichier non autorisé.
- Contenu : 376 pages / 275 codes ; site : 1 141 pages HTML / 66 422 liens et ressources internes contrôlés.
- **Réserve :** recette navigateur locale non obtenue, Chromium bloqué par les permissions système. Test Playwright prévu en CI ; ne pas annoncer de succès sur le site public avant vérification Pages.

## Sécurité et portée

- Canon partagé : institutions et principes ; **faits joués : aucun** dans ce lot.
- Notes MJ et secrets : **exclus du dépôt, du JSON, des images et de la projection joueur**.
- Pouvoirs et chiffres 5d6 : **aucun ajout** ; arbitrage INDEX/MATH requis si extension.
- Images de personnages : à développer avec PNJ et validation des droits ; les six visuels fournis sont des emblèmes d'organisations.

## Suite opérationnelle

1. Ouvrir une PR sur la branche, contrôler SHA, diff et tests de CI dont Playwright.
2. Avec l'autorisation de publication déjà donnée, fusionner après CI verte ; le marqueur `.github/pages-publication-approved.txt` déclenche Pages.
3. Contrôler six pages, six SVG et accès au rayon Studio **sur le site public**.
4. Transmettre les pistes d'interopérabilité et les demandes de PNJ/portrait aux référents concernés, sans envoi automatique.

**À revoir par :** STUDIO, QA, LORE, INDEX, MATH, PNJ, BEST, AVE, QTE. **À valider par DG/créateur :** preuve CI/Pages et futures capacités ou illustrations de personnages ; adoption canonique des six références déjà accordée.

**Clôture constatée :** PR #127 fusionnée sous SHA `6db27d2ab80fa61df259848c3027b3f5b18c1f77` ; CI #43796762278 réussie après correctif CSP ; les URL de la fiche, de son SVG et du catalogue Studio répondent HTTP 200 sur Pages. La revue des profils mécaniques reste distincte.

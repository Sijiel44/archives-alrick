# CHRON-001 — Rapport technique de mission

## 1. Identification

- **Mission :** CHRON-001 — séparation éditoriale des récits, campagnes et usages MJ.
- **Référent :** 36 ✍️ CHRONIQUES. **Commanditaire :** créateur / DG. **Date :** 4 novembre 2026.
- **Dépôt :** `Sijiel44/archives-alrick`, public ; `main` audité sur `88f774f3d0d6d520d8d11443b72202b9caf4f94b`.
- **Branche documentaire de mission :** `docs/chron-001-separation-editoriale`.
- **PR de mission :** https://github.com/Sijiel44/archives-alrick/pull/82 (brouillon).
- **Instruction initiale :** PR https://github.com/Sijiel44/archives-alrick/pull/78 (ORG-001), head vérifié `82d6b4c1096c7faa12da6b80ff09b82e11b9f259`. SHA du prompt `f1e578b77a39e0f995f954e483beb79d5775491b` = commit documentaire de préparation Work, non le head actuel #78.
- **Effet canon / code :** nul. Aucun changement de `content/`, du site, de la mécanique, du Bestiaire ou des bruts.

## 2. Contrat et périmètre

**Demande vérifiée :** proposer la séparation entre récit publié, campagne brute, inspiration de lore, fait joué et ressource MJ ; préserver l’Odyssée comme laboratoire et œuvre potentielle non préquelle obligatoire ; proposer circuit de publication/validation sans réécrire ni canoniser.

**Livrables :** (1) contrat éditorial proposé, (2) présent rapport technique, (3) fiche Direction, (4) gabarits de travail, (5) passations préparées non envoyées. Tous les documents sont des **propositions de conception**.

**Hors mission :** transcription exhaustive des campagnes, réécriture d’Orin, décisions de chronologie, migration de fiches, ajout à Quartz, publication Pages, correction du canon, nouvelle licence juridique, modification de schémas 5d6.

## 3. Sources effectivement consultées

| Source sur le dépôt | Observation vérifiée |
|---|---|
| `CONTRAT_EDITORIAL.md` (`main`) | Statuts `canon_statut`, séparation du brut et des synthèses, champs `publish`, `spoilers`, `unlisted`, quatre parcours |
| `content/chroniques/index.md` | Entrée « Chroniques et événements » centrée campagne Orin |
| `content/chroniques/cb44-la-bicoque-le-canard-et-les-caves.md` | Chronique adaptée non littérale, ancrée CCCX–CCCXIX, spoilée et non listée |
| `content/jdr-alrick/cb44-bilan-et-reprise.md` | État de reprise source distinct, jusqu’au chapitre CCCLXXIII |
| `content/jdr-alrick/cb44-journal-canon.md` | Distingue scènes, projets, annonces et limites |
| `content/odyssee/index.md`, `content/jdr-alrick/index.md`, `content/univers/index.md` | Les quatre parcours ne sont pas la même continuité |
| `sources/campagnes/README.md` | Registre des 15 DOCX préparés hors dépôt ; originaux/intégralités pas déposés à ce SHA |
| `README.md`, `content/a-propos.md` | Dépôt public, Quartz 5, avertissements de spoilers non confidentiels ; licence technique distincte de l’univers |
| PR #78 : `docs/chroniques-v01/00...`, `02_MISSIONS_INITIALES.md`, `03_PROTOCOLE_RAPPORTS.md`, `05_MESSAGES_DE_LANCEMENT.md` | Contrat de mission, gouvernance, absence d’autorisation automatique de publication |
| Kit IA v0.1 joint au projet : `prompts/19_CHRONIQUES_EDITORIAL.md`, `gouvernance/PROTOCOLE_COMMUN_GITHUB.md`, modèles de rapport et fiche | Exigences de provenance, validations, séparation des responsabilités |

**Limite :** les quinze Word originaux n’ont pas été fournis dans l’espace de travail CHRON-001 ; aucun passage du brut n’est déclaré nouvellement certifié. L’autorisation de transfert public affirmée dans le registre est une **déclaration documentaire**, et non une revue juridique des droits des participants.

## 4. Résultats et justification

**R1 — Taxonomie orthogonale.** Le document est classé par nature (`brut_campagne`, `transcription_campagne`, `adaptation_litteraire`, `oeuvre_originale`, `idee_lore`, `ressource_mj`), indépendamment du statut de vérité et de la diffusion. Ces nouvelles valeurs **ne remplacent pas** le `canon_statut` existant.

**R2 — Cinq couloirs éditoriaux.** La même scène peut être une source brute, un fait de campagne et le matériau d’un récit adapté. Une proposition LORE et une ressource MJ restent clairement des **usages dérivés** ; elles ne modifient pas le passé joué.

**R3 — Publication à portes bloquantes.** Réception et empreintes → consentements/licence → édition et traçabilité → avis spécialisés → décision DG → intégration avec CI/retour arrière → suivi. `publish: true` ne constitue pas l’accord de diffuser un texte ni la preuve de ses droits.

**R4 — Odyssée autonome.** Une réécriture d’Orin est possible en tant qu’œuvre littéraire séparée et peut s’écarter des scènes ; l’époque future mentionnée par le projet n’est ni imposée ni canonisée.

**R5 — Contrôle du risque public.** `unlisted` et `spoilers` ne protègent pas la confidentialité. Le brut, les secrets MJ, les sauvegardes personnelles ou des textes sans droits vérifiés ne doivent pas être déposés pour « brouillon » sur un dépôt public.

**R6 — Écart concret non tranché.** Les pages CB44 mentionnent `Campagne_Brut_4.4(1).docx`, le registre d’import `Campagne_Brut_4.4(2).docx`. Nécessité de vérifier les empreintes SHA256, variantes, versions et passages sous responsabilité ARCHIVES + LORE, **sans corriger à l’aveugle**.

## 5. Risques et gravité

| Niveau | Risque | Garde-fou |
|---|---|---|
| Bloquant | Divulgation de notes, secrets, données de participants dans GitHub public | Ne pas importer ; contrôle droits/visibilité avant tout dépôt |
| Bloquant | Fiction éditée transformée en canon ou fait joué | Trois axes ; décision LORE/DG séparée |
| Élevé | Source documentaire mal identifiée, versions CB44 | Comparaison originaux/manifeste et rapport de provenance |
| Élevé | Droits d’auteur/participant/illustrateur supposés | Registre d’autorisations par version et support, statut « inconnu » bloquant |
| Moyen | Nouveau schéma de champs incompatible avec Quartz | Proposition documentaire seulement, revue QA/INTEGRATION avant implémentation |
| Moyen | Export Studio ou contribution communautaire révèle une information MJ | Projection joueur à liste blanche, test de confidentialité |

## 6. Vérifications et critères d’acceptation

**Réalisé :** lecture et comparaison des sources listées, vérification des métadonnées CB44, constat de l’écart de nom de fichier, vérification du statut brouillon de #78 et création de la branche/PR dédiée. Les documents ne contiennent pas d’extrait de brut ni de secret MJ.

**À exécuter après le dernier commit :** vérifier les cinq fichiers attendus, comparer le diff `main...head`, confirmer que seuls `docs/` sont modifiés, relire les liens, contrôler le SHA final et les états de CI réellement retournés. Les sorties de ces contrôles sont à relever dans la PR ; ne pas déduire « vert » d’une simple création documentaire.

**Non exécuté :** `npm test`, `npm ci`, rendu Quartz, tests Chrome/tablette, CI applicative complète, certification des originaux CB, relecture juridique, test de partie. Aucun résultat antérieur ne vaut contrôle du dernier SHA de CHRON-001.

**Tests de prochaine implémentation (non réalisés) :** frontmatter sans collision avec `canon_statut`, recherche publique excluant les spoilers, liens et avertissements, page lecture mentionnant l’adaptation, absence de secrets dans le bundle, tests de réimport/retour arrière si Studio touché.

## 7. Décisions et transmissions

Six décisions en attente : D1 trois axes ; D2 publication des œuvres autonomes ; D3 politique des droits/crédits ; D4 accès aux bruts et contrôle CB44 ; D5 identité de l’Odyssée réécrite ; D6 éventuelle implémentation Quartz. Aucun vote ni accord implicite.

**À revoir par :** LORE (vérité/canon), ARCHIVES (versions), QA (spoilers/contrôles), STUDIO (projection), AVE (scénarios), COMMUNAUTÉ (contributions), INTÉGRATION (publication). Passations **préparées, non envoyées**.

**À valider par DG/créateur :** architecture documentaire, traitement des droits, limites de diffusion, futur mandat d’implémentation. La PR #82 reste **DRAFT**, sans fusion ni déploiement.

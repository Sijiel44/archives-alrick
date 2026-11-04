# FICHE_DIRECTION_DG_LOT_003 — Lancement exécutable de l'Alpha locale

**DG :** mandat d'exécution confirmé par le créateur, 4 novembre 2026.
**Base code :** 88f774f3d0d6d520d8d11443b72202b9caf4f94b; **référence organisation :** PR #78 @ 82d6b4c1096c7faa12da6b80ff09b82e11b9f259.
**Objet :** UN prototype local de cockpit et d'ateliers, sans publication, avec scénario navigateur réel.
**Type de changement autorisé :** nouveaux fichiers de prototype isolés sur branches propres, tests et PR brouillon ; aucun merge, ni changement des formules ou des branches propriétaires.

## Ce qui doit être livré
- Création campagne/scène avec import PJ v2/v3 en prévisualisation (source brute et SHA conservés).
- Créature fictive par référence puis instance, sans dépendance à B-003.1 non fusionnée.
- Projection MJ→joueur par whitelist et origine séparée, vérifiée dans Chrome réel.
- Export/reimport de l'archive **privée** et export joueur distinct, erreurs sans écrasement.
- Trois ateliers descriptifs réellement utilisables : capacités, sorts, objets.
- Port moteur M03 réel ; absorption et objets numériques interdits tant que non homologués.
- Tests automatiques et scénario navigateur sur HEAD intégré ; avis QA indépendant.

## Attribution
BUILDER : ports ; MATH : délégation 5d6 ; INDEX : contrat/validateur ; ARCHIVES : stockage ; STUDIO : UI/campagne/projection ; ATELIERS : trois formulaires ; INTÉGRATION : unique assemblage, build et PR ; QA : tests indépendants.

## Dépendances
Étape A contrats exécutables MATH/INDEX/ARCHIVES/BUILDER → étape B STUDIO+ATELIERS+INTÉGRATION → étape C QA finale. Les fonctions controversées restent désactivées sans bloquer l'Alpha locale. Le projet de règle MATH-002, l'option COMBAT B, les namespaces candidats et le canon ne sont pas adoptés.

## Décision de clôture
QUALIFIÉ PROTOTYPE LOCAL seulement si les dix cas L003-01 à L003-10 disposent de preuves au SHA final, sans P0/P1 ouvert. Sinon PARTIEL avec liste des échecs. En aucun cas ALPHA PUBLIQUE HOMOLOGUÉE ou autorisation de merge. Si CI est verte sur un SHA différent du dernier commit, la preuve demeure incomplète.

**Statut DG : ordre opérationnel lancé, travaux produits par les propriétaires à rendre ; pas d'attestation anticipée de tests.**

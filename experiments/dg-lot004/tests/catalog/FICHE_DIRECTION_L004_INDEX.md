# FICHE DIRECTION — INDEX L004-B/C

**Mandat :** DG-LOT-004, autorisé 05/11/2026. **Base exacte** PR85 `2ab809ef5351940e0fc272b859d10f21de894d00`. **Branche exclusive :** `prototype/dg004-index-xp-links`. **Périmètre :** `experiments/dg-lot004/src/catalog/` + `tests/catalog/`.

## Livré
1. Contrat exécutable de suggestion XP versionnée distincte d'une attribution MJ et d'un passage de niveau ; idempotence issue de campagne/PJ/session/événement, corrections révisées, historique requis et one-shot séparé.
2. Prévisualisation M01 par injection native uniquement, sans formule recopiée. Contrat de matrice N1/5/10/15/20/25, suite native TypeScript à relancer sur clone avec esbuild.
3. Chaîne descriptive fictive objet → capacité → créature → scène avec identités source/instance, provenance/version/statut, permissions MJ jamais forgées.
4. Snapshot MJ privé et round-trip de champs inconnus/version/statut, contrôle des collisions et sécurité des clés JSON ; aucun DTO joueur, aucun malus chiffré de flûte.
5. README d'interfaces et tests unitaires Node sur fichiers réels ; preuve brutes et SHA des blobs dans dossier.

## Verdicts
- **VALIDÉ localement** : schémas, bounds, refus d'attaque d'autorisation, absence d'auto-attribution, correction et idempotence, snapshot privé et round-trip des champs inconnus, références source/instance, suite Node.
- **RÉSERVÉ** : montant XP sous moteur réel M01, suggestions majeur/légendaire et validation MJ, libre attribution, cas 21–25 ; chaîne non liée aux adaptateurs d'instances de STUDIO/ATELIERS.
- **BLOQUÉ** : application numérique d'une flûte, effet chiffré d'objet, M03 absorption, toute conversion narration → mécanique, tout gain XP par le catalogue.
- **NON EXÉCUTÉ localement** : test TypeScript officiel avec esbuild, npm test global, intégration navigateur, CI au SHA final, test humain.

## Décisions attendues de DG
- Accepter la frontière **suggestion ≠ attribution ≠ niveau** et la policy de correction immutable ; éligibilité one-shot à préciser par MATH.
- Valider la compatibilité des interfaces descriptives avec ATELIERS/STUDIO et provenance/rollback avec ARCHIVES.
- Laisser les nouveaux champs numériques, l'attribution, les règles non homologuées et la fenêtre joueur désactivés jusqu'aux recettages sur base intégrée.

**Passations prêtes pour** MATH, ATELIERS, STUDIO, INTÉGRATION, ARCHIVES et QA ; non réputées lues ou validées par les destinataires. **Aucun merge, Pages, canon, formule, ou branche propriétaire historique modifiés.**

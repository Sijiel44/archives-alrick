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

---

## R2 — Réparation DG-LOT-004 du 05/11/2026

**Motif P0-B** : [Chrome CI #42028928740](https://github.com/Sijiel44/archives-alrick/actions/runs/42028928740) a constaté que l'ID ARCHIVES `pj:l004-hero-fiction` était rejeté par `createXpSuggestion`; l'erreur de construction se dégradait en `JSON privé invalide: Valeur non JSON`. Le défaut était réel, et est corrigé dans cette branche propriétaire #97 sans mutation des branches #95/#99/#85.

**Contrat MATH examiné** : [#99@e3fcbce49074bfcbe8814842a5ad57d0ba76160d](https://github.com/Sijiel44/archives-alrick/pull/99) (`previewEncounterXp`, `recordEncounterXpChoice`) et [passation 6662346332](https://github.com/Sijiel44/archives-alrick/issues/93#issuecomment-6662346332) ; directive XP enrichie [6659005380](https://github.com/Sijiel44/archives-alrick/issues/93#issuecomment-6659005380).

**VALIDÉ au niveau propriétaire INDEX (Node 22, ESM réels)** : ID typés `pj:...` inchangés, code/path/message structurés, dérivation déterministe SHA-256 complet, tuple brut conservé et collision intersources refusée, idempotence v1/v2 sans alias, collisions de sources et doublon boss/quête, révisions immuables, participants PJ/PNJ, PNJ N20, aide attestée, menace N1–25 et indice M01 1–12 distincts, source native MATH JSON canonique, fragments de port sans permission ni ledger, lien inerte à un reçu MATH, non-application, snapshots privés L004-C préservés. **114/114 tests** (64 précédents inchangés + 46 nouveaux).

**RÉSERVÉ** : nouveaux seuils d'IDs côté MATH/ARCHIVES (identifiant typé ≤40 accepté, plus long refusé sans alias), barèmes expérimentaux de difficulté de MATH #99 **non adoptés**, source d'approbation MJ externe, répartition globale/individuelle et journal append-only sous MATH, non-recette de l'assemblage.

**NON EXÉCUTÉ ici** : suite TS `native-m01.test.mjs` (tentative échouée faute de paquet `esbuild` et checkout complet), `npm ci`, `npm test`, 63 tests TS MATH #99, run Chrome de la PR intégrée après correction, CI sur le HEAD propriétaire. La preuve négative d'environnement est enregistrée, pas convertie en PASS.

**À 05 INTÉGRATION** : copier par blob uniquement les chemins INDEX de cette PR, puis relancer la recette de Chrome sur HEAD composite final, et vérifier les conditions de sortie P0-B enrichies. **À 02 QA** : contre-épreuves des 50 nouveaux tests et de l'absence de mutation. **À 10 MATH** : confirmer l'identité canonique `eventId`, sémantique des montants MJ, sources de journaux et limites 40 caractères. **À DG** : arbitrer les barèmes modèles A/B, jamais adoptés par INDEX.

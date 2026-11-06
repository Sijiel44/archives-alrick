# FICHE DIRECTION — INDEX / DATA-MODEL-001 P1-A + CORE-COMPAT-001

**Date 2026-11-06** · **Responsable 11 INDEX** · **Statut : proposition structurée et testée localement, NON homologuée** · **Priorité : P1 conception parallèle au P0 #95, jamais dépendance qui bloque P0**.

## Livré

- Schéma `cer.index.data-model.p1a.proposal.v0` (Draft 2020-12) et validateur/factories/ports expérimentaux ESM sans dépendance ; séparation explicite définition / instance / variante / version / provenance / statut travail / canon-proposition-fait joué / mécanique déclarée / texte / zone MJ / médias.
- **11 fiches exclusivement fictives :** PJ N1/10/25, créature N10 + variante N15, PNJ sans chiffres, objet sans malus, capacité narrative, sort de démo référencé, rite fictif non résolu et scène liée à cinq participants.
- Table exhaustive de **11 comparaisons** avec fiches historiques réellement lues, classées repris/adaptables/obsolètes/inconnus, ancrées par blobs Git. Aucune source historique migrée ni traitée comme canon par défaut.
- Import/export JSON LAB en mémoire, conservation de provenance/version/extensions; adaptateurs Markdown et JSON natif **proposés** sans importer automatiquement des anciens fichiers et sans authentifier un état éditorial ; zone privée + candidat public whitelist sans émission.
- Matrice CORE-COMPAT des modules M01–M05, Bestiaire, Grimoire, rites, INDEX, XP MATH, ARCHIVES, ATELIERS, STUDIO ; ports délégués, sans nouvel algorithme XP/5d6.
- **Preuves locales :** 58/58 tests Node22 ESM, 11/11 fixtures validées par JSON Schema ; journaux, manifest SHA et commandes. Tests natifs TS/CI/Chrome explicitement NON exécutés ici.

## Verdicts

- **VALIDÉ POUR ÉTUDE :** provenance, frontières de sécurité, identités natives à `:`, variantes, retour JSON sémantique, gestion d'inconnus privés, garde-fous contre canon/XP/effets automatiques, candidats publics minimaux.
- **RÉSERVÉ :** versionnage éditorial indépendant des commits, preuve externe du canon/fait joué, médiathèque et licences, byte-roundtrip ARCHIVES, authentification d'autorités MATH, protection navigateur, compatibilité de copie d'instance et journal XP.
- **BLOQUÉ :** toute migration massive, publication, conversion de texte en règle, `approved:true`, crédit XP, débits, mécanique numérique d'objet, M03 absorption non homologuée, niveau 25+ non validé.
- **NON EXÉCUTÉ :** npm ci/test complet, exécution native TS M01, CI composite, Chrome/local MJ-joueur, revue inter-référents, validation humaine, récupération des archives brutes historiques.

## Arbitrages DG

1. Confirmer **enveloppe mince + données typées propres aux moteurs**, sans standardiser prématurément chaque détail de fiche ancienne.
2. Nommer une autorité de signature et révocation des preuves `canon-reference`/`played`, indépendante du statut d'édition et des booléens des anciennes fiches.
3. Valider avec 04 ARCHIVES format des sauvegardes locales, octets d'origine, hash, provenance, versions, restauration et stratégie pour champs inconnus ; INTERDIRE tout snapshot privé vers la fenêtre joueur.
4. Valider avec 21 ATELIERS les gestes de création/variante et avec 01 BUILDER les ports natifs sans couplage DOM/stockage ; tests P1 puis prototype intégré seulement sur branche dédiée.
5. Orchestrer 10 MATH pour les invariants M01/M03/XP sans adopter hypothèses MATH-002 ; QA pour fail-closed et media rights ; aucune promotion canonique implicite.

## SHA de bases et sources

- M01 code `88f774f3d0d6d520d8d11443b72202b9caf4f94b` ; blobs M01 progression `d2040829ea0da7c0f6eae08dc8c701226bfc53c5`, probabilités `bfee984fad47902623f7117e9f024a5b6e042d2d`.
- DG003 Studio/ARCHIVES `2ab809ef5351940e0fc272b859d10f21de894d00` ; INDEX R2 `d071842639d0adc952dedf3e279c6a1b7004855c` ; MATH XP R2 étudié `e3fcbce49074bfcbe8814842a5ad57d0ba76160d` ; ATELIERS `093d2504c7633baff6124ad7986224124946f6ce`.
- Table complète des chemins/blob/ref dans `fixtures/CORE_SOURCE_SHA.json`. Les statuts de ces branches peuvent évoluer : épingler le SHA du prototype à l'intégration.

**Passations préparées, pas présumées lues ou approuvées par les autres chats.** 05 reste seul propriétaire de la PR intégrée #95 et de sa CI de reprise.

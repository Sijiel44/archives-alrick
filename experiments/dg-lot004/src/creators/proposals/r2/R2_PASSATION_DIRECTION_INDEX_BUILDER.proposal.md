# Passation 21 ATELIERS — DG-PLAN-REPRISE-002 / R2
**6 novembre 2026 · P1 DATA-MODEL-001.R2 + UX-STUDIO-001.R2 · avant arbitrage**

## Livrables R2
- `DATA_MODEL_001_R2_CROSSWALK.proposal.md` : tableau réel #102 (14 fiches) ↔ #105 (INDEX 11 objets/source) ↔ #104 (12 familles de stockage) ; écarts identité, version, provenance, privacité, média, 3 couches éditoriales, extensions et sources inconnues.
- `DATA_MODEL_R2_BRIDGE.proposal.mjs` : projection **fictive privée et réversible** des enregistrements #102 en enveloppe #105 ; validation obligatoire par les **vrais ports INDEX injectés** ; aucune capacité/XP/canon attribuée.
- `DATA_MODEL_R2_COMPOSITE.proposal.test.mjs` : huit tests Node sur checkout **composite** #102 + #105 + #104. Deux derniers exigent vrai SHA-256 d'archive #104.
- `DATA_MODEL_R2_JSON_SCHEMA_COMPOSITE.proposal.py` : Draft2020-12 de chacun des **deux schémas** + 14 anciens et 14 adaptés, avec `jsonschema` et Node; **à exécuter sur composite**.
- `UX_STUDIO_001_R2_RECONCILIATION.proposal.md` : rapprochement de #101/#102/#104 : cockpit unique, 7 zones, checkpoints 11/15 gestes, contrats, erreurs/reprise, privé/public, A/B/C, clavier/tablette et divergence palettes.

## Preuves R2 exécutées
**Sur les vrais blobs GitHub P1** injectés dans V8 (non Node/Chromium/CI) :
1. Module `validateModelRecord` + `validateModelDataset` INDEX #105 : **14/14 adaptations acceptées** ; huit familles, PJ N1/10/25, identités définition→variante→instance conformes à l'index proposé et lien source conservé.
2. `exportPrivateDataset` → `importPrivateDataset` INDEX : **14 originaux #102 récupérés à l'identique au niveau JSON**, y compris champs inconnus, versions natives, droits médias et notes privées ; canari absent de la vue publique.
3. `initialCampaign` et `assertCampaign` ARCHIVES #104 : **14 enregistrements présents dans `creatorDrafts`** d'une **campagne initiale fictive**, puis restitution JSON exacte après sérialisation. `applyCommand` refuse `add-creator-draft` : contrat mutation/transaction **manquant**.
4. Module des tests Node R2 en V8 : **6/6 scénarios d'objet et de persistance JSON PASS** ; 2 scénarios d'archive SHA natif non exécutés car indisponibles dans cet isolat.
5. Évaluation indépendante des mots-clefs d'assertion utilisés dans les deux JSON Schemas (types, regex, propriétés, refs, composition, conditions) : **14/14 #102 et 14/14 #105 acceptés**, et deux exemples `auto-canon` refusés. **Ce contrôle JS n'est pas le validateur Python Draft2020-12 normatif.**
6. Contrastes calculés, sans navigateur : palette #101/#102 ivoire-ardoise **14,26:1**, sombre-cuivre **8,45:1** ; palette #104 ivoire-ardoise **15,58:1**, sombre-cuivre **6,46:1**. Ne valide ni focus/hover/disabled ni conformité WCAG globale.

**Preuves tierces à ne pas confondre** : INDEX #105 documente de son côté **58/58 tests Node**, et contrôle JSON Schema Python de ses **11 fixtures**, mais ce n'est pas une recette de nos **14 fiches adaptées** ni de l'import ARCHIVES.

## Limites fermes
- Les branches #102, #104 et #105 ne sont pas fusionnées : **aucun test Node cross-PR natif, Python `jsonschema`, véritable IndexedDB, export/import SHA cryptographique ou Chrome sur HEAD composite n'a été exécuté ici**. Les scripts livrés permettent de réaliser ces contrôles dès que 05/QA disposent d'un checkout composite.
- L'adaptateur n'utilise pas la création d'événement ARCHIVES : il pré-charge les `creatorDrafts` d'une campagne initiale de test. **Aucune preuve de mutation atomique d'une campagne existante**, concurrence de deux onglets, import historique réel ou durabilité post-crash.
- `INDEX.state.layer` ne couvre pas à lui seul canon + publication + fait joué ; les 3 états #102 sont conservés dans `state.r2EditorialTruth` et l'original privé, **sans promotion** de statut.
- `INDEX` encode la variante comme un `record` distinct, mais l'instance issue de variante #102 n'a pas encore de lien variant natif homologué : référence conservée dans `data.r2OriginalDefinitionRef` ; le choix appartient à 11 INDEX.
- Les anciennes sources n'ont pas toutes été authentifiées. Droit média inconnu → `pending`, sans diffusion. Les moteurs et contrats Grimoire/rites restent seulement référencés.
- Un aller-retour JSON exact ne signifie pas conservation d'octets DOCX/Markdown. ARCHIVES doit fournir ses empreintes et reçus, éventuellement import de fichiers originaux binaires, hors de cette P1.
- **Aucun changement #95, #100, de moteurs, du site, de Quartz ou des données jouées ; aucune interface finale, migration, canonisation, publication ni merge.**

## Actions demandées par propriétaire
| Pour | Actions attendues | Bloqueur |
|---|---|---|
| **11 INDEX (responsable)** | Trancher le `EntityRef` léger, ID/sources/versions, variante→instance, droits d'extension, mécanique native; revoir la copie privée `originalAteliersRecord` ; rejeter la conversion canon/joué/publication en une seule couche | Sans ce contrat, ne pas mettre la projection en production |
| **04 ARCHIVES** | Définir un vrai événement versionné/idempotent pour nouveaux `CreatorDraft`, révision atomique, archivage des octets originaux et références MediaAsset; exécuter l'import/export sur #104 avec deux onglets, refus collision | Sans commande, aucun import de fiches dans une campagne existante |
| **01 BUILDER** | Arbitrer un seul cockpit web mode guidé/expert, 7 zones et checklist 11/15; contrat de navigation, décision de comparaison A/B/C, tokens et tests responsives | A/B/C non arbitré, #104 est banc isolé |
| **20 STUDIO** | Valider gestures↔ports, participant ID, notes privées, CLEAR, player whitelist et gestes de récupération; simuler novices/expert clavier/tablette | Aucun DTO complet transmis au joueur |
| **02 QA / 03 REVUE / DG** | Exécuter les deux scripts composite au même HEAD ancré, Python Draft2020-12, SHA, Chrome/CI, collisions et provenance, contre-audit identité/canon | Aucune homologation avant preuves réelles |
| **05 INTÉGRATION** | P0 #95 d'abord ; si candidat P1 autorisé, assembler séparément #102/#104/#105, citer HEADs/blobs et ne pas modifier les branches propriétaires | Aucun transfert implicite vers P0 |

**Statut demandé : RECEVABLE COMME CONTRE-PROPOSITION R2 ET TESTS CIBLÉS PRÉPARÉS, PAS CONTRAT COMMUN HOMOLOGUÉ.**

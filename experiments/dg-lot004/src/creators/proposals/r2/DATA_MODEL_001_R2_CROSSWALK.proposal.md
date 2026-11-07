# DATA-MODEL-001.R2 — Correspondance #102 ↔ #105 ↔ #104
**21 ATELIERS → 11 INDEX (propriétaire du contrat) / 04 ARCHIVES · 6 novembre 2026 · PROPOSITION P1, NON HOMOLOGUÉE**

## 1. Chaîne de preuves et frontières
- ATELIERS #102@`85f473d2005903a6fc81d37a83fcc6b3c6d16466`: schéma `c1226bc88f89a2749979bc31e8168f5bcf68b857` (`cer.p1.data-model.record.proposal.v0`), 14 fixtures *existantes* blob `577ffaf0fecefb553db3feecf218a8d5bd936382` ; **aucune fixture recréée**.
- INDEX #105@`4f3dffd51f16c0c1881f925a94a677a87feff17c`: schéma `157ab2462c605bbccb7ed3c1832bdad0faaa1434` (`cer.index.data-model.p1a.proposal.v0`), validateur `042e603a19a6c809b782e87c207eb8eecf8cbfdd`, fixtures `0693198e7703ab89cc77cdeb9aad4beb9ce7e222`, adapters `e5369816be2bf62fa3e029773ce25803b7d61318` ; **INDEX est responsable du contrat commun**, pas ATELIERS.
- ARCHIVES / BUILDER #104@`f84f8c54361b3701ebb0251700f2d0d09d4acf4d`: `contracts.mjs` blob `5e59f024efb4cc578af71fbe6bacdec984075148`, `idb-store.mjs` blob `967ebc052a448ff54c3806379160e73117afaf11`, `private-archive.mjs` blob `07f842ebcb6e2d0a5e2b7264d5a6c284d187c3d8`. Campagne `cer.arch-storage001.campaign.proposal.v0`, magasin transactionnel `campaigns+events`, export privé `cer.arch-storage001.private-export.proposal.v0`. Banc P1 uniquement.
- STUDIO #101@`3499004dd47d706b06d2dc3e2f5b670df3f60220` et ATELIERS #102 pour UX (voir dossier R2 séparé).
- Aucun changement P0 #95/#100, aucun moteur M01–M05, Grimoire, canon, historique ou publication.

## 2. Matrice champ/contrat — comparaison explicite
| Enjeu | #102 ATELIERS | #105 INDEX | #104 ARCHIVES | Adaptation R2 / arbitrage |
|---|---|---|---|---|
| Enveloppe | `schema=cer.p1...` ; `recordId`, `recordVersion` | `schema=cer.index...`, `recordId`, `version`, `revision`, `recordKind` | `campaign.schema=cer.arch-storage001...`; campagne révisionnée | Deux schémas **distincts** ; pas de renommage in situ. Enveloppe INDEX candidate de lecture ; brut #102 privé intact |
| Familles | `pj,creature,npc,item,capability,spell,ritual,scene` | `pj,creature,npc,item,ability,spell-ref,ritual-ref,scene` | `Character,CampaignInstance,CreatorDraft,Scene,MediaAsset,...` | `capability→ability`, `spell→spell-ref`, `ritual→ritual-ref` ; la famille ARCHIVES reflète **la destination**, pas une conversion de règles |
| Identités | `nodeType` définition/variante/instance ; `definitionRef`, `baseDefinitionRef` | `identity.definitionId/definitionVersion/instanceId/variantId/campaignId`, `data.variantOf` | `id` propre d'acteur/copie, `catalogRefId`, `campaignId` implicite | Définition et variante séparées dans #102 ; INDEX représente variant dans une **fiche** avec `variantId`. Variante de créature ↔ base `data.variantOf`; instance issue de variante conserve `r2OriginalDefinitionRef` privé dans `data`, **pas d'instance mutante inventée** |
| Versions | `recordVersion` SemVer P1 ; source `provenance.sourceVersion` string/int | `version` SemVer + `identity.definitionVersion` SemVer ; `provenance.sourceVersion` ouverte | `campaign.revision` entière, `eventId/expectedRevision` | SemVer d'enveloppe ≠ version natif Grimoire/rite ; `recordVersion→version`, révision d'instance, source native intacte dans `privacy.originalAteliersRecord` |
| Origine | `originKind` native/legacy/campaign/proposal + SHA facultatif | `origin` synthetic/native-reference/historical-reference ; pour native/historique SHA commit + blob obligatoires | `source` original, hash archive et journal événementiel | Fixtures #102 sont **synthetic** uniquement ; en production pas de provenance native sans commit/blob authentifiés par 04 |
| Vérité éditoriale | `continuity.referenceStatus` canon/proposition ; `playedStatus`, `publicationStatus` indépendants | `state.lifecycle` draft/in-review/archived et `state.layer` proposal/played/canon-reference ; `attestation` externe | Pas d'arbitre de canon/édition, conserve snapshots et sources | **Niveau d'information différent** : ne JAMAIS condenser publication et joué dans `layer` ; proposer `state.layer=proposal`, attestation `unverified`, trois états originaux privés. DG/LORE décident publication et certification |
| Mécanique | `mechanics.mode` none/pending/native-reference ; `engine/nativeId` proposés | `mechanics.status` not-evaluated/native-reference/blocked/not-applicable + `validationStatus`, blob natif requis | Source mécanique référencée, aucune règle dans le magasin | Nos références synthétiques ne portent aucun blob attesté : mapper `pending→blocked` et les autres `not-evaluated` (jamais `reported-validated`), original conservé pour futur port MATH/INDEX |
| Narration | `narrative.title/publicDescription/tags/locale` | `narrative.name/summary` | `title/publicDescription` sur scène, `label` acteurs | Proposer title→name, description→summary; tags/locale privés dans source intacte ; pas d'injection HTML |
| Privé | `privacy.gmOnly`, `visibility`, `publicFields` whitelist | `privacy.visibility='mj-private'`, `notes`, `legacyOriginal` libre | `privateNotes` isolées, export confidentiel, DTO public sommaire | Conserver tous les champs et extensions dans `privacy.originalAteliersRecord`; jamais faire de cette copie un DTO joueur |
| Médias/droits | `mediaId,rights:cleared/restricted/unknown,audience,alt,credit,sourceRef,sha256` | `assetId,rights:pending/confirmed,visibility` | `mediaAssets` + archive privée et choix de stockage | **Ne pas considérer cleared ≡ confirmed** sans pièce de droits : mapping fail-closed vers `pending/mj-private` ; source, crédit et alt demeurent dans l'original, pas de diffusion |
| Extensions/inconnus | `legacy.unknownFields`, `extensions`, `sourceSnapshots` conceptuels | `data` ouvert, `privacy.legacyOriginal` | `extensions.unknownFuture`, `creatorDrafts` ; refus de pollutions JSON | La **copie privée complète** rend les inconnus récupérables au roundtrip JSON ; futurs champs restent inertes, jamais appliqués |
| Acteurs/scènes | `scene.links` participants `targetId`, `state.current.participantIds` | `scene.data.participants=[{recordId,instanceId,role}]`, vérification identité/campagne | `scenes[].participantIds`, instances de campagne | Adaptation avec lookup des instances réelles de **même campagne**, pas seulement comparaison de labels |
| Import/export | Proposition preview/commit, archive brute et conflits | `exportPrivateDataset / importPrivateDataset` JSON en mémoire | `makePrivateArchive / inspectPrivateArchive` SHA-256 et journal ; `openStore.createCampaign/applyEvent/exportPrivate/previewImport/commitImport` IndexedDB | Index JSON export ≠ persistance ARCHIVES ; aucun `add-creator-draft` dans `applyCommand` #104 ; attendre événement dédié avant toute migration. Le test R2 prépare **uniquement** une campagne fictive initiale avec `creatorDrafts` |

## 3. Contrat léger commun à arbitrer (pas de fusion hâtive)
Un *sommet référencé* commun, **pas un nouveau format d'exécution** :

```text
EntityRef = { recordId, schema, recordVersion,
              identity:{definitionId,definitionVersion,instanceId?,variantId?,campaignId?},
              provenance:{sourceId,sourceSchema,sourceVersion?,commit?,blob?},
              audience:'mj-private'|'public-candidate',
              mechanicRef?:{status:'not-evaluated'|'blocked'|'native-reference',
                             engineId?,sourceBlob?},
              sourceOriginalRef, sourceFidelity:'exact'|'adapted'|'unknown' }
```

- **INDEX** choisit le dictionnaire de famille et le format de référence officiel (`capability` versus `ability`, les suffixes `-ref`, ID stable).
- **ARCHIVES** choisit la transaction, la propriété et l'empreinte de l'original, les droits d'extension ainsi que l'événement `add-creator-draft` ou équivalent ; un DTO d'archive n'est pas un état de moteur.
- **LORE/DG** donnent les attestations et gouvernent séparément canon, publication et joué ; INDEX ne crée pas cette preuve.
- **ATELIERS** n'affiche et ne transforme que des données sourcées, sans écrire la mécanique officielle ; les actions MJ requièrent ports explicites.
- **STUDIO** construit le DTO joueur à liste blanche et CLEAR; ne jamais exporter `privacy.originalAteliersRecord` vers le joueur.

## 4. Vérification réelle effectuée et portée
Le module `DATA_MODEL_R2_BRIDGE.proposal.mjs` transforme en mémoire les **14 fixtures originales** de #102 vers le validateur `validateModelRecord/validateModelDataset` de #105. À l'exécution V8 sur les vrais blobs :
1. **14/14 acceptées par INDEX #105**; huit familles; trois PJ niveaux 1, 10, 25 ; définition → variante → instance reliée sans collision;
2. `exportPrivateDataset` → `importPrivateDataset` → `recoverR2Originals` renvoie le **même JSON exact** des 14 fiches, y compris `legacy.unknownFields`, privés, droits d'image, canon non attesté;
3. `seedR2ProposalOnInitialCampaign(initialCampaign(#104))` → `assertCampaign(#104)` → sérialisation JSON → `recoverR2FromArchiveCampaign` conserve les mêmes 14 originaux et `extensions.unknownFuture`. **Ce n'est pas un commit IndexedDB** ;
4. `statusPublicOnly`/aperçu R2 ne donnent pas le canari privé ;
5. #104 `applyCommand` possède uniquement `add-character/copy-creature/add-scene/add-private-note`. `add-creator-draft` est absent : **un stockage après création et une migration P1 ne sont pas prouvés**. Ne pas détourner `copy-creature` pour contourner.

Le test Node `DATA_MODEL_R2_COMPOSITE.proposal.test.mjs` couvre également l'export binaire SHA-256 de #104 et l'import privé avec rejet de falsification, **mais exige un checkout composite réel**. Le test Python `DATA_MODEL_R2_JSON_SCHEMA_COMPOSITE.proposal.py` vérifie les **deux vrais schémas Draft2020-12** et 14 fixtures R2 à l'aide de `jsonschema`, avec deux cas négatifs. Ces deux tests **ne sont pas revendiqués exécutés ici**, car les branches #102/#104/#105 ne sont pas combinées sur le même checkout. INDEX #105 a rapporté de son côté une validation Python 11/11 et 58/58 tests Node ; ce chiffre appartient à sa PR, pas à nos 14 adaptations.

## 5. Limites et alertes techniques
- **L001 / import :** l'empreinte JSON égale n'est pas une preuve d'octets originaux DOCX/MD. Les blobs historiques absents ne sont ni authentifiés ni migrés.
- **Schémas :** la validation `validateModelDataset` INDEX est réelle, mais ne remplace pas un passage normatif des deux JSON Schemas du composite. La proposition conserve plusieurs champs supplémentaires dans la partie privée pour éviter les pertes de source : **ne pas déclarer la structure INDEX canonique**.
- **Absence de commande ARCHIVES :** `createCampaign` accepte une campagne de départ fictive avec `creatorDrafts`, mais `applyEvent` ne sait pas enregistrer de nouvelle fiche dans un projet existant.
- **Mutation/rollback :** le banc #104 indique une transaction `campaigns+events` et un SHA-256 archive, mais nous n'avons exécuté ni IndexedDB réel ni reprise `ack-lost` sur notre suite cross-PR. Pas de PASS après panne/2 onglets.
- **Attestation :** une source originale marquée canon dans #102 demeure seulement `proposal/unverified` dans #105 ; aucune propagation sans preuve externe DG/LORE.
- **Identités :** la variante `var:creature:...` est une fiche dans #105, mais une instance issue de variante #102 n'y est pas encore typée comme lien variant natif : elle conserve la référence originale en `data.r2OriginalDefinitionRef`. **Arbitrage INDEX requis**.
- **Médias :** les droits `cleared` #102 restent `pending` #105 (conservateur), car aucune preuve de licence n'a été vérifiée.
- **Taille et origine :** jeu INDEX 100 fiches / 512 Ko, archive #104 2 Mio ; conserver limite la plus stricte et ne jamais stocker une grosse galerie/image binaire dans `creatorDrafts`.
- **P0 :** ni `pendingStudioOp` ni le helper STUDIO ni la PR #95 n'ont été changés par ces propositions.

## 6. Arbitrages à 11 INDEX / 04 ARCHIVES / DG
| Code | Responsable | Décision nécessaire |
|---|---|---|
| R2-ID | 11 INDEX | Relation définition / variante / instance dans la même identité, avec ID natif immuable ; `data.variantOf` vs `definitionRef` |
| R2-VERS | 11 INDEX + 04 | SemVer enveloppe vs types natifs Grimoire/rites et références SHA |
| R2-STATE | DG + LORE + 11 | Trois vérités (canon, publication, fait joué) en attestations séparées, `layer` non suffisant |
| R2-PRIV | 20 + 04 + 11 | Où garder les originaux privés, secrets, extensions et whitelist publique ; canaris de test |
| R2-MEDIA | 04 + DG | Catalogue MediaAsset, crédit/alt/rights et preuve avant statut `confirmed` |
| R2-EVENT | 04 ARCHIVES | Événement idempotent d'ajout de fiche et rollback de transaction, contrôle `expectedRevision`, export/import exact |
| R2-MATH | 10 MATH + 11 | Port mécanique officiel et versions natives ; aucun `approved:true` par atelier |
| R2-MIGRATE | DG/QA | Périmètre d'une importation pilote, aucune migration massive, aucun canon automatique |

**Statut : contribution R2 vérifiable, non homologuée. L'adaptation conserve le modèle #102; le contrat final est propriété de 11 INDEX et la persistance de 04 ARCHIVES.**

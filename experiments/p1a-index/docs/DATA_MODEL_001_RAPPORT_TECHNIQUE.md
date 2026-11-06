# 11 🔗 INDEX — DATA-MODEL-001 (P1-A) — rapport de conception et prototype de contrat

**Date :** 2026-11-06. **Statut :** PROPOSITION STRUCTURELLE TESTÉE LOCALEMENT, non homologuée, non canonique. **Aucun correctif de production, aucune migration massive.** Les seules données d'essai sont fictives.

## 1. Décision d'architecture proposée

Une **enveloppe versionnée unique**, mais *pas* une fiche universelle monolithique. Les modules de jeu gardent leurs schémas et propriétaires. Schéma labo : `cer.index.data-model.p1a.proposal.v0`, définition SemVer propre, révision d'instance distincte du statut éditorial et des versions de sources. Classes acceptées : `pj`, `creature`, `npc`, `item`, `ability`, `spell-ref`, `ritual-ref`, `scene`. Les objets non encore importables sont **des références documentaires**, pas des conversions automatiques.

Séparation volontaire :

| Dimension | Champ / sens | Règle d'autorité |
|---|---|---|
| Fiche/lignée | `recordId`, `version` (SemVer), `revision` (édition locale) | INDEX ; identité stable d'un dossier, sans renommer automatiquement les sources |
| Définition | `identity.definitionId` + `definitionVersion` | Catalogue explicite : un type peut avoir N versions |
| Copie de campagne | `identity.instanceId` + `campaignId` | ARCHIVES/STUDIO ; opaque, accepte `pj:l004-hero-fiction`, jamais normalisé |
| Variante | `identity.variantId` et référence `data.variantOf` | Un même `definitionId` pour base + variante ; copy-on-write, non destructive |
| Provenance | `provenance.origin/sourceSchema/sourceId/sourceVersion/sourceCommit/sourceBlob/sourcePath` | SHA source et SHA commit indépendants ; documents anciens jamais transformés en canon |
| Avancement | `state.lifecycle = draft/in-review/archived` | État de travail de la fiche, indépendant du lore |
| Plan de réalité | `state.layer = proposal/played/canon-reference` + `attestation` | `played`/`canon-reference` exigent des preuves EXTERNES ; validation de forme ≠ authentification du canon |
| Mécanique | `mechanics.status = not-evaluated/native-reference/blocked/not-applicable` + `validationStatus` | `reported-validated` = **mention importée non authentifiée**, jamais un `AuthorizedM03Effect` |
| Narration | `narrative.name/summary` + extensions | Texte, jamais conversion automatique en malus/bonus, PV, mana, XP |
| Privé | `privacy.visibility = mj-private`, `notes`, `legacyOriginal` ou `originalSource` | Hors DTO joueur, hors index public ; JSON sans comportement exécutable |
| Médias | `media[].assetId/rights/visibility` | Aucun lien publié sans preuve de droits confirmée et publication explicitement autorisée |
| Contenu propre au type | `data` JSON, non interprété ; champs inconnus maintenus | Les nombres déclarés N1/10/25 ne deviennent pas des builds M01 validés |

Le **schéma JSON Draft 2020-12** documente la forme ; le module `src/data-model.mjs` impose des garde-fous supplémentaires (collisions, autorités, participants, portée des IDs, source SHA). Aucune validation via JSON Schema ne doit être traitée comme une approbation canonique ou une application de règles.

## 2. Ensemble fictif, contrôlé

**11 fiches, toutes `state.layer=proposal` / `attestation.status=unverified`:** trois PJ N1/10/25 ; créature N10, variante N15 (même définition, instances différentes) ; PNJ narratif sans niveau ; flûte purement narrative et média fictif non autorisé ; capacité descriptive ; sort de démonstration référencé sans lancer ; rite fictif référencé sans résolution ; scène locale et cinq participants précisément reliés. **Ni Autorités, ni effets numériques, ni vrai canari MJ, ni personnages existants.**

La scène n'est pas déclarée jouée ; la créature n'est pas une espèce enregistrée ; le niveau initial d'un PJ n'est ni un budget M01 distribué ni une promotion. `Spell.demo-lueur-guide` est la référence à un objet d'essai Grimoire, **non** un sort canonique. Le rite reste un identifiant fictif non résolu. `media[].rights=pending` interdit l'exposition publique.

## 3. Adaptateurs non destructifs proposés

- `proposeHistoricalReference(input)` : accepte des métadonnées Markdown **déjà extraites**, la source intégrale brute et ses SHA (commit et blob). Il n'invente aucun analyseur YAML et ne se prononce pas sur un `canon_statut` historique. Sa sortie est toujours `layer=proposal`; la fiche et ses champs inconnus restent dans `privacy.originalSource` ; l'usage de `publish:true` ne lance aucune publication.
- `proposeNativeReference(input)` : stocke la source JSON brute dans `privacy.nativeOriginal`, conserve ID, version, statut et extensions, et épingle le module+blob. Les indications `approvedByGM` *dans l'original brut* restent archivées, **jamais interprétées comme une approbation de cette adaptation**.
- `validateModelDataset(records)` : refuse collision `recordId`, collision d'instance au sein d'une même campagne, participant inconnu ou de rôle divergent. Les variantes n'écrasent pas leurs définitions.
- `exportPrivateDataset(records)` / `importPrivateDataset(json)` : import/export **JSON privé du laboratoire** et vérification de l'aller-retour des valeurs, versions et champs inconnus. **Ce n'est pas** le contrat officiel de sauvegarde ARCHIVES : pas de signature, pas de preuve SHA du fichier initial, pas de transaction localStorage/IndexedDB, pas d'authentification du donneur d'ordre. Conserver les octets d'origine exige ARCHIVES `Uint8Array` + SHA256 ; ne pas prétendre qu'un JSON sérialisé récupère les espaces ou le BOM initial.
- `makeSelectedPlayerCandidate(record,{selected:true})` : réduit à un candidat strictement whitelisté (label/résumé/médias publiables), **mais ne le transmet pas**. Seul STUDIO décide ensuite de l'envoi sur les origines locales autorisées et de la liste blanche finale.

**Sécurité** : clones JSON bornés, pas de getters/fonctions/prototypes hostiles/cycles, pas de clés magiques, pas de `approved:true`, `autoApply:true`, `creditXp` dans une nouvelle définition. Les champs anciens qui contiennent ces mots sont conservés uniquement comme *données privées* hors exécution.

## 4. Comparaison avec les fiches historiques

Consulter `HISTORICAL_FIELD_MAPPING.md` : **une correspondance pour chacune des onze fiches fictives**, regroupée par types ; les classifications sont `repris`, `adaptable`, `obsolète pour le nouveau modèle`, `inconnu/non déduit`. Références vraies : templates `modeles/personnage.md`, `modeles/objet.md`, `modeles/magie.md`, `modeles/evenement.md`, `modeles/creature-profil-5d6.md` ; sources choisies `PER-CB2-ORIN`, fiche proposée du cerf, `OBJ-CB31-CLE-HEIMDALL`, `MAG-106`, aventure pilote. Aucune de leurs identités ou histoires n'est copiée dans les 11 fiches synthétiques.

## 5. Essais et statuts de preuve

- **Exécuté ici** : `node --test tests/data-model.test.mjs tests/core-compat.test.mjs` → 58/58 après correction d'une assertion de prototype (`Object.create(null)`). Node 22.16.0, tests sur de vrais fichiers `.mjs`; sortie `logs/NODE22_TESTS.tap`.
- **Exécuté ici** : Python `jsonschema.Draft202012Validator.check_schema` → schéma correct ; **11/11** fixtures acceptées par le schéma Draft 2020-12, zéro erreur. Ce test ne remplace pas l'authentification des données.
- **Non exécuté ici** : `node --test tests/native-core-on-clone.test.mjs`, `npm ci`, `npm test` complet, CI de la PR propre, Chrome et round-trip natif ARCHIVES. Le conteneur n'a ni clone complet ni `esbuild`; `git ls-remote` retourne `Could not resolve host: github.com`. La suite native prévue consomme les vrais TS M01/probabilités via esbuild du dépôt, aucun second moteur. Les résultats Node24 P0 fournis par coordination n'ont pas été réexécutés pour P1.

## 6. Risques et décisions DG

| Niveau | Risque / question | Décision proposée |
|---|---|---|
| BLOQUANT | `canon-reference` / `played` ne peut être authentifié par simple JSON | 04 ARCHIVES + LORE/DG définissent attestation, chaîne des preuves et autorité avant promotion |
| BLOQUANT | M03 absorption et objets numériques non homologués | Rester `blocked`; pas d'effet automatique issu du récit |
| BLOQUANT | Protection du MJ lors de la nouvelle sauvegarde / vue joueur | ARCHIVES signe/valide snapshot et STUDIO whitelist ; QA navigateur sur SHA intégré |
| RÉSERVÉ | Modèle documentaire et modèle de jeu parfois éloignés, notamment bestiaire/PNJ | Adapter par références, jamais par coalescence silencieuse |
| RÉSERVÉ | Variantes et identités transversales : collision d'ID, version, instance | INDEX + ARCHIVES arbitrent clés stables et gestion de l'historique/snapshots |
| RÉSERVÉ | `reported-validated` n'est pas une preuve de calcul MATH | Port natif obligatoire ; reçu externe ; aucune validation mécanique par INDEX |
| RÉSERVÉ | Mise en scène/visuels, licences et droit de montrer | MEDIA/ATELIERS + DG définissent circuit d'usage et consentement |
| OUVERT | Gestion d'un même personnage en plusieurs campagnes, tables et one-shots | Clé `(campaignId,instanceId)` et snapshot individuel, coordination avec 04 |

**À valider par DG/créateur** : principe « enveloppe minimale + sous-contrats natifs » ; statut des variantes ; droits/attestations ; arbitrage stockage local durable/reconstruction partielle. **Ce rapport ne déclenche aucun canon, site ni import historique.**

# UX-STUDIO-001.R2 — Matrice gestes ↔ contrats, composants et frontières

**Propriétaire métier :** 20 STUDIO. **Statut :** conception P1 seulement ; toute interface/API nouvelle ci-dessous est **proposée** et ne doit pas être appelée depuis #95 tant qu'elle n'est pas homologuée.

## Légende de statut

- **E** : contrat existant dans les sources L003/L004 à réutiliser, indépendamment de sa qualification intégrée P0 (qui reste à 05/QA).
- **B** : capacité **démontrée seulement dans le banc B** IndexedDB de #104, sans promotion vers l'application.
- **P** : besoin/contrat proposé ; **aucune implémentation certifiée**.
- **X** : action expressément interdite sans autre autorisation.

## Matrice unifiée

| Phase | Geste observable | Donnée / responsabilité de vérité | Port ou composant ancré dans les sources | Statut | Résultat/erreur exigés pour UX R2 | Pilote |
|---|---|---|---|---|---|---|
| Reprendre | Choisir campagne locale / démonstration | ID, `schema`, espace MJ vs fictif | `mountStudio`, `mountStudioDemo`, `createDemoStorageArea` | E | N'adopter ni effacer une autre campagne ; indiquer l'espace local | 20 / 04 |
| Reprendre | Recharger dernière version **durable** | Snapshot privé et révision | `storage.load()` L003 ; `readCampaign()` #104 | E+B | Ne jamais confondre mémoire et durable ; signaler `unpersisted` | 04 |
| Reprendre | Reprendre scène active A après B | `activeSceneId`, `revision` | `setActiveScene(id): Promise<void>` L003 | E | Persistée après reload ; CLEAR et aucun SHOW automatique | 20 / 04 |
| Reprendre | Reprendre point de séance | `Session`/`playedEvent` (candidats), point de reprise | `Session` #102 et #104, non adopté | P | Afficher « séance P1 non disponible » plutôt qu'inventer une sauvegarde | 01 / 04 / 20 |
| Reprendre | Voir autre onglet modifier la campagne | `expectedRevision`, événements | `applyEvent` #104 renvoie `STALE_REVISION` | B | Conflit explicite ; recharge/export brouillon privé, pas last-write-wins | 04 / 01 |
| Reprendre | Relire un journal créateur interrompu | `pendingStudioOp` et campagne durable indépendante | #100 `inspectStudioRecovery()` ; #98 `inspectCreatorAttachment()` | E | Refus si manque preuve, snapshot discordant ou plusieurs candidats | 21 / 20 / 04 |
| Reprendre | Confirmer **même ID** après ACK perdu | ID d'instance confirmé, journal effacé durablement | #98 `confirmCreatorAttachmentWithEvidence()` ; #100 `reconcileStudioLink` | E | `durableVerified:true`, candidat unique, confirmation MJ et relecture finale | 20 / 21 |
| Préparer | Créer campagne / modèle fictif | `Campaign.id`, provenance, identité locale | `createCampaign` L003 ; `initialCampaign` #104 **banc** | E+B | Un nouvel ID, pas de collision ni import silencieux de données anciennes | 04 / 20 |
| Préparer | Prévisualiser PJ v2/v3 | Octets originaux, hash, feuille importée | ARCHIVES `previewCharacterImport` / STUDIO `previewCharacter` | E | Aperçu sans mutation, taille, identité, version et provenance visibles au MJ | 04 / 20 |
| Préparer | Accepter PJ et créer copie de campagne | Source immutable + ID PJ en campagne | `commitCharacterImport` / `acceptCharacter` | E | Pas de doublon lors d'une nouvelle soumission, collision refusée | 04 / 20 |
| Préparer | Choisir créature BEST puis variante | `CatalogReference`, `definition/variant`, provenance | `previewCreature` / `catalog.resolveCreature` / INDEX identité candidate | E+P | Source, profil, ruleset et version séparés ; pas de calcul numérique | 11 / 21 / 20 |
| Préparer | Copier une créature en campagne | `CampaignInstance.id`, `sourceRef` | `copyCreature` STUDIO, `bestiary.copyCreature` port | E | Afficher ID d'instance ; ne jamais modifier la définition | 20 / 04 |
| Préparer | Éditer objet/capacité descriptifs | `CreatorDraft` privé, statut de validation | `mountCreators` / #100 `createCreatorCycle`, `cycle-ui` | E | Prévisualiser / valider MJ ; pas d'effet ou XP non homologués | 21 / 11 |
| Préparer | Créer scène / associer participants | `Scene.id`, `participantIds` stables | `createScene`, `updateScene` STUDIO | E | Participants résolus par ID ; notes MJ distinctes de public | 20 |
| Préparer | Reprendre import de média | SHA, droits, crédits, `alt`, visibilité | `MediaAsset` #102/#104 **candidat** | P | Fallback texte si droits inconnus ou hors ligne ; refus partage | 21 / 04 |
| Jouer | Activer scène A ou B | `activeSceneId` privé | `setActiveScene`, `PLAYER_CLEAR` | E | Révoquer la sélection, pas de republication | 20 |
| Jouer | Voir participants du groupe | Liste `instanceId`, `characterId` | `Scene.participantIds` L003 ; `CampaignInstance` P1 | E+P | Distinguer PJ/PNJ/créature et droits de visibilité | 20 / 11 |
| Jouer | Ouvrir fenêtre joueur distincte | Origines 4173/4174, READY, canal | `openPlayer`, `mountPlayer`, `checkedPlayerOrigins` | E | Refus si origine/opener incorrect ; aucune vue MJ de secours | 20 / 05 |
| Jouer | Choisir titre, description et acteurs publics | DTO neuf à liste blanche | `makePlayerProjection` / `selectPublic`, `getPublicProjection` | E | Aperçu identique à l'objet qui sera envoyé, sans notes/IDs privés | 20 |
| Jouer | Publier sélection puis révocation | Consentement ponctuel, READY/SHOW/CLEAR | `sendProjection`, `PLAYER_SHOW`, `PLAYER_CLEAR` | E | Publication MJ explicite ; plus tard CLEAR, jamais SHOW au reload | 20 |
| Jouer | Jouer une résolution M03 | Références mécaniques **natives** | `rules.previewM03({commit:false})`, seulement si `nativeValidated` | E | Désactiver sans port ; aucune formule improvisée ni débit automatique | 10 / 11 |
| Improviser | Ajouter PNJ narratif / objet / sort | Brouillon privé à provenance versionnée | `mountCreators` ; #102 `CreatorDraft` candidat | E+P | Non canon, aucune émission joueur sans sélection | 21 |
| Improviser | Ajouter une scène pendant une séance | Scène, participants, contexte | STUDIO `createScene` / `updateScene` | E | Sauvegarder avant changement ; CLEAR si changement actif | 20 / 04 |
| Improviser | Insérer une capacité descriptive dans créature/scène | Chaîne objet→capacité→créature→scène | #100 `indexChain` injecté, #98 `scene-bridge` **preview-only** | E+P | Pas d'activation numérique, ni copie en double après incident | 21 / 11 / 20 |
| Journaliser | Noter éléments de jeu privés | Note MJ, scène, campagne | `privateNotes` L003 ; #104 `PrivateNote` candidat | E+P | Jamais dans DTO joueur ; conserver avec scène à la reprise | 20 / 04 |
| Journaliser | Marquer un **fait joué** | `playedEvent` narratif **à définir** | #102 3 statuts indépendants ; **pas** `EventJournal` #104 | P | Joué ≠ publication ≠ canon ; pas d'envoi automatique | DG / 01 / 20 |
| Journaliser | Voir l'historique technique d'opérations | `eventId`, `revision`, signature / résultat | #104 `EventJournal`, `listEvents` | B | Sans secret en clair, distinguer de la chronique jouée | 04 / 01 |
| Sauvegarder | Lire état d'enregistrement | Révision et **reçu durable** | L003 `storage.save`; #104 `applyEvent` `committed/duplicate` | E+B | `Enregistré R` uniquement après preuve ; ACK inconnu = avertissement | 04 |
| Sauvegarder | Exporter campagne complète PRIVÉE | Archive + SHA + original PJ / inconnus | ARCHIVES `serializePrivateCampaign` / `exportPrivate` | E | Mention CONFIDENTIEL ; jamais vers joueur/public Git | 04 / 20 |
| Sauvegarder | Prévisualiser restauration | Octets, SHA, manifeste, collisions, identité | `previewPrivateRestore`, STUDIO `previewRestoration` | E | Aucun état muté par l'aperçu ; limites L003 16 Mio privées | 04 / 20 |
| Sauvegarder | Confirmer restauration | `expectedRevision`, backup préservé, remplacement explicite | `commitPrivateRestore` / STUDIO `acceptRestoration` | E+P | Refus de collision, de backup inconnu ou de révision obsolète | 04 |
| Sauvegarder | Exporter en deux onglets | Snapshot+journal **même transaction** | #104 export actuellement lectures séquentielles | B+P | Exiger lecture cohérente atomique avant adoption B | 04 |
| Tous | Basculer guidé ↔ expert | Préférence de vue, même campagne | Navigation BUILDER `mountPreviewNavigation` non mutante | E+P | Aucun recalcul, conversion, réimport ou changement de consentement | 01 / 20 |
| Tous | Afficher images et média joueur | Droits, visibilité, URL locale / alt | #102 `MediaAsset`, #104 `MediaAsset` candidats | P | Pas de média privé par défaut ni requête externe implicite | 21 / 04 / 20 |

## Découpage des composants et propriété

| Composant de surface proposé | Source réutilisée | État d'intégration | Qui décide son évolution |
|---|---|---|---|
| **Shell de six intentions** | #96 `mountPreviewNavigation` + #101 guidé/expert | Navigation contractuelle existante, **nouveau shell non construit** | 01 BUILDER |
| **Accueil / reprise** | `mountStudio` + stockage L003 / #104 lecteur B | Réemploi avec nouvel état de preuve à arbitrer | 20 STUDIO + 04 ARCHIVES |
| **Panneau import PJ** | L003 `previewCharacter/acceptCharacter` + ARCHIVES natif | Réemploi, pas de migration des archives | 20 / 04 |
| **Bibliothèque + inspecteur provenance** | BEST/INDEX ports, #102 définition/variante/instance | Inspecteur actuel partiel, nouveau schéma non adopté | 11 INDEX + 21 ATELIERS |
| **Éditeur de scène** | `createScene/updateScene/setActiveScene` | Réemploi du contrat; **écran éventuellement restructuré** | 20 STUDIO |
| **Créateurs / improvisation** | `mountCreators`, `createCreatorCycle` | Réemploi, panneau latéral non homologué | 21 ATELIERS |
| **Porte de présentation joueur** | `makePlayerProjection`, `mountPlayer`, READY/SHOW/CLEAR | Serializer existant ; **pas de deuxième DTO** | 20 STUDIO |
| **Journal de séance** | notes STUDIO + modèle `Session` proposé ; #104 `EventJournal` technique | **À concevoir après décision modèle**, ne pas réutiliser tel quel le journal technique | 01 / 04 / 20 |
| **Centre incidents/reprises** | `inspectStudioRecovery`, `confirmCreatorAttachmentWithEvidence`, #104 révision/eventId | UI à harmoniser, pas de nouvelle transaction distribuée | 04 / 21 / 20 |
| **Sauvegarde/restore/exports** | ARCHIVES, #104 `exportPrivate/previewImport` banc | Réutiliser les primitives sans mélanger les enveloppes | 04 ARCHIVES |
| **Tokens ardoise/cuivre/or** | #101/#102 propositions + #104 variante sombre | Palette **non sélectionnée**, CSS #98 non activé | 01 BUILDER + 21 ATELIERS + QA |

## Points négatifs obligatoires du futur banc (NON EXÉCUTÉS dans ce document)

| Code | Condition de refus | Attendu observable |
|---|---|---|
| N01 | Import PJ illisible ou > limite source contractuelle | Aperçu refusé ; campagnes inchangées |
| N02 | Deux onglets partent de la même révision et sauvegardent | Un seul commit courant ; autre `STALE_REVISION`, brouillon préservé |
| N03 | Coupure avant journal durable créateur | Aucune copie/STUDIO en double, boutons de reprise bloqués |
| N04 | Coupure après copie STUDIO et avant lien ATELIERS | Relecture de deux stores, même ID, confirmation explicite ; sinon `unattestable` |
| N05 | Deux nouvelles créatures plausibles | `ambiguous`, aucun lien automatique |
| N06 | Changement scène, rechargement ou restauration | CLEAR et sélection vide, aucun SHOW |
| N07 | Fenêtre joueur sous origine inattendue | Projection désactivée, aucun fallback MJ |
| N08 | Tentative de publication des notes, brouillons, source brute ou image sans droits | Champ absent du DTO et de toute donnée joueur |
| N09 | Quota / panne disque / ACK perdu | Jamais de « sauvegardé » sans preuve, reprise manuelle sûre |
| N10 | Export simultané à écriture sur deux stores | Snapshot+journal cohérents ou refus explicite, jamais archive mixte |
| N11 | Zoom 200/400 %, clavier, 390px, lecteur d'écran | Focus et fonctions conservés, pas de piège ni débordement |
| N12 | Bascule mode débutant/expert en cours de scène | Même `campaignId`, même `revision` et notes ; aucune émission SHOW ni résurrection d’un ancien consentement ; projection active inchangée si aucune scène ne change |

**Sources essentielles :** PR #101 `UX_STUDIO_001_PARCOURS.md` blob `82bdfa3c92d2da334d699b0adfe37a3c1d4aa478`; PR #102 `UX_STUDIO_001_CONCEPTION.proposal.md` blob `9e5504d4072b438aa53299c7e386e8644b8202af`; PR #104 `src/contracts.mjs` blob `5e59f024efb4cc578af71fbe6bacdec984075148`, `src/idb-store.mjs` blob `967ebc052a448ff54c3806379160e73117afaf11`, `src/app.mjs` blob `31460ddcbfba21b4158751a4ec4d88f1a8db31ad`.

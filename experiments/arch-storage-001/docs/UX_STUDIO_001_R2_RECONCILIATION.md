# UX-STUDIO-001.R2 — Réconciliation des propositions #101, #102 et #104

**Conception uniquement — NON APPROUVÉE, NON DÉPLOYÉE.** Rédaction 01 BUILDER le 6 novembre 2026, à revoir par 20 STUDIO et 21 ATELIERS, plus 04 ARCHIVES pour le vocabulaire transactionnel. On reprend `UX-STUDIO-001.md`, les guides L004-REPAIR déjà livrés et les maquettes précises ci-dessous ; aucun nouveau moteur ni système de fiches n'est créé.

## Ancrage aux trois sources réelles

- **#101 20 STUDIO @ `3499004dd47d706b06d2dc3e2f5b670df3f60220`**, `UX_STUDIO_001_PARCOURS.md` blob `82bdfa3c92d2da334d699b0adfe37a3c1d4aa478` : un mode one-shot guidé 10–15 gestes et une campagne experte **sur les mêmes données**, séparation origin MJ 4173 / joueur 4174, flux whitelist `READY/SHOW/CLEAR`, messages erreur et barre d'état. Contributions fonctionnelles P1, navigateur P1 NON EXÉCUTÉ par STUDIO.
- **#102 21 ATELIERS @ `85f473d2005903a6fc81d37a83fcc6b3c6d16466`**, `UX_STUDIO_001_CONCEPTION.proposal.md` et `DATA_MODEL_001_SCHEMA.proposal.json` : trois identités `definition/variant/instance`, narration/mécanique/provenance/privé/media distincts, 14 fixtures synthétiques, deux parcours et ardoise/cuivre/or. Les tests cités sont structurels de proposition, non une certification de schéma ou une UI réelle.
- **#104 01 BUILDER @ `f84f8c54361b3701ebb0251700f2d0d09d4acf4d`**, `UX-STUDIO-001.md` et `ADR-001_STORAGE_OPTIONS.md` : transaction `Campaign/EventJournal`, messages de révision/conflit, portabilité hors profil, compatibilité M01–M05 et réemploi des fichiers. La démo IndexDB R2 est un banc MJ fictif, **pas** une fenêtre joueur du Studio réel.

**Règle de réconciliation :** les deux modes consomment le **même port de campagne**, la même révision et les mêmes identifiants. La densité des panneaux et la navigation changent ; le format de sauvegarde, les permissions, les règles, l'auteur d'un événement et les listes blanches ne changent jamais. Les types P1 (dont `Session`, `Encounter`, `MediaAsset`) restent *proposés*, pas des tables déjà en production.

## Deux parcours sur les mêmes contrats

| Phase | One-shot guidé (écran unique par geste) | Campagne experte (cockpit / inspecteur) | Point de données commun |
|---|---|---|---|
| Entrée | Démo fictive / créer / rouvrir ; source de stockage annoncée | Liste campagnes + statuts de reprise | `Campaign.id`, `schema`, `revision`, `storage.status` |
| Personnages | Prévisualiser v2/v3, puis accepter les deux PJ | Vue liste + détails origine/SHA/version | `Character`, `SourceDocument` ARCHIVES ; même `eventId` / pas de copie implicite |
| Bestiaire | Choisir source BEST, prévisualiser et créer une copie | Inspecteur `CatalogReference` / `CampaignInstance`, comparaison variante | Source/document/profil/instance séparés ; même action confirmée |
| Scène | Créer scène A puis B ; notes privées séparées | Sessions (P1 concept), scènes, acteurs et notes dans colonnes | `Scene`, `PrivateNote`, participants IDs ; même journal |
| Créateurs | Décrire un objet puis une capacité (sans effet), rattacher la créature | Créateurs guidé/expert, `CreatorDraft`, versions/provenance | INDEX/ATELIERS descriptif, `pendingStudioOp` + ID stable |
| Séance et XP | Afficher uniquement une **suggestion native non appliquée** | Inspecter proposition MATH/INDEX, arbitrage MJ indépendant | `RulesGateway.preview` et `XPDecisionLedger` consultatif ; **pas** `grantAward` automatique |
| Présentation | Ouvrir fenêtre distincte ; cocher titre/description/acteurs, aperçu, publier | Zone projection whitelist avec état CLEAR/READY et révocation | DTO public construit neuf par STUDIO, **jamais** `Campaign` |
| Sauvegarde | `Sauvegardé à Rn` seulement après commit confirmé, exporter CONFIDENTIEL | Journal, révision, conflits, comparaison/preview restore | `StorageReceipt`/`expectedRevision`, `ExportManifest` candidat |
| Sortie | Confirmer fermeture du mode démo, ne pas effacer par défaut | Reprise à l'identité choisie, export des brouillons privés en conflit | Annulation/récupération, aucune suppression du profil ou des stores legacy |

**Changer de mode :** aucun commit, migration, relabel ou normalisation de fiche. L'UI ne modifie que la densité, le focus et le panneau courant ; un brouillon non enregistré reste visible et demande confirmation avant sortie.

## Matrice gestes → contrats / erreurs / permissions / composants

| Geste utilisateur | Port/contrat propriétaire attendu | Erreur et récupération non destructive | Permissions / données visibles | Composant proposé (sans implémentation) |
|---|---|---|---|---|
| Ouvrir campagne | `CampaignRepository.read(id)` + `revision` (proposition P1) ou `storage.load()` L003 | `DB_BLOCKED`, `DB_CLOSED`, version incompatible : proposer fermer ancien onglet / export puis recharger, pas reset | MJ local seul | Sélecteur campagne + bannière stockage |
| Import PJ | ARCHIVES `previewImport` puis `commitImport` sur original SHA | Schéma/taille/hash/collision : conserver octets, refus fermé, jamais « corriger » les sources | Source MJ privé ; pas de DTO joueur | Assistant import, carte provenance, validation explicite |
| Copier créature | INDEX `resolve`/BEST `readProfile` puis STUDIO `copyCreature` | `STALE_REVISION`, doublon `eventId` : relire journal, même ID ou intervention MJ | MJ ; définition consultable mais instance privée | Inspecteur définition/variante/instance + action Copier |
| Créer scène / note | `CampaignWrite.applyEvent({eventId,expectedRevision,kind})` | `TX_ABORTED`, `QUOTA_EXCEEDED` : afficher « Aucune écriture confirmée », ne rien effacer | `PrivateNote` jamais partageable | Éditeur scène + champ privé verrouillé textuellement |
| Modifier autre onglet | `readConsistentSnapshot`/receipt durable / `versionchange` | `STALE_REVISION`, `DB_CLOSED` : recharger, exporter brouillon, comparer, ne pas écraser | MJ seulement | Bannière conflit persistante `role=alert` |
| Valider atelier | ATELIERS `validateMJ` + INDEX `validateDescriptiveChain`; journal `pendingStudioOp` | Source/version manquante, validation descriptive échouée : pas d'application numérique | MJ, brouillon privé | Cycle étapes + inspecteur provenance |
| Associer atelier à scène | STUDIO `attachCreature/attachScene` + `inspectStudioRecovery` + idempotence du store | Accusé perdu : rechercher preuve durable du même `operationId`, refuser seconde copie | MJ et ses instances | Dialogue de rapprochement avec preuves, pas bouton Créer encore |
| Prévisualiser XP | MATH `suggestXpFromM01`, INDEX consultation | Non homologué / désaccord : afficher `Indisponible`, pas de montant appliqué | MJ ; calcul natif consultatif | Panneau « suggestion seule » |
| Ouvrir joueur | `mountPlayer` sur origine 4174, STUDIO `openPlayer` | Popup refusée / mauvaise origine : refuser projection | Joueur reçoit uniquement DTO | Passerelle de présentation |
| Publier / révoquer | STUDIO `makePlayerProjection` / `sendProjection` / `PLAYER_CLEAR` | Changement scène/onglet : CLEAR, ré-autorisation avant SHOW | Cases titre/description/acteurs ; jamais notes/assets sans droits | Checklist, aperçu exact, deux boutons Publier/CLEAR |
| Export confidentiel | `readConsistentSnapshot` puis `makePrivateArchive` + SHA + receipt | Lecture/erreur quota : refuser export, présenter archive *précédente* sans la supprimer | MJ export contient secrets ; ne jamais l'envoyer au joueur | Exporter + empreinte/taille + avertissement |
| Restaurer | ARCHIVES `previewRestore` puis `commitRestore`/`commitImport` sous garde | Collision/preview périmée : refus et conservation de l'état cible | MJ, source inconnue en quarantaine | Aperçu de différence + confirmation explicite |
| Média / image | futur `MediaAssetResolver` : droits, SHA, alt, visibilité | Droit inconnu/offline : placeholder texte, aucun transfert joueur | MJ privé par défaut | Carte image avec crédit/droits/alt |

**Port de statut candidat** (non implémenté) :

```ts
export type DurableWriteState =
  | {kind:'idle'}
  | {kind:'writing'; eventId:string; expectedRevision:number}
  | {kind:'committed'; eventId:string; revision:number; durable:true}
  | {kind:'uncertain'; eventId:string; action:'reconcile'}
  | {kind:'stale'; observedRevision:number; action:'reload-or-export-draft'}
  | {kind:'blocked'; code:'DB_BLOCKED'|'DB_CLOSED'|'QUOTA_EXCEEDED'|'UNSUPPORTED_SCHEMA'};
```

Ce type est une **signature de discussion pour 04 ARCHIVES et 20 STUDIO**, pas une API prétendument disponible dans le code P0. L'export atomique R2 n'atteste pas à lui seul la durabilité métier de la sauvegarde STUDIO.

## Direction visuelle, navigation et accessibilité (proposition)

- **Choix commun proposé à débattre** : `#14212D` ardoise profonde, `#233347` panneau, `#E4B179` cuivre CTA, `#E9C56E` or accent, `#F4EFE5` texte, `#FFE299` focus. Il diffère légèrement de la première palette #104 `#111C25/#C99368` : **ne pas mélanger silencieusement**. Soumettre un seul jeu de tokens à la revue 20/21 et calculer les contrastes de *tous* les états effectifs avant sélection.
- **Clavier** : Tab/Shift+Tab/Entrée/Espace/Escape sans piège ; le focus revient au contrôle déclencheur après dialogues, et aux premiers champs invalides sur erreur. `Ctrl/Cmd+S` reste proposé, pas implémenté ; aucune touche n'active une ressource ou une publication.
- **Tablette** : à 768px les trois zones deviennent panneaux/accordéons ; à 390px l'inspecteur est replié sans cacher « Sauvegarder » ni « Publier ». Cibles tactiles recommandées ≥44px et test au zoom 200/400%.
- **Erreurs** : messages persistants `role=status`/`role=alert`, associés à l'input (`aria-describedby`) ; jamais une couleur seule ou un toast éphémère. Distinction « enregistré localement », « transaction commencée », « opération confirmée ».
- **Médias** : aucune vignette mise en publication sans `rights` explicites, crédit et alt ; cache offline, placeholder lisible, pas de SVG/script HTML non fiable. Définition, variante et instance ne partagent pas automatiquement les droits de l'image.
- **Privé vs public** : enveloppe MJ privée conservée sur son origine ; joueur via DTO whitelist neuf sur autre origine, données jamais envoyées au DOM/messages/logs/assets publics avant opt-in. CLEAR ne révoque pas ce qui a déjà été observé/copié.
- **Mode débutant/expert** : même campagne et mêmes permissions, pas de transactions automatiques masquées ; les sessions P1, les effets d'objets et statuts canon/joué restent visibles uniquement comme propositions/versionnements indépendants jusqu'à validation.

## Avis et décisions restant à obtenir

- **20 STUDIO** : confirmer en particulier focus/changement de scène, erreurs `DB_CLOSED`, conflits deux onglets, désactivation après échec, et protocole de projection. Les maquettes #101 sont des exigences, pas des écrans certifiés.
- **21 ATELIERS** : confirmer définition/variante/instance, refus de second attach après `pendingStudioOp`, navigation guidé/expert et gestion des droits images. Le schéma JSON #102 reste candidat.
- **04 ARCHIVES** : arbitrer `StorageReceipt`, modes de restauration/versionchange et originaux octet-exact ; l'UX ne peut prétendre à un statut `durable` avant réception du commit.
- **QA/REVUE** : contre-tests clavier réel/lecteurs d'écran, 1280/768/390/320, zoom, contraste des états, confidentialité canari et absence de fuite par illustrations. **NON EXÉCUTÉS** pour cette proposition.
- **DG** : choisir les contrats et la palette après revue croisée, sans modifier #95 ni publier. **Aucune interface définitive, aucun CSS de production, aucun merge.**

# UX-STUDIO-001.R2 — Parcours, actions et permissions du cockpit MJ
**21 ATELIERS → 20 STUDIO / 01 BUILDER · 6 novembre 2026 · CONCEPTION / NON VALIDÉE**

## 1. Trois bases confrontées, aucune nouvelle UI
| Source à respecter | Repère exact et preuve | Apport / conflit |
|---|---|---|
| STUDIO #101 | `#101@3499004dd47d706b06d2dc3e2f5b670df3f60220`, `experiments/dg-lot004/tests/studio/p1/UX_STUDIO_001_PARCOURS.md` blob `82bdfa3c92d2da334d699b0adfe37a3c1d4aa478` | 11 étapes d'usage (camapgne, PJ, créature, scène, vérification, joueur, publication, changement, export, quitter) ; révision et durabilité visibles, avis multi-onglet ; BUILDER responsable de la navigation |
| ATELIERS #102 | `#102@85f473d2005903a6fc81d37a83fcc6b3c6d16466`, `experiments/dg-lot004/src/creators/proposals/UX_STUDIO_001_CONCEPTION.proposal.md` blob `9e5504d4072b438aa53299c7e386e8644b8202af` | 15 gestes pédagogiques (scénario/objet/capacité/aperçu séparés), définition/variante/instance, diff import, droits média, canaris |
| ARCHIVES / BUILDER #104 | `#104@f84f8c54361b3701ebb0251700f2d0d09d4acf4d`, `experiments/arch-storage-001/docs/UX-STUDIO-001.md` blob `4c8722cfbb7cb1077542fe664dd23800a423bfa9`, `src/contracts.mjs` `5e59f024efb4cc578af71fbe6bacdec984075148` | Une courte séquence campagne→PJ→créature→scène→créateurs→projection→sauvegarde ; états transactionnels IndexedDB prototype, 12 familles futures, test 768/390px |

**Décision de conception proposée (01 BUILDER décide)** : **un cockpit, deux densités**, plutôt que trois assistants concurrents. Les « 15 gestes » de #102 restent une **checklist dépliable** au sein de 7 zones d'activité de #104 ; les « 11 étapes » de #101 décrivent les tâches essentielles et non un autre schéma. Aucun nouvel écran ne nécessite un second stockage ou une autre campagne. Pas de niveau maximum 12 : conserver 1–25.

## 2. Parcours harmonisé et gestes ↔ contrats
| Zone du cockpit et geste novice/expert | Contrat propriétaire existant ou futur | Succès attesté | Erreurs/reprise |
|---|---|---|---|
| **Accueil / choisir mode** : one-shot fictif ou campagne libre ; expert accède directement à l'inspecteur | BUILDER navigation, préférence locale d'affichage, pas de mutation de fiche | « Campagne sélectionnée », origine privée identifiée | Aucun magasin => blocage création, aide hors ligne ; mode sans changement des données |
| **Campagne** : créer puis choisir un ID, éviter homonymies | #104 `createCampaign` / `readCampaign` ; `expectedRevision` pour événements futurs | Révision durable, source/version sauvegardée | ID collision => proposer nouvel ID après contrôle, pas « écraser » |
| **Bibliothèque / créer fiche** : sélectionner définition/variante/instance ; voir statut de vérité | #105 `validateModelRecord/Dataset`; #102 aperçu privé ; 04 source originale | « Brouillon descriptif privé », aucune mécanique appliquée | Refus si source non épinglée, version inconnue ou champs inconnus : montrer diff et bloquer application |
| **Importer PJ** : prévisualiser → accepter par consentement | L003 STUDIO `previewCharacter/acceptCharacter`, ARCHIVES source v2/v3, nouveau adaptateur selon DG | Copie d'instance et référence source différenciées | Ancien backup/schéma non attestable => aucune modification et source conservée |
| **Créer/coller créature** : définition BEST → variante validée en amont → copier instance | BEST natif M04 + STUDIO `previewCreature/copyCreature` ; ATELIERS `pendingStudioOp` durable | ID de copie STUDIO **après ACK relu**, aucun profil recalculé par UI | `unpersisted/ambiguous/stale/conflict` => aucune nouvelle copie ; écran reprise même ID |
| **Objets/capacités/sorts/rites** : description en premier, inspecteur autorisations en second | L003 ATELIERS + #105 INDEX ; M01–M05/Grimoire/Ritual ports natifs si homologués | « Enregistré comme proposition », jamais « sort lancé » | `blocked/not-evaluated` non exécutable ; aucune imitation numérique ni débit |
| **Scènes/participants** : ajouter la scène à une campagne, puis acteurs par ID ; notes séparées | STUDIO scène/participants, #104 `add-scene` avec `participantIds`; adapter DATA-MODEL encore P1 | titre/publicDescription côté candidat public, notes MJ en stockage privé | `needs-participants`, ID absent, panne post-copy : reprise sans duplication ni publication |
| **Vérifier avant le jeu** : révéler problèmes de provenance, sauvegardes, médias | `getStudioRecovery` non attesté ; `inspectStudioRecovery` durable ; 04 contrôles archive ; INDEX statuts | Indicateurs « sauvegardé révision N » si magasin confirme, « prêt à présenter » séparé | Révision obsolète/2 onglets => offrir sauvegarde du brouillon et relecture, jamais dernier écrivain gagne |
| **Présenter joueur** : prévisualiser DTO, cocher titre/description/acteurs, confirmer | STUDIO `makePlayerProjection`, READY/SHOW/CLEAR et whitelist, origine 4174 contrôlée | Public uniquement après validation et consentement explicite, « Envoyé » ≠ « sauvegardé » | Origine incorrecte, READY absent, droits média non confirmés => ne pas publier |
| **Changer de scène** : CLEAR, nouvelle sélection | STUDIO `PLAYER_CLEAR` et liste des scènes ; ne pas exporter `privateSnapshot` | Vidage de la projection avant nouvelle sélection | Fenêtre joueur déconnectée => message sans fuite, pas de SHOW implicite |
| **Exporter / importer / quitter** : choisir privé, confirmer aperçu restore | #104 `exportPrivate/previewImport/commitImport`, digest SHA + journal de campagne, recette navigateur seulement après choix A/B/C | Archive privée téléchargeable une fois confirmée, version/SHA visibles | Import collision, checksum, quota/offline/ACK perdu => aucun remplacement ; ancien backup sans journal bloqué |

La différence entre **un geste UX** et un événement/commande de stockage est explicite : « ouvrir fiche », « prévisualiser », « afficher un panneau », « passer en mode expert » ne doivent pas écrire d'événement. `createCampaign/applyEvent` du prototype #104 ne fournit **pas** une commande transactionnelle `add-creator-draft` : le futur atelier n'a pas d'API de persistance réelle dans ce prototype tant que 04 n'arbitre pas.

## 3. Composants de conception et contrats de données
```text
ApplicationShell (BUILDER)
├─ CampaignSwitcher — origine locale, revision et conflits (ARCHIVES)
├─ JourneyChecklist — novice 7 zones, expert libre (ATELIERS)
├─ LibraryInspector — définition / variante / instance ; source/version/canon? (INDEX)
├─ DraftEditor — validation narrative + statut mécanisme natif (ATELIERS)
├─ SceneWorkspace — acteurs par ID, public et notes MJ séparés (STUDIO)
├─ RecoveryPanel — journal, lecture persistée, id/campagne, annulation si attestée (STUDIO/ARCHIVES/ATELIERS)
├─ PlayerPreview — projection DTO fraîche issue liste blanche (STUDIO)
├─ ExportImportDialog — aperçu, hash, source native, taille, collisions (ARCHIVES)
└─ MediaInspector — droits/alt/crédits, jamais autoriser avant preuve (ARCHIVES + ATELIERS)
```

**Les composants sont un découpage de responsabilités, pas des classes implantées ni des fichiers à ajouter au produit.** Aucun composant ne calcule une formule M01–M05, n'écrit une copie STUDIO en l'absence de journal, ne valide un canon, ni ne prend des décisions d'origine à la place d'ARCHIVES.

## 4. Reprise après panne — états par machine + navigation clavier
| État lisible | Bouton permis | Bouton interdit | Focus et annonce |
|---|---|---|---|
| `draft-local` | enregistrer brouillon | publier automatiquement | statut « non confirmé » persistant |
| `saving` | consulter l'état | double clic copier/valider | `aria-busy`; priorité focus stable |
| `committed` | continuer, exporter | considérer « sauvegardé » comme « publié » | `role=status`, révision réelle |
| `ack-lost` | relire journal + ARCHIVES | retenter copie sans inspection | `role=alert`, focus au panneau reprise |
| `unpersisted` | diagnostiquer la file d'écritures | confirmer un ID mémoire seul | même ID et campagne explicitement indiqués MJ |
| `ambiguous/conflict/stale` | exporter privé/ouvrir rapport | forcer un lien arbitraire | erreurs descriptives, pas de canari |
| `old-backup-unattestable` | garder les deux archives, demande arbitrage | restaurer en remplacement silencieux | aucun accusé de réussite |
| `external-modification` | recharger, exporter brouillon local | dernier écrivain gagne | focus sur comparaison des versions |
| `public-preview` | sélectionner whitelist | publier sans clic | `aria-checked`, libellé « rien envoyé » |
| `player-cleared` | sélectionner à nouveau | SHOW implicite | message « vue joueur effacée », aucun secret exposé |

La récupération n'est **pas** un « raccourci pour réparer la transaction » ; le MJ doit voir la campagne, l'ID et la preuve durabilité. En cas d'absence de certitude, les boutons `Confirmer lien` et `Retenter création` sont désactivés et la sauvegarde existante reste conservée.

## 5. Permissions et projections — séparation des cinq catégories
1. **Source et fichier original** : MJ privé (04 ARCHIVES), jamais dans DTO.
2. **Définition publique approuvable** : référence candidate; publication/canon exigent une autre attestation.
3. **Instance de campagne** : nom public éventuellement selectable ; état, ressources, secrets non exposés par défaut.
4. **Notes privées / canaris** : aucune case à cocher publique ; absence obligatoire à 4174, dans logs, dans alt d'images et messages d'erreur.
5. **Média** : `rights=pending/unknown/restricted` => preview MJ seulement ; accès public si droits confirmés + sélection expresse. Le seul statut « anciennement public » ne justifie pas une nouvelle publication.

Le DTO joueur doit être créé neuf depuis une liste blanche : `title`, `publicDescription`, éventuellement acteurs expressément choisis et médias avec droits confirmés. Export INDEX `makeSelectedPlayerCandidate` est seulement candidat à transporter, **pas** un port STUDIO autorisant `SHOW`.

## 6. Palette divergente : arbitrage requis avant tout CSS
| Référence | Ardoise fond | Panneau | Cuivre | Or | Texte |
|---|---|---|---|---|---|
| STUDIO #101 / ATELIERS #102 | `#14212D` | `#233347` | `#E4B179` | `#E9C56E` | `#F4EFE5` |
| ARCHIVES/BUILDER #104 | `#111C25` | `#1B2A34` / `#263642` | `#C99368` | `#E7C77B` | `#F1F4F1` |

Ce ne sont **pas** deux thèmes à charger : choisir avec BUILDER après les tests de lisibilité, les états d'alerte, les badges privés/publics, la force du focus et le contraste texte/non-texte. Les rapports sur paires du dossier #102 ne certifient pas les boutons désactivés, liens, icônes, contrastes en survol ni la fenêtre joueur. L'or doit marquer une confirmation rare, non les statuts ordinaires.

## 7. Clavier, tablette, accessibilité : scénarios à planifier
- **Clavier** : traverser création → PJ → scène → sauvegarde → fenêtre joueur sans souris; focus restauré après modale, pas de piège, `Tab/Shift+Tab` prévisibles ; `Ctrl/Cmd+S` seulement après arbitrage et sans interférer avec la saisie ; actions désactivées réellement.
- **Tablette** : 768 px portrait avec panneau inspecteur refermable, test 390 px comme témoin ; cible tactile ≥44×44 px, pas de scrollbar horizontal sur l'édition ; zoom 200/400 % avec reflow de formulaire.
- **Contraste** : cibles WCAG 2.2 AA (4,5:1 texte, 3:1 UI), test des vrais états, pas seulement palette; état de sauvegarde et privé/public toujours accompagné d'un libellé.
- **Médias** : alt descriptif, droits et crédit; image manquante non bloquante, image sans droits privée.
- **Erreur** : résumé avec liens vers champs, `aria-invalid`/`aria-describedby`, `role=alert` au besoin; conserver saisie et position malgré `render()`.
- **Reprise hors ligne/2 onglets** : relire les deux sauvegardes, conflits révision; jamais écraser une campagne en démo.
- **Confidentialité** : deux canaris fictifs côté MJ, aucun à 4174 après READY/SHOW/CLEAR. Ne pas promener un DOM complet du cockpit dans la projection.

## 8. Arbitrages propriétaires et gates
| Décision | Référent | Gate |
|---|---|---|
| 7 zones versus 11/15 micro-étapes et mode expert | 01 BUILDER + 20 STUDIO | maquette conceptuelle revue, préférences sans migration |
| Namespace/stockage et port de révision | 04 ARCHIVES + 01 BUILDER | banc A/B sur panne/2 onglets, ne pas proclamer B choisi |
| DTO public / CLEAR / filtre médias | 20 STUDIO + QA | vrais navigateurs 4173/4174 et canaris |
| Validation narrative / mécanique | 21 ATELIERS + 11 INDEX | champs reliés aux ports natifs, aucun effet de remplacement |
| Tokens ardoise/cuivre/or et contraste | 01 BUILDER + 21 ATELIERS | audit sur candidat réel, clavier/tablette, droits image |
| P0 transactionnel | 05 INTÉGRATION + 04 + 20 + 21 | nouveau HEAD composite, CI/Chrome et QA indépendant **avant** toute P1 |

**Verdict :** réconciliation des usages et critères de recette, pas « Studio R2 » implémenté. Les trois documents gardent leur valeur de preuve, les différences sont explicites et aucun modèle historique ou style n'est effacé.

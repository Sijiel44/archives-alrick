# UX-STUDIO-001.R2 — Rapport de convergence STUDIO / BUILDER / ATELIERS

**Projet :** Les Chroniques d’Entre-Rives v0.1  
**Date de travail :** 6 novembre 2026  
**Émetteur :** 20 🎛️ STUDIO — usages MJ, scènes, notes privées et projection joueur  
**Destinataires :** 01 BUILDER (responsable architecture/navigation), 21 ATELIERS (formulaires et créations), 04 ARCHIVES (écriture et reprise), 00 DG (arbitrages), QA (recette ultérieure)  
**Statut :** **PROPOSITION P1 — CONCEPTION SEULEMENT / NON ARBITRÉE**. Aucun montage dans #95, aucune migration, aucun nouveau Studio parallèle.

## 0. Sources et périmètres effectivement rapprochés

Ce rapport consolide **sans les remplacer** :

| Source | Référence vérifiée | Contribution qui reste distincte |
|---|---|---|
| STUDIO #101 | PR `#101@3499004dd47d706b06d2dc3e2f5b670df3f60220`, `UX_STUDIO_001_PARCOURS.md` blob `82bdfa3c92d2da334d699b0adfe37a3c1d4aa478`; `ARCH_STORAGE_001_BESOINS_STUDIO.md` blob `54d3fd5b33ff55800f78c7607f556fe56322690a` | One-shot/campagne sur même état, boucle privée/public, concurrence, sauvegarde, besoins hors ligne et scénarios de panne |
| ATELIERS #102 | PR `#102@85f473d2005903a6fc81d37a83fcc6b3c6d16466`, `UX_STUDIO_001_CONCEPTION.proposal.md` blob `9e5504d4072b438aa53299c7e386e8644b8202af`; `DATA_MODEL_001_SPECIFICATION.proposal.md` blob `270bc64866e965eab49d48403ccbf4e33d37a198` | One-shot en 15 gestes, wireframes, définition/variante/instance, brouillons, provenance native, média, états canon/publication/fait joué indépendants ; schéma **candidat** non adopté |
| BUILDER #104 | PR `#104@f84f8c54361b3701ebb0251700f2d0d09d4acf4d`, `UX-STUDIO-001.md` blob `4c8722cfbb7cb1077542fe664dd23800a423bfa9`; `ADR-001_STORAGE_OPTIONS.md` blob `7d5ac64513c998f08905ba39d82a4c9c85a5293a` | Addendum UX et prototype B IndexedDB **isolé** : révisions optimistes, journal idempotent, essais Chrome B01–B10 sur 4181 en CI ; A/B/C toujours non tranchés |
| Contrat Studio existant | #98 `35e2de3bcc702def3d37906997fb07155d2c44a3`; L003 `src/studio/CONTRACT.md` blob `ef9b3d26c6660f7ff10d22f6186abed1c00a20e4` | `mountStudio`, sélection publique explicite, `setActiveScene` → CLEAR, `mountPlayer` sur origine distincte et conservation du secret MJ |
| Contrat ARCHIVES existant | `experiments/dg-lot003/src/storage/storage.mjs` blob `be6a881018ae1709ecef71c3c5a155acfb94a658`, contrat blob `7390b1872db0d2199404c394d1df8e21c8af2678` | Aperçu/commit d’import et de restauration privés, octets originaux et inconnus, export privé ≤ 16 Mio ; **la fonction pure n'atteste pas à elle seule l’écriture durable du navigateur** |
| Reprise P0 | #98 `src/studio/reconcile.mjs` blob `61cc35376f80b1845472109332ecc681d81d2fe3`, ATELIERS #100 `cycle-state.mjs` blob `5554b3b12728f0e63388beccec2c58b29b214281` | Journal `pendingStudioOp`, relecture durable par `await inspectStudioRecovery()` et même ID, jamais seconde copie automatique |

**Séparation des preuves :** #104 a rapporté 13/13 Node24 et B01–B10 Chrome en CI au SHA indiqué, sur un **banc de stockage fictif à une seule origine 4181**. Ce n'est pas une recette du cockpit MJ/joueur ni du futur parcours R2. Les contrôles structurels #102 (6/6 V8) ne certifient pas son JSON Schema complet ni l’UX. Les travaux P0 #98 sont livrés, mais la recette intégrée avec #95 reste à 05/QA. **Aucun test navigateur R2 n’est exécuté dans ce dossier.**

## 1. Conclusion de convergence : une boucle, deux niveaux de guidage

Le parcours maître proposé est :

**Reprendre → Préparer → Jouer → Improviser → Journaliser → Sauvegarder → [Reprendre]**.

Ce sont **six intentions métier récurrentes**, non six nouvelles tables ni un nouveau moteur. Le créateur de campagne peut passer de la première à la dernière à tout moment, selon le travail déjà accompli. **One-shot guidé** présente ces mêmes intentions comme étapes courtes avec des contrôles de passage et un seul appel à l’action principal. **Campagne experte** les expose sous forme de navigation, recherche et inspecteurs simultanés ; aucune conversion, duplication de campagne ou changement de schéma n'accompagne ce changement de mode.

| Intention | Résultat attendu par le MJ | Contrainte invariant P0/P1 |
|---|---|---|
| **Reprendre** | Retrouver la campagne et la dernière révision **attestée**, l'état de la scène active, les éventuels conflits et le point de reprise | Un brouillon en mémoire n'est pas une écriture durable. Une ancienne archive sans journal ne permet pas de rattachement automatique. |
| **Préparer** | Importer les PJ par aperçu, référencer/copie de créature, préparer les scènes et participants, renseigner notes MJ et créateurs descriptifs | Définition/source ≠ variante ≠ instance de campagne. Action créateur externe précédée de journal durable. Aucun effet numérique sans port natif. |
| **Jouer** | Ouvrir la scène active, utiliser ses participants, choisir une projection publique et piloter ce que voit la fenêtre joueur | Une scène enregistrée n'est pas une scène *publiée*. `PLAYER_SHOW` seulement après choix explicite ; `PLAYER_CLEAR` au changement/reprise. |
| **Improviser** | Ajouter un PNJ narratif, une rencontre, un objet ou une nouvelle scène **en brouillon**, sans interrompre la partie | Créateur/INDEX descriptifs et port de copie, sans duplication ni transformation automatique du monde, du canon ou des ressources. |
| **Journaliser** | Noter ce qui **s'est réellement passé** en séance, conserver les décisions et le point de reprise | Distinction stricte : note MJ privée / fait joué de campagne / événement technique de stockage / contenu publiable / canon. L'`EventJournal` #104 est un journal technique **pas encore** un journal narratif. |
| **Sauvegarder** | Voir l'accusé durable local, exporter une archive privée, inspecter avant toute restauration et vérifier hors ligne | `Enregistré R` seulement sur reçu durable ; **export** et **écriture locale** sont des opérations différentes ; refuser collisions et restauration destructive. |

**Changement de mode d’interface :** aucune mutation de `Campaign`, aucun `schemaVersion` de mode, aucune promotion de statut canon/jeu/publication. La préférence d'affichage pourrait être enregistrée séparément, **à arbitrer avec ARCHIVES** (pas une garantie existante).

## 2. Parcours one-shot guidé : 15 gestes regroupés dans les six intentions

Ce regroupement **conserve les 15 gestes du document ATELIERS #102** en intégrant la logique de retour/reprise de #101 :

1. **Reprendre** — (1) choisir « Nouvelle campagne / Reprendre / Démonstration fictive » ; (2) initialiser ou vérifier l'identité et l'état de sauvegarde (l'écran ne prétend pas déjà gérer des sessions persistées).
2. **Préparer** — (3) choisir canevas/scénario narratif ; (4) prévisualiser les sources PJ v2/v3 ; (5) accepter les copies de PJ et leurs identités de campagne ; (6) consulter la source BEST et copier **une instance** de créature ; (7) sélectionner un objet descriptif ; (8) enregistrer/référencer une capacité descriptive ; (9) créer une scène, notes MJ distinctes et participants par ID ; (10) valider la checklist provenance, droits médias, champs inconnus et sauvegarde.
3. **Jouer** — (11) ouvrir la fenêtre joueur séparée et inspecter l'aperçu DTO strict ; (12) choisir titre/description/acteurs puis **publier la sélection** ; (13) changer de scène, provoquer CLEAR et exiger un nouveau choix pour republier.
4. **Improviser** — accessible depuis Préparer/Jouer, sous panneau facultatif « Ajouter pendant la partie ». Cela ne remplace aucun des gestes ; si utilisé, la création/rattachement suit exactement les mêmes journaux et validations.
5. **Journaliser** — annoter les événements joués et le point de reprise, **proposé** tant que le contrat métier du journal de séance n'est pas homologué ; le débutant peut conserver une note privée sans la confondre avec un événement technique.
6. **Sauvegarder** — (14) obtenir un accusé local réellement durable, puis exporter **CONFIDENTIEL** ; (15) prévisualiser une restauration sur copie et confirmer sans écrasement implicite, ou quitter/reprendre.

Les gestes 1–15 sont une **organisation UX candidate**, pas le constat que chaque bouton existe. Le scénario d'import fictif (2 PJ, une créature, 2 scènes) reste un banc de validation, pas une obligation de toute nouvelle partie.

## 3. Campagne experte : mêmes données, davantage de vues

Le MJ expérimenté accède directement au cockpit : recherche campagne/sources, navigation scènes et séances (séances = **modèle candidat**), inspecteur définition/variante/instance, créateurs ATELIERS, rencontres, journaux et export. La barre de persistance est constante. La piste « Improviser » garde les actions de création **à part** des effets mécaniques. Un expert peut sortir d'une sous-vue et la retrouver sans perdre son brouillon. Les panneaux sont réordonnables/adaptatifs, **pas des copies d'état**.

La commande « Aller à » de BUILDER (`mountPreviewNavigation` dans #96) est une **navigation non mutante** réemployable ; elle n'est pas le contrat d'enregistrement ni un système d'autorisation. Il ne faut pas lui confier la création, le débit de mana, le choix du DTO joueur ou le journal de reprise.

## 4. Composition UX proposée — réemploi contre reconstruction

### 4.1 Éléments réemployables, sans présumer leur adaptation automatique

- **STUDIO** : `mountStudio` (campagne/import/copie/scène/export et restauration), `setActiveScene`, `makePlayerProjection`, `mountPlayer`, protocole READY/SHOW/CLEAR, `mountStudioDemo` seulement pour la **démonstration**, `inspectCreatorAttachment`/`confirmCreatorAttachmentWithEvidence` pour la reprise attestée.
- **ATELIERS** : `mountCreators` L003 et le cycle descriptif L004 `createCreatorCycle`/`cycle-ui` avec `pendingStudioOp` ; en P1 le couple définition/variante/instance est **schéma proposé**, pas contrat implémenté par ces widgets.
- **BUILDER** : navigation non mutante `mountPreviewNavigation` et service de composition/ports ; la page `4181` de #104 est un **banc IndexedDB**, non une nouvelle interface Studio et ne doit pas être importée comme écran MJ définitif.
- **ARCHIVES** : `previewCharacterImport`/`commitCharacterImport`, `serializePrivateCampaign`/`previewPrivateRestore`/`commitPrivateRestore`, adaptateur validé de sauvegarde L003. Réemploi du lecteur byte-exact sans prétendre que le format P1 `cer.arch-storage001.*.proposal.v0` remplace L003.
- **INDEX/MATH** : références d'identité/capacité et ports natifs existants, jamais moteur de calcul réinventé par UX.

### 4.2 Zones à reconstruire éventuellement *après* arbitrage

1. **Coque de navigation transversale** : six intentions, raccourcis débutant/expert, état de campagne et révision toujours visible, régions clavier — BUILDER pilote avec STUDIO.
2. **Éditeur de scène unifié** : participant-picker par IDs de copies et PJ, séparation irréductible texte public / note MJ, action scène active vs publication distincte — STUDIO pilote les usages ; formes ATELIERS réemployables.
3. **Journal de séance** : événements *joués* référencés (horodatage logique/ordre, auteur local, lien de scène, confidentialité) et point de reprise ; **distinct** d'`EventJournal` idempotent du stockage — décision ARCHIVES/DG avant modèle.
4. **Centre de reprise et conflits** : deux onglets, `STALE_REVISION`, ACK perdu, `pendingStudioOp`, lecture durable indépendante et choix MJ « même ID / abandon sûr / exporter brouillon », jamais retry create automatique.
5. **Porte de projection** : sélection publique détaillée et aperçu *du DTO réel*, bouton SHOW et CLEAR séparés ; **ne pas** concevoir une seconde API de projection, seulement une interface sur le serializer whitelist existant.
6. **Inspecteur source/variante/instance et média** : traces, droits image, alt, provenance, champs inconnus sous label privé ; peut consommer la proposition #102 **une fois validée**, pas les objets P1 comme données de production.
7. **Gestion des séances** : écran « Séances » uniquement lorsque le contrat `Session`/journal de séance est confirmé ; avant, afficher des points de reprise à portée de campagne/scène, sans fausse persistance.

La matrice détaillée « geste ↔ contrat ↔ responsable ↔ état ↔ risque » figure dans `UX_STUDIO_001_R2_MATRICE_GESTES_CONTRATS.md`.

## 5. Permissions, confidentialité et frontières de présentation

- **MJ local** : une étiquette « MJ privé » signifie une **frontière d'interface et d'origine**, **pas une authentification de personne** ; les secrets sont accessibles au détenteur du navigateur/profil MJ. Ne pas promettre un rôle MJ sécurisé sans une autorité distincte, qui n'appartient pas à ce mandat.
- **Joueur** : seul le serializer `makePlayerProjection` produit un objet neuf à liste blanche ; ni `Campaign`, ni sources brutes, notes, brouillons, droits média, tokens de restauration, provenance secrète, ID privés ou historique n'y passent. `PLAYER_CLEAR` après changement de scène/reprise, jamais SHOW automatique ; aucun moyen d'effacer ce qu'un joueur a déjà copié ou vu.
- **Candidat public de scène** : une description « publique » dans le Studio n'est pas publiée tant que la sélection MJ n'est pas confirmée. Les médias ne sont sélectionnables qu'après droits prouvés. Une éventuelle photo avec provenance inconnue reste privée et son absence doit permettre le jeu.
- **Double vue** : l'onglet MJ B n'est pas la fenêtre joueur. Deux onglets MJ d'une même origine sont des **concurrents en écriture** ; un joueur sur autre origine est un **lecteur sans stockage MJ**. Cela impose deux procédures de test différentes.
- **Consentement de projection** : ne pas le restaurer automatiquement après import, fermeture, rechargement ou conflit. La bascule guidé/expert ne déclenche **aucun nouveau SHOW** et ne redonne pas une autorisation expirée ; si une projection déjà active demeure visible, seul un CLEAR explicite ou un changement de scène la révoque. Un champ déjà envoyé est irrévocable rétrospectivement.
- **Fait joué/canon/publication** : statuts indépendants (proposition #102), avec frontières dans le cockpit ; ne pas transformer une note de séance en canon ni publier un journal par inadvertance.

## 6. États de fiabilité UX : ce que le MJ doit comprendre

| Condition | Message durable dans la barre de statut | Action visible | Action interdite |
|---|---|---|---|
| Nouvelle campagne/aucun contenu | « Aucune campagne locale ; créer ou prévisualiser un import » | Créer / aperçu | Remplacer une campagne existante sans choix |
| Vue modifiée, non sauvée | « Modifications locales non confirmées » | Vérifier / sauvegarder brouillon | Afficher « Enregistré » |
| Écriture en cours | « Écriture en cours » (`role=status`) | Lire le contexte, annuler si sûr | Nouvelle copie/création concurrente |
| Transaction confirmée | « Enregistré — révision R (stockage local) » | Reprendre / exporter | Confondre avec un backup hors appareil |
| ACK perdu ou statut inconnu | « Enregistrement non confirmé — relire avant reprise » | Relecture du stockage + journaux | Retenter l'action non idempotente |
| `STALE_REVISION` / deux onglets | « Conflit avec un autre onglet — aucun écrasement » (`role=alert`) | Recharger, exporter le brouillon privé, comparer | Dernier écrivain gagne automatiquement |
| Journal attendu mais non durable | « Préparation non attestée : aucune nouvelle copie autorisée » | Revoir l'état CREATORS + ARCHIVES | Recréer l'instance |
| Une seule copie attestée | « Reprise possible : confirmer le même identifiant » | Confirmation MJ puis preuve finale | Nouveau `copyCreature`/`createScene` |
| Ancienne archive non attestable | « Reprise incertaine — intervention manuelle, originaux conservés » | Afficher source/ID pour MJ, export de conservation | Relink, suppression ou migration implicites |
| Origine joueur incorrecte | « Projection désactivée : fenêtre non vérifiée » | Vérifier config locale | Fallback vers page MJ contenant secrets |
| Scène changée, importée ou reprise | « Projection révoquée ; nouvelle sélection nécessaire » | Refaire aperçu public | `PLAYER_SHOW` automatique |
| Export local créé | « Archive **CONFIDENTIELLE** prête — conserver hors dépôt public » | Télécharger, vérifier SHA | Considérer l'export comme copie chiffrée |
| Échec quota/IDB inaccessible | « Sauvegarde impossible — conserver brouillon et exporter si possible » | Options de secours sûres | Effacer les stores, affirmer succès |

Les décisions sur réception transactionnelle et types d'erreurs sont du domaine ARCHIVES/BUILDER ; ces libellés sont des besoins STUDIO, **pas un contrat d'erreur adopté**. La proposition #104 expose concrètement `committed`, `duplicate`, `STALE_REVISION`, `TX_ABORTED`, `CAMPAIGN_COLLISION`, mais uniquement dans son banc B ; ne pas les imposer comme API P0.

## 7. Clavier, tablette, images et ardoise/cuivre/or

**Accessibilité** — ordre de Tab suivant la lecture, Entrée/Espace sur boutons, Échap sur dialogue sans perte d'édition, focus restauré après changement d'étape ou rerender, skip link vers scène, titres hiérarchiques, étiquettes et erreurs `aria-describedby`, statut `role=status`, conflit `role=alert` ; prévenir pièges clavier. Cibles tactiles **≥44×44 px comme objectif UX** ; test desktop 1280×800, tablette 768×1024, téléphone témoin 390×844, zoom 200 et 400 %, reflow 320 CSS px, lecteurs d'écran et contrastes en vrai rendu. Aucun de ces contrôles **R2** n'a été exécuté. Les images avec source, droits/licence, crédits, alt, variante et visibilité « privé / public opt-in » restent facultatives ; aucun chargement distant implicite.

**Palette non arbitrée** : #101 et #102 convergent sur fond `#14212D`, panneaux `#233347`, texte `#F4EFE5`, cuivre `#E4B179`, or `#E9C56E`, focus `#FFE299`. #104 utilise un **autre jeu exploratoire** (`#111C25`, `#1B2A34`/`#263642`, `#F1F4F1`, `#C99368`, `#E7C77B`). **UXR2-09 :** demander à BUILDER + ATELIERS une sélection documentée et un audit WCAG 2.2 AA sur rendu réel ; aucun CSS activé dans #95. Le contraste calculé sur quelques paires ne suffit pas à attester les erreurs, disabled, survols et composants non textuels. Privé/public se distingue par **structure, texte et choix de données**, jamais par cuivre/or seulement.

**Tablette** — vues en cartes/onglets, inspecteur en panneau repliable sans perdre l'état, barre de sauvegarde et accès à l'aperçu public toujours présents. Publication et suppression loin l'une de l'autre ; zone de notes étirable ; l'erreur de stockage reste lisible sans survol ni notification éphémère.

## 8. Ce que nous ne déduisons pas du prototype #104

Le banc BUILDER #104 sait faire **dans son propre format provisoire** `cer.arch-storage001.campaign.proposal.v0` : transactions IDB `campaigns+events`, opérations idempotentes, deux onglets et export privé. Il ne prouve **ni** adaptation des sources PJ/Bestiaire historiques octet-exact, **ni** la projection sur seconde origine, **ni** l'authentification MJ, **ni** les séances métier avancées, **ni** la compatibilité transversale avec #95. Son `EventJournal` est technique ; son `statusPublicOnly()` de démonstration ne peut pas remplacer le DTO joueur L003. En outre, son export lit snapshot et journal séquentiellement : la lecture atomique multi-stores fait partie des **réserves identifiées** avant adoption de B.

## 9. Recommandation de phase P1 et critères de sortie

1. **Maintenir #95 P0 inchangé** et ne rien importer depuis #104 comme nouvelle interface Studio.
2. Faire arbitrer par 01+04 les API de durabilité (`receipt`, révision, transaction, conflit, offline, import/export, identité) et le sort A/B/C. En attendant, conception UX uniquement.
3. Faire certifier par 11 INDEX/21 ATELIERS le schéma définition/variante/instance et la provenance native des médias/champs inconnus sans retraitement destructeur.
4. Construire *ultérieurement* un seul prototype UX sur les mêmes services ; mesurer one-shot et expert, permission projection + CLEAR, pannes et 2 onglets, puis clavier/tablette/lecteur d'écran/contrastes.
5. Soumettre au DG les décisions détaillées `UX_STUDIO_001_R2_DECISIONS_PASSATIONS.md`; aucune décision de publication ou de migration massive incluse.

**Verdict STUDIO : recevable comme convergence documentaire P1 ; aucun écran refondu ni parcours R2 testé.**

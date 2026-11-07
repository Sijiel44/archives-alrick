# Passations et fiche Direction — P1 DATA-MODEL-001 / UX-STUDIO-001
**Émetteur : 21 ATELIERS · 6 novembre 2026 · lecture et arbitrage P1 uniquement**

## Décision demandée
Autoriser une **phase de certification des contrats et du design**, pas une implémentation générale. Distinguer trois objets (définition, variante, instance), conserver état courant sur l'instance, et séparer en permanence : origine native, règles autorisées, narration, notes privées, fichiers média, canonicité, publication, fait joué. Cette séparation préserve les campagnes anciennes et prépare le Studio libre sans imposer les fiches legacy comme structure définitive.

Les dossiers sont hébergés dans **une branche P1 séparée** `proposal/p1-ateliers-data-model-ux-001`, créée à partir du P0 ATELIERS immuable **`#100@ceb316e00d667ba9d5155822fd57cabc931f3380`**. Les documents et tests P1 sont nouveaux sous `experiments/dg-lot004/src/creators/proposals/**` : aucun fichier P0, branche #95, code de moteur, site ou source historique n'a été touché.

## Livrables à examiner
1. `DATA_MODEL_001_SPECIFICATION.proposal.md` : preuves historiques des structures connues, tableau de correspondance par famille, contrat import/export, huit arbitrages bloquants.
2. `DATA_MODEL_001_SCHEMA.proposal.json` : JSON Schema 2020-12 de l'enveloppe candidate (**non adoptée**).
3. `DATA_MODEL_001_FIXTURES.proposal.json` : **14 fiches fictives** — PJ N1/10/25, définition+variante+instance créature, PNJ narratif, objet, capacité, sort, rite référencé et scène avec participants ; chaque fiche porte `legacy.fieldDecisions` et les inconnus en quarantaine.
4. `DATA_MODEL_001_VALIDATE.proposal.mjs` / `DATA_MODEL_001_CONTRACT.proposal.test.mjs` : contrôle **structurel de prototype**, pas validateur JSON Schema normatif ni importeur.
5. `UX_STUDIO_001_CONCEPTION.proposal.md` : deux parcours (one-shot guidé 15 gestes ; expert campagne libre), quatre wireframes texte, états d'erreur/abandon, accessibilité, palette ardoise/cuivre/or **non chargée**.

## Preuve technique disponible
- Relecture de fichiers du dépôt et ancrage Git blob exact : BestiaryCard `4dd84b20ee0ff213a0c8f17ad172fafbd5bd9c10`, éditeur descriptif L003 `b53f1868baa8a5eb5ed4415000247a128e668846`, Studio L003 `5ce963e6120404f7cadbf6512cb0639c2adc888f`, adaptateurs ARCHIVES `aa8a28950b5ddab90fd8ba7b56c7934e489f45c5`, stockage L003 `444066ca6dbeaf59a9f8097e550bfff6105e47c7`, INDEX L004 `27ffd1dbb520eed8fff3efd293948c94ea57cf95`.
- Exécution V8 des **sources/tests P1 exacts récupérés de GitHub** : **6/6 contrôles structurels PASS**, 14 fiches, 8 familles, N1/10/25, références vérifiées, droits, canaris et interdiction de canon/joué automatiques. Une transformation en version source native numérique est testée comme distincte du SemVer enveloppe.
- Contrastes calculés pour les paires proposées : ivoire/ardoise profonde **14,26:1**, ivoire/panneau **11,20:1**, sombre/cuivre **8,45:1**, sombre/or **9,86:1**, focus/ardoise **12,91:1**. Ce sont des calculs sur paires, **pas une certification WCAG du futur site**.
- **Non exécuté** : `node --test` sur checkout GitHub ; validation du JSON Schema complet par une bibliothèque certifiée ; passage sur les 15 archives brutes, Grimoire/RitualDefinition complet, vraie UI/canaris navigateurs, tests clavier/lecteur d'écran, recette Chrome 4173/4174, CI composite, revue légale des images, migration réelle. Aucun test mécanique M01–M05 par les prototypes P1.

## Passation 11 🔗 INDEX — catalogue et identités
**À instruire :** nomenclature globale des `recordId` et collisions de versions; `definitionRef` vers `variant` et non l'inverse ; quelle source est reconnue comme `mechanics.nativeId` ; où finit la définition `AbilityDefinition`/sort/rite et où commence l'effet natif M02/M03; validation des liens `item → capability → creature → scene` sans les convertir en effets.

**Livraison attendue d'INDEX :** matrice `entityType ↔ schéma actuel ↔ référence mécanique`, IDs et versions, champs interdits/obligatoires, règles de stabilité et de provenance. Les `pj:...` ARCHIVES doivent rester tels quels. **À ne pas faire :** autoriser une valeur numérique, XP, coût, mana, soin ou capacité depuis nos exemples narratifs.

## Passation 04 🗄️ ARCHIVES — imports, sauvegardes, originaux
**À instruire :** inventaire authentifié des schémas PJ v2/v3, `BestiaryCard` et sources historiques, différences réellement présentes sur les fichiers, manifest SHA256 et décisions par champ. Définir `previewLegacyImport` / `confirmImport` avec conservation de la source brute, attribution du format inconnu, collisions id/version, ressources médiatiques, permissions et *fidelity*. Définir `expectedRevision`, idempotence, sauvegarde atomique (ou refus sûr), accès sécurisé aux inconnus et contrat d'export privé.

**Garde P0 inchangée :** `pendingStudioOp` exige lecture indépendante du journal et de la campagne STUDIO après écriture. Une vieille archive sans preuve d'identité reste bloquée, pas réécrite. **À ne pas faire :** utiliser un schéma de fiche P1 pour restaurer une campagne DG003 existante ou vider un namespace.

## Passation 01 🧱 BUILDER — architecture et navigation
**À instruire :** vérifier que la future architecture web accueille une seule bibliothèque de définitions et des instances de campagne indépendantes, sans imposer le moteur autoritaire Discord ni un serveur pour le mode local. Réviser arborescence et mode guidé/expert sur les maquettes; définir navigation et responsabilités entre P0 réparé et P1 futur. Si nouvelle fondation applicative : documenter compatibilité import/export, rollback non destructif et ouverture progressive sans reprendre toutes les fiches immédiatement.

**À décider :** nombre d'écrans/étapes initiales, responsabilité du client pour la recherche, import de documents, copie d'instance et présentation; origine de la charte visuelle, aucun CSS chargé en production sans revue.

## Passation 20 🎛️ STUDIO — cockpit et confidentialité
**À instruire :** interface `definition / variant / instance / currentState`, participants par ID d'instances, ligne éditoriale privé/public, Clear à chaque changement de scène. Définir tests d'interaction pour un one-shot novice et campagne expert sur tablette/clavier. La charte ardoise/cuivre/or est **proposition**, pas une autorisation de modifier #95.

**P0 distinct :** corriger le helper `confirmCreatorAttachmentWithEvidence` pour `await creator.inspectStudioRecovery()` et `durableVerified:true` sans exposer le canari. L'incompatibilité antérieure a été transmise à #98, sans patch cross-owner.

## Passation 00 🧭 DG / QA / REVUE — gates
- **P0** : priorité exécutive à #95 avec vrais adaptateurs, journal attesté, CI/Chrome et QA indépendant sur nouveau SHA ; le dossier P1 ne prouve rien sur cette intégration.
- **P1 DATA-MODEL** : accepter seulement après (i) inventaire source des familles, (ii) choix des identités/versions INDEX, (iii) preuve de restauration non destructive par ARCHIVES, (iv) gouvernance des trois statuts, (v) essai contradictoire d'import/collision/extension inconnue.
- **P1 UX-STUDIO** : accepter seulement après (i) arbitrage architecture, (ii) essais MJ débutant/expert, (iii) contraste et accessibilité sur interfaces réelles, (iv) canaris joueur et droits médias, (v) repli tablette + clavier; aucune interface finale avant ces gates.

## Risques et décisions encore ouvertes
- Quelles anciennes fiches seront seulement référencées, lesquelles pourront fournir une vraie définition versionnée ?
- Une variante chiffrée N10 ou N25 doit-elle porter un profil M04 complet distinct ou uniquement sa référence ?
- Comment garantir l'immutabilité logique d'une définition déjà utilisée par plusieurs campagnes ? Identité et fork de version.
- Comment représenter des relations PNJ non mécaniques sans imposer un profil M03 ?
- Où conserver médias et droits lorsqu'un ancien document contient une image sous licence inconnue ?
- Comment empêcher qu'une archive anciennement jouée transforme une proposition en canon ?
- Comment distinguer une scène narrative réutilisable d'un événement joué avec ses secrets/participants ?
- Quel contrat de rollback pour un import refusé ou interrompu entre deux stockages ?

**Verdict DG sollicité : RECEVABLE COMME PROPOSITION DE CONCEPTION, NON HOMOLOGUÉ.** Aucune migration, publication, effet, merge, changement des règles ou de la branche P0 n'est autorisé par cette remise.


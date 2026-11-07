# ARCH-STORAGE-001 — recette navigateur isolée proposée (deux PJ, créature, deux scènes, panne, deux onglets)

**Spécification de test, NON EXÉCUTÉE.** Ce scénario est un **critère de choix A/B/C** pour 01 BUILDER et 04 ARCHIVES, pas un script de validation du candidat P0. Aucun changement de code source, aucun navigateur réel lancé dans cette mission. À porter dans le futur banc P1 **après** décision de modèle/ports. Ne pas employer de vraies données personnelles ou MJ.

## Préconditions contrôlables

- Checkout d'une branche P1 distincte, commit SHA exact consigné ; Node et navigateur/version notés ; réseau externe fermé. Serveurs locaux dédiés à `127.0.0.1:4173` (MJ) et `127.0.0.1:4174` (projection joueur), pas de port ouvert à `0.0.0.0`. Le banc de P0 #95 reste indépendant.
- Profil de navigateur de test isolé, avec possibilité de **précharger une clé étrangère**. Snapshot local et empreinte SHA256 **avant** toute action. Un autre profil vierge vérifie la démo propre.
- Fiches fictives source PJ-A et PJ-B, `alrick.sheets.v3` et extensions inconnues : PJ-A « Aëlia » (caractéristique brute 14), PJ-B « Néro » (caractéristique brute 8) ; chaque original a un SHA256 calculé. Créature BEST fictive source (`documentId`, `profileId`, `ruleset`) distincte de son instance.
- Scène A « Passage de brume » : description publique « Deux silhouettes attendent près du gué » ; notes MJ = `CANARI_MJ_SCENE_A_2026`. Scène B « Hall englouti » : texte public « Une porte se referme » ; notes MJ = `CANARI_MJ_SCENE_B_2026`. Les canaris doivent apparaître **uniquement** dans l'état privé MJ et l'export CONFIDENTIEL.
- Un dossier de preuves local non suivi par Git avec captures (MJ uniquement si confidentielles), journaux TAP/Chrome, données fictives, hashes/export et diff des clés. Ne publier aucun vrai fichier de campagne.

## Parcours vérifiable

| Étape | Geste automatique ou humain | Observation requise / oracle | Classe |
|---|---|---|---|
| S00 | Capturer clés/valeurs privées étrangères byte-exactes, état d'installation, origine et fenêtre joueur fermée. | Baseline SHA, aucune mutation. | P0 confidentialité |
| S01 | Ouvrir la campagne locale vide, choisir explicitement **mode fictif** et créer campagne `camp-P1-001`. | Mode visible, ID et schéma stables, aucun accès aux autres campagnes. | P1 usage |
| S02 | Prévisualiser PJ-A ; accepter ; prévisualiser PJ-B ; accepter. Refaire un clic d'acceptation sur le même aperçu. | **Deux PJ exactement**, IDs distincts, provenance/hash source intacte ; refus doublon ; valeur brute 14 non plafonnée. | P1 données |
| S03 | Résoudre source créature, copier une seule instance. | `sourceId`/`profileId`/`ruleset` conservés ; `instanceId` neuf ; pas de mutation du catalogue public. | P1 références |
| S04 | Créer scène A, participants PJ-A, PJ-B + créature ; notes privées canari A. | Participants par ID, champs publics/privés séparés. Révision durable après ACK. | P1 modèle |
| S05 | Créer scène B avec PJ-B + créature ; canari B, sélectionner B puis A. | `activeSceneId` revient à A après reload ; B demeure ; aucun SHOW automatique ; si joueur ouvert, CLEAR. | P0/P1 |
| S06 | Ouvrir joueur sur origine 4174, envoyer READY puis sélectionner explicitement **titre et PJ-A seulement** pour A. Publier. | DTO joueur contient seulement titre et label PJ-A, pas de PJ-B/créature non cochés, pas de canari ni IDs/fiches/source ; `event.origin/source` corrects. | P0 sécurité |
| S07 | Changer vers B, revenir A ; relancer le joueur sans sélection MJ. | CLEAR et état vide, même si ancien DTO avait été affiché ; pas de réémission automatique après reload. | P0 sécurité |
| S08 | Onglet MJ A : modifier note privée scène A et sauvegarder avec révision R. Onglet MJ B a R-1 ouvert et tente de sauvegarder scène B. | Soit **conflit explicite** avec option actualiser/résoudre, soit politique mono-éditeur contrôlée ; jamais écrasement silencieux A. Reporter ordre des commits/revisions. | P1 concurrence |
| S09 | Injecter panne **avant** écriture d'un `pendingStudioOp`, demander une création. | Aucune instance ajoutée, ancien état inchangé. Réessai explicite seulement après contrôle. | P1 crash |
| S10 | Injecter panne **après** journal durable et **après** création réelle mais avant ACK final du lien créateur. Recharger les deux magasins. | Un seul ID instance ; preuve durable ou état bloqué ; confirmation MJ rattache **ce même ID**, jamais de seconde copie. | P0/P1 reprise |
| S11 | Injecter panne au milieu de `updateScene`/sauvegarde ; couper l'onglet entre ACK en mémoire et flush durable. | Réouverture affiche dernier état durable ou alerte d'écriture incertaine ; pas de note perdue présentée comme sauvegardée. | P1 durabilité |
| S12 | Restituer une **ancienne sauvegarde sans journal** et avec instance existante, puis deux candidats de même provenance. | `unattestable` / `ambiguous` => arrêt de reprise automatique ; aucun lien arbitraire ni suppression compensatoire. | P0 sécurité des données |
| S13 | Exporter archive privée, consigner taille/hash, tester restauration en **aperçu** puis confirmer sur instance distincte, recharger. | PJ originaux byte-exacts, extensions inconnues, IDs, deux scènes, notes privées A/B, point de reprise et révision conservés ; aucune projection joueur issue du restore. | P1 sauvegardes |
| S14 | Précharger une clé créateurs externe à la démo, tenter ouverture/sortie/nettoyage. | Refus ou conservation byte-exacte du préexistant ; aucun nettoyage hors ressources prouvées appartenir à la session de test. | P0 intégrité |
| S15 | Débrancher réseau après chargement local ; naviguer, éditer scène et exporter. Tester réouverture hors ligne selon contrat P1. | Affichage du mode hors ligne, édition locale préservée ; absence de demande réseau tiers, ressources absentes annoncées. | P1 offline |
| S16 | Rejouer écran 1280×800, 768×1024, 390×844, clavier Tab/Shift-Tab, zoom 200%, lecteur d'écran si disponible. | Focus explicite, pas de scroll horizontal, états privés/publics discernables sans couleur, boutons >=44×44, pas de piège clavier. | P1 UX |

**Preuve à produire pour chaque étape** : `caseId`, SHA source/bundle, horodatage local, appareil et navigateur, préconditions, état avant/après, IDs et révisions sans secrets, PASS/FAIL/NON EXÉCUTÉ, logs d'erreur, fichier de preuve référencé par chemin privé. Pas d'affirmation « PASS » sur une simple lecture du code.

## Injections adversariales minimales

1. `storage.save` rejette avant mutation (sans journal) : aucun effet STUDIO.
2. `storage.save` confirme le journal, `copyCreature` réussit, commit du lien rejette : **une seule copie**, statut `requires-confirmation` après **deux relectures durables**, confirmation MJ et même ID.
3. Entre lecture et confirmation, onglet B modifie l'instance, la source ou la campagne : `conflict/stale/wrong-campaign`, réinspection obligatoire.
4. `getStudioRecovery()` mémoire « semblant valide » mais `inspectStudioRecovery()` refuse la durabilité : **aucun relink** ; ne pas remplacer l'API asynchrone.
5. Save concurrent de note A et édition scène B : une écriture ne peut pas effacer l'autre sans conflit visible.
6. Une archive originale importée de plus de 5 Mio et jusqu'à 16 Mio doit être acceptée seulement **si le format et les règles ARCHIVES le permettent** ; rappel : le plafond 5 Mio est le flux UI PJ, **16 Mio** la restauration privée. Au-delà, refus avant mutation.
7. Accusé de write suivi de crash : vérifier ce que le navigateur a *réellement* rendu durable ; ne pas assimiler résolution de `Promise` à transaction multi-magasin.
8. Tentative d'introduire canari dans extension inconnue/public DTO : serializer whitelist exclut l'extension ; une chaîne publiquement cochée avec canari écrit par erreur doit afficher une alerte éditoriale **proposée**, sans présenter la whitelist comme filtre sémantique.

## Scoring comparatif A/B/C

Noter chaque solution sur une grille commune, **sans résultats anticipés** :

- **Exactitude (bloquant)** : 0 perte de champ/byte sur cas S02/S13, 0 duplication sur S09–S12, 0 fuite sur S06–S07, 0 écrasement de clé étrangère S14.
- **Reprise multi-onglets (bloquant P1)** : refus ou résolution explicite de tout commit obsolète S08.
- **Durabilité** : différencier « sauvegardé », « pending », « inconnu », temps de reprise constaté ; horodatage et captures avant/après.
- **Ergonomie** : nombre d'actions guidées, erreurs récupérables et focus, écran tablette/téléphone sans perte de données.
- **Coûts** : complexité des adaptateurs, migration progressive des anciens exports, maintenance et réversibilité, stockage du navigateur réel.

Une solution A/B/C ne gagne pas en seul argument « technologie moderne ». Le responsable 01 + 04 consolide mesures et arbitrages. **Statut actuel du scénario : NON EXÉCUTÉ**.

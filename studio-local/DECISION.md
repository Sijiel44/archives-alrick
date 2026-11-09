# Décision de reprise du Studio

Relevé GitHub du 7 novembre 2026. Branche de travail locale `codex/studio-local-pilote`, issue de `main` à `88f774f3d0d6d520d8d11443b72202b9caf4f94b`. Les six PR examinées sont ouvertes en brouillon et leurs bases diffèrent. Chaque résultat ci-dessous vaut pour le SHA indiqué.

| Référence | HEAD | Fichiers et résultats observés |
| --- | --- | --- |
| main | `88f774f3d0d6d520d8d11443b72202b9caf4f94b` | Archives Quartz, règles et ateliers historiques. CI Archives et sauvegarde vertes. [Workflow Pages](https://github.com/Sijiel44/archives-alrick/blob/88f774f3d0d6d520d8d11443b72202b9caf4f94b/.github/workflows/pages.yml) |
| #95 | `6004369bc1192f1619ecb0fb71182315be947e6b` | L003/L004, Studio, projection, adaptateurs et recette. L004 échoue après ses contrôles Chrome et S01–S09, sur le banc strict des parents causaux. Archives, L003 et Builder verts. [PR #95](https://github.com/Sijiel44/archives-alrick/pull/95) · [CI L004](https://github.com/Sijiel44/archives-alrick/actions/runs/42343142587) |
| #110 | `7277d0f64e31fe7198135a3d287ae9413a3df705` | Basée sur #95. Runtime, preuves de provenance et correctifs de concurrence. Banc de secours vert avec Chrome L004/L003. L004, L003 et Archives échouent dans leurs workflows propres. [PR #110](https://github.com/Sijiel44/archives-alrick/pull/110) · [Secours](https://github.com/Sijiel44/archives-alrick/actions/runs/42370878514) · [L004](https://github.com/Sijiel44/archives-alrick/actions/runs/42370878492) · [L003](https://github.com/Sijiel44/archives-alrick/actions/runs/42370878552) · [Archives](https://github.com/Sijiel44/archives-alrick/actions/runs/42370878496) |
| #104 | `f84f8c54361b3701ebb0251700f2d0d09d4acf4d` | Prototype isolé, contrat candidat et essais IndexedDB. Banc dédié et Archives verts. [PR #104](https://github.com/Sijiel44/archives-alrick/pull/104) · [CI](https://github.com/Sijiel44/archives-alrick/actions/runs/42301603251) |
| #106 | `f254d9cfa2cf9b630b933945d7734b5ac98db18c` | Basée sur #104. Lecture atomique de l’export, comparaison A/B et garde-fous de restauration. Banc dédié et Archives verts. [PR #106](https://github.com/Sijiel44/archives-alrick/pull/106) · [CI](https://github.com/Sijiel44/archives-alrick/actions/runs/42332414592) |
| #107 | `86ae6e2823af40e875de58bb407b1f04feee3cfd` | Fixtures Ateliers #102 vers validateur/export #105, puis candidat `creatorDrafts` du prototype. CI Archives verte. Le parcours composite natif reste à exécuter. [PR #107](https://github.com/Sijiel44/archives-alrick/pull/107) |
| #108 | `bb04b5ca3eb115445953f7f6e89feab5c1f00f3d` | Enveloppe #105 complétée par identités et statuts facultatifs, conservation de l’original et projection privée INDEX candidate. CI Archives verte. Ports natifs M01/M03 et fixtures originales #102 à vérifier. [PR #108](https://github.com/Sijiel44/archives-alrick/pull/108) |

Deux résultats #95 éclairent des défauts distincts. Sur le HEAD de #95, la commande `node --import tsx --test experiments/dg-lot004/tests/storage/P0_CAUSALITY_ARCHIVES.test.mjs` refuse les trois écritures en conflit. Le banc utilise une instance B sans lecture préalable pour l’attester. Une recette QA indépendante sur un descendant de #95 a montré qu’une instance C, après lecture de R5, pouvait écraser une scène récente en soumettant des données R4 étiquetées R9. Les modules de stockage/runtime y étaient réels, avec des doubles de stockage et de verrous. [Recette QA](https://github.com/Sijiel44/archives-alrick/actions/runs/42367226454)

Sur #110, la commande locale `node experiments/dg-lot003/tools/test-unit.mjs`, après build, a reproduit deux messages `cer.dg003.player.clear` là où le test en attend un. Le changement asynchrone réinitialise la sélection avant et après l’attente. Le banc L004 des propriétaires, lancé après build avec `node --test experiments/dg-lot004/tests/studio/*.test.mjs experiments/dg-lot004/tests/studio/L004_PENDING_REAL_INTEROP.mjs`, échoue sur cinq assertions d’action de création de scène. Le job Archives échoue à `npm run test:m04:browser`. Sur le même SHA en local, le build suivi de cette commande a réussi 22 scénarios avec Chrome 156.0.8078.80 sur Windows et Node 24.22.1. La cause de l’échec CI reste inconnue. Les annotations publiques donnent le code de sortie et les journaux de job complets ont renvoyé HTTP 403.

## Voie retenue

| Voie | Intégrité et effort sur le parcours de reprise | Maintenance et évolution |
| --- | --- | --- |
| A · Consolider L003/L004 | Reprendre l’intégration et qualifier le correctif de causalité, les écritures historiques et les appels asynchrones sur plusieurs bancs. | Réemploi maximal des interfaces et adaptateurs, avec plusieurs chemins d’écriture à maintenir. |
| B · Refaire la persistance et une partie des interfaces | Le prototype démontre une piste transactionnelle. Raccorder immédiatement les anciens modèles réintroduirait leurs adaptateurs et leurs incompatibilités dans le premier essai. | Voie de convergence possible par import explicite ou adaptateurs après un essai du nouveau contrat. |
| C · Fondation applicative locale ciblée | Un parcours autonome peut être vérifié avec une transaction par commande et un format de sauvegarde versionné. | Choisie pour le pilote. Les moteurs et les sources restent disponibles pour des raccords fins ultérieurs. |

Le pilote reprend de #106 le principe campagne et journal atomiques, la révision attendue, l’identifiant d’opération, l’aperçu d’archive et l’import sans remplacement. La comparaison A/B du prototype révèle une écriture perdue dans la variante à enveloppe `localStorage`. Son contrat candidat et son archive ne sont pas adoptés. Le pilote vérifie ses propres références de participants et sépare les sources du catalogue de leurs exemplaires. Les commandes ne modifient que les éléments visés. Les formats inconnus ou incompatibles sont refusés à la frontière de restauration. Le stockage et l’affichage sont propres au Studio local.

Sur le HEAD exact de #106, le banc Node des deux fichiers `contracts.test.mjs` et `r2-contracts.test.mjs` a réussi 19 contrôles avec des données fictives et un double `localStorage`. Les commandes `python experiments/arch-storage-001/tests/browser.spec.py` et `python experiments/arch-storage-001/tests/browser-r2.spec.py` ont réussi B01–B17 dans Chrome 156.0.8078.80 sur Windows, avec Playwright Python 1.56.0. Le quota y était injecté. Ces résultats concernent le prototype.

La projection est un document sandboxé sans script, produit à partir du titre et du texte explicitement cochés. Les descriptions de scène peuvent être projetées sur décision du MJ. Le champ de notes privées et les autres données de campagne ne sont pas transmis à ce document.

## Moteurs à raccorder

Les fichiers suivants sont dans `quartz/components/scripts/`. Les tests historiques restent les références de parité. Les valeurs de niveau du pilote servent à saisir des profils, sans progression calculée.

| Module | Entrée réutilisable | Dépendances principales |
| --- | --- | --- |
| M01 · Progression | `atelier5d6-progression.ts` | Probabilités exactes `atelier5d6-probabilities.ts` |
| M02 · Capacités et développement | `atelier5d6-m02.ts` | M01, origines et schéma `alrick.sheets.v3` |
| M03 · Combat et profils | `atelier5d6-combat-m03.ts`, `atelier5d6-bestiary.ts` | M01, contrats M02 et opposition |
| M04 · Atelier bestiaire | `atelier5d6-bestiary-workshop.ts` | M01/M03, probabilités et UI Quartz séparée |
| M05 · Fiches vivantes | `atelier5d6-m05-sheet-view.ts` | Dérivation des sorties précédentes, rendue par `atelier5d6-m05-sheet-dom.ts` |

Le projet historique utilise Node 24, TypeScript, esbuild et tsx. Le Studio s’exécute avec les API natives du navigateur et un serveur Node sans dépendance d’exécution ajoutée. Le dépôt est marqué `private` et `UNLICENSED` dans le manifeste npm. Le MIT de Quartz et le GPL-2.0 du thème ITS ont leur portée propre. Les droits d’extraction des moteurs originaux et de diffusion du contenu doivent être établis pour un nouvel usage public. [Provenance technique](https://github.com/Sijiel44/archives-alrick/blob/88f774f3d0d6d520d8d11443b72202b9caf4f94b/UPSTREAM.md)

## Qualification et étapes suivantes

L’archive privée doit être conservée hors du profil. L’accès local repose sur le profil navigateur. La projection intégrée n’est pas un espace joueur distant. Les essais automatisés ne qualifient ni la saturation physique du disque, ni une coupure secteur, ni la restauration de données historiques. Un nouvel onglet ou un rechargement nécessite que le serveur local fonctionne.

Contrastes calculés sur les couleurs du pilote avec la formule de luminance sRGB. Le texte principal sur panneau est à 11,98:1, le texte du bouton cuivre à 7,42:1 au repos et 9,39:1 au survol. Le focus sur la surface claire est à 6,25:1, le texte du bouton désactivé à 6,21:1 et le texte d’erreur à 12,21:1. Ces mesures couvrent ces couples de couleurs. La navigation avec lecteur d’écran reste à essayer.

Le prochain lot couvre les ateliers et l’Atlas. Il peut commencer par des fiches d’objet et de capacité, puis raccorder un exemple à un moteur natif par un adaptateur avec test de parité. Le Hub joueur, les journaux, les interludes et le mentorat relèvent des lots suivants. Les suggestions XP resteront distinctes d’une attribution confirmée par le MJ. Un paquet d’aventure partageable aura un format distinct de la sauvegarde jouée.

Pour un accès de test, préparer un paquet d’actifs du Studio seul, une origine distincte, un contrôle d’accès vérifié et un jeu de données fictives. Vérifier les chemins, en-têtes, caches et téléchargements sur cette origine avant une décision de publication. Conserver un paquet précédent et les archives locales pour le retour arrière. Le workflow Pages historique ne sert que la sortie Quartz `public/` et se déclenche depuis `main` lors d’un changement du marqueur ou d’un lancement manuel approuvé. Une mise en ligne du Studio attend un choix explicite du public, de l’hébergeur et des conditions d’accès.

## Première évolution issue du Lab

L’addendum et la fiche Direction du 7 novembre 2026 cadrent la conception. Le feu vert donné ensuite par le créateur autorise la réalisation locale. La première tranche reprend les scènes existantes dans une Fresque horizontale et une vue liste, ajoute des liens narratifs orientés, puis rapproche la recherche et la création d’une scène de la régie **Jouer**.

L’ordre réutilise la collection de scènes et les liens pointent vers leurs identifiants stables. Les conditions sont des indications écrites pour le MJ. La création d’une scène improvisée et son éventuelle activation se font dans la même transaction. Les commandes utilisent les révisions et le journal du pilote. Les campagnes du pilote s’ouvrent dans la même base IndexedDB. L’archive v2 identifie les campagnes ayant utilisé les nouvelles opérations et le lecteur accepte les archives v1.

Les types de cartes supplémentaires, l’archivage des séances, la fenêtre joueur distincte et les médias font partie des tranches ultérieures de la feuille de route. La recette de cette tranche porte sur le trajet préparation, improvisation, projection et restauration ainsi que sur les commandes accessibles de la Fresque.

## Cockpit et archives de séance

La phase **Archiver** ajoute une collection optionnelle à la campagne. La base IndexedDB conserve sa version, et les écritures reprennent les transactions, révisions et identifiants d’opération du pilote. L’export privé passe en v3 dès qu’il contient une archive de séance. Les archives v1 et v2 restent restaurables. L’ouverture d’une ancienne campagne sans écriture d’archive conserve son format d’export.

La Fresque déduit le statut « Jouée et confirmée » des scènes cochées dans les archives. L’ouverture d’une scène, la projection et le point de reprise restent distincts de cette confirmation. Retirer une confirmation dans une archive remet la scène au statut « Préparée » si aucune autre séance ne la confirme.

L’archive privée enregistre résumé, repères, point de reprise et texte de chronique. La copie et le téléchargement relisent l’approbation et le texte dans IndexedDB avant de remettre uniquement le texte de chronique. Modifier ce texte retire son approbation. Cette action locale fournit du texte prêt à partager par le MJ.

## Repères de la Fresque

Les indices, lieux et conséquences possibles sont des repères de préparation privés. Chacun peut pointer vers une scène de la campagne ou rester en réserve. Un rattachement se modifie depuis la fiche. En séance, seuls les repères de la scène active sont affichés dans la régie MJ. La projection reçoit toujours le titre et la description de scène choisis séparément.

Les repères utilisent une collection optionnelle et les mêmes transactions que les scènes. La taille des cartes et le filtre sont des contrôles de présentation. L’export privé passe au format v4 après une opération sur les repères. Les formats v1 à v3 restent importables, et les campagnes existantes conservent leur format d’export tant qu’une opération plus récente ne le requiert pas. La confirmation d’un fait joué reste une action d’archivage.

## Bibliothèque et provenance des variantes

La bibliothèque construit un index en mémoire à partir des campagnes du profil et de deux sélections de référence. Le bestiaire de démonstration réutilise les trois créatures illustrées. Quatre lieux publics des Archives ont été retenus à la révision de `main` indiquée plus haut selon leur visibilité publique, leur portée `univers_partage` et leurs statuts `lore_valide` et `valide`. Le Studio sert les résumés localement. Le lien de la fiche ouvre la source épinglée, sur action du MJ. [Sources des lieux](https://github.com/Sijiel44/archives-alrick/tree/88f774f3d0d6d520d8d11443b72202b9caf4f94b/content/lieux)

Les repères, PJ et copies de créatures proviennent d’IndexedDB. La bibliothèque recherche dans le profil local. La régie **Jouer** limite les fiches privées à la campagne active. Les descriptions de repères sont privées et accessibles depuis l’aperçu. Les notes de PJ et de scènes sont exclues de l’index. Le format de projection conserve son périmètre de champs choisis.

Un repère copié conserve `sourceSchema`, `sourceId` et `sourceVersion`. Pour les Archives, `sourceVersion` est le SHA du fichier Git à la révision épinglée. Pour un repère personnel, la provenance inclut l’identifiant et la révision de sa campagne source. L’identifiant du nouvel exemplaire et ses champs éditables sont indépendants. Le lecteur restitue la provenance même si la campagne source est absente du profil. Il fabrique un lien externe uniquement pour une référence d’Archives reconnue à sa version exacte. L’export v5 conserve le repère et sa provenance dans la même transaction de campagne. Les anciennes archives v1 à v4 restent lisibles.

Cette première sélection couvrait le bestiaire, les PJ, les repères et quatre lieux d’Archives. La forme de provenance suit la terminologie étudiée dans le prototype INDEX, où le raccord mécanique reste à qualifier. [Prototype INDEX](https://github.com/Sijiel44/archives-alrick/pull/105)

## Protocole et premier raccord au moteur 5d6

Le Studio utilise `resolveProgressionAction` et `rollFiveDice` des sources TypeScript historiques. Le serveur local retire leurs annotations de type avec Node 24 et sert ces deux modules depuis une liste de chemins autorisés. Le dépôt complet fournit les sources au lancement. La régie et les fonctions existantes restent accessibles si le chargement du moteur échoue. [Sources du protocole et raccords par module](PROTOCOLE-JEU.md)

L’arbitrage fixe l’intention, les enjeux et les paramètres avant le jet. Le journal conserve les valeurs saisies et les faces plutôt qu’un deuxième calcul. Il restitue les résultats avec le moteur M01 et garde la conséquence choisie par le MJ. Une écriture vérifie la scène courante et utilise la révision attendue. Une même opération peut être rejouée après perte d’acquittement. L’archive v6 inclut ce journal et le lecteur accepte les sauvegardes v1 à v5.

## Rayons, Atlas et Univers

Le catalogue local est généré par `node studio-local/build-catalogue.mjs` depuis la révision `main` épinglée plus haut. Il contient 92 références. Le générateur vérifie la publication, la visibilité et la portée des pages sélectionnées. Les trois objets de campagne sont des exceptions publiques explicites. Les références techniques et le modèle d’objet sont sélectionnés individuellement. Les six sorts proviennent des littéraux du Grimoire et portent le statut de prototype. Le statut du canon, l’origine et les catégories sont des champs distincts. Les huit schémas SVG de l’Atlas sont les seules ressources historiques supplémentaires servies comme images.

Les liens wiki des sources sont rapprochés uniquement avec les fiches présentes dans le catalogue. Les raccourcis Markdown de la régie ciblent ces mêmes références et les démonstrations du Studio. Les chaînes non résolues restent du texte. Les liens utilisent des éléments DOM et des destinations locales construites à partir des identifiants connus. La découverte publique conserve son propre script. Le chargement du catalogue est autorisé sur son seul chemin local dans la régie.

L’Atlas et le Bestiaire réemploient les commandes de repère et de copie de créature. L’enregistrement privé utilise les mêmes schémas et versions de sauvegarde. L’intégration des fiches mécaniques et des ateliers reste un raccord distinct des fiches descriptives et de leurs sources.

## Atelier du Bestiaire et présentation du Studio

La navigation sépare campagne, ressources et conservation. Les vues partagent les mêmes en-têtes et distinguent les commandes de table, les références et la diffusion. La bibliothèque propose une préférence locale pour les cartes ou la liste. Les panneaux de création et d’aperçu de l’Atelier s’affichent côte à côte sur grand écran et s’empilent sur mobile.

L’Atelier réutilise `createBestiaryCard` et `validateBestiaryCard` de M04 et `deriveM05Sheet` pour la lecture du profil. Le serveur sert leurs modules historiques depuis des chemins autorisés. L’import de l’export individuel `alrick.bestiary.v1` valide le JSON avant la normalisation. L’exemplaire de campagne conserve le profil normalisé et l’objet source importé, dont les extensions JSON admises. Un profil composé ou importé reçoit un nouvel identifiant d’instance. La sauvegarde privée v7 le conserve avec la campagne et le journal de révisions. Les sauvegardes v1 à v6 restent restaurables.

En séance, le profil peut renseigner la caractéristique et la maîtrise choisies dans le formulaire M01. Les seuils et absorptions M03 sont consultables. Le raccord des exports `alrick.sheets.v3` relève du lot PJ. [Atelier historique](https://github.com/Sijiel44/archives-alrick/blob/88f774f3d0d6d520d8d11443b72202b9caf4f94b/content/jouer/atelier-bestiary-5d6.md)

## Opposition M03 et PV de campagne

`opposition.mjs` adapte les dés et les champs de l’annonce pour `resolveCombatM03`. Les profils mécaniques M04 fournissent la défense via `toDefense`. Mêlée et tir sollicitent la résistance physique, magie la résistance magique et influence mentale la résistance mentale. Une action impossible emprunte le parcours sans jet du Studio.

L’opération `record-opposition` vérifie la révision et la présence de la cible dans la scène courante. Elle calcule l’impact depuis le profil enregistré et enregistre la décision et les PV avant et après dans la même transaction IndexedDB. Les PV en jeu dérivent du dernier événement concernant l’instance. Le profil source conserve ses PV maximum. Un même identifiant d’opération permet un réessai après perte d’acquittement.

L’archive privée passe en v8 à la première opposition consignée, y compris quand les PV sont conservés. À la restauration, le lecteur vérifie le journal, la continuité des PV et le montant proposé par M03. Les formats v1 à v7 restent pris en charge. La projection reçoit uniquement les champs de scène sélectionnés. [Feuille de route](FEUILLE-DE-ROUTE.md)

## Import de la fiche PJ M02

Le Studio lit les exports `alrick.sheets.v3` et propose les entrées de type PJ sous le système M02. Il contrôle la structure et réutilise `evaluateSheet` pour vérifier le budget et les capacités. Il conserve la fiche choisie avec ses extensions dans l’archive privée v9. Le rattachement conserve l’identifiant du PJ de campagne, son nom et ses notes. Les sauvegardes v1 à v8 restent restaurables.

La fiche source fournit les valeurs brutes, les maîtrises et le profil de défense. Le journal M03 part des PV actuels indiqués par l’export et conserve chaque transition confirmée. Le profil source reste une référence immuable. La projection garde sa sélection de champs de scène.

Le parcours guidé utilise les listes d’origines historiques et `draftFromLifePath`. Il reprend le niveau 5 et la convention de ressources initiales de l’Atelier M02. Le mode de transmission, la lecture et les champs libres restent descriptifs. L’aperçu utilise la fiche M02 existante et l’action finale réemploie la commande d’ajout de fiche v9 avec un nouvel identifiant de campagne. La consultation du récit reste dans la régie privée.

## Vue joueur temporaire

La régie construit une projection à partir de champs cochés explicitement. Le rendu de l’aperçu et de la fenêtre utilise le même document HTML et échappe les textes. Les noms et quantités constituent le seul contenu de l’inventaire projetable. Les contrôles de révision empêchent de présenter un aperçu devenu périmé.

La route `/joueur` s’exécute sous une politique CSP sandboxée à origine opaque. Elle charge uniquement le script de réception. Un ticket temporaire lie le message de préparation à la fenêtre ouverte par la régie. Un port de message transmet le document expurgé et le signal de retrait. La fenêtre perd son lien à l’ouvreuse après l’établissement du port. La sauvegarde, les identifiants et les données source restent dans le Studio. Le format v9 reste celui des campagnes avec profils M02.

## Créations privées et PJ libre

Le registre des modèles décrit les champs propres à chaque fiche. Les créations sont des entrées privées de campagne, indexées dans les rayons existants. Le nom, la description et les champs du modèle sont cherchables. Les notes du MJ sont consultables depuis la fiche et restent hors de l’index de recherche. Les liens privés et les parents de l’Atlas sont résolus dans la campagne de la fiche. Les parents sont des lieux et leur hiérarchie doit rester acyclique. La sauvegarde v10 utilise les mêmes transactions et contrôles de révision que les autres fiches. Les formats v1 à v9 restent restaurables.

Le raccord aux repères utilise le raccourci de la fiche. Un PNJ ou une créature peut préremplir les champs descriptifs d’une composition M04. Les effets et coûts des sorts, rituels, capacités et objets sont saisis pour la préparation. L’application mécanique relève d’un raccord séparé au protocole.

La création libre du PJ reprend le budget et le coût des rangs de M02, l’expérience requise du niveau et la convention de départ des ressources déjà utilisée par le parcours de vie. La fiche est prévisualisée puis ajoutée avec la même commande v9 que le parcours guidé. Le récit, le métier, les liens et le but sont descriptifs. La projection joueur conserve sa sélection explicite de champs.

## Préparation d’une aventure dans la Fresque

La fiche d’aventure reste le modèle de préparation. Le MJ convertit jusqu’à 12 jalons en scènes éditables et vérifie séparément les champs partageables et privés. La commande `plan-adventure` ajoute le lot et les embranchements facultatifs dans une même transaction. Elle vérifie la révision, refuse une deuxième préparation de la même aventure et accepte le réessai d’une opération déjà confirmée. L’ordre existant et la scène active sont conservés. Dans une Fresque vide, la première scène devient le point de reprise.

Chaque scène conserve l’identifiant de l’aventure et des fiches choisies parmi ses liens au moment de la préparation. La régie résout ces références dans la campagne et dans le catalogue. Les acteurs jouables sont rattachés ensuite par le formulaire normal de scène. La projection peut recevoir le titre et le texte expressément sélectionnés. Les notes et les références sont conservées dans la sauvegarde privée v11.

## Projection de scène dans la fenêtre joueur

La scène et la fiche PJ partagent le dialogue de préparation et le canal de la fenêtre joueur. Chaque type affiche ses propres champs. Pour une scène, seuls le titre et le texte peuvent entrer dans le document. Le même HTML échappé sert à l’aperçu, à l’affichage sur place et à la fenêtre. La régie vérifie la révision avant d’envoyer le document.

Le retrait d’une fenêtre de scène intervient à la demande du MJ, au changement de scène, à l’ouverture de l’éditeur de la scène courante ou à la sortie de la régie. Une nouvelle sauvegarde locale ou signalée par un autre onglet révoque la présentation. La perte de visibilité de la régie retire uniquement l’affichage sur place, ce qui permet de passer sur la fenêtre joueur. Les choix de présentation sont temporaires.

## Cartes et portraits dans la projection

Le sélecteur se limite aux médias locaux de l’Atlas et de l’Imagerie. Les illustrations des fiches liées, des repères et des participants de la scène peuvent remonter en tête de liste. Leur sélection reste explicite. Une fiche illustrée peut aussi ouvrir un aperçu consacré à son image.

La régie décode l’image locale puis en crée une copie PNG de 2 048 pixels au plus sur son côté le plus long. Les SVG de l’Atlas arrivent sous forme de pixels et les attributs de l’image proviennent du catalogue. L’aperçu et la fenêtre utilisent le même document. Le document n’autorise que les images incorporées. L’origine opaque, le canal temporaire et le retrait restent en place. Le changement de sélection invalide le chargement précédent et une image indisponible bloque l’envoi jusqu’à une nouvelle sélection.

## Carnet d’ambiances

Chaque scène conserve jusqu’à 12 ambiances. Une entrée contient un nom privé, son propre titre et texte partageables et une référence facultative à une image du catalogue. La création et la suppression passent par les opérations de campagne avec révision attendue. Le format v12 conserve les références d’images. Le Studio continue de lire les sauvegardes v1 à v11.

La régie applique les choix enregistrés à l’aperçu. Le MJ confirme la présentation séparément et peut y ajuster la sélection. Le texte présenté vient de l’ambiance et son nom privé reste dans la régie. Une référence d’image devenue indisponible reste visible dans le carnet et empêche l’envoi tant que le MJ n’a pas remplacé ou retiré l’image de l’aperçu.

## Remplacer une présentation dans la fenêtre joueur

L’aperçu est préparé dans la régie. La présentation en cours reste visible jusqu’à la confirmation du MJ et au chargement du nouveau document dans la fenêtre isolée. Le même canal transmet le remplacement. Le retrait ferme le canal et efface les documents visibles ou en chargement. Le changement de contexte ou de révision révoque la présentation.

## Mini-carte de la Fresque

Les repères reprennent l’ordre des scènes et les embranchements de la campagne. Les flèches du schéma montrent les liens de la scène repérée. La liste de ces liens donne leur sens, leur destination et leur condition, y compris quand deux scènes se trouvent hors du même écran. Le repérage et le focus de la carte sont des états temporaires de préparation. La scène courante continue de venir du point de reprise enregistré.

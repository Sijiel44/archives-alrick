# ARCH-STORAGE-001 — contribution STUDIO : gestes MJ, frontières et besoins de stockage

**Statut : CONTRIBUTION P1, conception non arbitrée — 2026-11-06.** Référents de décision : **01 BUILDER (architecture)** et **04 ARCHIVES (stockage, sauvegardes et migration)**. Contributeur : **20 STUDIO (parcours et confidentialité)** ; consultation **21 ATELIERS** pour les transactions `pendingStudioOp`. P0 et PR #95 inchangés. Données de recette fictives uniquement.

## 1. Ce qui est déjà prouvé par les sources, et ce qui est proposé

**Sources existantes, non décisions P1 :**

- DG003 `src/storage/storage.mjs` (blob `be6a881018ae1709ecef71c3c5a155acfb94a658`) expose `createCampaign`, aperçu/commit d'import, export privé et aperçu/commit de restauration purs ; limites de prototype : **2 Mio par source PJ**, **16 Mio par export privé**. Il conserve octets originaux et champs inconnus, mais ne fournit pas seul la transaction durable entre onglets. Contrat : `src/storage/CONTRACT.md` blob `7390b1872db0d2199404c394d1df8e21c8af2678`.
- DG003 `src/studio/CONTRACT.md` blob `ef9b3d26c6660f7ff10d22f6186abed1c00a20e4` : `mountStudio`, scènes `{id,title,publicDescription,privateNotes,participantIds}`, `setActiveScene()` asynchrone, sélection publique révoquée par `PLAYER_CLEAR` et DTO **strictement whitelist** ; joueur sur `127.0.0.1:4174`, MJ sur `127.0.0.1:4173`. Une confirmation d'enregistrement n'est pas synonyme de stockage durable si l'adaptateur ne l'atteste pas.
- STUDIO L004 `src/studio/demo-storage.mjs` blob `57f38f946c9592e9bd75462ff7e4a91e25b0b756` : espace de **démonstration** séparé et export avec SHA reconnu, sans remplaçant du parseur ARCHIVES ; ceci ne constitue pas un format de stockage pérenne.
- ATELIERS #100 `cycle-state.mjs` blob `5554b3b12728f0e63388beccec2c58b29b214281` : journal privé `extensions.pendingStudioOp` avant copie/création ; preuve de reprise asynchrone `inspectStudioRecovery()` avec relecture indépendante des données créateur et STUDIO. Le journal ne procure pas à lui seul une transaction distribuée ni un `operationId` causal partagé.
- L'architecture publique des tables indique explicitement que **l'interface MJ locale n'est pas une authentification** et qu'une table multiappareils exige des autorisations distinctes. Source : `content/jouer/architecture-tables-multijoueur.md` blob `9f0154f21643ad6ec7848e53c9b8d850881cc592`.

**Tout ce qui suit est une proposition de besoin P1**, sauf mention explicite d'une capacité ci-dessus. Ne pas migrer les données existantes et ne pas inventer de garanties d'atomicité.

## 2. Parcours réels attendus, vus du MJ

| Moment | Geste observable du MJ | Données à conserver | Acceptation et erreur |
|---|---|---|---|
| Première ouverture | Choisir **Démonstration fictive**, **Nouvelle campagne locale** ou **Rouvrir campagne**. Le mode ne doit jamais se déduire d'un nom. | Identité technique de campagne, `schemaVersion`, `mode`, `createdAt`, `revision`, provenance ; espace et clé propres au mode. | Une sauvegarde préexistante ou étrangère n'est ni adoptée ni effacée silencieusement. P0 inchangé. |
| Préparation d'un one-shot | Créer deux PJ fictifs via *prévisualiser → accepter*, sélectionner une créature de la bibliothèque puis une **copie de travail**. | Octets sources, SHA, ID de source/profil, ID d'instance, provenance, validation et références ; extensions inconnues privées. | Aperçu sans mutation ; aucun double import sur un retry ; erreur taille/schema/hash lisible. |
| Campagne longue | Créer des **sessions de jeu** (futures, passées, en cours) indépendantes des scènes ; marquer une session active, conserver point de reprise. | `sessionId`, campagne, ordre/horodatage logique, état brouillon/en cours/clôturée, scènes jouées et notes de reprise, sans modifier le canon. | Une session n'est **pas** une campagne ; son historique ne doit pas être écrasé lors de l'édition d'une autre scène. Modèle P1 non implémenté. |
| Création de scène | Titre, texte public, notes secrètes, participants PJ/PNJ/créatures, ordre facultatif, références de ressources. | `sceneId`, `sessionId?`, participants par ID stable, notes privées et description publique distinctes, `revision`. | La scène A peut rester inactive lorsque B est sélectionnée ; sélectionner A après B survit au reload. |
| Pendant partie | Afficher une vue de scène, déplacer un participant vers une autre scène, ajouter une note, enregistrer rapidement. | Révision visible et accusé durable ; journal minimal « qui a été modifié localement » sans publier les notes. | État « enregistrement », « sauvegardé », « changement non confirmé ». Une panne laisse un chemin de reprise explicite. |
| Projection | Ouvrir le joueur **sur autre origine**, choisir **titre/texte/acteurs** à afficher, prévisualiser puis publier volontairement. | DTO public à liste blanche et **révision/expiration du consentement**, pas de campagne ni secret dans le transport. | Aucun SHOW automatique après changement de scène, reload ou reprise ; CLEAR avant nouvelle sélection. |
| Coupure et reprise | Fermer brutalement onglet MJ, relancer hors ligne ; reprendre exactement la dernière révision durable, avec signalement des écritures douteuses. | Dernier snapshot validé, point de reprise, éventuel journal d'opération **privé** durable avant effet externe. | Ni duplications de créature/scène, ni suppression de notes, ni réconciliation de backup ancien sans preuve. |
| Export/import | Télécharger archive **CONFIDENTIELLE**, contrôler SHA, aperçu puis choisir explicitement remplacement ou import séparé. | Octets sources PJ intacts, champs inconnus, versions natives, scène active/participant IDs, notes privées, attestations valides. | Prévisualisation sans mutation ; export privé jamais sur origine joueur ; restauration étrangère non forcée. |
| Deux onglets MJ | Tab A et Tab B ouvrent la **même campagne** ; l'un modifie scène A, l'autre tente d'enregistrer état B obsolète. | Révision persistée, ID de magasin, auteur local de l'onglet facultatif, conflit/rebase explicite. | Refuser la dernière écriture silencieuse ; pas de faux « sauvegardé » ni de synchronisation prétendue. |
| Fin/démo | Sauvegarder puis quitter ; effacer **seulement** les ressources fictives créées et identifiées par la session active si autorisé. | Identité d'espace/mode/propriété d'origine, backup facultatif et confirmation humaine. | Aucune suppression opportuniste de clés inconnues ou antérieures ; nettoyage non destructif par défaut. |

### Distinctions métier à rendre visibles

- **Campagne** : contexte et identité durable. **Session** : période jouée et point de reprise (modèle proposé). **Scène** : unité navigable, éventuellement réutilisable entre sessions ; une scène n'est ni un enregistrement de jet ni une source de lore canonique.
- **Personne PJ** = identité d'instance dans la campagne ; **fiche source** = document brut validé et immuable. **Créature source** = Bestiaire/version ; **créature instance** = copie de travail MJ. Les références ne doivent jamais être réécrites dans les originaux.
- **Notes MJ** : sensibles même en mode local ; modèle privé. **Texte public** : ne devient public qu'après consentement du MJ pour cette projection. Le filtrage technique ne corrige pas une erreur humaine de classification.
- **Identité locale** : ID technique d'installation/profil et ID de campagne, pas une preuve d'authentification ou de droit entre utilisateurs d'un même ordinateur. Les deux onglets MJ d'un profil ont les mêmes privilèges locaux. **Joueur** = fenêtre d'affichage d'une autre origine, sans autorisation d'écrire la campagne.

## 3. Invariants attendus des ports de stockage — proposition, non API homologuée

1. `load(campaignId)` retourne le **dernier état durable validé**, accompagné de `revision` et du mode d'origine ; aucun « succès » basé seulement sur une variable JS.
2. `commit(expectedRevision, nextSnapshot, operationId?)` est **tout ou rien pour une campagne** et refuse une révision devenue obsolète (conflit explicite). `expectedRevision`/`operationId` sont des **signatures proposées**, pas celles de DG003.
3. Les mutations `scene/participant/note/session` ne doivent pas être confondues avec la **projection** ; toute navigation de scène invalide la sélection publique et peut envoyer `PLAYER_CLEAR` si la fenêtre authentifiée par le canal est connectée.
4. Tous les identifiants demeurent stables sur reload/export/restore ; un import n'attribue pas l'identifiant de la source à une seconde instance par inadvertance.
5. La reprise cross-store avec ATELIERS vérifie **journal durable avant action**, sauvegarde STUDIO relue séparément, ID unique, provenance, statut, puis confirmation MJ ; si la preuve est absente : `unattestable`, **aucune création/reprise automatique**. La disparition du journal et le lien durable sont relus après commit.
6. Les sauvegardes privées contiennent l'état MJ ; le DTO joueur est construit par un module *différent* avec whitelist. La fenêtre joueur ne reçoit jamais le graphe MJ, les notes, les SHA sources, les références privées ou les bytes d'archive.
7. **Offline** : créer/éditer/exporter/recharger sans réseau après installation locale et disponibilité des ressources ; les références externes (catalogue/illustration) sont affichées comme indisponibles sans casser l'état. Le choix de stratégie cache/installation appartient à BUILDER ; « hors ligne » ne signifie pas accès universel sur un nouveau navigateur non provisionné.
8. Les schémas historiques ne sont **jamais** convertis en masse à l'ouverture. Un adaptateur affiche l'aperçu, l'écart, le risque et une sauvegarde préalable ; pas de réécriture silencieuse.
9. **Durabilité et reprise** : distinguer écriture demandée, acceptée, persistée et exportée ; documenter si le navigateur peut tuer l'onglet entre ces états. L'accusé `Promise<void>` de l'adaptateur actuel ne suffit pas à prouver un commit inter-magasin.
10. **Données et images** : provenance/droits, taille/format, texte alternatif, URL locale ou origine autorisée ; ressources privées non transportées ni récupérées de serveurs distants par défaut ; SVG non fiable refusé ou traité dans un pipeline indépendant.

## 4. Comparatif A/B/C soumis à BUILDER et ARCHIVES

| Critère discriminant | A. Renforcer le stockage existant | B. IndexedDB commun | C. Fondation reconstruite |
|---|---|---|---|
| Réutilisation DG003/Studio | Très élevée ; wrappers et gardes de révision | Élevée via adaptateurs, refonte de persistance | Variable, refonte de contrats possible |
| Écriture atomique campagne + scène + journal | Possible si un *snapshot unique* et petit ; cross-store reste fragile | Transactions IDB multi-stores possibles sur **même base**, à démontrer | À définir ; potentiellement robuste mais doit prouver l'architecture choisie |
| Deux onglets MJ | Nécessite verrou/révision et tests anti-perte explicites ; `localStorage` seul n'offre pas compare-and-swap | Version CAS en transaction IDB + message d'invalidation inter-onglets (pas d'autorité) | Dépend du modèle retenu ; peut être surdimensionné à P1 |
| Capacité et archives 16 Mio | Risques quota/synchronie de `localStorage` ; tester sur navigateurs cible | Blobs/records adaptés mais quota/éviction restent à gérer | À chiffrer ; aucun quota infini garanti |
| Hors ligne, sans serveur | Oui, tant que ressources web disponibles localement | Oui, sous même réserve d'installation/cache | Oui si conçu explicitement local-first |
| Réversibilité et migration | Chemin court, pas de conversion majeure | Migration progressive versionnée, double lecture possible ; nouvelle politique à décider | Forte charge de migration/validation et compatibilité à démontrer |
| Séparation MJ/joueur | Nécessite **deux origines** et whitelist dans tous les cas | Idem ; IDB n'est pas un système d'autorisations MJ | Idem sans serveur d'autorisation ; nouvelle UI seule ne sécurise pas les rôles |
| Échec/rollback/backup | Garde-fous ajoutables mais multiplication de clés à risque | Transaction/backup/version snapshot consolidés, test de restore obligatoire | Test de reprise intégral indispensable avant tout basculement |
| Délais P1 / risque de détourner P0 | Faible à moyen | Moyen | Élevé ; reconstruction seulement si critères A/B échouent |

**Avis STUDIO conditionnel :** traiter A comme piste de stabilisation rapide, **examiner B en priorité comme fondation locale commune** si la transaction multi-entités et les deux onglets sont jugés incontournables. **Ne pas choisir C par esthétique ou nouveauté** : demander à BUILDER un prototype démontrant un invariant que A et B ne peuvent pas satisfaire sans bricolage. Ceci n'est **pas un arbitrage DG**. Aucune migration à ce stade.

## 5. Questions à arbitrer par 01 / 04 / 21

1. L'unité transactionnelle cible est-elle **campagne entière**, scène, ou campagne + sous-entités + journal ATELIERS ? Une transaction IndexedDB ne couvre pas une base/un stockage distincts sans mécanisme d'idempotence.
2. Que désigne « sauvegardé » dans l'UI : `save()` résolu, transaction IDB complète, relecture validée ou export hors navigateur ? Quel accusé peut être prouvé après fermeture forcée ?
3. Une session est-elle un sous-document d'une campagne ou une entité versionnée séparément ? Besoin de restitution « dernier instant joué » sans supposer le canon.
4. Deux onglets peuvent-ils éditer simultanément ou le second devient-il lecture seule avec option de reprise de contrôle ? Décision utilisateur/produit avant mécanisme.
5. Quel garde-fou impose la preuve d'appartenance du namespace fictif avant effacement ? Une clé historique étrangère valide ou opaque bloque la démo.
6. Identifiant d'opération `pendingStudioOp` et corrélation avec instance STUDIO : contracter un `operationId` durable commun ou conserver blocage des restaurations ambiguës.
7. Politique quota/éviction, sauvegarde de secours, export fréquent et stratégie d'import 16 Mio ; **SHA256 = intégrité, pas authenticité**.
8. Stratégie de médias locaux et droits/alt, formats autorisés et stockage des binaires, sans requêtes vers des URLs tiers.

## 6. Portes de validation proposées

- **P1 contrat d'usage** : diagramme des gestes et modèle de session approuvés BUILDER/STUDIO/ARCHIVES/ATELIERS.
- **P1 stockage** : au moins un banc démonstrateur A ou B **réel**, tests de panne et concurrence, migration non destructive, export/restore, sécurité DTO ; mesurer capacité et performances sur navigateur.
- **P1 UX** : aucune couleur/label ne masque un état « non sauvegardé » ; test novice et expert, clavier, zoom, tablette/écran 390 px.
- **P0 indépendant** : tests Chrome/QA du HEAD #95 continuent sans modification ; aucun PASS P1 attribué par héritage des tests P0.

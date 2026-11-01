# Sources de campagne publiques — mode volontaire

**Décision du créateur, 30 octobre 2026 :** les campagnes brutes d'Alrick peuvent être rendues publiques sur GitHub. Elles ne sont pas confidentielles par défaut et l'archivage public est souhaité. Avant chaque import, contrôler les droits de diffusion, données personnelles et éléments explicitement réservés aux MJ ; ces contrôles portent sur les passages concernés et ne justifient pas une interdiction générale des bruts. Conserver les originaux, les versions et la distinction entre une proposition et un événement joué.

## Ce qui sera public

Quand l'original a été explicitement retenu pour publication, le dossier d'une séance peut contenir :

- `original/Campagne_Brut_4.4.docx` — document source inchangé, à conserver sans écraser ;
- `transcription_integrale_CB44.md` — transcription lisible et indexable par GitHub ;
- `index_chapitres.md` et `index_messages.md` — recherche par chapitres et messages ;
- `messages/CB44-MSG-001-alexandre.md` à `CB44-MSG-135-chatgpt.md` — fragments complets par message, permettant une recherche de texte précise ;
- `manifest.json` — empreinte SHA256 et références de provenance.

Le pack de **CB44** a été généré et vérifié séparément. **Il n'est pas encore poussé dans le dépôt GitHub par cette PR**, car les outils de cette intervention ne permettent pas de téléverser directement le DOCX binaire depuis la pièce jointe du chat. Il est disponible comme fichier utilisateur à importer sur l'ordinateur. **Ne pas laisser penser que la source brute est déjà consultable sur GitHub.**

## Où les placer

Dossier public recommandé : `sources/campagnes/CB44/`. **Ne pas** utiliser `content/` pour les transcriptions intégrales si elles ne doivent pas apparaître dans le site Quartz. La recherche GitHub du dépôt pourra les parcourir ; la recherche de la barre du site Quartz sera limitée aux pages effectivement publiées dans `content/`.

Pour les bruts plus anciens : `sources/campagnes/CB01/`, `CB02/`, etc. en reprenant les noms réellement attestés, sans supposer l'existence de tous les fichiers intermédiaires.

## Windows / GitHub Desktop

1. Inventorier les fichiers reçus sans modifier les originaux : nom, format, taille, date/version disponible et identifiant CB attesté.
2. Préserver chaque original dans `sources/campagnes/<CB>/original/` et conserver la transcription UTF-8, les index Markdown/CSV et les fragments de chapitres ou messages lorsqu'ils existent réellement.
3. Vérifier les manifestes par recalcul SHA-256, compter les originaux et transcriptions attendus, rechercher les doublons exacts (empreinte) et les doublons probables (comparaison de texte). Ne pas inférer une correspondance CB à partir d'un titre seul.
4. Contrôler la taille Git, les droits, données personnelles et secrets explicitement MJ. Écrire la provenance et les limites de segmentation dans le manifeste ; les zéros d'un extracteur ne prouvent pas l'absence de chapitres ou de scènes.
5. Créer une branche d'import dédiée et une PR qui indique les totaux, empreintes et résultats de recherche vérifiés. Une PR de sources n'autorise pas une publication Quartz.
6. Après revue et fusion autorisée, vérifier le contenu distant, rechercher par code, chapitre et terme, et tester la restauration depuis un clone indépendant. Toute suppression ultérieure doit tenir compte de l'historique public.

## Trois types de documents, trois fonctions

| Document | Objectif | Statut |
| --- | --- | --- |
| Brut intégral | Prouver ce qui a été raconté et permettre la recherche exacte | Source primaire, **pas automatiquement du canon** |
| Fiches et journal | Décrire les faits joués, personnages, institutions et projets vérifiés | Référence canonique révisable |
| Chronique historisée | Donner envie de lire ; retirer répétitions, commandes et échanges techniques | Adaptation littéraire identifiable, **pas nouvelle scène** |

Une réplique inventée dans l'adaptation littéraire, un projet non réalisé, une déclaration erronée d'un PNJ et une correction explicite du créateur ne se rangent jamais sous le même statut.

## Reconstruire les anciens volumes

L'objectif est de faire du **Registre**, de la **Bible**, de l'**Atlas**, du **Compendium**, du **Codex**, de la **Maison**, de la **Continuité** et du **Bilan de reprise** des **vues structurées** de cette base. Tant que les 645 sujets et leurs successeurs ne sont pas réconciliés, les anciens Word doivent être conservés en sauvegarde. Le brut peut être public sans que tous les secrets d'une future partie aient besoin d'apparaître sur la page d'accueil.

## Évolution de l'outil d'importation

La [PR #35](https://github.com/Sijiel44/archives-alrick/pull/35) est un outil d'import hors réseau et d'indexation. Sa politique initiale de refus des sources/sorties dans le dépôt public doit être revue pour respecter l'autorisation d'archivage public ; préserver les contrôles contre les secrets réels et la publication Quartz. Vérifier les statuts réels de la PR avant d'agir. L'outil ne doit pas décider du canon ni publier de lui-même.

## État de CB44

Le Word a été lu et les **fiches CB44** ont fait l'objet d'une PR éditoriale distincte. Le lot source intégral reste à déposer. La publication du résumé ne prouve pas la mise en ligne des 135 messages.

**Sauvegarde :** garder en plus une copie indépendante de GitHub sur disque externe ou stockage chiffré ; le backup automatique GitHub du dépôt public est temporaire et sur la même plateforme.


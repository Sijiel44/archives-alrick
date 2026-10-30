# Sources de campagne publiques — mode volontaire

**Décision du créateur, 30 octobre 2026 :** les campagnes brutes d'Alrick peuvent être rendues publiques sur GitHub. Cela lève la préférence de confidentialité **pour les bruts qu'il décide lui-même de déposer**. Il faut néanmoins conserver les originaux, les versions et la distinction entre une proposition et un événement joué.

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

1. Sur l'ordinateur, ouvrir le dossier local du dépôt `archives-alrick` (déjà cloné dans GitHub Desktop).
2. Extraire le pack de CB44. Copier `original`, `messages`, `transcription_integrale_CB44.md`, `index_chapitres.md`, `index_messages.md` et `manifest.json` **dans `sources/campagnes/CB44/`**.
3. Vérifier que le nom, le contenu et la taille des documents sont corrects. Le DOCX est inférieur aux limitations usuelles de GitHub pour un objet Git, mais tout fichier binaire devient un élément de l'historique public.
4. Dans GitHub Desktop, vérifier les fichiers modifiés, créer un commit sur une **branche dédiée aux sources**, publier la branche puis ouvrir une PR.
5. Contrôler une dernière fois que l'original ne contient rien que le créateur ne souhaite pas exposer. Une suppression ultérieure d'un fichier public **ne garantit pas** sa disparition des historiques Git ou des copies chez des tiers.
6. Fusionner seulement après validation. **Ne pas** déclencher automatiquement Pages pour l'ajout de sources : la diffusion du site reste contrôlée et les pages « Bilan » et « Chronique » font l'objet d'une PR éditoriale distincte.

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

La [PR #35](https://github.com/Sijiel44/archives-alrick/pull/35), encore en brouillon, introduit un extracteur conçu initialement pour des dossiers privés. **Ce comportement doit être adapté pour un import public explicitement autorisé avant fusion de #35** ; l'outil de base ne publie pas de lui-même. La présente politique documente le nouveau choix du créateur et les contraintes du dépôt.

## État de CB44

Le Word a été lu et les **fiches CB44** ont fait l'objet d'une PR éditoriale distincte. Le lot source intégral reste à déposer. La publication du résumé ne prouve pas la mise en ligne des 135 messages.

**Sauvegarde :** garder en plus une copie indépendante de GitHub sur disque externe ou stockage chiffré ; le backup automatique GitHub du dépôt public est temporaire et sur la même plateforme.

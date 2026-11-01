# DG-01 — Import et recherche des archives de campagne

État : complément à la PR #35 ; à examiner après celle-ci et la PR #63. Base #35 : `6f0d3d6`. Au contrôle, #35 et #63 étaient ouvertes ; `main` était `6fe3c79cfdd36e69a6eaa356abc498d29b81f580`. Issues #39 et #41 ouvertes. Aucune fusion, aucune publication Pages.

## Inventaire vérifié

Dans `sources/campagnes/`, seul `README.md` est présent. Aucun des 15 DOCX ou transcriptions annoncés par #39 n'est présent dans ce dépôt ; le ZIP `Alrick_Archives_15_Bruts_Markdown_Chapitres_Messages_2026-10-30.zip` n'a pas été trouvé dans Documents/Codex ni les pièces jointes accessibles. Les ensembles CB01, CB02, CB03-01–09 et CB04-01–04 sont attendus selon l'issue ; leurs tailles, formats effectifs, empreintes et contenus ne sont pas vérifiés ici. Les six volumes et autres archives sont distincts. Aucun import réel n'est réalisé.

## Travaux et limites

L'extracteur de #35 accepte désormais une source ou sortie dans `sources/campagnes/`, refuse les autres destinations du dépôt et ne remplace pas une sortie non vide. Les identifiants tels que CB03-01 sont acceptés. Il produit une transcription, un manifeste SHA-256 et des références de paragraphes et chapitres détectés ; il ne copie pas l'original. Les tableaux sont extraits comme paragraphes sans garantir leur structure, les images et notes ne sont pas entièrement conservées. La revue humaine reste nécessaire avant tout import public.

`scripts/chercher_campagne.py` cherche une expression littérale sans tenir compte de la casse dans les transcriptions `*/transcription_integrale.md`. Options `--code` et `--chapitre` (ce dernier dépend du schéma de manifeste de l'extracteur #35). Résultats JSON : fichier, campagne, paragraphe, chapitres, extrait et `a_verifier`. Aucun alias, événement, période ou lien de fiche n'est inféré ; chercher les alias individuellement et établir les liens après examen des sources. Le format des manifestes du ZIP absent reste à vérifier. La recherche charge chaque transcription en mémoire ; les gros fichiers et la recherche GitHub n'ont pas été évalués sur corpus réel.

Tests synthétiques : cinq tests Python réussis (DOCX factice, chapitres répétés, SHA, chemin autorisé/interdit, UTF-8 et recherche code/chapitre). Aucun contrôle sur fichiers réels, doublons, qualité de transcription, recherche distante ou restauration n'a été effectué. Les contrôles SHA du paquet et sa structure sont bloqués jusqu'à réception ; ne pas fermer #39. La réconciliation #41 exige le registre et les preuves originales ; elle n'est pas effectuée.

## Reprise reproductible

1. Récupérer le ZIP nommé dans #39 dans un répertoire de travail local, hors du site. Conserver l'archive et ses originaux sur un support indépendant.
2. Extraire sans écraser, inventorier les 15 ensembles et leurs fichiers ; contrôler les chemins, tailles, formats et chaque SHA-256 contre les manifestes réellement reçus. Signaler les écarts et les doublons, sans modifier les originaux.
3. Comparer des passages et tableaux Word/transcription ; noter les limites de chapitrage et identifier droits, données personnelles et secrets MJ à protéger avant dépôt public.
4. Placer les dossiers autorisés sous `sources/campagnes/<CB>/` sur une branche dédiée. L'extracteur s'utilise `python scripts/prepare_campagne.py <original.docx> --session CB03-01 --sortie sources/campagnes/CB03-01` lorsque la sortie n'existe pas. Conserver l'original séparément et enregistrer sa provenance et empreinte ; ne pas écraser un dossier existant. Les transcriptions du paquet préexistant peuvent avoir une autre structure : ne pas les remplacer automatiquement.
5. Lancer `python scripts/chercher_campagne.py "expression" --code CB03-01 --chapitre CH-IV` après vérification des manifestes. Chaque résultat est une piste à confirmer, pas un fait canonique. Rechercher codes, noms et alias séparément.
6. Vérifier les résultats locaux, taille et doublons ; ouvrir une PR d'import limitée, sans modification du marqueur Pages. Après fusion autorisée, vérifier fichiers/recherche GitHub et restaurer depuis un clone ou une sauvegarde indépendante.

Les documents dans `sources/` sont consultables dans le dépôt public mais ne sont pas automatiquement publiés dans Quartz. Une transcription ne crée ni canon, ni événement joué, ni fiche encyclopédique. Le paquet doit être fourni pour procéder aux contrôles réels.

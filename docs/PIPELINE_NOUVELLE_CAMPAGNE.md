# Pipeline des nouvelles campagnes d'Alrick (CB44+)

**Statut : proposition technique.** Aucun brut de campagne n'est ajouté au dépôt public par cette procédure.

## Deux dépôts, deux responsabilités

- **archives-alrick (PUBLIC, déjà existant)** : fiches canoniques diffusables, Atlas, Compendium, Codex, institutions, chroniques éditoriales, Quartz et GitHub Pages. Les fiches à spoilers restent accessibles à toute personne ayant leur URL ou le lien GitHub ; unlisted n'est pas un contrôle d'accès.
- **archives-alrick-sources (PRIVÉ, à créer séparément)** : documents DOCX originaux, chapitres Markdown intégraux, journal des scènes, index des sources, registre des 645 sujets, dossiers MJ, secrets et point de reprise intégral.
- **Sauvegardes hors GitHub** : copies datées des deux dépôts et de leurs fichiers originaux, empreintes SHA256 et test régulier de restauration.

Le dépôt privé proposé n'est PAS créé automatiquement par ce plan. Ne jamais stocker les bruts ou les secrets dans une branche cachée du dépôt PUBLIC.

## Import d'une nouvelle campagne

1. Conserver le DOCX original (CB44, CB45...) dans un dossier privé. Noter son nom et son empreinte SHA256.
2. Exécuter l'extracteur local : il écrit une transcription, un index CSV des chapitres, un manifeste et des chapitres Markdown avec numéros de paragraphes, sans contacter GitHub.
3. Examiner les événements avec leurs références : scène réellement jouée, déclaration de personnage, décision de canon hors jeu, idée proposée, contradiction ou événement annulé.
4. Comparer les noms et codes existants, puis générer un journal de changement (personnages, relations, Atlas, magie, Maison, institutions, projets).
5. Mettre à jour le registre de recherche et la continuité PRIVÉS, avec le dernier lieu et la dernière action réellement jouée. Ne pas inventer les scènes à venir.
6. Créer une PR PUBLIQUE limitée aux fiches pouvant être divulguées. Ne jamais y recopier une transcription brute ou une liste de secrets non encore révélés.
7. Lancer les tests du dépôt, relire la PR et approuver explicitement le lot de publication dans le marqueur Pages.
8. Contrôler le déploiement GitHub Pages et les sauvegardes après la fusion.

**L'extraction de texte n'est pas une validation automatique du canon.** Les codes de chapitre peuvent être répétés ; chaque occurrence reçoit un suffixe. Un numéro de paragraphe est une référence au DOCX, pas un numéro de page Word.

## Commande locale Windows

Depuis le dépôt public cloné, en utilisant les fichiers PRIVÉS à l'extérieur de ce dépôt :

    python .\scripts\prepare_campagne.py "C:\Users\<Vous>\Documents\Alrick\Sources_privees\CB44\Campagne_Brut_4.4.docx" --session CB44 --sortie "C:\Users\<Vous>\Documents\Alrick\Sources_privees\CB44\index_extrait"

Le programme doit refuser toute lecture/écriture de fichiers de campagne dans le dépôt public. Il n'ouvre pas de PR et ne publie aucun texte. Une étape de revue éditoriale séparée est indispensable.

## Schéma minimum des provenances

Pour chaque modification d'une fiche, enregistrer dans le dossier PRIVE : identifiant de campagne, SHA256 du fichier, identifiant de chapitre, paragraphe de la preuve, code existant ou nouveau, type de canon, résumé factuel, état de validation, fichiers à modifier, et impact sur le point de reprise.

Les statuts **faits_joues**, **lore_valide**, **proposition_non_jouee**, **hypothese**, **a_verifier** et **annule** restent distincts. Une déclaration de personnage ne démontre pas nécessairement la vérité de son propos.

## Remplacer les Word progressivement

Les huit dossiers (Index, Bible, Atlas, Compendium, Codex, Maison, Continuité, Bilan) doivent devenir des **vues et exports** de fiches structurées, pas huit manuscrits à maintenir séparément. Le Registre et la Continuité complète demeurent PRIVES tant que leurs sources contiennent des secrets.

**Condition avant d'abandonner les Word comme sources de travail :** couvrir les sujets non encore migrés, avoir une table d'alias fiable, conserver chaque source primaire et sa version, pouvoir reproduire les bilans de reprise, exporter un Word lisible à la demande et réussir un test de restauration. Ne pas supprimer les anciennes sauvegardes.

## Deux fonds d'archives distincts

- **Brut privé** : transcription intégrale, chapitres et recherche exacte, utilisable par le MJ pour retrouver la scène.
- **Chronique historisée** : récit littéraire issu des mêmes scènes, débarrassé des consignes répétitives et des échanges techniques. Style d'aventure, lieux vivants, humour et séquences fortes ; aucun fait ou dialogue nouveau ne doit être présenté comme jouÉ. Une adaptation narrative doit être identifiée.

Un nouveau groupe pourra écrire sa propre continuité, sans transformer une proposition d'aventure en expérience d'Orin.

## Freins à l'automatisation totale

Une pièce jointe dans ChatGPT n'est pas détectée toute seule par GitHub. L'assistant peut analyser le document pendant la conversation, construire les corrections et ouvrir une PR avec la connexion GitHub ; les tests et la publication restent séparés. Les GitHub Actions actuelles ne doivent pas recevoir un accès global aux secrets du dépôt privé.

**État initial documenté :** après CB43, au Palais divin, avant le déjeuner attendu avec Édric et Maëlya. Aucun nouveau contenu de CB44 ne sera créé avant lecture effective de son brut.

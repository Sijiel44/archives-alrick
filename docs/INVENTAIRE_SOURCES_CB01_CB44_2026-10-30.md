# Campagnes brutes reçues — inventaire et ordre de réconciliation

**Audit de présence initial : 30 octobre 2026.** Quinze fichiers Word **distincts**, CB1, CB2, CB3.1–CB3.9 et CB4.1–CB4.4, ont été reçus dans la conversation. Le contrôle local confirme que chacun est lisible au format DOCX. Extraction structurelle de **352 724 paragraphes et ~15,75 millions de caractères** au total (textes de messages et narration, valeurs indicatives). **Ce scan de présence n'est pas une validation factuelle de chaque paragraphe** : l'indexation fine et le rapprochement des contradictions demandent un passage thématique ou par chapitre.

| Brut | Nom de la pièce reçue | SHA-256 initial (14 premiers hex.) | Statut d'import GitHub |
| --- | --- | --- | --- |
| CB1 | `Campagne Brut 1.docx` | `dc0aff03aa1269` | à importer |
| CB2 | `Campagne Brut 2(1).docx` | `d3418bdbedf2ad` | à importer |
| CB3.1 | `Campagne Brut 3.1(1).docx` | `4ad2a971c3160f` | à importer |
| CB3.2 | `Campagne Brut 3.2(1).docx` | `12d04635dc8a9f` | à importer |
| CB3.3 | `Campagne Brut 3.3(1).docx` | `e2e3ff200cf95d` | à importer |
| CB3.4 | `Campagne Brut 3.4(1).docx` | `00b3acbd1453f1` | à importer |
| CB3.5 | `Campagne Brut 3.5(2).docx` | `1a68cd29519d` | à importer |
| CB3.6 | `Campagne Brut 3.6(2).docx` | `1a5ea9218fdd7b` | à importer |
| CB3.7 | `Campagne Brut 3.7(3).docx` | `06cc60a3a25511` | à importer |
| CB3.8 | `Campagne Brut 3.8.docx` | `7236f1fce0efaf` | à importer |
| CB3.9 | `Campagne_Brut_3.9(2).docx` | `e9aa5a04a44a14` | à importer |
| CB4.1 | `Campagne_Brut_4.1(3).docx` | `c55545cbaa33ef` | à importer |
| CB4.2 | `Campagne_Brut_4.2(2).docx` | `faa6ad28c6cb0a` | à importer |
| CB4.3 | `Campagne_Brut_4.3(3).docx` | `5163f9e50ad4` | à importer |
| CB4.4 | `Campagne_Brut_4.4(2).docx` | `e462ac4b37ea0f` | **pack chapitré préparé séparément**, dépôt complet à faire |

**Doublons vérifiés :** `Campagne_Brut_4.3(2).docx` = `Campagne_Brut_4.3(3).docx` et `Campagne_Brut_4.4(1).docx` = `Campagne_Brut_4.4(2).docx` à contenu binaire SHA-256 identique. Les anciennes transcriptions regroupées sont des **sources dérivées**, non des volumes supplémentaires dans cette table.

## Politique d'intégration des archives

1. **Préserver le Word original** (même texte, même SHA-256) sous `sources/campagnes/CBxx/original/`. Les noms historiques peuvent être normalisés pour la lecture, mais le manifeste doit conserver le nom reçu et son empreinte.
2. **Créer des transcriptions Markdown**, index des messages et chapitres, avec URLs de provenance quand elles sont intégrées à l'original.
3. **Ne pas déduire un chapitre du nom du Word** : les premiers bruts et certains Word intermédiaires n'utilisent pas le même système de numérotation. La numérotation romaine est particulièrement stable en CB43–CB44, mais le nombre de titres n'égale pas le nombre de messages.
4. **Ne pas confondre ancienne préparation et état actuel**. Les reprises intégrées à chaque ancien brut étaient vraies à l'instant de leur rédaction et sont parfois devenues périmées par les séances suivantes.
5. **Rapprocher chaque événement avec les fiches du dépôt**, en créant pour les autres MJ des dossiers indépendants des intrigues propres à Orin. Conserver un renvoi clair vers le chapitre source.
6. **Vérifier les noms de dictée** et homonymes avant création de personnes, de contrat ou de géographie.

## Travaux de réconciliation à prioriser

- **Lot A — prêt pour jouer :** protocole de recherche, fiche de reprise exacte après **CB44 CCCLXXIII**, Elyan toujours en attente.
- **Lot B — univers réutilisable :** quatre fiches détaillées de l'Île des Divertissements (**Hiver, Automne, Printemps, Été**) avec attractions, circulations, personnel, limites, accès, lieux non dédiés au personnage Orin.
- **Lot C — archives intégrales :** import des 15 DOCX et de leurs transcriptions, publication volontaire explicitement autorisée par le créateur ; prise en compte des limites de recherche GitHub/Quartz.
- **Lot D — réconciliation historique :** chronologie, statut des personnes, engagements, technologie, magie, institutions, inventaire et canons rectifiés, d'abord les contradictions bloquantes puis le confort de lecture.
- **Lot E — sauvegarde :** une **copie complète Git** et des archives originales sur un deuxième support. Les exports deux fois par semaine peuvent être une bonne cadence, mais ne remplacent ni l'historique Git ni une sauvegarde externe indépendante.

## Contrôle indispensable de l'état de publication

À la rédaction de cette fiche, les **15 Word ne sont pas encore déposés en intégralité dans GitHub**. Les premières fiches CB44 et la première chronique historisée ont déjà été fusionnées. Les pages des quatre saisons et le protocole de reprise sont un nouveau lot. **Ne pas déclarer l'import des sources terminé avant de contrôler physiquement les fichiers et leurs empreintes dans le dépôt.**

Voir `docs/SOURCES_CAMPAGNES_PUBLIQUES.md` et `docs/PROTOCOLE_RECHERCHE_AVANT_REPONSE_JDR.md`.

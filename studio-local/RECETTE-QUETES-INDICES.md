# Quêtes, indices et liens de retour — 16 novembre 2026

Branche dédiée : `codex/quetes-indices-liens`. Base initiale : `44979d27878b40d7fe1c56991eadf6459b587c78`, dépôt propre au départ. Aucun contenu canonique ni paquet de campagne ajouté. Pas de dépendance npm supplémentaire.

## Audit et portée

La création des quêtes/missions/aventures, les repères d’indice simples, la Fresque, les raccourcis des créations et la projection choisie existaient. Le lot complète ces composants par un suivi multi-scène, des décisions historisées et les liens de retour. Le lot Fiabilité reste partiel tant que la séance humaine n’est pas réalisée ; progression avec mentor, dossier approuvé, atlas interactif et table synchronisée restent les développements suivants.

Les listes complètes de fichiers des 41 PR ouvertes ont été examinées au début du lot : aucun recouvrement dans `studio-local/`. Les PR 35, 54, 64, 66, 73 et 76 concernent des fichiers partagés de CI ou dépendances. Aucun prototype de ces PR n’est fusionné ici. Les ajouts publics d’univers arrivés sur main pendant le travail sont conservés lors du rapprochement.

## Recette

Les tests utilisent IndexedDB réel, des profils Chrome/Edge isolés et des données fictives. Ils couvrent plusieurs chemins vers un indice, objectifs, transitions aller/retour, historique, commandes rejouables, conflit de révision, refus des références étrangères, suppression d’une référence de repère, sauvegarde/restauration v21, versions refusées et conservation d’une extension privée inconnue.

La recette UI vérifie les raccourcis Markdown, « utilisé dans », le retour à la Fresque, les filtres, la saisie conservée après conflit, le clavier et l’absence de débordement de 320 à 1440 px. Les captures 390 et 1440 px ont été examinées. La projection ne contient que le texte coché ; les canaris de titre, notes, liens et décisions restent absents. Un aperçu périmé est refusé.

Trois anciennes attentes ont été adaptées au catalogue déjà publié : rayon PNJ distinct et sélection exacte de la Renarde de brume. Aucun comportement de ces parcours n’a été retiré. Le récepteur joueur conserve sa liste fermée de types de document.

Les résultats finaux et les liens CI/Pages sont consignés dans la PR du lot. `npm test` et le build Pages ont réussi localement ; les six parcours Pages incluent le nouveau suivi et les parcours multimédia/joueur existants.

## Publication et limites

Publication autorisée par le créateur dans ce chat, après tests et PR dédiée. Le workflow Pages et un contrôle sur l’URL publique doivent réussir avant de déclarer la mise en ligne vérifiée. L’assemblage ne copie que les assets de sa liste ; aucune campagne ni sauvegarde privée n’est dans Git.

**Séance réelle avec un MJ et deux PJ : non réalisée.** Les essais automatiques ne valent pas homologation en partie. Voir le [guide du suivi](QUETES-INDICES.md) et la [feuille de route](FEUILLE-DE-ROUTE.md#prochains-lots-recommandés).

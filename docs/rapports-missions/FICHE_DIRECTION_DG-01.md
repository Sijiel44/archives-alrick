# ARCHIVES D'ALRICK — RAPPORT DE MISSION

**Identification :** DG-01 — Import, indexation et exploitation des archives brutes. Référent : Sources et Continuité. Date : 31 octobre 2026. Branche : `codex/dg-01-sources`. PR : https://github.com/Sijiel44/archives-alrick/pull/64 (brouillon, cible la branche de #35).

**Statut : partiellement réalisée.** Première phase technique livrée en PR ; l'import réel des quinze archives reste en attente.

## Objectif

Rendre les sources de campagne faciles à retrouver et à relier aux fiches, tout en conservant leurs originaux et la distinction entre source, fait joué et canon. Préparer un import public contrôlé sans publication automatique dans Quartz.

## Travaux réalisés

L'importeur de #35 accepte les dossiers autorisés sous `sources/campagnes/`, les identifiants CB avec suffixe, et refuse les autres chemins internes au dépôt. Une recherche locale expérimentale retrouve une expression dans les transcriptions et retourne campagne, paragraphe et chapitre détecté, avec statut `a_verifier`. Le rapport technique contient une procédure de réception et de reprise. Aucun brut réel n'a été importé.

## Vérifications

Cinq tests Python synthétiques réussis : extraction, SHA-256, chemins, chapitres et recherche UTF-8. `npm test` et `git diff --check` réussis sur la base historique de #35. CI initiale réussie : https://github.com/Sijiel44/archives-alrick/actions/runs/41264298565. Le test de recherche a ensuite été intégré à la CI via `test_*campagne.py`. La [nouvelle CI #41264847644](https://github.com/Sijiel44/archives-alrick/actions/runs/41264847644) est **réussie** : ses logs attestent cinq tests Python, dont `test_reference_code_chapitre_utf8`, et `npm test` réussi. Cette CI ne vérifie pas l'import des quinze fichiers réels.

## Réserves

Le ZIP des quinze archives n'était pas accessible dans les emplacements examinés. Les empreintes réelles, droits, doublons, conformité Word/transcription, recherche sur corpus et restauration n'ont pas été vérifiés. La recherche actuelle dépend des marqueurs et du format de manifeste de l'extracteur #35 ; sa compatibilité avec le paquet reçu reste à établir. La branche #35 précède les travaux récents de `main` et requiert une réconciliation avant intégration.

## Décisions attendues et prochaines actions

Fournir le ZIP mentionné dans l'issue #39. Examiner #35 et #63 avec les référents éditorial et technique, puis réconcilier les branches et relancer les contrôles. Inventorier et vérifier les fichiers reçus, leur sensibilité et leurs empreintes avant une PR d'import ; tester ensuite recherche et restauration. Poursuivre seulement alors le rapprochement des sources avec le registre de l'issue #41.

## Verdict du référent

Maintenir #64 en brouillon : la première phase technique est disponible pour revue, mais les archives réelles et les vérifications nécessaires à l'import manquent. Aucune fusion ou publication n'a été effectuée.


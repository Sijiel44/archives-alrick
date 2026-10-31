# B001-F — Modèle documentaire des évolutions

**Statut :** architecture d'indexation proposée, **aucun événement nouveau**, aucune famille canonisée, aucun changement des règles 5d6.

## Principes

1. **Niveau ≠ stade de vie ≠ nature ontologique ≠ puissance.** Le niveau 1–25 n'est **jamais** un déclencheur automatique de métamorphose. Un individu peut être niveau élevé sans changer de corps.
2. Un changement d'apparence n'est pas forcément une reproduction, une espèce, une maturation ou une ascension. Classer par preuve.
3. Traverser une Faille n'est pas être altéré par celle-ci : il faut documenter la cause et ses effets.
4. Une transition peut être exclusive à un individu ; son existence n'altère pas automatiquement sa fiche d'espèce.
5. Les liens d'une transition partagent les identifiants **historiques** ; aucun code nouveau attribué sans contrôle et validation.
6. Une séquence de trois à six formes n'est créée **que si la biologie ou les scènes démontrent une telle série**.

## Typologie documentaire proposée (non cosmologique)

| Mécanisme | Définition de travail | Point de contrôle |
| --- | --- | --- |
| \`croissance_naturelle\` | changement lié au cycle de vie | preuve d'un cycle répété, pas seulement âge connu |
| \`metamorphose\` | transformation corporelle marquée | variation d'état ou d'identité à documenter |
| \`developpement_magique\` | aptitude magique modifiée avec le temps | pouvoir observé, cause encore à vérifier |
| \`transformation_conditionnelle\` | forme dépendant d'un déclencheur | conditions et réversibilité |
| \`evolution_divergente\` | plusieurs trajectoires possibles | non démontrée par un choix isolé |
| \`mutation_alteration\` | changement sous effet extérieur observé | source de l'altération, pas une Faille supposée |
| \`adaptation_sans_metamorphose\` | expérience/entraînement sans changement de forme | aucun nouveau taxon |

## Format descriptif (exemple **structurel neutre**, pas un taxon)

Le JSON ci-dessous n'est **pas** un format accepté par l'Atelier 5d6 et n'est pas une règle de jeu.

\`\`\`json
{
  "schema": "alrick.bestiaire.evolution-documentaire.v1-propose",
  "code_transition": null,
  "sujet_code": null,
  "sujet_portee": "individu",
  "mecanisme": "adaptation_sans_metamorphose",
  "forme_depart_ref": null,
  "forme_arrivee_ref": null,
  "declencheur": null,
  "prerequis": [],
  "temporalite": null,
  "reversible": null,
  "modifications_physiques": [],
  "capacites_acquises": [],
  "capacites_perdues": [],
  "besoins_ecologiques_nouveaux": [],
  "conditions_de_survie": [],
  "limites": [],
  "source_precise": null,
  "canon_statut": "a_verifier",
  "etat_editorial": "en_chantier",
  "rencontre_jouee": null,
  "niveau_5d6": null,
  "remarques": "Exemple vide. Une valeur inconnue reste null ou []."
}
\`\`\`

### Contraintes de validation

- \`forme_depart_ref\` et \`forme_arrivee_ref\` sont des codes **existants**, pas des espèces automatiquement nouvelles.
- \`sujet_portee\` vaut \`individu\` ou \`espece\`, avec preuve directe pour généraliser à l'espèce.
- Les mécanismes narratifs doivent rester distincts des listes de niveaux.
- \`source_precise\` indique une scène jouée, une validation explicite, ou une proposition identifiée.
- \`canon_statut\` / \`etat_editorial\` doivent employer **exclusivement** les valeurs du contrat éditorial.
- Une transition non démontrée reste avec \`canon_statut: a_verifier\` ou \`hypothese\`, ou \`proposition_non_jouee\` s'il s'agit d'une idée de MJ.
- Les transformations irréversibles ne sont pas présumées transmissibles aux descendants.
- Aucune propriété \`mutation_faille\` n'est déduite du seul champ \`origine_couronne\`.
- Les métamorphoses attestées d'individus comme les compagnons de l'Odyssée doivent être relues dans les bruts et le Compendium **avant création d'une transition publique**.

## Modèle de graphe

Une famille peut relier **plusieurs formes réelles** et des bifurcations, plutôt qu'un chemin linéaire imposé :

\`\`\`text
Forme A --(transition attestée ou proposée, statut, source)--> Forme B
        --(autre transition sourcée si elle existe)--------> Forme C
Individu X --(expérience individuelle sans métamorphose)--> Individu X, état ultérieur
\`\`\`

Ce schéma représente des **emplacements de travail anonymes** et n'affirme l'existence d'aucune nouvelle lignée ou espèce. La future interface doit afficher le statut de chaque arête, sa provenance et ses restrictions d'accès.

## Tests à prévoir au chantier suivant

- Interdire les cycles impossibles **lorsque les sources déclarent la transition irréversible**, mais permettre les formes réversibles.
- Empêcher qu'un code d'individu devienne un code d'espèce à la sauvegarde.
- Empêcher qu'un \`niveau_5d6\` crée à lui seul une nouvelle forme.
- Rejeter tout champ « Faille » sans preuve de transformation.
- Vérifier les transitions à deux parents et formes dérivées **seulement si attestées**.
- Garder toutes les données sensibles hors du registre public ou de son graphe indexable.

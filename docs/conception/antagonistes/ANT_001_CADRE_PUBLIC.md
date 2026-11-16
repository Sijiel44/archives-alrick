# ANT-001 — Cadre d'antagonisme générique (proposition)

**Responsable :** ANT. **Statut :** proposition hors canon et non jouée. **Version de travail :** `ant-threat/0.1`. **Portée :** conception documentaire, pas règle 5d6.

## Définition

Une menace peut être un personnage, un collectif, une institution, une crise matérielle, un prédateur ou un système oppressif. Elle se caractérise par **intérêts**, **logique interne**, **moyens**, **limites**, **alliés**, **signes visibles**, **escalade**, **conséquences** et **options d'action**. Comprendre une motivation n'excuse pas les abus. Certains adversaires refusent la négociation : secours, défense, confinement et repli restent possibles.

## Gabarit réutilisable

| Champ | Contenu attendu |
| --- | --- |
| `threat_id`, `schema_version` | Identifiant stable et version du contrat, à homologuer |
| `title`, `kind`, `scope`, `campaign_id` | Nom, nature, échelle et contexte local distinct |
| `editorial_status`, `provenance` | Source, révision et statut ; `proposition_non_jouee` par défaut |
| `public_face`, `visible_signs` | Informations effectivement observables, sans révélations |
| `interest`, `rationale`, `red_lines` | Objectifs, logique, choix condamnables, interdits |
| `resources`, `dependencies`, `constraints` | Ressources et points faibles concrets, sans chiffres improvisés |
| `pressure_front`, `escalation_triggers` | Étapes conditionnelles, avertissements et bascules |
| `inaction_outcomes`, `deescalation_routes` | Suites plausibles, modes de désamorçage |
| `confrontation_modes`, `withdrawal_routes` | Rencontres, sorties, secours, non-violence et repli |
| `role_slots`, `profile_refs`, `ability_refs` | Emplacements PNJ et références mécaniques validées seulement |
| `rule_status`, `visibility`, `source_ref` | Homologation, public/privé et traçabilité |

## Front narratif (aucun bonus, niveau ou formule)

| Phase | Signaux publics | Interruption possible |
| --- | --- | --- |
| I0 — tension | Plaintes et décisions contestées | Informations, écoute, étude |
| I1 — pression | Restrictions, rumeurs, effets visibles | Témoins, médiation, contrôle |
| I2 — rupture | Confiance brisée, contestation | Protection, solidarité, preuve |
| I3 — crise | Décision risquée et préparatifs visibles | Négociation, secours, action, retrait |
| I4 — conséquences | Reconstruction ou conflit transformé | Réforme, justice, départ |

Le MJ n'avance pas ce front comme une punition automatique. Un déclencheur doit être cohérent, annoncé par des signes et susceptible d'être modifié par les choix des PJ. Le front n'est **pas une échelle de difficulté 5d6**.

## Échelles de jeu

**Proche :** hameau et infrastructure. **Régionale :** institutions et ressources. **Étendue :** diplomatie ou réseau de plusieurs territoires. **Exceptionnelle :** danger surnaturel ; tout effet mécanique exige validation des spécialistes. L'ampleur narrative n'attribue aucune puissance chiffrée.

## Équité et diversité

Prévoir pour chaque menace des indices indépendants, au moins trois voies de réponse significatives quand c'est possible, une conséquence de l'inaction, des limites de moyens, un droit au refus ou au départ et une issue même en cas d'échec partiel. Combat et pardon ne sont ni obligatoires ni garantis. Proposer audition, enquête, inspection, secours, médiation, résistance collective, repli et parfois confrontation. Prendre en compte les limites de contenu fixées par la table.

## Interfaces et confidentialité

- **INDEX/MATH :** aucune formule ajoutée ; les références de capacités sont vides tant que non validées.
- **PNJ/BEST/COMBAT/MAG :** les identités, créatures et pouvoirs restent chez leurs propriétaires.
- **AVE/QTE :** réutiliser scènes et fronts sans imposer une issue.
- **STUDIO/ARCHIVES :** copies locales, version/provenance, préservation des extensions et projection joueur **nouvelle construite par liste blanche**. Ne jamais transmettre l'objet MJ complet.
- **LORE/Publication :** ne pas confondre proposition, fait joué et lore validé.

**Aucun secret MJ réel ou fictif de scénario n'est inclus ici.** `unlisted`, `spoilers` ou CSS ne remplacent pas un contrôle d'accès. Aucun changement à Quartz, M01–M05, Bestiaire ou sauvegardes.

## Sources

`CONTRAT_EDITORIAL.md`, `content/monde/menaces-et-antagonismes.md`, `content/jouer/antagonistes-sans-decheance.md`, `content/monde/antagonistes-factions-propositions.md` (main `88f774f3d0d6d520d8d11443b72202b9caf4f94b`) ; contrat ORG-001 PR #78. **Document à valider par DG/LORE/INDEX/MATH.**

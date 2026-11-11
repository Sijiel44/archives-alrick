# B-003.1 — Passerelle contrôlée vers B-004

**Statut : préparation documentaire uniquement.** Aucun démarrage de B-004 avant accord explicite de la Direction et du créateur, fusion de B-003.1 puis vérification de `main`. Ne pas créer ici `bestiaire/b004-familles-evolutives`.

## Sources à transmettre
- `docs/bestiaire/B001_EVOLUTIONS.md`
- `docs/bestiaire/B003_1_RECONCILIATION_EVOLUTIONS.md`
- `docs/bestiaire/B003_1_MATRICE_VALIDATION_ESPECES.md`
- `docs/bestiaire/B003_1_ECOSYSTEME_CONSOLIDE.md`
- `docs/bestiaire/B002_CODES_VALIDES.json`
- Contrats M01–M05 et moteur `generateCreatureProfileM03` (strictement sans dérivation d'âge par niveau)

## Neuf pistes et qualifications de départ
| ID | Nature proposée | Incertitude à lever |
| --- | --- | --- |
| P21 | Épaississement anatomique + vigilance sociale | Croissance des plaques, biomasse, âge |
| P22 | Apprentissage de tissage | Soie, humidité, différences individuelles |
| P23 | Maturation lumineuse hypothétique | Énergie de bioluminescence, organes |
| P24 | Dépôts / maturation à distinguer | Scories refroidies, lichens et kératine |
| P28 | Maturation des défenses + rôle territorial | Sexe, âge, statut de chef |
| P30 | Apprentissage et adaptation de mobilité | Courants, territorialité |
| P34 | Maturation de coquille candidate | Particules, nutriments du lac |
| P35 | Croissance d'organe vocal + signaux acquis | Acoustique, ressources végétales |
| P36 | Mues/antennes + comportement | Écologie de galeries, mues |

## Modèle de transition à instruire en B-004
Pour chaque transition envisagée : `source_forme`, `cible_forme`, `mecanisme` (croissance, maturation, apprentissage, adaptation, statut, métamorphose réelle, magie, altération), `conditions_ecologiques`, `morphologie_verifiable`, `changements_comportementaux`, `reversible`, `portee` (espèce, population, individu), `sources`, `incertitudes`, `autorisation_createur`, `profil_5d6_optionnel`. Aucun seuil XP/niveau ne déclenche une mutation.

**Pilotes suggérés (non approuvés) :** P28 (défenses vs rang social) et P23 (maturation bioluminescente proposée) ; deux mécanismes contrastés. Aucun `VARC-` ou `P5C-` sans validation et preuve B-002.

## Porte de décision
B-004 ne commence que si la PR de B-003.1 est approuvée, fusionnée, que son commit final et sa CI sont vérifiés sur `main`. Les images P37–P41 restent hors dépôt et publication tant que droits et source ne sont pas résolus.

# Grimoire 5d6 — prototype v1 (branche séparée)

**Statut :** adaptation mécanique en test, **aucune règle de magie canonique ajoutée**. Cette documentation technique n'est pas une fiche de lore publiée.

## Sources et limites de conception

- Codex de la magie et de l'ingénierie, v1.7 (25 octobre 2026), notamment la partie *Arts magiques, Cercles et ingénierie* : un Cercle organise des architectures, il n'est ni un niveau de sort ni une jauge de mana ; **mana ≠ maîtrise ≠ créativité** ; la différence entre théorie, assistance et maîtrise stable reste déterminante ; VIII décrit un critère technique d'archimage, IX ne devient pas automatiquement un rang divin.
- Bible du monde et des puissances v1.7 : le Silence, Yggdrasil et les Autorités fondamentales ne se réduisent pas à l'échelle de dégâts d'un système de combat.
- `content/jouer/systeme-5d6-base12.md`, `content/jouer/echelle-existences-niveaux-affinites.md`, `content/jouer/parcours-de-vie-affinites.md` et `docs/EQUILIBRAGE_ATELIER_5D6_24_NIVEAUX.md` : niveaux 1–25, aventurier habituellement niveau 5, affinités conditionnelles, opposition, protection, critiques naturels.
- `CONTRAT_EDITORIAL.md` : les propositions et adaptations de table ne créent pas le canon, aucun secret MJ privé dans les pages publiques.

### Ce qui existe dans la version initiale

Le hub contient un nouvel onglet **Grimoire**. Le système conserve `archives-alrick-atelier-5d6-v1` et les imports/exports actuels `alrick.sheets.v2` et `alrick.campaign.v1`. La fiche enrichie conserve désormais un bloc **optionnel** `grimoire` qui est régénéré à vide lors de l'import d'une vieille sauvegarde.

- Catalogue : cinq sorts de démonstration **non canoniques**, classés par usage, et créations locales du MJ attachées à la fiche. Pas de promotion automatique vers le référentiel officiel.
- Apprentissage : demande locale PJ, approbation/retrait en mode MJ ; préparation si requise par un sort ; vérification systématique de la connaissance et du Cercle attesté.
- Attestation des Cercles I–IX par le MJ sur preuve de pratique, pas selon le niveau et sans ajouter de sorts automatiquement.
- Lancer : sélectionner, identifier la cible/l'intention, vérifier le mana, le Cercle, les maîtrises, la préparation et la concentration, **confirmer la dépense**, lancer 5d6 et enregistrer le résultat. Une tentative incantatoire validée consomme le mana même si le jet échoue (proposition mécanique révisable).
- Opposition : réutilise `resolveOpposition`, `resistanceScore`, `effectiveProtection` et `affinityImpactBonus`. Affinité : **seulement les dégâts magiques réellement correspondants**, jamais un bonus universel de touche. Un contact héroïque naturel n'impose pas un état ni une pénétration. Les protections demeurent applicables.
- Effets actifs : instantané, tours, segments narratifs et permanence conditionnelle ; concentration unique dans ce prototype ; entretien demandé avant d'avancer une unité, interruption manuelle et journal. Aucune conversion arbitraire en secondes réelles.
- Sécurité : **aucun PV ni statut d'une autre fiche ne se modifie automatiquement** par un sort ; les dégâts affichés sont seulement potentiels. Les contrôles « MJ local » ne constituent **pas** des permissions serveur.

### Exemples démonstratifs

| ID | Type | Cercle | Mana | Remarque |
| --- | --- | --- | --- | --- |
| `demo-lueur-guide` | Utilitaire | I | 2 | Lumière locale, scène |
| `demo-brise-outils` | Artisanat | I | 2 + 1/tour | Concentration, tour |
| `demo-lecture-eau` | Perception | I | 3 | Maîtrise Magie 1 |
| `demo-voile-protecteur` | Protection | II | 4 + 1/tour | Préparation, concentration, aucun bouclier chiffré implicite |
| `demo-etincelle` | Attaque | I | 4 | DD 21, résistance magique, affinité foudre conditionnelle |

Ces valeurs sont fictives et servent exclusivement à tester le flux. **Aucune technique de la campagne d'Orin n'est traduite automatiquement en fiche de sort.**

## Schéma de données

`alrick.grimoire.v1` est conservé **dans chaque objet Sheet** :

```json
{
  "schema": "alrick.grimoire.v1",
  "circlesAttested": [],
  "known": [],
  "requests": [],
  "personalSpells": [],
  "effects": [],
  "history": []
}
```

Un sort possède un identifiant et une version, les métadonnées d'origine/statut/source, une catégorie et un domaine, son Cercle (si pertinent), le coût, l'exigence de maîtrise/affinité/préparation, le jet, la résistance, la portée, la cible, la durée, l'entretien et les limites. Les `KnownSpell`, `ActiveSpell` et `SpellEvent` ont chacun des identifiants distincts.

`normalizeGrimoire` est une migration défensive : les données manquantes deviennent un grimoire vide ; seules les entrées valides sont conservées, avec limites de taille. Un sort personnalisé importé reste une **création de campagne**, jamais `canon_confirme`. Les statistiques, les affinités, l'inventaire et l'historique 5d6 existants sont préservés.

## Test et validation

```sh
npm ci
npm run check:types
node scripts/test-5d6-grimoire.mjs
npm test
```

Parcours manuel : exporter une sauvegarde ancienne, la réimporter, sélectionner un personnage doté de mana, ouvrir le grimoire, demander un sort, passer en mode MJ, attester son Cercle avec une justification, approuver le sort, l'utiliser (confirmer le mana), vérifier le jet, l'historique, l'effet actif et l'export/réimport. Vérifier sur téléphone et avec une fiche sans magie.

## Frontière multijoueur

Aucune connexion réseau fictive. Le moteur et les événements peuvent être déplacés dans un serveur futur, **mais aucune mutation n'est actuellement atomique ou autoritaire**. Pour l'intégration future : conserver les identifiants d'événements, transmettre intentions et préconditions, demander au serveur la permission du MJ, vérifier la révision de fiche et l'idempotence, puis exécuter dépense+jet+effets dans une transaction. Le pilote de tables existant reste sur sa branche et n'est pas modifié ici.

## Ce qui reste hors v1

Le grimoire n'a pas encore de véritable catalogue **canon validé** ; la traduction de sorts tirés des volumes demande une revue avec références exactes. Une création de campagne est attachée à une fiche et ne peut pas encore être synchronisée entre plusieurs personnes. Les ressources autres que le mana, la sélection d'options avancées, les interruptions externes/contre-sorts, les soins et altérations appliqués à une **autre** fiche, les effets permanents soumis à une vraie autorisation, les animations et les tests utilisateurs mobiles sont à développer après validation de cette tranche.

# Grimoire 5d6 — prototype v1 (branche séparée)

**Statut :** adaptation mécanique en test, **aucune règle de magie canonique ajoutée**. Cette documentation technique n'est pas une fiche de lore publiée.

## Clarification du créateur — Cercles et artefacts (31 octobre 2026)

Les **Cercles I à IX** sont des prérequis de compréhension et de pratique magique, et non des niveaux de personnage. Ils ouvrent à des architectures de plus en plus complexes et à des effets **potentiellement** plus puissants ou dévastateurs. Ils ne sont pas une multiplication systématique des dégâts : un grand effet utilitaire peut aussi nécessiter une architecture supérieure.

Le **Cercle I** correspond notamment à la capacité d'**activer une structure préexistante**. **MAG-050, L'activation accessible** (Codex v1.7, CB37 échanges 82–89, paragraphes 06702–07442) confirme qu'un Cercle peut déclencher un ensemble préparé par un mage plus avancé, avec énergie déjà disponible ou stockage prévu dans l'objet. L'utilisateur **n'acquiert ni la connaissance du sort, ni le Cercle de conception, ni la capacité de reconstruire cette architecture**.

**Neuvième Cercle :** nouvelle précision du créateur : la *pratique* du IX est réservée aux êtres divins, sans automatisme lié au niveau 21–25. Le Codex antérieur précise également que la stabilisation du IX, observée chez Orin et Freya, **n'accorde ni divinité automatique, ni siège au Grand Conseil**. Les scènes antérieures sont conservées ; la qualification des statuts divins exige un examen spécifique, pas une retouche rétroactive du récit.

### Séparation mécanique

| Faculté | Prérequis | Ce qu'elle ne confère pas |
| --- | --- | --- |
| Activer une matrice préparée | Objet réel dans l'inventaire, Cercle de **déclenchement** attesté, charges et conditions de l'objet | Conception, connaissance du sort et maîtrise du Cercle de construction |
| Pratiquer seul un sort | Sort appris, Cercle de pratique, maîtrise et ressources | Tous les sorts du Cercle, ni un Cercle supérieur |
| Concevoir une nouvelle architecture | Recherche, compréhension, stabilité et validation MJ ; création autonome avancée encore hors v1 | Immunités ou Autorités fondamentales |
| Pratiquer le IX | Reconnaissance divine explicite par le MJ, indépendante du niveau | Divinité, ascension ou titre accordé par le simple Cercle |

**Modèle de matrice v1 :** `id, itemId, spellId, architectureCircle, activationCircle, energySource, charges, approvedBy, source`. La matrice est liée à un objet déjà enregistré. Elle peut consommer une charge préstockée plutôt que le mana du porteur ; le déclenchement reste soumis à un jet si l'issue est incertaine. Les effets et immunités restent soumis aux règles 5d6 et au MJ.

Le champ expérimental `effectLevel` (1–25) décrit **l'intensité chiffrée conçue dans l'effet**, indépendamment du niveau du porteur. Ce n'est ni une formule déduite du numéro du Cercle, ni une condition d'ascension ; le MJ peut concevoir des effets majeurs de Cercle VIII tout en conservant des sorts utilitaires du même Cercle. L'entretien d'un effet continu reste provisoirement payé par le porteur dans le prototype, même si l'activation initiale vient d'une matrice.

## Sources et limites de conception

- Codex de la magie et de l'ingénierie, v1.7 (25 octobre 2026), notamment la partie *Arts magiques, Cercles et ingénierie* : un Cercle organise des architectures, il n'est ni un niveau de sort ni une jauge de mana ; **mana ≠ maîtrise ≠ créativité** ; la différence entre théorie, assistance et maîtrise stable reste déterminante ; VIII décrit un critère technique d'archimage, IX ne devient pas automatiquement un rang divin.
- Bible du monde et des puissances v1.7 : le Silence, Yggdrasil et les Autorités fondamentales ne se réduisent pas à l'échelle de dégâts d'un système de combat.
- `content/jouer/systeme-5d6-base12.md`, `content/jouer/echelle-existences-niveaux-affinites.md`, `content/jouer/parcours-de-vie-affinites.md` et `docs/EQUILIBRAGE_ATELIER_5D6_24_NIVEAUX.md` : niveaux 1–25, aventurier habituellement niveau 5, affinités conditionnelles, opposition, protection, critiques naturels.
- `CONTRAT_EDITORIAL.md` : les propositions et adaptations de table ne créent pas le canon, aucun secret MJ privé dans les pages publiques.

### Ce qui existe dans la version initiale

Le hub contient un nouvel onglet **Grimoire**. Le système conserve `archives-alrick-atelier-5d6-v1` et les imports/exports actuels `alrick.sheets.v3` et `alrick.campaign.v2`. La fiche enrichie conserve désormais un bloc **optionnel** `grimoire` qui est régénéré à vide lors de l'import d'une vieille sauvegarde.

- Catalogue : six sorts de démonstration **non canoniques**, classés par usage, et créations locales du MJ attachées à la fiche. Pas de promotion automatique vers le référentiel officiel.
- Apprentissage : demande locale PJ, approbation/retrait en mode MJ ; préparation si requise par un sort ; vérification systématique de la connaissance et du Cercle attesté.
- Attestation des Cercles I–VIII par le MJ ; IX soumis à reconnaissance divine distincte. Aucune attribution automatique par niveau et aucun sort automatiquement acquis.
- Lancer : sélectionner, identifier la cible/l'intention, vérifier le mana, le Cercle, les maîtrises, la préparation et la concentration, **confirmer la dépense**, lancer 5d6 et enregistrer le résultat. Une tentative incantatoire validée consomme le mana même si le jet échoue (proposition mécanique révisable).
- Opposition : réutilise `resolveOpposition`, `resistanceScore`, `effectiveProtection` et `affinityImpactBonus`. Affinité : **seulement les dégâts magiques réellement correspondants**, jamais un bonus universel de touche. Un contact héroïque naturel n'impose pas un état ni une pénétration. Les protections demeurent applicables.
- Effets actifs : instantané, tours, segments narratifs et permanence conditionnelle ; concentration unique dans ce prototype ; entretien demandé avant d'avancer une unité, interruption manuelle et journal. Aucune conversion arbitraire en secondes réelles. Un résumé des effets actifs apparaît également dans la fiche de personnage et dans la barre de statut du hub.
- Sécurité : **aucun PV ni statut d'une autre fiche ne se modifie automatiquement** par un sort ; les dégâts affichés sont seulement potentiels. Les contrôles « MJ local » ne constituent **pas** des permissions serveur.

### Exemples démonstratifs

| ID | Type | Cercle | Mana | Remarque |
| --- | --- | --- | --- | --- |
| `demo-lueur-guide` | Utilitaire | I | 2 | Lumière locale, scène |
| `demo-brise-outils` | Artisanat | I | 2 + 1/tour | Concentration, tour |
| `demo-lecture-eau` | Perception | I | 3 | Maîtrise Magie 1 |
| `demo-voile-protecteur` | Protection | II | 4 + 1/tour | Préparation, concentration, aucun bouclier chiffré implicite |
| `demo-etincelle` | Attaque | I | 4 | DD 21, résistance magique, affinité foudre conditionnelle |
| `demo-onde-murailles` | Attaque préparée | VIII | 16 mana ou charge | Démo haute intensité, compatible activation par dispositif du Ier Cercle, jamais canonique |

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
  "history": [],
  "matrices": [],
  "divineNinthApproved": false,
  "divineNinthWitness": ""
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

Le grimoire n'a pas encore de véritable catalogue **canon validé** ; la traduction de sorts tirés des volumes demande une revue avec références exactes. Une création de campagne et ses matrices préparées sont attachées à une fiche et ne peut pas encore être synchronisée entre plusieurs personnes. Les ressources autres que le mana, la sélection d'options avancées, les interruptions externes/contre-sorts, les soins et altérations appliqués à une **autre** fiche, les effets permanents soumis à une vraie autorisation, les animations et les tests utilisateurs mobiles sont à développer après validation de cette tranche.

## G-001 — Réconciliation M01–M05 (31 octobre 2026)

- Le Grimoire est ajouté à l’Atelier courant sans effacer les interfaces M02, combat M03, Bestiaire M04/M05. Les sauvegardes publiques restent `alrick.sheets.v3` et `alrick.campaign.v2`; les versions plus anciennes sont acceptées.
- Les résolutions s’appuient sur `resolveProgressionAction` et `resolveCombatM03`. Les caractéristiques brutes restent distinctes des bonus effectifs, ainsi que niveau, Cercle, maîtrise, affinité et intensité de matrice.
- Les extensions inconnues des fiches, objets, sorts, matrices, effets et historiques sont conservées. Les entrées de Grimoire rejetées par la validation restent archivées sous `legacyOriginal` avec avertissements `migrationWarnings`.
- Arbitrage énergétique OUVERT : une matrice `energySource=caster` consomme encore une charge et le mana du porteur (comportement historique provisoire), sans canonisation. Voir rapport G-001.
- Les six sorts de démonstration sont expérimentaux et non canoniques. Les essais manuels sur profils réels restent nécessaires.

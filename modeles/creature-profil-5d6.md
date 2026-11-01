---
publish: false
title: "[Profil 5d6 M03 — modèle documentaire, non canonique]"
code: "CODE_PROFIL_A_VERIFIER"
categorie: "guide"
canon_statut: "a_verifier"
etat_editorial: "en_chantier"
source_brute: "Adaptation de jeu à documenter ; aucune scène jouée implicite"
ancre_documentaire: "B-001.1 / M03 / M04.1 / M05"
visibilite: "brouillon"
spoilers: false
unlisted: true
portee: "univers_partage"
public_cible: ["mj", "joueurs"]
usage_en_jeu: ["reference", "rencontre", "scenario"]
description: "Gabarit pour un profil 5d6 M03 ; couche de jeu distincte du lore."
tags: [bestiaire, modele, 5d6, m03, playtest]
---

# [Profil de jeu — créature / PNJ]

> [!warning] Ce modèle n'est ni une espèce, ni une capacité canonique, ni une sauvegarde importable
> Remplacer les espaces réservés par des valeurs réellement issues du moteur actuel, des ajustements explicites du MJ et des sources documentaires. Ne jamais copier ce gabarit Markdown dans une sauvegarde JSON en prétendant qu'il s'agit de `alrick.bestiary.v1`.

## I. Identité de jeu et correspondances documentaires

- **Référence documentaire** : [code(s) existant(s) ; espèce, individu ou autre ; statut de preuve].
- **Code de profil documentaire** : [réservation distincte, aucune attribution automatique].
- **ID local de la fiche Bestiaire** : [`BestiaryCard.id`, indépendant des codes IMP/REV/DRG/CRE].
- **Associations n:n (proposées dans le registre documentaire)** : [0..n relations `profileId` ↔ `documentaryId`, avec type, source, version, validation et restrictions]. Une espèce ou un individu peut admettre plusieurs profils de jeu, et un profil peut être cité par plusieurs dossiers documentaires : **ce registre inverse n'est pas encore implémenté automatiquement par M05**.
- **`documentaryLink` M05** : [zéro ou un lien déclaratif principal actuellement lu par `readDocumentaryLink(card)`; `id`, `type: espece|individu|autre`, `source`, `sourceVersion`, `canonStatut`, `etatEditorial`, `visibilite`, `publish`, `spoilers`, `unlisted`, `publicPath`]. La navigation est volontairement désactivée (`canOfferDocumentaryLink() === false`). Le champ ne prouve pas le canon, l'existence d'une URL ni un droit de publication.
- **Niveau de jeu** : [1–25] ; **niveau de danger de rencontre** : [analyse séparée : nombre, terrain, objectif, état, tactique, moyens des personnages, possibilités de fuite].

## II. Contrat de moteur, versions et provenance numérique

- **Source du générateur** : `generateCreatureProfileM03(level, archetype)` dans `atelier5d6-bestiary.ts`, **et non** `generateCreatureProfile` historique.
- **Base de fiche courante** : `createBestiaryCard(level, archetype, kind, role)` dans `atelier5d6-bestiary-workshop.ts`.
- **Moteur** : `ruleset: "m03"` ; **schéma natif** : `schema: "alrick.bestiary.v1"`.
- **`kind`** : `creature` ou `pnj` ; **`role`** : `offensif`, `defensif` ou `soutien`.
- **Archétype** : `faune`, `predateur`, `gardien`, `mystique`, `colosse`.
- **Commit/révision du moteur** : [SHA vérifié ; version du playtest] ; **statut local** `BestiaryCard.status` : `brouillon`, `jeu_valide`, `documentaire_approuve` (ce dernier **n'autorise jamais** une publication documentaire).
- **Historique des ajustements MJ** : [champ, ancien état, nouveau chiffre, auteur, motif, date de validation]. Ne jamais dupliquer des formules pour calculer les valeurs.
- **Provenance de chaque chiffre** : [M03 généré / valeur éditée par le MJ / contexte test / donnée documentaire observée mais jamais transformée automatiquement en chiffre].

## III. Caractéristiques, réserves et défenses

| Clé effective M03/M04.1 | Valeur à fournir | Calcul / prudence |
| --- | --- | --- |
| `stats.physique`, `agilite`, `esprit`, `presence` | [bruts] | `effectiveStat` de M01 ; pas de plafond brut à 12 |
| `masteries` | [noms et rangs] | `effectiveMastery` de M01 ; pas de bonus fait à la main |
| `pvMax`, `manaMax` | [chiffres] | générateur M03 ; mana sans pouvoir automatique |
| `resistanceBonus.physique/magie/mental` | [0..8] | **bonus au seuil de résistance**, via `resistanceScoreM03` |
| `protection.physique/magie/mental` | [0..60] | **bonus MJ à l'absorption**, via `effectiveProtectionM03`, amorti par le moteur |
| `equipmentGrades.physique/magie/mental` | [0..5] | protection d'équipement calculée par M03 |
| `baseDamage`, `penetration` | [1..12], [0..8] | validation native `validateBestiaryCard` |
| `abilities` | [tableau de capacités] | texte et consentement MJ ; aucun effet numérique automatique |

**Lecture de combat** : utiliser `toDefense`, `resolveCombatM03`, `attackMath`, `evaluateMatchup`, `deriveM05Sheet`, `sumOccurrences` et `TOTAL_OUTCOMES`. Distinguer défense, contact, pénétration, absorption et dégâts. Ne pas insérer ici une deuxième version des formules.

## IV. Capacités, mobilité et actions

- **Affinités** : [source lore individualisée / option MJ ; aucune affinité gratuite issue du seul nom].
- **Capacités** : [nom, description, limitations, accord MJ, déclencheur, coût, durée, cible, rechargement et statut « mécanique implémentée » ou « description seulement »].
- **Offensive** : [modes attestés, portée et faisabilité ; `baseDamage` ne signifie pas comportement agressif].
- **Défense** : [protection, couverture, actions disponibles, limites].
- **Mobilité / terrain** : [marche, nage, vol, accès, obstacles : faits ou propositions sourcés].
- **Économie des actions** : [hypothèse de test ; `evaluateMatchup` utilise un modèle simplifié d'une attaque par acteur et round].
- **Limites** : [ressources, zones d'effet, vulnérabilités documentées, obstacles narratifs].

## V. Rencontre, groupes et options non combattantes

| Scénario à tester | Paramètres | Résultat / validation |
| --- | --- | --- |
| N5, N10, N15, N20, N25 | [5 archétypes, profils adverses offensif/défensif/polyvalent] | [`evaluateMatchup` ; aucune garantie de victoire] |
| Solo et groupes | [1/2/4 adversaires de référence ; grade, situation, effectifs] | [durée théorique et limites explicites] |
| Être non combattant | [`kind: pnj`, `role: soutien` ou faune non hostile ; objectifs] | [absence d'attaque souhaitée ≠ suppression des `baseDamage` techniques] |
| Évitement / fuite / négociation / secours | [indices, conditions, issue et suivi narratif] | [jugement du MJ, **pas** jet automatisé absent du moteur] |

- **Niveau de menace collectif** : [évalué par le MJ, distinct du niveau et de l'espèce].
- **Hypothèses** : [cible passive, pas de ressources dépensées, une attaque par acteur et round, pas de tactique ni de morale dans la projection simplifiée].
- **Tests humains** : [effectués / non effectués, date, joueurs, retours, limitations].
- **Validation mécanique** : [non testé / testé automatiquement / approuvé par le MJ ; ne modifie ni `canon_statut` ni le registre encyclopédique].

## VI. Import, export et sauvegardes — contrat réel M04.1 / M05

1. **Sauvegarde native** : utiliser `BestiaryCard` validée par `validateBestiaryCard` ; `schema:"alrick.bestiary.v1"`, `ruleset:"m03"`, stockage local `archives-alrick-bestiary-v1`. Le choix de fiche active est conservé séparément.
2. **Transfert volontaire vers l'Atelier** : utiliser `exportBestiaryForAtelier(card)` ; enveloppe `schema:"alrick.sheets.v3"`, feuille `schema:"alrick.sheet.v3"`, `ruleset:"m03-bestiary"`, `kind:"creature"|"pnj"`, valeurs, `resistanceBonus`, `protection`, `equipmentGrades`, et instantané complet `bestiarySource`.
3. **Relecture de la source** : `bestiarySource` conserve les extensions JSON inoffensives, dont `documentaryLink` ; ne pas copier les informations confidentielles dans un export public. Les identifiants locaux de profils et les codes documentaires sont distincts.
4. **Anciennes sauvegardes** : `alrick.sheets.v1/v2`, campagnes v1/v2 et `legacyOriginal` demeurent des données à préserver ; **pas de conversion automatique** ni de combat mixte ancien/M03 sans adaptation volontaire. Ne jamais fournir un ancien exemple `alrick.sheet.v2` comme format de transfert actuel.
5. **Limites de sécurité** : un champ JSON déclaré ne vérifie ni canon, ni droits sur un portrait, ni provenance ; `readApprovedArtwork` filtre le rendu M05 ; les secrets MJ ne doivent pas être placés dans les pages publiques ni les exportations partagées.

## VII. Traçabilité et décision

| Affirmation ou chiffre | Fonction / provenance | Scénario de test | Statut documentaire | Arbitrage |
| --- | --- | --- | --- | --- |
| [à renseigner] | [SHA ou CB exact] | [automatisé / table] | [contrat existant] | [à vérifier] |

**Références de base :** PR #57 à #62 ; `docs/rapports-missions/M03_COMBAT_BESTIAIRE_5D6.md`, `M04_INTEGRATION_PUBLICATION_5D6.md`, `M05_CONTRAT_BESTIAIRE_DOCUMENTAIRE.md`, `M05_CONTRAT_MOTEUR_5D6.md` et `CONTRAT_EDITORIAL.md`. Ce gabarit reste hors `content/`, avec `publish: false`.


## Validation individuelle du code B-002 (obligatoire avant fusion de la fiche)

- **Préfixe approuvé** : `P5C-` pour la nature documentaire `profil_5d6_partage`. Pour une identité déjà dotée d'un code historique (`DRG`, `REV`, `IMP`, `CRE`…), conserver ce code sans le remplacer.
- **Code proposé** : [uniquement si l'entité est réellement définie et justifiée ; ne jamais reprendre un code déjà attribué].
- **Fichier de référence** : [chemin réel dans `content/` ; identique au registre].
- **Source exacte** : [document, version et passage, ou décision explicite de création].
- **Preuve de validation du créateur** : [référence traçable de l'approbation individuelle].
- **Statuts** : `canon_statut` et `etat_editorial` indépendants ; un code unique n'attribue ni canon, ni `publish:true`.
- **Inscription de contrôle** : renseigner l'entrée correspondante dans `docs/bestiaire/B002_CODES_VALIDES.json` et faire réussir `npm run test:b002`. Le contrôle recherche directement la fiche dans `content/` ; aucun identifiant attribué seulement par son préfixe n'est autorisé.

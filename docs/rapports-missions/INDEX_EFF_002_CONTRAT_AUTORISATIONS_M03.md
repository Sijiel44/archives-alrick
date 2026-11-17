# INDEX-EFF-002 — Passerelle d'autorisation vers M03 (prototype)

**Rôle :** 11 INDEX + 10 MATH.  
**Statut :** développement expérimental isolé, **non homologué, non fusionné, non publié**.  
**Sources :** [MATH-EFF-001 #147](https://github.com/Sijiel44/archives-alrick/pull/147), [MATH-REF-002A #163](https://github.com/Sijiel44/archives-alrick/pull/163), [MATH-CREATE-003 #165](https://github.com/Sijiel44/archives-alrick/pull/165).  
**Ordre :** [INDEX #161](https://github.com/Sijiel44/archives-alrick/issues/161), [STUDIO-CREATE-004 #166](https://github.com/Sijiel44/archives-alrick/issues/166), [ARCHIVES #157](https://github.com/Sijiel44/archives-alrick/issues/157), [QA-MATH-003 #167](https://github.com/Sijiel44/archives-alrick/issues/167).

## 1. Pourquoi ce raccord est prioritaire

Les cartes M04 et les fichiers d'import peuvent conserver une propriété `approved:true` ou `approvedByGM:true` **déclarée par les données**. Cette mention ne suffit pas à prouver que le MJ a effectivement autorisé l'acteur à utiliser une capacité, un sort, un enchantement ou un effet de créature. M03 valide les bornes des nombres, mais ne connaît pas à lui seul l'origine et les droits du détenteur.

La nouvelle couche `quartz/components/scripts/atelier5d6-index-effects.ts` **n'invente aucun autre calcul de combat** : elle rassemble les effets réellement autorisés puis appelle `resolveUnifiedCombatM03`, lui-même fondé sur le M03 existant.

## 2. Contrat et comportement de la session INDEX

| Élément | Champs minimum | Protection |
|---|---|---|
| Référence | `type` (`ability/spell/object/ritual/creature/ordinary`), `id`, `revision` | Identifiant stable, révision entière positive, pas de code dans le nom |
| Définition candidate | Référence, `provenance`, `effect` optionnel, `intensityEligible` | Effet borné M03, aucune approbation tirée de l'import |
| Autorisation | Référence exacte, détenteur `holderId`, confirmation locale du MJ | En mémoire, jamais recréée depuis `approved:true` d'un export |
| Jet | Contrat `CombatM03Input`, référence(s) d'attaque et défense, intensité éventuelle | L'effet envoyé par le caller dans `action.effects` est **toujours remplacé** par les effets autorisés de la session |
| Résultat | `resolveUnifiedCombatM03` + références utilisées/bloquées | Même touche/protection que M03 ; mental sans PV, aucun débit effectué |

### Ordre d'usage attendu dans le Studio

1. `importDefinition` charge une définition *candidate* locale, sans droit automatique, en ignorant les drapeaux `approved`.
2. `approveForHolder` est appelé **uniquement depuis un geste explicite du MJ** sur le détenteur et la version affichée ; cette API seule ne vérifie pas l'identité du MJ, responsabilité du contrôleur Studio.
3. `resolve` assemble les effets d'attaque et défense autorisés, ignore les autres, habilite éventuellement une intensité et délègue **toute la résolution à M03**.
4. `revokeForHolder` retire immédiatement un droit ; recharger la même définition révoque les permis de la session sur cette révision.
5. Les permissions ne sont pas sérialisées : après interruption/reprise, ARCHIVES doit redemander/attester la validation MJ via un journal protégé, **jamais** lire `approved:true` dans un JSON arbitraire.

**Attention :** la confirmation `approveForHolder(..., true)` constitue une **frontière de confiance applicative**. Elle n'est pas une preuve cryptographique ni une autorité distante. Seul le contrôleur MJ doit appeler cette opération, après vérification des droits et des données. Le prototype ne remplace pas la protection des secrets, le contrôle de propriété ni les journaux de sauvegarde de Studio.

## 3. Invariants d'interopérabilité

- Les *objets purement descriptifs* possèdent `effect:null` et ne changent aucun résultat numérique M03.
- Les effets numériques sont bornés : familles `precision/defense/absorption/impact/penetration`, magnitude **1 à 2**, durée **1 à 3**, déclencheur cohérent. Ni sort ni objet ne reçoit une propriété chiffrée depuis une phrase libre.
- Le permis d'intensité est distinct d'un effet offensif ; un sort ou objet à `intensityEligible:false` ne donne jamais accès au multiplicateur divin.
- Niveau 20 = éveil, N21–25 = coefficient offensif pour l'effet réellement éligible ; `mineure` reste x1. Rang, Cercle et degré narratif d'école restent indépendants.
- L'autorisation d'un sort, par exemple **Étincelle feu Cercle I**, ne lui attribue pas automatiquement de portée, dégâts ou coût : ceux-ci appartiennent à MAG et doivent être définis/validés séparément.
- Une référence d'effet liée à une carte du Bestiaire peut être transférée avec la fiche, **pas son ancienne autorisation d'activation**. Les identités source et détenteur restent distinctes.

## 4. Test préparé (exécuter sur le vrai HEAD)

`node scripts/test-index-eff-002.mjs` ou `npm run test:indexeff002`, ajouté à `npm test` :

1. Import avec drapeaux `approved:true` malveillants : **aucun effet**.
2. Confirmation locale du MJ obligatoire et liée au détenteur ; un autre PNJ n'hérite pas du droit.
3. Révision différente, rechargement et révocation : aucune persistance automatique.
4. M03 avec impact validé : +2 borné ; avec absorption défensive : réduction sans percer l'absorption.
5. Arme/objet descriptif : pas de dégâts en plus.
6. Sort d'essai autorisé à intensité majeure N25 : x2 ; sans autorisation : x1 ; mineure disponible.
7. Mental : zéro PV même avec sort intensifié ; références invalides refusées.

Ces tests sont **écrits mais pas encore qualifiés PASS** tant que le run de CI de la branche n'a pas fini. Les recettes navigateur, anti-doublon, dépense mana/charge et sécurité des sauvegardes restent les missions STUDIO/ARCHIVES/QA.

## 5. Passations propriétaires et conditions de fusion

- **INDEX #161 :** revoir le type de référence stable, l'authentification de l'instance/copie/variante et la politique d'autorisation du détenteur ; finaliser le lien catalogue vers Studio.
- **MAG #156, CAP #160, OBJETS #159 :** fournir leurs définitions de source, révisions, prérequis, ressources, niveaux/Cercles distincts ; pas de bonus dérivé des descriptions.
- **BEST #158 :** vérifier espèce → individu → variante et autorisation d'un effet propre à une créature.
- **STUDIO #166 / ARCHIVES #157 :** interfaces de confirmation, débiter une fois la tentative, journal idempotent, restauration, pas de permissions récupérées d'un export non fiable.
- **QA #167 / DG #162 :** vérifier 7 776 issues, protections, mental, objets, niveaux divins, navigateur, tablette et dés physiques.

**Aucune donnée de canon, de campagne ou de publication Quartz n'est modifiée par ce prototype.**

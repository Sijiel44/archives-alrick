# MATH-SITE-002 — Dossier de diffusion conditionnelle du guide 5d6 illustré

**Date de décision : 16 novembre 2026.**  
**Ordre du créateur : LANCER la publication du guide mathématique illustré, en même temps que l'intégration Studio, INDEX et la recette complète.**  
**Statut : PR de livraison préparatoire ; le site public n'est PAS encore modifié.**  
**Référents :** 10 MATH, 21 ATELIERS, 02 QA, 00 DG et 05 INTÉGRATION.

## 1. Chaîne de sources et responsabilités

- [MATH-EFF-001 PR #147](https://github.com/Sijiel44/archives-alrick/pull/147) : audit, sources M01–M03 et contrat unique.
- [MATH-REF-001 PR #151](https://github.com/Sijiel44/archives-alrick/pull/151) : modèle et simulations de référence.
- [MATH-SITE-001 PR #152](https://github.com/Sijiel44/archives-alrick/pull/152) : deux guides Quartz **encore à `publish:false`**, huit WebP, textes alternatifs et scripts.
- [MATH-REF-002A PR #163](https://github.com/Sijiel44/archives-alrick/pull/163) : extension M03 opt-in, tests exacts. CI à HEAD `5716cd1aa4dbe405258355b14f087782f17364bb` : PASS.
- [MATH-CREATE-003 PR #165](https://github.com/Sijiel44/archives-alrick/pull/165) : variantes M04, import PJ M02 → PNJ M03, catalogues. CI à HEAD `f52bbbf657b2152d568e59dc9a06a68b2237047a` : PASS.
- [STUDIO-CREATE-004 #166](https://github.com/Sijiel44/archives-alrick/issues/166) : interface du MJ et parcours deux gestes, à réaliser.
- [INDEX-EFF-002 #161](https://github.com/Sijiel44/archives-alrick/issues/161) et [ARCH-EFF-002 #157](https://github.com/Sijiel44/archives-alrick/issues/157) : provenance des permissions, ressources et sauvegarde, à raccorder.
- [QA-MATH-003 #167](https://github.com/Sijiel44/archives-alrick/issues/167) : recette exhaustive, équilibre, navigateur et table, **non terminée**.
- [MATH-SITE-002 #162](https://github.com/Sijiel44/archives-alrick/issues/162) : arbitrage de diffusion DG.

## 2. Livrable effectivement prêt pour examen

| Page | Chemin Quartz | Contenu |
|---|---|---|
| **Le système 5d6 unifié** | `content/jouer/systeme-5d6-unifie-reference.md` | Un jet de cinq d6 ; toucher/effets ; dégâts, protection, pénétration, absorption, intensités, éveil N20/divin N21+, usage table |
| **Créer avec le système 5d6** | `content/jouer/atelier-creation-5d6-guide-illustre.md` | PJ, PNJ, créature, maîtrise, sort, capacité, objet, exemples fictifs, scènes et création facile |

Huit WebP originaux figurent sous `content/images/regles/math-site-001-*.webp`. Sources SVG hors `content/` et script de rendu `scripts/render-math-site-001-illustrations.mjs`.

**Caution éditoriale :** plusieurs exemples de dégâts, coûts, PV d'ennemis et statistiques particulières restent des illustrations ou hypothèses. La version numérique d'Étincelle **feu, Cercle I** n'est pas déduite de `demo-etincelle` **foudre**. Les objets descriptifs ne créent pas de bonus et les effets mentaux ne donnent pas de PV perdus automatiques.

## 3. Conditions bloquantes AVANT de passer `publish:false` à `publish:true`

1. **Contrat v1 figé.** La DG reçoit une version et le SHA exacts de M03 / INDEX / M04, et tranche le raccord du bonus héroïque +2, de l'intensité et de l'absorption.
2. **Tests unitaires :** `npm test`, `npm run test:mathref002a`, `npm run test:mathcreate003`, `node scripts/test-math-site-001.mjs`, M03/M04 complets : tous PASS au HEAD testé.
3. **Équilibre :** QA #167 publie distribution, médianes/p10/p90, létalité, blocages et ressources aux N1/5/10/15/20/21/25 ; ordinaire 3–5 rounds, élite 5–8, boss 8–12 sont des **cibles** à vérifier, pas des garanties.
4. **Expérience :** action physique, magie, mental, capacités, enchantement, créature et Étincelle ; scénario table cinq d6 ; interface novice/expert en un à deux gestes ; Chrome PC/tablette, protections clavier.
5. **Stockage et sécurité :** coûts à la tentative engagée, aperçu gratuit, une application après validation MJ ; 2 onglets, interruption, export/import et notes MJ invisibles au joueur.
6. **Relecture des deux guides :** aligner toutes les formules avec les résultats homologués, corriger les phrases « n'existe pas en M03 » devenues obsolètes, distinguer chiffres **approuvés** et exemples **expérimentaux** ; légendes/alt des huit illustrations, navigation, liens et apparence sombre/cuivre/or.
7. **Gate DG :** procès-verbal `GO` de QA+DG attestant que l'accord du créateur du 16 novembre s'applique bien à cette révision. Les modifications de canon distinctes ne sont jamais inférées.

**Jusqu'au GO, maintenir les deux guides non publics, la PR en brouillon et les titres de prépublication.**

## 4. Procédure d'activation après GO

- Actualiser les deux guides à partir du contrat homologué (révision et SHA attestés).
- Changer seulement alors `publish: false` vers `publish: true` et ajuster les métadonnées éditoriales **sur décision DG** ; les exemples encore prototypes doivent porter leur statut.
- Vérifier `npm test`, `node scripts/test-math-site-001.mjs`, résolutions des liens/figures, export du site, navigateur et absence de secrets ; joindre le journal exact des runs.
- Effectuer le merge contrôlé dans le bon ordre des PR empilées ; ne pas forcer le contournement d'une branche propriétaire.
- Déployer par le workflow Pages du projet seulement après feu vert ; contrôler **la vraie URL**, navigation, mobiles, assets WebP, 404 et mécanismes de récupération.
- Donner une annonce à la communauté avec le numéro de version, le lien public et les limites restantes ; conserver une possibilité de retour par revert ciblé.

## 5. Décisions de référence à maintenir dans le guide

- Cinq d6, 7 776 issues ; échec forcé naturel 5–7, 27–30 récompense bornée seulement si succès réel.
- `E(c)=floor(3 log2(1+c/3))` et `M(r)=floor(log2(1+r))`, caractéristiques non plafonnées à 12.
- N1–25 ; éveil divin N20, divin affirmé N21, coefficient offensif de N21→N25 **seulement si éligible** ; N25+ PNJ, pas de N26.
- Dégâts M03 communs aux armes, capacités, sorts, objets et créatures, pénétration avant protection restant, puis absorption ; mental sans PV automatiques.
- Différencier niveau, Cercle magique, rang numérique et neuf degrés narratifs ; pas de +1 par niveau ni d'effets reconstruits depuis un texte descriptif.
- Mana et charges consommés sur tentative engagée selon définition homologuée, aperçu libre ; modèle C général, exceptions documentées, coûts individuels réservés.
- Toute validation canon/faits joués/publication reste **distincte** de l'homologation mathématique.

## 6. Statut de ce dossier

**Ordre de publication du créateur : REÇU.**  
**Recette exhaustive #167, câblage Studio #166, habilitations INDEX #161 : NON LIVRÉS.**  
**Autorisation de mise en ligne réelle : NON DÉCLENCHÉE ; le GO dépend des preuves.**

Ce dossier met la mission de diffusion en route sans faire passer une règle candidate ni un document de prépublication pour un site homologué.

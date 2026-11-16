# MATH-SITE-001 — Préparation du chapitre illustré pour le nouveau site

**État : prêt pour relecture éditoriale et contre-audit mécanique ; publication NON autorisée.**

## Livrable de diffusion

- Page Quartz : `content/jouer/systeme-5d6-unifie-reference.md` ; frontmatter `publish: false`, `canon_statut: proposition_non_jouee`, `etat_editorial: en_cours`.
- Diagrammes originaux WebP : `content/images/regles/math-site-001-{jet,degats,divin}.webp` ; textes alternatifs intégrés à la page.
- Sources des figures SVG **hors** répertoire `content/` (conformément au contrat éditorial) : `docs/rapports-missions/illustrations/math-site-001-{jet,degats,divin}.svg`.
- Régénération déterministe : `node scripts/render-math-site-001-illustrations.mjs` avec `sharp` déjà installé par le dépôt. Contrôle format WebP, largeur et taille de fichier.
- Recette indépendante : `node scripts/test-math-site-001.mjs` (statut brouillon, trois liens images, dimensions/format/alt et garde-fous mécaniques).

La page est conçue pour l'ardoise sombre/cuivre/or du nouveau site : une formule de jet visuelle, une cascade de réduction des dégâts, une frise de l'éveil divin. Les illustrations sont des **schémas mécaniques originaux** créés pour ce lot, sans iconographie de lore ni illustration extérieure sous droits. Le contenu est utilisable sur téléphone, tablette, ordinateur et en aide de jeu imprimée. Les textes alternatifs permettent une lecture sans images.

## Décisions déjà exprimées par le créateur

1. Une mécanique unique 5d6/M03 pour attaques physiques, magie, capacités, créatures, objets ; réussite et dégâts en un jet.
2. Combats à rythme dynamique : cible 3–5 rounds ordinaire, 5–8 élite, 8–12 boss.
3. Progression des maîtrises agréable, avec gestes, contrôle et techniques, pas seulement un bonus au chiffre.
4. Puissance magique modulable, y compris **vers le bas** à haut niveau ; ressources distinctes de la maîtrise.
5. Absorption = **réduction des dégâts**, après protection et pénétration.
6. **Éveil divin au niveau 20** ; niveau 21 divinité affirmée. Grille de puissance proposée N21 x1,25/x1,50 jusqu'à N25 x1,50/x2 acceptée pour étude ; coefficients pas encore intégrés.
7. **Niveau 25+ pour PNJ seulement**, sans niveau 26 : possibilité d'expérience et de rangs de maîtrise supplémentaires selon jalons MJ.
8. Démarrage de campagne haut niveau autorisé par accord de la table ; étalement narratif long des progressions divines dans une campagne ordinaire.

## Chaîne de preuves et compatibilité

| Référence | Objet | Statut |
|---|---|---|
| MATH-EFF-001, PR [#147](https://github.com/Sijiel44/archives-alrick/pull/147) | Audit M01–M03, adaptateurs, protections | Préparatoire, brouillon |
| MATH-REF-001, PR [#151](https://github.com/Sijiel44/archives-alrick/pull/151) | Contrat mathématique candidat et simulations | Préparatoire, brouillon |
| `docs/rapports-missions/MATH_REF_001_REFERENCE_MATHEMATIQUE.md` | Formules exactes et contrat commun | Référence candidate, NON production |
| `scripts/test-math-ref-001.mjs` | 7 776 issues, combats déterministes et invariants | Test autonome à rejouer |
| `MATH-SITE-001` | Page explicative + figures | **Prépublication** ; ne remplace pas le contenu public actuel |

**Précautions :** maintenir les règles M01/M02/M03 existantes, aucun coût de mana pour Étincelle repris de `demo-etincelle` (foudre). Le contenu ne cite aucun paramètre d'objet descriptif comme bonus automatique. Les effets mentaux ne déclenchent jamais de PV automatiques. Ne pas figer la puissance des PNJ 25+ ni de crédits d'après-N25 avant arbitrage.

## Recette éditoriale et technique demandée

- [ ] Validation MATH/QA de chaque exemple chiffré, y compris le statut du multiplicateur N21/N25 et de l'absorption.
- [ ] Contre-audits MAG, CAP, OBJETS, INDEX, Bestiaire, ARCHIVES (sauvegarde/idempotence) et DG.
- [ ] Vérifier l'affichage mobile des figures, la taille des images, leur chargement et leur contraste en thème ardoise.
- [ ] Test manuel lecture sans images + navigation clavier, texte alternatif pertinent, lisibilité des tableaux.
- [ ] Recette des boutons dans Studio : prévisualisation, engagement coût/jet, confirmation MJ, journal, double-clic, export/reprise.
- [ ] Tests de combat sur table avec adversaire actif, coût des ressources, couverture N1/5/10/15/20/21/25, plusieurs rangs de maîtrise.
- [ ] Approbation expresse de l'homologation mathématique et de la diffusion par DG et créateur.
- [ ] **Après** cette approbation seulement : passer `publish: true`, créer un lien de navigation depuis `content/jouer/index.md`, vérifier le rendu Quartz, puis fusion/déploiement selon le circuit du site.

## Passations

- **MAG** : homologuer définition, DD, portée, coûts et trois intensités de MAG-SORT-001 Étincelle (feu, Cercle I), séparée de la démo de foudre.
- **CAP** : définir les raffinements de maîtrise, limites d'effets autorisés et cadence des déblocages.
- **OBJETS** : propriété/charge/version d'enchantement, aucun bonus pour simple description.
- **INDEX** : identifiants, habilitations, provenance, familles d'effets et adaptateurs vers M03.
- **BESTIAIRE** : attaques de créatures au contrat commun ; profils sources inchangés et variantes MJ.
- **ARCHIVES/STUDIO** : deux gestes au maximum ; jet et coût engagés une seule fois, validation MJ puis sauvegarde idempotente.
- **QA** : parité M03, sécurité et recette du site + table.
- **DG** : arbitrage final, statut documentaire, autorisation de publication distincte de l'homologation.

**Interdits de ce lot :** aucun code M03 modifié, aucune fusion, aucune canonisation, aucune activation de page publique.

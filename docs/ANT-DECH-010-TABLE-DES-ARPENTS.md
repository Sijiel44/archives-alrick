# ANT-DECH-010 — Table des Arpents et quatre figures de reconstruction

**Lot éditorial du 17 novembre 2026.** Développement direct du JDR avec le créateur ; lore partagé non issu d'une scène jouée. Les fiches publiées ont `canon_statut: lore_valide`, `publish: true` et des codes stables. Toute issue de campagne reste une possibilité, pas une chronologie canonisée.

## Fiches et illustrations

| Code | Fonction | Niveau narratif | État de Déchéance | Portrait public |
| --- | --- | ---: | --- | --- |
| `ORG-DECH-11` | Table des Arpents | — | Institution composite, non Déchue en bloc | `org-dech-11.svg` |
| `PER-DECH-37` | Séliane Mordin, direction | 17 | Non Déchu | `per-dech-37.webp` / SVG alternatif |
| `PER-DECH-38` | Tarek Osme, chef de digue | 12 | Rupture, Lieur | `per-dech-38.webp` / SVG alternatif |
| `PER-DECH-39` | Nolène Vassil, releveuse | 6 | Fêlure | `per-dech-39.webp` / SVG alternatif |
| `PER-DECH-40` | Erian Tolne, apprenti | 2 | Non Déchu | `per-dech-40.webp` / SVG alternatif |

Le nom et le code sont distincts de ceux déjà présents dans `content/` au départ du lot. Les illustrations originales sont publiées dans `quartz/static/images` et inscrites dans les catalogues publics. Le visuel ne prouve pas une apparence absolument immuable dans chaque table.

## Contrainte canonique indispensable

- `Tarek` a provoqué **une Chute liée réelle**, celle de Cyrda Loven, adulte transformée et en Fêlure. Le lien est le fondement de sa Rupture. Ni ses ouvriers, ni ses clients, ni Séliane, ni Erian ne comptent comme tribut.
- `Nolène` a reçu des dons répétés et atteint la Fêlure, sans branche ni Chute liée créée par elle.
- `Séliane` et `Erian` sont **non Déchus**. Des choix cruels, des erreurs ou des mensonges ne changent pas automatiquement ce statut.
- L'Assise de Tarek et l'Aiguille de Nolène possèdent des limites **narratives et locales**. Aucun PV, dégât, mana, bonus ou autre profil 5d6 chiffré n'est inventé par ces fiches.

## Contrat du Studio MJ

1. La bibliothèque publique référence les sources, les images et les niveaux indicatifs sans importer de secrets de campagne.
2. Les quatre fiches apparaissent dans le rayon **Antagonistes et rivaux**, la Table dans **Institutions et contre-pouvoirs**.
3. La création locale d'un PNJ copie sa référence avec la **position narrative** suggérée. Le MJ peut la modifier entre « Opposition possible », « Rivalité / ambiguïté », « Allié / rédemption » et « Neutre / indéterminé » sans modifier la référence commune.
4. `levelIntent` est un **repère narratif**, pas `level` de combat. Les capacités doivent attendre le contrat INDEX/MATH.
5. Les notes et événements de campagne ne sont jamais expédiés dans le catalogue public ni vers la fenêtre joueur sans décision explicite du MJ.

## Fronts à instancier dans une campagne

| Front | Déclencheur | Deux issues distinctes | Conséquences à conserver en journal |
| --- | --- | --- | --- |
| Le tracé de la basse rive | Nouveau plan contesté | Commission avec deuxième levé ; chantier imposé et protestations | Maisons indemnisées ou déplacées, confiance dans la Table |
| La corde de Tarek | Cyrda souhaite rompre le lien | Libération avec relève de l'ouvrage ; refus et recherche d'une autre Chute liée | État du tribut, autonomie de Cyrda, entretien réel de la digue |
| L'Aiguille de Nolène | Un vieux profil contredit le rite | Renoncement et réparation ; pacte renforcé | Documents rendus, confiance et évolution de la Fêlure |
| Le carnet d'Erian | Un témoin accepte de parler | Débat public documenté ; copie confisquée et futur retour | Liberté du témoin, nouveaux alliés ou rivaux |

Il n'existe **pas de chute obligatoire**, ni de rédemption automatique. Pour Tarek, l'abandon de la Déchéance exige rupture des Ancrages, libération de Cyrda, perte de la puissance empruntée, aveu, réparation et conséquences durables. Le pardon appartient aux personnes touchées.

## Recette de publication

- [ ] `npm ci` puis `npm test` ; contrôle des pages, liens, images, référentiels, protections et règles communes.
- [ ] `node --test studio-local/tests/antagonistes-data.test.mjs studio-local/tests/organisations-data.test.mjs` ; 40 PNJ, 12 organisations, hashes, images et données publiques.
- [ ] `node --test studio-local/tests/antagonistes.test.mjs` ; Chrome : recherche des nouvelles fiches, copie de Tarek, changement de couleur et non-projection des notes MJ.
- [ ] PR dédiée ; contrôle CI ; fusion et workflow GitHub Pages ; vérification effective des URLs publiées.

**Dépendances :** `MON-DECH-01` (loi canonique), `content/groupes/organisations-decheance.md`, `studio-local/catalogue-antagonistes.json`, `studio-local/catalogue-organisations.json`. La création de ces fiches ne modifie ni l'Odyssée d'Orin, ni les 5d6, ni l'état joué d'autres tables.

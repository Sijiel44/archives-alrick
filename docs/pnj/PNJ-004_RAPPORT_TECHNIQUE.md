# PNJ-004 — Rapport technique du quatrième lot

## Contrat de mission et sources examinées

Quatrième lot demandé par le créateur, portant **d'abord sur les fiches existantes** et sur une présentation illustrée pour la nouvelle version du site. Périmètre propriétaire : `content/personnages/`, `content/images/personnages/`, `experiments/pnj-v01/` et `docs/pnj/` ; aucun changement à la démo P0, à `studio-local/`, au moteur 5d6 ou au site publié.

Références lues : `AGENTS.md`, `CONTRIBUTING.md`, `CONTRAT_EDITORIAL.md`, les douze fiches existantes et leurs codes/provenances `source_brute`; documentation PNJ-001 à 003 et générateur du Cabinet. Les campagnes brutes ne sont **pas recertifiées intégralement** à cette occasion : chaque fait conservé garde le statut de sa fiche source. Les pistes ajoutées sont des propositions, jamais des preuves supplémentaires.

## Inventaire du lot

| Personne | Source stable | Statut documentaire conservé | Point de contrôle |
| --- | --- | --- | --- |
| Oren Dast | `PER-CB39-OREN-DAST` | `faits_joues`, public | Finances Orinor, coopération avec Sariel |
| Yse Korr | `PER-CB39-YSE-KORR` | `faits_joues`, public | Sécurité des routes, passé militaire inconnu |
| Dagna Roue-de-Cuivre | `RES-07` | `lore_valide`, `publish:false` | Existence oui, contrat technique non, autre Dagna distincte |
| Éren Valombre | `RES-08` | `faits_joues`, spoilers | Rappelé libre ; aucun contrat en CB43 ; homonymes distincts |
| Liora Pommebrune | `RES-10` | `lore_valide`, `publish:false` | Existence confirmée, aucune embauche aux appartements |
| Vaska Perledombre | `RES-12` | `lore_valide`, `publish:false` | Aucun contrôle sur Palais/fournisseurs/Mirena |
| Nerys Silvenaine | `RES-13` | `lore_valide`, `publish:false` | Elfe vivante, 214 ans ; non la puissance du Dernier Phare |
| Farwen Pierreclaire | `RES-14` | `lore_valide`, `publish:false` | Aldhammar, aucune charge de gouvernante |
| Lurne Brise-Boulon | `RES-15` | `faits_joues`, spoilers | Évaluation réussie et contrat signé CB43 ; variante « Brise-Lune » |
| Margha Trois-Mers | `RES-16` | `faits_joues`, spoilers | Recrutement confirmé ; signature et voyage non joués |
| Naëline Fendrelune | `RES-18` | `faits_joues`, spoilers | Rappelée libre, dessin, non Revenante ; portrait conceptuel |
| Nahla Serevin | `PER-CB43-NAHLA-SEREVIN` | `faits_joues`, spoilers | Cabinet personnel, essai signé ; faux « vacant » tardif |

## Modifications et sécurité éditoriale

1. Ajout de douze références à `selection.mjs`, **66 identités et 66 sources uniques**. Nom, code, ancre, publication et avertissement proviennent des frontmatters de la fiche source, sans recopie contradictoire.
2. Douze nouvelles sections *En jeu* ou *Complément MJ*, donnant posture scénique, contradiction ou choix, amorce, réplique **fictive** et garde-fou de continuité. Aucun changement des statuts, âges, contrats, liens ou secrets de source.
3. Nouvel asset original `content/images/personnages/naeline-concept-v01.webp` ; portrait non canonique d'une personne dessinant, généré pour cette seule interprétation graphique, sans prétention à la représentation historique de Naëline. `illustrationValidee:false`, fichier WebP optimisé sous 3 Mio ; prompt, provenance et restrictions archivés dans `PNJ-004_SOURCE_VISUELLE.md`.
4. Actualisation du catalogue `content/personnages/cabinet-des-rencontres-v01.md` conservé `publish:false` et du prototype HTML autonome. Les cinq fiches de lore non publiées ne deviennent pas automatiquement publiques.
5. Les trois liens externes de Wikimedia Commons du lot PNJ-003 restent **facultatifs** avec auteur, licence et page source ; aucun nouveau visuel tiers n'a été retenu pour ce lot. Le chargement distant demeure désactivé tant que le lecteur ne le demande pas.
6. La couche narrative ne fixe aucune statistique 5d6 : une source d'identité peut plus tard être associée à plusieurs versions de profils, avec arbitrage INDEX/MATH sur capacités et prérequis.

## Recette reproductible

```bash
node experiments/pnj-v01/build.mjs
node --test experiments/pnj-v01/test.mjs
npm test
git -c core.whitespace=cr-at-eol diff --check
```

**Contrôles locaux (16 novembre 2026) :**

- Générateur : **PASS**, 66 cartes, 13 portraits, 3 inspirations externes.
- Tests PNJ : **PASS 5/5**, dont contrôle spécifique des douze identités, des cinq `publish:false`, de deux homonymes, des avertissements et du portrait conceptuel.
- Suite complète `npm test` : **PASS (code de sortie 0)** ; 387 pages de contenu admises, 285 codes uniques, compilateur Quartz, 1 178 pages HTML et 68 897 liens/ressources internes, suites 5d6, organisations, antagonistes, Bestiaire, Grimoire, MAG-003 et contrôles de sauvegarde.
- `git -c core.whitespace=cr-at-eol diff --check` : **PASS**, y compris le contrôle à reprendre après ajout à l'index.
- **Recette visuelle humaine PC/tablette : ouverte** ; cette modification ne constitue pas une preuve que la galerie a été intégrée au site Quartz/Studio ou que l'affichage navigateur a été validé.

## Implications transversales

- **LORE :** arbitrage sur les cinq biographies non publiques ; éviter une résurrection, une continuité de 500 ans ou un recrutement rétroactifs.
- **STUDIO/ATELIERS :** référence/source distincte de copie de campagne, de variante visuelle, d'état présent et de secret MJ ; fenêtre joueur sur liste blanche uniquement. Illustration proposée, jamais automatiquement validée.
- **INDEX/MATH :** `character.code` stable, zéro ou plusieurs adaptations `profile_id`/`profile_version` ; compétences, XP, coûts, prérequis et formations à arbitrer séparément.
- **ARCHIVES/QA :** inventaire de provenances, test `publish:false` et `spoilers`, sauvegardes sans fuite de notes privées, contrôle des liens externes et du repli sur emblème.
- **QUÊTES/AVE :** douze rencontres transposables, plusieurs choix non violents, aucune issue obligatoire.

**À revoir par :** LORE, INDEX, MATH, STUDIO, ATELIERS, ARCHIVES, QA, QUÊTES et AVE.

**À valider par DG/créateur :** illustration, visibilité, profils mécaniques, raccord site et canon. Aucun merge ni publication sans ordre distinct.

# FICHE DIRECTION — L003-COCKPIT, STUDIO

Mission approuvée par créateur ; prototype isolé dans `experiments/dg-lot003/src/studio/`, `src/player/`, `tests/studio/`. Aucun merge, publication, canonisation ni formule modifiée. Export temporaire `cer.studio.dg003.provisional.v0`.

## Livré

- UI DOM montée par `mountStudio` : campagne, import PJ prévisualisé, copie créature à référence distincte, scènes et notes privées, partage opt-in, restauration/export.
- `mountPlayer` sur origine séparée 4174, READY contrôlé par `source` + `origin` + canal, DTO sur liste blanche seulement.
- Services injectés documentés : storage, characterImport, catalog, bestiary, rules. Aucun calcul 5d6, aucun fallback homologué fictif.
- Tests Node des modules réels et banc HTML synthétique. Contrôles navigateur intégrés **à recetter par QA** sur son environnement.

## Réserves / décisions

- API d'ARCHIVES/BUILDER/INDEX et SHA final de leurs branches non disponibles au moment du développement : mapping exact à confirmer par 05.
- Origines fixées à 127.0.0.1:4173/4174 ; la protection de l'accès physique au navigateur du MJ n'est pas assurée par cette séparation.
- Les secrets peuvent apparaître dans des champs volontairement marqués publics par le MJ ; le contrôle porte sur le modèle de transfert, pas sur la classification sémantique du texte.
- Le runner Python Chromium est optionnel. Une exécution bloquée par `ERR_BLOCKED_BY_ADMINISTRATOR` n'autorise aucune revendication de recette navigateur réussie.

**À revoir par :** 05 INTÉGRATION (wiring), 04 ARCHIVES (octets SHA/restore), 11 INDEX (provenance), 01 BUILDER (ports), 02 QA (P0 fenêtre joueur). **À valider par DG :** interfaces de passage + critères d'acceptation de l'intégration, pas Alpha homologuée.

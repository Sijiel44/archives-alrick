# FICHE DIRECTION — BUILDER-001 / DG-LOT-002

**Rôle :** 01 🧱 BUILDER — architecture et API · **Date :** 3 novembre 2026  
**Mandat :** specifier, **sans implémentation**, l'intégration architecturale de STUDIO-001 : campagne locale → PJ → référence/copie de créature → scène → projection joueur par liste blanche → export/réimport.  
**Référence produit :** `main` `88f774f3d0d6d520d8d11443b72202b9caf4f94b` ; **référence DG/ORG :** PR #78 `82d6b4c1096c7faa12da6b80ff09b82e11b9f259`.  
**Verdict conseillé : VALIDÉ AVEC RÉSERVES — architecture préparatoire, pas homologation de Studio.**

## Décision de réemploi

**Conserver** Quartz 5 (site et URL), Markdown, codes, sources, M01–M05, Grimoire, M04/M05 et ateliers d'origine ; **extraire plus tard** des ports sans recopier les formules ; **adapter** imports/exports, identifiants, validation et lecture du Bestiaire ; **créer** uniquement le projet Studio MJ local, la scène privée, la projection dédiée et un format d'archive indépendant. La version Studio `entre-rives.studio.project.v0-proposal` est une *proposition de test*, pas un format adopté.

BUILDER possède `DocumentReader`, `RulesGateway`, `CatalogResolver`, `CharacterImport`, `BestiaryAdapter`, `PlayerProjectionBuilder` (frontières) et leur coordination. STUDIO reste propriétaire des données de campagne, des scènes, de la confidentialité d'usage et de la progression de séance. INDEX statue sur les identités de capacité; ARCHIVES sur le round-trip et les migrations; MATH sur les calculs; QA sur les preuves.

## Constats directement vérifiés

- `main` contient `alrick.sheets.v3`, `alrick.campaign.v1/v2`, `alrick.bestiary.v1`, `alrick.grimoire.v1`, les clés de stockage anciennes et actuelles, ainsi que les modules 5d6 et M05. La PR #78 est ouverte en **brouillon**, sans fusion.
- Dans `atelier5d6-m05-sheet-view.ts`, `canOfferDocumentaryLink()` renvoie `false`. Le lien B-002 est déclaratif, non un droit de révélation.
- Le contrôleur M03 accepte l'effet `absorption` dans `validateM03AbilityEffect`, mais `resolveCombatM03` ne l'applique pas : **écart direct à renvoyer à MATH**, sans correction dans ce lot.
- Un `git ls-remote` local a échoué (DNS `github.com` non résolu). Les sources ont été consultées par connecteur GitHub. La CI du `main` [#41340618029](https://github.com/Sijiel44/archives-alrick/actions/runs/41340618029) était verte sur le SHA indiqué; elle n'a pas été lancée par BUILDER.

## Tests effectués et portée

Banc Python indépendant exécuté sur une campagne fictive non canonique, sous la forme d'une spécification de ports : **27/27 assertions réussies**. Il vérifie notamment la liste blanche du payload joueur, l'absence des sentinelles `MJ_SECRET_CANARY` dans son JSON, le refus des médias non autorisés, la non-entrée d'IDs documentaires non validés, les collisions d'instances, les extensions inconnues, `legacyOriginal` et une caractéristique brute 14.

**Ces tests NE valident PAS le produit.** Ils ne lancent pas Quartz, TypeScript, `npm test`, navigateur, fenêtres, stockage réel, restauration native, CI nouvellement créée ou test humain. La projection effective et les migrations restent des portes QA **bloquantes**.

## P0 — Conditions à régler avant prototype homologable

| Blocage / réserve | Décision demandée | Instance |
|---|---|---|
| Contrat des identifiants, provenance, capacités et règles natives | Réconciliation `RulesGateway`, `CatalogRef`, policy numérique/descriptive | INDEX + MATH + DG |
| Schéma de projet, collisions, extensions et restauration | Version et namespace, aperçu, staging, confirmation/rollback | STUDIO + ARCHIVES + DG |
| Données MJ non visibles dans le DOM/messages joueur | Whitelist stricte **et isolation de contexte**, test réel par QA | STUDIO + QA + DG |
| Deuxième fenêtre navigateur de même origine | **Non considérée confidentielle** tant que stockage/origine ne sont pas isolés | STUDIO + QA + DG |
| Parité et respect des URLs | Tests moteur, `check-site`, legacy et navigateur sur commit final | MATH + QA |

## Décision recommandée et suite

**Valider la carte de réemploi et les frontières comme base de travail**, sans adopter les schémas proposés ni autoriser de fusion. Faire réviser D01–D08 par leurs propriétaires, puis confier à QA la recette verticale complète : PJ importé → créature référencée/copiée → scène → sélection joueur → fermeture/révocation → sauvegarde/réimport sans altération des données précédentes.

**État final dans ce dossier :** audit de sources et banc mock VALIDÉS ; architecture AVEC RÉSERVES ; confidentialité de fenêtre et restauration native BLOQUÉES pour homologation ; code et tests du dépôt NON EXÉCUTÉS. Aucun correctif, merge, publication, canonisation, transmission automatique ou usage de sauvegarde personnelle.

**À revoir par :** MATH, INDEX, STUDIO, ARCHIVES, QA ; BEST/MAG/UX en consultation ciblée.  
**À valider par DG/créateur :** D01–D08, sécurité de la projection, conventions de sauvegarde et prochaine phase de développement (interdite par ce rapport).  
**Passations : préparées séparément, pas envoyées.**
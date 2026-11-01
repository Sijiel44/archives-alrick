# M05 — Contrat d'interopérabilité avec le Bestiaire documentaire

**État :** contrat d'échange provisoire à transmettre à B-002 et suivantes ; aucune validation canonique. **Base M05 :** main `f026de00d5a6bb5d8b45d1103e28d813c08bc995`. **Dépendance :** PR #56 B-001 encore ouverte à l'audit initial, **non fusionnée au titre de M05**.

## 1. Autorité des données et granularité

L'identité d'espèce, l'identité d'individu, les biomes, la biographie, les rencontres réellement jouées et l'attribution des codes restent sous l'autorité du Bestiaire documentaire et du `CONTRAT_EDITORIAL.md`. Le jeu 5d6 régit exclusivement ses nombres et sa validation mécanique. La fiche graphique ne tranche jamais un conflit documentaire. Les 21 entrées du registre B-001 ne sont **pas** 21 espèces canoniques.

Une source documentaire peut pointer vers **plusieurs profils** `alrick.bestiary.v1` (exemples de niveau, rôle ou campagne), et un profil peut être associé à un individu ou à une espèce existante. B-002 maintiendra le registre inverse de ces liens. Il ne faut ni renommer les codes `DRG`, `REV`, `IMP`, `CRE`, ni en créer de nouveaux sans autorisation documentaire.

## 2. Contrat de liaison M05

Le champ facultatif `documentaryLink` est une **extension JSON** conservée par le validateur M04.1 ; il ne modifie pas le schéma officiel `alrick.bestiary.v1`. Champs proposés :

| Champ | Usage | Autorité / défaut |
| --- | --- | --- |
| `id` | Code documentaire stable déjà existant, 2–90 caractères alphanumériques ou tirets | Bestiaire ; absent = sans lien |
| `type` | `espece`, `individu`, `autre` | Bestiaire ; typologie déclarative |
| `source`, `sourceVersion` | Provenance et version attestées | Bestiaire ; chaîne vide = inconnu |
| `canonStatut`, `etatEditorial` | États documentaires indépendants de `card.status` | Bestiaire ; `null` = inconnu |
| `visibilite`, `publish`, `spoilers`, `unlisted` | Politique éditoriale et accès | Publication documentaire ; `null` = inconnu |
| `publicPath` | Route proposée, **non suivie** automatiquement | Pipeline documentaire ; `null` = inconnu |

La fiche garde aussi `id` (identifiant de profil de jeu), `ruleset:"m03"` (version de moteur), `status` (validation **locale du jeu**), `bestiarySource` à l'export vers `alrick.sheets.v3`, et `legacyOriginal` dans les chemins historiques. Aucun statut `documentaire_approuve` de la fiche locale ne donne une permission de publication.

`readDocumentaryLink(card)` retourne un modèle de lecture, sans muter le JSON. `canOfferDocumentaryLink` refuse **tous** les liens publics pour l'instant : B-002 devra introduire une source d'autorité publiée et attestée, avec preuve d'accès, avant d'activer la navigation.

## 3. Flux de données prévus

**Jeu → documentaire :** proposition de profil identifiée + moteur, caractéristiques, archetype, provenance numérique, MJ/test et statut de validation **mécanique**, sans modification directe d'une espèce. **Documentaire → jeu :** identifiant existant, type, source et version, états éditoriaux, politique de publication, portrait autorisé. **Encyclopédie → visiteur :** seulement champs publiables et déjà vérifiés. Aucune copie de texte secret dans les fichiers publics du dépôt ni dans l'HTML masqué. Une page `unlisted` reste publique par URL.

**Validation documentaire avant publication :** `publish:true` explicitement, `canon_statut` et `etat_editorial` interprétés selon le contrat éditorial, `visibilite` compatible, politique `spoilers` et `unlisted`, source exacte, identité non ambiguë, absence de secrets. Un booléen seul ne suffit jamais.

## 4. Illustration

Le champ d'extension `artwork` est optionnel. Pour être affiché en M05, il doit déclarer `status` = `publication_approuvee` ou `canonique_validee`, `rights` = `own|open|public|permission`, `alt` non vide, `author` non vide et une URL **locale** du site sous `/archives-alrick/static/` ou `/archives-alrick/assets/`. Aucun hotlink Pinterest, aucune attribution automatique de canon. Le chantier documentaire doit vérifier licence et droit effectif : le simple champ JSON déclaré ne constitue pas une preuve juridique.

## 5. Matrice de responsabilité

| Besoin | Décision M05 | Pourquoi | Autorité | Échange | Limite | Validation restante |
| --- | --- | --- | --- | --- | --- | --- |
| Code unique | Réutiliser `id` de profil ; champ documentaire séparé | Éviter collision | 5d6 / B-002 | id + code existant | Pas de nouvelle nomenclature | B-002 |
| Espèce vs individu | `type` indépendant | Ne pas extrapoler | B-002 | type, preuve | Déclaratif | Audit taxonomique |
| Canon | `canonStatut` non déduit des scores | Séparer vérité de jeu/monde | Direction éditoriale | statut/source | Pas de canonisation | Revue de chaque dossier |
| Publication | Aucun lien automatique | Pages publiques | Éditorial + sécurité | publish/visibilite/spoilers | Pas d'autorisation implicite | Pipeline public validé |
| Portrait | Facultatif, filtré côté présentation | Droits/accessibilité | DA + éditorial | URL locale, licence, alt | Déclaration ≠ preuve | Contrôle des assets |
| Profils multiples | Relation n:n dans le registre futur | Multiples campagnes | B-002 | IDs / versions | Non indexé automatiquement | B-002 / B-003 |

## 6. Conditions de reprise

B-002 doit vérifier l'état final de la PR #56, résoudre codes et doublons, définir un registre publié explicitement filtré, spécifier le schéma final de référence inverse et ajouter des tests de lien autorisé/interdit. M05 ne force pas la fusion de #56 et n'invente aucune espèce.

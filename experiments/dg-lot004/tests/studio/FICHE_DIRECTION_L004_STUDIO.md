# Fiche Direction — L004-A / STUDIO (05 novembre 2026)

**Base contractuelle :** PR #85 @ `2ab809ef5351940e0fc272b859d10f21de894d00`. **Branche** : `prototype/dg004-studio` créée sur cette base ; aucun changement historique ni fusion.

## Livré dans le périmètre STUDIO

Mode fictif guidé, vraie interface L003 montée par import, support des 3 créateurs L003, fixture PJ v3 avec statistique brute 14, référence/copie de créature fictive, scène avec note MJ sentinelle, projection joueur par liste blanche et consentement explicite, export/restauration délégués aux services ARCHIVES, CSS petits écrans et focus. L004-C : prévisualisation privée, descriptive uniquement, objet → capacité → créature → scène, non persistée.

## Protections

Stockage préfixé séparé `cer.dg004.demo.only.v0.*`, port de sauvegarde natif obligatoire, aucun accès aux campagnes personnelles depuis la façade, pas d'import de PJ autre que la fixture, backups demo uniquement ceux exportés dans cette session de démonstration, règles numériques inactives, pas de script côté joueur nouveau. Le préfixe ne chiffre pas les données ; environnement de confiance local requis.

## Preuves et réserves

- **15/15 tests Node PASS**, Node 22.16.0 (ports externes simulés pour les tests de façade). Fichiers source STUDIO réellement testés.
- **Syntaxe PASS**. Clone GitHub indisponible (DNS), sources vérifiées via connecteur GitHub.
- **Chromium démarre** mais navigateur localhost **NON EXÉCUTÉ** (politique `ERR_BLOCKED_BY_ADMINISTRATOR`). Le script navigateur est livré pour 05/02.
- **CI / `npm test` complet / restauration vraie ARCHIVES en GUI / tablette / QA L004 : NON EXÉCUTÉS ici.** L003 QA 10/10 sur SHA PR85 est un résultat rapporté antérieur, non transférable à L004.
- **Pas d'homologation Alpha.** La livraison reste dépendante de la composition et des preuves exactes de 05.

## À faire / décisions

**05 INTÉGRATION :** brancher `storageFactory` et fabrique de ports séparée, importer CSS et fixer page de démo MJ, lancer recettes sur HEAD final avec deux origines. **02 QA :** inspection DOM/messages/stockage + export/réimport réel, mobile. **01 BUILDER :** garde des frontières et exports. **11 INDEX + 21 ATELIERS :** définir version/provenance et persistance possible du raccord descriptif L004-C. **DG :** qualifier L004-A seulement après preuves navigateur et avis QA ; aucune publication/merge sans mandat.

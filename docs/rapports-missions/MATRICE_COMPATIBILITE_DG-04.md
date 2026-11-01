# DG-04 — Matrice de compatibilité des modules 5d6

**Date de contrôle :** 31 octobre 2026 (dernières preuves CI du 1er novembre UTC).  
**Référence :** [rapport technique complet DG-04](DG_04_AUDIT_INTEGRATION_PR54_55_56.md) ; [fiche Direction DG-04](FICHE_DIRECTION_DG-04.md).  
**Branches concernées :** PR [#54](https://github.com/Sijiel44/archives-alrick/pull/54), [#55](https://github.com/Sijiel44/archives-alrick/pull/55), [#56](https://github.com/Sijiel44/archives-alrick/pull/56) ; contrats M01–M05 de `main`.

**Légende :** **C** = compatible sur le périmètre vérifié ; **R** = correction requise ; **S** = spécifié mais non implémenté ; **NV** = compatibilité de bout en bout non vérifiée. Une CI verte sur branche isolée n'est pas un test d'intégration.

| Interface | Verdict | Preuve, écart ou limite | Responsable et condition de sortie |
| --- | --- | --- | --- |
| M01 ↔ M03 | **C** | M03 réutilise `effectiveStat` et `effectiveMastery` de M01. | Moteur : maintenir les fixtures de parité. |
| M03 ↔ M04.1 | **C** | Contrat M03 et scénarios modernes de sauvegarde/combat. | Moteur : non-régression avant fusion des autres modules. |
| M04.1 ↔ M05 | **C** | Lecture documentaire et scénarios Chrome actuels dans la CI #56. | Moteur/Documentation : vérifier les liens et la lecture seule. |
| M01/M03 ↔ Tables #54 | **R — bloquant** | Calcul sur caractéristique brute avec plafond 12 au lieu de la formule logarithmique officielle. | Tables + Moteur : fonction pure commune et tests N5/N10/N15/N20/N25, dont valeurs >12. |
| M04.1/M05 ↔ Tables #54 | **R** | Import partiel, identité des instances et provenance non transmises globalement. | Tables : contrat d'import versionné et roundtrip/instantané conservé. |
| Personnage M02/M03 ↔ Grimoire #55 | **R — bloquant** | Ancien Atelier, sauvegardes v2/v1, calcul de sort et protections antérieurs à M03. | Grimoire + Moteur : réconcilier sans écraser M03/M04/M05, tester migrations. |
| Inventaire ↔ Matrices #55 | **C sur la branche / NV après fusion** | `itemId` et scénario Cercle I → matrice VIII attestés sur l'ancienne branche, pas sur le moteur actuel. | Grimoire : valider l'identité et la persistance d'objet sur `main`. |
| Grimoire #55 ↔ Tables #54 | **NV** | Aucune recette combinée mana, charges, permissions MJ et état serveur. | Tables + Grimoire : actions atomiques, contrôles MJ, idempotence, cas mana/charge arbitré. |
| Bestiaire B-001.1 ↔ M03/M04.1 | **C sur le périmètre automatisé** | Normalisation protection/résistance et transfert vers l'Atelier ; 1 318 assertions de compatibilité. | Bestiaire : revue spécialisée finale, sauvegardes utilisateur réelles. |
| Bestiaire B-001.1 ↔ M05 | **C en lecture / S en relations n:n** | `documentaryLink` prévu et lu ; registre documentaire inverse plusieurs-à-plusieurs non livré. | Bestiaire / éditorial : définir et implémenter registre avant activation publique des liens. |
| Bestiaire M03 ↔ Tables #54 | **R** | Données modernes de combat et identité d'instance mal couvertes par l'import minimal. | Tables + Bestiaire : transport d'instance sans canonisation ni champ perdu. |
| Campagne indépendante ↔ univers partagé | **NV** | Frontières documentées dans DG-001/#63, sans essai de promotion canonique ni scénario combiné. | Direction éditoriale : approbation humaine de chaque promotion. |
| Anciennes sauvegardes ↔ tous modules | **R / NV** | Versions de schéma, propriétés inconnues et restauration globale non éprouvées. | Tous les référents : import/export non destructif, fixtures historiques, vraie restauration. |

## Ordre de correction et de vérification

1. **Gouvernance :** faire examiner DG-001/#63 et la revue documentaire B-001.1/#56 par leurs propriétaires ; ne pas réécrire le Bestiaire en parallèle.
2. **Contrat commun :** moteur partagé M01/M03, identifiants de campagne, versions de sauvegarde, provenance, transfert limité vs complet.
3. **Branches #54 et #55 :** corrections en parallèle, chacune sous son référent ; rebasage/réconciliation sans écrasement de fonctionnalités déjà intégrées.
4. **Tests indépendants puis combinés :** `npm test`, `npm run test:m04:browser`, `npm run tables:test`, `node scripts/test-5d6-grimoire.mjs`, B-001.1, migrations et vrais parcours MJ + deux joueurs.
5. **Décisions humaines :** mana/charges, données publiques vs secrets MJ, fusion séquentielle et éventuelle exposition Internet.

## Preuves GitHub réellement consultées

- [CI Tables #54 — succès sur ancienne branche](https://github.com/Sijiel44/archives-alrick/actions/runs/41206146216).
- [CI Grimoire #55 — succès sur ancienne branche](https://github.com/Sijiel44/archives-alrick/actions/runs/41211549812).
- [CI Bestiaire #56 — succès sur branche B-001.1](https://github.com/Sijiel44/archives-alrick/actions/runs/41263562458).
- [Rapport technique DG-04](DG_04_AUDIT_INTEGRATION_PR54_55_56.md), anomalies DG04-01 à DG04-07.

**Portée et réserve :** matrice établie par inspection ciblée du code et des journaux CI. Aucune exécution locale de tests, aucun test sur branche combinée ni essai humain multijoueur réalisé par DG-04. Ne pas confondre **compatible au périmètre attesté** et **prêt à publier**. Aucune fusion ou publication automatique.

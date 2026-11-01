# MAG-003.C — Plan de recette et traçabilité

**Projet :** Archives d'Alrick · **PR :** [#71 — DRAFT](https://github.com/Sijiel44/archives-alrick/pull/71) · **Date :** 1er novembre 2026.  
**Règle :** le résultat d'un test **automatisé** n'est pas un essai **humain** ; la recette n'autorise pas une fusion.

## 1. Chaîne d'intégration testée

- `npm ci` : dépendances figées du projet.
- `npm test` : contenu, types TypeScript, build Quartz, liens/site, moteurs M01–M05, B-001/B-002, MAG-003.A, MAG-003.B, G-001 et MAG-003.C.
- `npm run test:m04:browser` : Chrome headless/CDP sur serveur local du build Quartz ; parcours M04.1/M05 et extensions MAG-003.C (repos, répétition, sortie locale, mobile, cérémonie).

**Historique vérifié :** CI [#41324379649](https://github.com/Sijiel44/archives-alrick/actions/runs/41324379649) en échec de types à la première intégration ; anomalies corrigées. CI [#41324466229](https://github.com/Sijiel44/archives-alrick/actions/runs/41324466229) en échec sur fixture de parité manquante ; fixture G-001 ajoutée. CI [#41324634457](https://github.com/Sijiel44/archives-alrick/actions/runs/41324634457) **SUCCÈS** : `npm ci`, `npm test` complet (dont MAG-003.C), navigateur M04.1/M05 existant, sur le code avant ajout de la recette MAG-003.C Chrome. La **CI du dernier commit** de la PR #71 doit être contrôlée via [Checks](https://github.com/Sijiel44/archives-alrick/pull/71/checks) ; aucune réussite future n'est présumée par ce rapport.

## 2. Scénarios unitaires MAG-003.C

Le script `scripts/test-mag003c.mjs` vérifie :
1. Prévisualisation de 20 % de 35 mana sans mutation ni effet.
2. Crédit d'un repos individuel après validation et écriture sur fiche et registre.
3. Double clic/idempotence du repos, journal unique.
4. Refus d'un lieu non sûr et d'un repos incomplet/interrompu.
5. Deux repos courts et plafond alternatif cumulatif ; troisième repos refusé.
6. Pratique exceptionnelle refusée sans attestation MJ.
7. Traçage d'une dépense Grimoire sans réécriture des charges.
8. Refus du crédit artificiel, changement explicite de journée.
9. Export/import de registre et extension, compatibilité d'une fiche ancienne **sans** extension ; refus conservateur de schéma inconnu ou d'identité divergente.
10. Rite personnel, refus de résolution PJ collective, autorisation MJ locale.
11. Prière sans points de foi ni miracle et tradition non religieuse viable.
12. Cérémonie incertaine avec probabilité M01, soutien plafonné à +1, aucun débit ou effet appliqué.
13. Dossier d'objet existant, validation du statut `proposition_mj`, refus d'objet inexistant et aucune recharge.

Le Grimoire G-001 conserve ses tests `scripts/test-5d6-grimoire.mjs`, les fixtures de parité M01/M03 et les critères d'éligibilité, effets actifs et matrices C1→VIII ; ne pas déduire de leur succès une adoption canonique.

## 3. Scénarios réels navigateur

Parcours Chromium automatisé ajouté dans `scripts/test-5d6-m04-browser.mjs` :
- navigation réelle vers l'Atelier et le panneau « Rites et repos » ;
- sélection d'une fiche M02, mana 10/35, prévisualisation +7, confirmation native, sauvegarde locale, répétition sans crédit additionnel ;
- présence de `alrick.grimoire.v1` après récupération ;
- affichage mobile simulé 390 × 844 et capture ;
- rechargement de page, restauration du budget et historique ;
- préparation puis résolution locale MJ de cérémonie, sans débit de mana.

**Attention :** Chrome automatisé n'est ni un test sur téléphone physique, ni un playtest humain. Si un scénario échoue, le statut de recette doit devenir « avec réserves / bloquée » et être relié au run précis.

## 4. Critères encore non démontrés par des essais humains

- Plusieurs navigateurs **sur appareils distincts**, comptes PJ/MJ réels, autorité distante et transactions atomiques de cérémonie : **non disponibles** dans l'intégration C.
- Import/export sur un corpus exhaustif de vraies sauvegardes historiques et objets orphelins : **non exécutés**.
- Dialogue avec un MJ réel sur la sûreté, le calendrier, l'interruption et les pratiques exceptionnelles : **non réalisé**.
- Ergonomie sur plusieurs téléphones, lecteurs d'écran et tailles de police : **non évaluée humainement**.
- Faith points, autorisation divine, bénédictions, création/recharge d'objet : **volontairement non exécutés** en l'absence de contrats approuvés.

## 5. Critère de sortie

La branche est **présentable à l'audit technique uniquement** si le dernier head est vert et les scénarios bloquants sont couverts, avec toutes les limites documentées. Elle **n'est pas admissible** à l'exécution multijoueurs autoritaire, à une fusion main, au site public ou à un changement de canon. La Direction générale demeure seule responsable de l'acceptation et des arbitrages.
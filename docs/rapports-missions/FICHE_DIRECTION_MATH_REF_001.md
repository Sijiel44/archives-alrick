# FICHE DIRECTION — MATH-REF-001 (16 novembre 2026)

**Rôle :** 10 MATH — Système 5d6. **Objet :** dossier de référence mathématique général fondé sur M01–M03, utilisable par MAG/CAP/OBJETS/INDEX/BESTIAIRE/STUDIO et jouable sur table. **État : prêt pour contre-audit, NON homologué ni publié sur le site.**

## Décisions du créateur désormais actées

1. **Rythme :** ordinaire 3–5 rounds, élite 5–8, boss 8–12 ; cibler la durée des combats **avec plusieurs joueurs**, pas uniquement le duel.
2. **Maîtrise :** progressions sensibles avec petits déblocages fréquents et paliers importants ; `E`/`M` logarithmiques de M01 préservés.
3. **Intensité :** un même sort/capacité peut viser un effet mineur utile, à faible coût, ou une intensité plus coûteuse. Ressources et coûts expérimentaux restent à arbitrer par MAG/OBJETS.
4. **Absorption :** une **réduction de dégâts**, pas une réserve automatique de PV temporaires ; proposition de l'appliquer après protection/pénétration avec magnitude1–2.
5. **Divin :** **N20 = éveil ; N21 = divin affirmé**. Grille candidate approuvée comme référence de simulations : N21 courant ×1,25 / majeur ×1,50 ; N25 courant ×1,50 / majeur ×2,00, paliers intermédiaires proportionnés.
6. **25+ : PNJ seulement**, toujours niveau25 ; leur maîtrise peut progresser avec des crédits accordés à des jalons narratifs, sans niveau26.
7. **Création de PJ avancés :** campagnes débutant à haut niveau permises avec consentement du MJ et de toute la table.

## Statut des résultats

| Contrôle | Résultat | Portée exacte |
|---|---|---|
| Audit MATH-EFF-001 | **PASS documentaire** | M01–M03, Grimoire/Studio, séparations et défenses |
| `scripts/test-math-eff-001.mjs` | **PASS** | 7 776 issues, 18 profils, six provenances, mental/objets |
| `scripts/test-math-ref-001.mjs` | **PASS** | N1/5/10/15/20/21–25, absorption projetée, 6 300 rencontres offensives à graine fixe |
| Rythme au N25, 3 alliés, modèle PV fictif | **5 / 7 / 9 rounds** | Médianes ordinaire/élite/boss, sans ripostes ni coût réel |
| Suite intégrale `npm test` sur cette branche MATH-REF | **PASS, exit 0** | Contenu, type, build Quartz, site, M01–M05, Grimoire, MAG-003 et suites du dépôt ; aucune recette Chrome nouvelle |
| Application de multiplicateur et absorption dans M03 | **NON FAIT** | Nécessite homologation et mandat du propriétaire |
| Recette Chrome/table et restauration | **NON FAITE** | Sous responsabilité QA/ARCHIVES/STUDIO |
| Publication Quartz | **NON FAITE** | Rédaction publique, validation DG puis accord de publication requis |

**Règle de sécurité :** les chiffres de `MAG-SORT-001 Étincelle` **feu Cercle I** n'héritent jamais de `demo-etincelle` **foudre**. Les exemples chiffrés de ce dossier sont fictifs. Aucun effet mental ne retire de PV par défaut.

## Décisions techniques encore ouvertes, à traiter avant les formules finales

| ID | Propriétaire(s) | Objet | Choix préparatoire |
|---|---|---|---|
| `REF-01` | MATH/QA/DG | Forme exacte de l'extension M03 : `floor(I×k)` et absorption post-armure | Vérifier arrondis, résistances magiques et parité M03 |
| `REF-02` | MAG/OBJETS/DG | Prix des intensités mineure/courante/majeure, coût si raté, charges, matrices | Réutiliser les études existantes, ne pas importer de coûts de démo |
| `REF-03` | CAP/INDEX | Cadence/identité/autorisation des déblocages techniques, non-cumul | Catalogue versionné + validations MJ, aucun `+rang` brut |
| `REF-04` | BESTIAIRE/QA | Ratios PV ordinaires/élites/boss, groupes et ripostes | Mesurer en combat simulé complet et en séance humaine |
| `REF-05` | ARCHIVES/STUDIO/QA | Deux gestes, snapshots, dépenses, journal et idempotence | Test interruption/reconnexion/double-clic/deux onglets |
| `REF-06` | M02/INDEX/ARCHIVES | Crédits N25+ **PNJ** (3–6 par jalon *seulement comme essai*) | Budget additionnel validé par MJ, sans modifier `level=25` ni créer de nouvelles règles PJ |
| `REF-07` | LORE/DG | Signification narrative et attestations de l'éveil N20 | Cohérence lore sans canonisation automatique du récit |

## Passations à distribuer (préparées, non envoyées)

- **MAG :** définir Étincelle feu, ses intensités utiles et coûts, les prérequis Cercle/école/degré et le moment du débit ; pas de valeurs issues de la démonstration foudre.
- **OBJETS :** adapter armes, protections, enchantements et charges ; aucun bonus descriptif, validation propriétaire, cumul borné.
- **CAP :** motifs de techniques fréquentes et maîtrise sans cumul, états mentaux/hors PV.
- **INDEX :** effet source/revision/approval, famille, ownership, politique d'intensité, projection M03 versionnée.
- **BESTIAIRE :** variantes de réserves PV, capacités défensives, contrôle, duel et groupes à six niveaux au minimum.
- **ARCHIVES/STUDIO :** `intentId`, confirmation du jet/débit puis application, journaux anti-doublon, export et secrets MJ.
- **QA :** exécuter le banc, `npm test`, scénarios N20/21/25, dés physiques et Chrome ; rapport de couverture avec FAIL et verdicts.
- **DG :** arbitrer REF-01..07, attribuer propriétaires et décider si/quand créer l'implémentation M03 et la page Quartz canonique.

## Conditions de publication du règlement sur le site

1. Ne pas modifier `content/` public ni déclencher GitHub Pages dans cette PR de **préparation**.
2. Valider les détails manquants et les résultats de test dans des branches propriétaires sans supprimer les moteurs legacy.
3. Faire la recette automatisée **et humaine** (table 5d6, Chrome Studio, tablette, import/export, liste blanche joueur).
4. Rédiger ensuite un chapitre pédagogique dans la navigation Quartz, avec statut/citations/règles, illustrations d'exemples, version des contrats et historique.
5. Obtenir **l'homologation mathématique et l'accord de publication explicites de DG/créateur**, puis seulement fusionner et déployer.

**Références :** [règles candidates](MATH_REF_001_REFERENCE_MATHEMATIQUE.md), [simulations et recette](MATH_REF_001_SIMULATIONS_RECETTE.md), [fiche de table](MATH_REF_001_FICHE_5D6_TABLE.md), [MATH-EFF-001](MATH_EFF_001_CONTRAT_EFFETS_V0.md).

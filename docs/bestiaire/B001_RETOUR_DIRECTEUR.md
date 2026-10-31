# RETOUR MISSION B-001 — FONDATION DU BESTIAIRE

## 1. État d'exécution

**Partiellement terminée (fondations livrées ; exhaustivité du dépôt et exécution CI restant à vérifier).** Date : **31 octobre 2026**. Commit de référence \`main\` : \`3443be26b15a90f078e7fdcb94ae5fbb5cfd9191\`. Branche dédiée : \`bestiaire/b001-fondations\`. La PR est à consulter en **brouillon**, sans fusion ni canonisation. Les fichiers produits sont des outils de travail et des propositions de classification, pas de nouveaux faits de l'univers.

## 2. Sources examinées

**Dépôt :** \`CONTRAT_EDITORIAL.md\`, \`PLAN_DEVELOPPEMENT_UNIVERS.md\`, \`package.json\` ; index et quinze fichiers identifiés sous \`content/creatures/\` ; \`content/personnages/REV-16.md\`, \`REV-13.md\`, \`IMP-48.md\`, \`REV-06.md\` ; les trois principales pages 5d6 et leur plan, l'échelle des existences, la Bible des passages du site, la Déchéance, l'Atlas schématique ; les trois notes documentaires \`docs/\` demandées ; le générateur \`atelier5d6-bestiary.ts\`, l'opposition \`atelier5d6-opposition.ts\`, les parcours \`atelier5d6-origins.ts\`, le script interactif \`atelier5d6.inline.ts\` ; les trois bancs de test de \`scripts/\`. La page du Bestiaire et son plan ont été lus **dans leurs fichiers Markdown sources du dépôt**, les URL du site publié n'étant pas directement récupérables.

**Archives privées vérifiées hors GitHub :** Bible V01 v1.7, Atlas V02 v1.8, Compendium V03 v1.7, Codex V04 v1.7, Maison V05 v1.8, Continuité V06 v1.7, Index directeur v2.4, Registre recherche v2.4, Campagne regroupée volume 1 (CB1–CB34), CB41, CB42, CB43 et bilan CB43 v1.1. Le ZIP fourni réunit ces versions. **L'intégralité des très longs bruts n'a pas été relue ligne par ligne pour chaque taxon ; recherche ciblée effectuée.** Le brut consolidé de CB35–CB39 en volume séparé n'était pas dans les fichiers locaux : références indirectes possibles, preuve complète encore à revoir.

## 3. Résultats de l'audit

- **15 fichiers directement contrôlés** sous \`content/creatures/\` (échantillon traçable, non exhaustivité démontrée).
- **0 fiche d'espèce canonique autonome confirmée** parmi ces 15 ; cela ne veut pas dire qu'aucune espèce naturelle n'existe dans l'univers.
- **9 individus de créature nommés et rapprochés** : Thessoryn, Velmora, Orzeyl, Irindra, Édril, Maërys, Aldren le loup, Harald le lion et Phénix. Ce chiffre compte les individus, pas des espèces.
- **7 prototypes MJ non joués**, tous situés sous les pages de villages.
- **3 dossiers/index** dans les 15 (\`index.md\`, \`bestiaire-villages-sept-cites.md\`, \`dragons-et-souverainetes.md\`) ; concepts complémentaires à classifier : Dros, chèvre encore imaginée, dragon animé, créature secourue du Nord, etc.
- **Doublon strict démontré : aucun** dans cet ensemble ; rapprochements essentiels : Aldren loup ≠ Aldren humain, Harald le lion ≠ Harald Forgecœur, Édril ≠ Maërys, Irindra ≠ espèce/Archétype. Codes historiques \`DRG\`, \`REV\`, \`IMP\` et \`CRE-CB39...\` préservés.
- **Contradictions ou risques :** publication des sept aides de jeu \`proposition_non_jouee\` à arbitrer au regard de la règle générale du contrat ; code collectif des lions distinct des identités de chaque lion ; ordre d'ancienneté du niveau 5d6 ; confusion des créatures de Faille avec une mutation ; dangers de généralisation de pouvoirs et de coordonnées écologiques non attestées.

**Prudence de comptage :** les 21 lignes du registre incluent des dossiers, événements, prototypes et concepts non canoniques. Elles ne constituent **ni 21 espèces ni 21 fiches de bestiaire publiées**.

## 4. Fichiers livrés

**Nouveaux :**
- \`docs/bestiaire/B001_AUDIT_TAXONOMIE_5D6_ARCHITECTURE.md\` — B001-A/B/C/D/E/G/H/I.
- \`docs/bestiaire/B001_REGISTRE_INITIAL.json\` — B001-D, 21 entrées vérifiées/à revoir.
- \`docs/bestiaire/B001_EVOLUTIONS.md\` — B001-F.
- \`docs/bestiaire/B001_RETOUR_DIRECTEUR.md\` — présent compte rendu autonome.
- \`modeles/creature-espece.md\` — B001-C.
- \`modeles/creature-individu.md\` — B001-C.
- \`modeles/creature-profil-5d6.md\` — B001-C.
- \`modeles/biome.md\` — B001-C.

**Modifiés :** aucun fichier historique. **Laissés volontairement inchangés :** toutes les fiches existantes, le catalogue, les liens de Quartz, le moteur 5d6, les scripts de tests, les illustrations, les règles de publication. **Aucun fichier privé Word/Excel/ZIP transmis au dépôt public.**

## 5. Architecture retenue

Taxonomie multiaxe (nature ontologique, provenance, altération, allégeance, hostilité, écologie et biomes indépendants) ; quatre modèles de fiches hors publication ; registre JSON audit-able ; convention de nouveaux préfixes **réservée à validation** sans renommer les codes historiques ; transitions d'évolution sourcées, non déclenchées automatiquement par les niveaux ; couche 5d6 comme adaptation indépendante, non définition biologique.

Les 21 catégories de biomes sont un vocabulaire **proposé**, non une géographie canonique. \`docs/bestiaire/\` évite de gonfler le décompte de Quartz ; \`modeles/\` évite la publication accidentelle.

## 6. Contrôles

**Exécutés et réussis :** vérification de l'unicité des 10 codes non nuls du registre de 21 entrées, analyse JSON, contrôles de présence de métadonnées sur les quatre gabarits, conformité de séparation des notions, absence de modification d'un fichier historique dans les changements prévus.

**Non exécutés :** \`npm test\` intégral, \`npm run check:content\`, \`check:types\`, \`build\`, \`check:site\`, et tests navigateur : le dépôt complet et ses dépendances ne sont pas disponibles localement dans l'environnement utilisé. Les suites de tests **ont été lues mais pas lancées**. Le résultat de GitHub CI doit être examiné sur la PR. Exhaustivité de l'arbre et test de migration JSON restent ouverts.

**Aucune régression identifiée par modification des pages existantes ; absence de régression technique non démontrée sans build et CI.**

## 7. Décisions requises du créateur

1. Confirmer l'exception ou la migration des sept propositions MJ déjà publiées, sans les canoniser.
2. Approuver ou modifier les préfixes suggérés \`ESP-\`, \`FAMT-\`, \`INDC-\`, \`BIO-\`, \`P5C-\`, \`VARC-\`.
3. Décider si Édril et Maërys doivent avoir un identifiant d'individu propre, sans déplacer le code du dossier existant.
4. Valider plus tard toute création d'espèce, relation taxonomique ou localisation d'habitat manquante.
5. Statuer en chantier 5d6 sur les niveaux habitants/aventuriers et le convertisseur import/export, sans règle concurrente.

## 8. Prochaines missions recommandées

**B-002 :** audit complet de l'arbre Git, des pages non indexées, des illustrations et des doublons ; rapprochement des sources CB35–CB39, vérification des annexes et du dernier état des personnages. **B-003 :** choisir un biome déjà attesté dans l'Atlas et développer son écologie uniquement à partir des sources. **B-004 :** approfondir une famille évolutive uniquement après preuve documentaire de plusieurs formes ; aucune série canonique n'est pré-choisie. **Dépendance technique :** terminer les contrôles CI, la politique d'aides MJ publiables et la spécification validée de l'adaptateur JSON 5d6.

**Conclusion :** fondation documentaire opérationnelle en revue. L'exhaustivité de l'audit, le contrôle automatique complet et les décisions canonisantes ne sont pas proclamés acquis.

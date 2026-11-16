# Rapport technique — ANT-DECH-003 — Extension antagonismes LAB-DECH-003

**Mission :** LAB-DECH-003, lot ANT (organisations, menaces, escalade, négociation et retrait).

**Responsable :** ANT. **Date d'exécution :** 2026-11-15 (America/Toronto).

**Branche réservée :** `docs/ant-dech-003-factions` ; **base :** `main@6ede99200d5ab2530a7e0b1f3880b136e4dae94d`.

**Statut :** proposition documentaire **non canonique, non jouée, non publiée** ; aucune migration ni règle ajoutée.
**Source LAB :** `lore/lab-dech-003@4cbd5337df4d29767a3a8eddabd34c919145ea8f`, dossiers 01 à 07.

## Périmètre et résultat

Le dossier LAB contient déjà une première rédaction sur dépendance/privation, douze tentations, six portraits A–F, quatre histoires A–D et la matrice INDEX/STUDIO. **Nous n'avons ni réécrit, ni fusionné, ni canonisé ces travaux.** La présente tranche traite seulement des ensembles organisés et de leur jouabilité ; les biographies détaillées appartiennent à PNJ, les récits à CHRONIQUES/AVE, les capacités à INDEX/MATH et les lois cosmologiques à LORE.

| Livrable | Contenu | Propriété et visibilité |
| --- | --- | --- |
| `docs/conception/antagonistes/ANT_DECH_003_FACTIONS_PUBLIC.md` | 6 organisations proposées (dont un contre-pouvoir non Déchu), intérêts, ressources, limites, alliances, dépendances et pistes de désamorçage. | ANT, documentaire public **hors site**. |
| `docs/conception/antagonistes/ANT_DECH_003_FRONTS_RENCONTRES_PUBLIC.md` | 3 fronts thématiques, 12 rencontres, escalade I0–I4, résolution, fuite, garde-fous équité. | ANT, documentaire public **hors site**. |
| `docs/rapports-missions/ANT_DECH_003_RAPPORT_TECHNIQUE.md` | Sources, résultats de tests, garde-fous, régressions et transmission. | ANT, rapport de mission. |
| `docs/rapports-missions/FICHE_DIRECTION_ANT_DECH_003.md` | Synthèse décisionnelle, arbitrages et passations à préparer. | ANT, fiche DG. |
| `ANT_DECH_003_GUIDE_MJ_CONFIDENTIEL.md` | Variantes de secrets, agendas internes, indices, affrontement et scène pilote. | Fichier **privé distinct**, non versé au dépôt public ni au site. |

La Caisse, les Maisons, le Conservatoire, le Chœur, la Chambre et l'Assemblée sont des **propositions originales**, sans code canonique ni implantation historique. Les affiliations aux branches de Princes sont des options explicites, jamais une nouvelle vérité sur leurs actes.

## Sources vérifiées

| Document du dépôt | Statut lu | Emploi dans ANT-DECH-003 |
| --- | --- | --- |
| `content/monde/decheance-canon.md` MON-DECH-01, blob `c728a38ff46faf17549637395b771fe1c47c73f6` | `lore_valide` | 5 états, tribut, Chutes liées, respect des victimes, possibilité de rupture. |
| `content/monde/dechus-hierarchie.md` ANT-DECH-01, blob `2a762670777b83947bc31df706ec7102fc70b81f` | `lore_valide` | 3 Seigneurs, 9 Princes, 3 pyramides et limites d'affiliation. |
| `content/jouer/decheance-systeme.md` SYS-DECH-01, blob `48f9ca47c41d985f4b85bdce807d51f45dff89b4` | Mini-système optionnel **2d6** validé | Séparation Emprise 0–12 / niveaux 1–25 ; pas de conversion chiffrée. |
| `content/jouer/decheance-aventures.md` Q-DECH-01 | `proposition_non_jouee`, scénarios approuvés | Ne pas doubler les huit aventures ni remplacer « Les Sceaux de Demain ». |
| `content/monde/failles-et-ruptures.md` MON-FAI-02 | `lore_valide` | Pas de Faille impliquant une Déchéance automatique. |
| Anciennes propositions et prototypes de Déchéance | `historique`, remplacés | Traçabilité seulement, non sources de nouveaux effets. |
| `docs/lab-dech-003/01`–`07` sur la branche LORE | Propositions non jouées | Dépendance, douze tentations, six PNJ A–F, quatre histoires et interopérabilité. |
| `ANT_001_CADRE_PUBLIC.md` et PR #83, brouillon | Proposition ANT-001 | Réemploi du contrat `ant-threat/0.1` et des phases I0–I4. |
| `CONTRIBUTING.md`, `AGENTS.md`, `CONTRAT_EDITORIAL.md` | Gouvernance | Secret MJ hors dépôt ; pas de publication ou de canonisation automatique. |

Les documents bruts CB/Bible n'ont **pas** été réauthentifiés lors de cette mission ; nous nous appuyons sur les fiches de lore **déjà validées**. Le constat n'est pas une certification historique autonome.

## Invariants contrôlés

1. **Canon :** aucune nouvelle affiliation, scène jouée, ville, période, siège divin ou statut de Prince/Seigneur affirmés ; noms F1–F6 et variantes toujours proposés.
2. **Mécanique :** aucune valeur de dégâts, PV, mana, attaque, défense, coût, difficulté, bonus ou règle 5d6 nouvelle. L'Emprise ne représente pas le niveau du PNJ.
3. **Pyramides :** une personne salariée, croyante, malade, captive ou endeuillée ne crée pas automatiquement de Tribut ; la souffrance et la dette ne sont pas converties en puissance.
4. **Dépendance :** différence entre entretien, croissance, usage et source ; perte de liens = conséquences **proposées, conditionnelles** ; protection des bénéficiaires.
5. **Résolutions :** négociation, réformes, alliance, enquêtes, résistance, secours, fuite, repli, défense ou échec partiel ; combat sans obligation.
6. **Visibilité :** secrets et révélations de scènes dans un document privé, absents des fichiers transmis au dépôt ; `unlisted` et `spoilers` ne sont pas considérés comme un contrôle d'accès.

## Recette reproductible — exécutée localement

**Environnement :** clone propre de `main@6ede992`, Node `v24.22.1`, installation complète des dépendances ; fichiers du lot dans `docs/`, aucun changement sous `content/`, Quartz ou Studio.

| Contrôle | Commande / protocole | Résultat |
| --- | --- | --- |
| Dépendances | `npm ci --no-audit --no-fund` | **PASS** — 329 paquets installés. |
| Chaîne de régression existante | `npm test` | **PASS** — contenu, TypeScript, build Quartz, liens, M01–M05, B-001/B-002, MAG-003 et Grimoire. |
| Métadonnées publiques existantes | Étape `check:content` dans `npm test` | **PASS** — 369 pages publiables, 269 codes uniques. Le script ne certifie **pas** nos idées. |
| Exactitude règles existantes | Étapes 5d6 dans `npm test` | **PASS** — 7 776 issues vérifiées par les outils existants ; **aucune** homologation de Déchéance 5d6. |
| Comptages propres au lot | Script Node reproduit plus bas | **PASS** — 6 factions, 3 fronts, 12 rencontres, avertissements et absence des marqueurs de vérité MJ dans les fichiers publics. |
| Espaces et modifications | `git diff --check` ; suivi Git limité aux quatre fichiers documentaires | **PASS** — pas d'erreur de forme. |

Test ciblé reproductible, à lancer à la racine du dépôt avec les nouveaux fichiers présents :

```bash
node -e 'const fs=require("node:fs");const a=fs.readFileSync("docs/conception/antagonistes/ANT_DECH_003_FACTIONS_PUBLIC.md","utf8"),b=fs.readFileSync("docs/conception/antagonistes/ANT_DECH_003_FRONTS_RENCONTRES_PUBLIC.md","utf8");for(let i=1;i<=6;i++)if(!new RegExp("### F"+i+" ").test(a))throw Error("F"+i);for(let i=1;i<=12;i++)if(!new RegExp("\\| R"+i+" ").test(b))throw Error("R"+i);for(const p of ["Front A","Front B","Front C","I0","I4","MATH","hors canon"])if(!(a+b).includes(p))throw Error(p);if(a.includes("Vérité MJ")||b.includes("Vérité MJ"))throw Error("Secret en public");console.log("ANT-DECH-003: OK")'
```

**Limitations de recette :** aucun nouvel effet mécanique à simuler ; pas de playtest humain, pas de recette navigateur ni audit d'étanchéité réelle du Studio ; aucun test d'import/export sur ce lot documentaire. Un contrôle de chaînes ne prouve **pas** qu'un fichier ne divulgue aucun spoiler : la revue éditoriale du contenu demeure obligatoire. Les preuves CI d'un futur HEAD doivent être **vérifiées après dépôt** et ne sont pas présumées ici.

## Régressions et dépendances pour intégration future

- `INDEX/MATH` : références de dons non homologuées ; pas de porte d'activation, ni de transposition directe des charges 2d6. Si une fiche niveau 1/5/10/15/20/25 est créée, calculer les cas exacts sur 7 776 issues et documenter l'équilibrage sans « gain » de niveau par souffrance.
- `PNJ` : profils A–F à relire pour unicité des noms, compétences, statut de victime contrainte et possibilité de rupture ; 19 autres profils restent hors du présent lot.
- `LORE` : arbitrer la loi d'entretien, les conversions rituelles spécifiques, la relation Failles/Couronnes, les privilèges et limites des Princes sans inventer de Tout-Puissant.
- `AVE/QTE/CHRONIQUES` : préférer plusieurs issues aux quatre récits existants et préserver leur statut non joué.
- `STUDIO/ARCHIVES/QA` : référencer et copier les factions, les lier à une scène en campagne locale, séparer `campagne_id` et source ; états secrets **jamais** inclus dans la projection joueur ; retour/annulation d'une branche et export/restauration à tester lors d'une vraie intégration.
- `BEST/COMBAT/MAG` : monstres, adversaires chiffrés et magie restent sous leurs propriétaires ; aucune puissance par adjectif narratif.
- **Sauvegardes, sécurité, publication :** aucun fichier d'application ni stockage modifié. Ne pas considérer une branche GitHub publique comme un coffre privé. Mise en ligne et canonisation sur décision explicite seulement.

## Statut et décisions ouvertes

1. DG/LORE : quelles factions — le cas échéant — doivent devenir références de l'univers partagé, et sous quels noms ?
2. LORE/DG : quelle règle narrative exacte pour la privation avancée, ses exceptions et ses sources ?
3. LORE/PNJ : rattachements facultatifs aux neuf Princes, biographies A–F et distinction serviteur/lieur/captif.
4. INDEX/MATH/MAG/COMBAT : budget et références d'effets avant tout chiffrage.
5. STUDIO/ARCHIVES/QA : format de copie de campagne, registre de liens, consentement, sauvegarde et liste blanche de la fenêtre joueur.
6. DG/créateur : vérifier et approuver le lot documentaire ; décision distincte et ultérieure pour toute diffusion.

**Transmission à préparer, non envoyée :** LORE, PNJ, AVE, QTE, CHRONIQUES, MAG, BEST, COMBAT, INDEX, MATH, STUDIO, ARCHIVES, QA et DG. **Aucune fusion, publication ni canonisation autorisée dans ce lot.**

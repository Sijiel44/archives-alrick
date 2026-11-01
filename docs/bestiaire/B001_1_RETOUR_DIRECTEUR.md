# B-001.1 — Compte rendu au Directeur du Bestiaire

**Mission :** synchroniser la PR #56 avec le moteur 5d6 réellement implémenté dans la branche `main` après les PR #57–#62. **Base vérifiée avant reconciliation :** `6fe3c79cfdd36e69a6eaa356abc498d29b81f580` ; branche B-001 initiale `7b4886b7296d5ff424e287abb38de4cd2063ebcb`. **État de livraison B-001.2 :** CI B-001.1 sur `e19649e` vérifiée et réussie (workflow #41263562458) ; nouveau commit de clôture à revalider en CI ; **aucune fusion ni publication automatique**.

## 1. Livrables et modifications prévues sur la PR #56

- `modeles/creature-profil-5d6.md` : nouveau contrat M03/M04.1/M05, import/export `alrick.bestiary.v1` → `alrick.sheets.v3` (`m03-bestiary`), protections, capacités, groupes et résolution pacifique.
- `modeles/creature-espece.md`, `modeles/creature-individu.md` : 0..n profils, sans transfert des caractéristiques individuelles à l'espèce.
- `docs/bestiaire/B001_AUDIT_TAXONOMIE_5D6_ARCHITECTURE.md` : ancienne matrice E remplacée par renvoi et données M03/M05 correctes.
- `docs/bestiaire/B001_1_MATRICE_COMPATIBILITE_5D6.md` : comparaison complète des contrats et état des tests.
- `scripts/test-b0011-compat.mjs`, `package.json` : tests complémentaires sur les fonctions actuelles, sans changer les formules.
- `docs/bestiaire/B001_RETOUR_DIRECTEUR.md` : avertissement de synchronisation et renvoi vers ce compte rendu.

## 2. Compatibilités et corrections

| Sujet | Verdict | Action |
| --- | --- | --- |
| M01, M03, M04.1, M05 | **Compatible en lecture** | Reprendre les fonctions existantes |
| Ancien `generateCreatureProfile` | **Obsolète pour M03** | Remplacer par `generateCreatureProfileM03` et `createBestiaryCard` |
| Ancien exemple `alrick.sheet.v2` | **Obsolète pour le transfert M03** | Documenter `alrick.bestiary.v1`, `alrick.sheets.v3`, `m03-bestiary` |
| `resistanceBonus` / `protection` | **Distinction obligatoire** | Seuil de résistance vs absorption, garder `equipmentGrades` |
| `bestiarySource` | **Contrat existant** | Conserver l'instantané complet au transfert |
| `documentaryLink` | **Déclaratif** | Maintenir les champs et la validation de lecture M05, aucun lien public activé |
| Relations fiches ↔ profils | **n:n à documenter** | Registre inverse futur, M05 ne gère qu'un lien principal |
| Niveau vs menace | **Indépendants** | Échelles et hypothèses de groupe séparées |
| Non-combattants | **Documentable, non automatisé** | Fuite, dialogue, secours sous responsabilité MJ |
| Réécriture mathématique / canon | **Interdite et évitée** | Aucun calcul ni capacité historique modifié |

## 3. Contrôles exécutables et limitations

La suite de tests B-001.1 couvre cinq niveaux représentatifs, cinq archétypes, groupes, transfert natif, extensions et protections. Elle utilise les modules M01/M03/M04/M05 existants et vérifie l'absence d'effet automatique du texte narratif. Le statut de CI **a été relevé pour le commit B-001.1 `e19649e`** : [workflow #41263562458](https://github.com/Sijiel44/archives-alrick/actions/runs/41263562458) `completed/success` ; `npm test`, TypeScript, Quartz, contenu, liens et Chrome réussis. La nouvelle tête B-001.2 nécessite un contrôle distinct. Les tests M03/M04/M05 existants, y compris le navigateur publié par M04.1 et 15 scénarios M05, sont attestés dans leurs rapports respectifs ; ils **ne sont pas** des tests humains de la nouvelle branche documentaire.

**Non réalisé dans cette mission :** playtest humain de négociation, équilibrage de campagne, authentification de MJ, migration exhaustive des anciennes sauvegardes, navigation encyclopédique publique validée, statut de publication d'une espèce, nouvelles créatures ou biomes.

## 4. Points à soumettre au Directeur

1. Valider la forme du registre inverse n:n entre fiches et profils et l'autorité des codes.
2. Approuver les conventions des nouveaux IDs de profils sans modifier IMP/REV/DRG/CRE.
3. Décider les seuils de danger collectif à partir de véritables parties ; ne pas le déduire du niveau de profil.
4. Valider les alternatives non violentes comme choix narratifs, non comme pouvoirs gratuits du moteur.
5. Faire une revue des sauvegardes personnelles et des publications à spoilers avant toute fusion.
6. Vérifier la CI du nouveau commit B-001.2 puis demander revue de la PR #56 avant toute fusion.

## 5. Décision de fin

**Recommandation :** conserver la PR #56 en brouillon et non fusionnée, réconciliée avec `main`, jusqu'à validation éditoriale, compatibilité enregistrée et contrôles CI. Les travaux B-002/D-004 peuvent utiliser les conventions proposées sans les présenter comme du canon.


## Mise à jour de clôture B-001.2 — preuves et limites

La PR #56 est toujours **ouverte, en brouillon, non fusionnée**, réconciliée avec `main` après #57–#62 ; à `e19649e` : **13 commits d'avance / 0 de retard**, `mergeable:true`, sans valoir autorisation de fusion. Le workflow [#41263562458](https://github.com/Sijiel44/archives-alrick/actions/runs/41263562458) sur ce SHA a exécuté `npm ci`, `npm test` (dont 1 318 assertions B-001.1, 1 390 M05), TypeScript, build Quartz, contrôle de site (1 111 HTML/64 434 liens) et Chrome (15 scénarios/7 confirmations), tous **réussis**. [Artefact captures #13066760528](https://github.com/Sijiel44/archives-alrick/actions/runs/41263562458/artifacts/13066760528).

Contrôle du registre : 21 entrées, 10 codes historiques non nuls tous distincts, 11 `null` sans attribution ; `npm test` compte 269 codes **publiés** uniques. L'audit des créatures initial couvre 15 fichiers, contre 17 Markdown dans l'arbre Git courant : revue des deux supplémentaires et contrôle transversal des brouillons encore nécessaires. Le test n'utilise plus `DRG-01` comme identifiant fictif ; `TEST-B0012-NONCOMBAT-01` est **réservé aux tests**, non documentaire.

**Réserves et décision :** conserver les préfixes proposés non approuvés ; faire arbitrer par le créateur les sept prototypes de village déjà publiés comme propositions, la forme du registre n:n et les profils, la sécurité des spoilers/portraits, l'équilibrage et les alternatives pacifiques ; tester des sauvegardes réelles et une séance humaine. Nouvelle CI B-001.2 à vérifier. Voir `docs/rapports-missions/B001_2_CLOTURE_BESTIAIRE.md` et `FICHE_DIRECTION_B001_2.md`. **Aucune fusion, publication ni lancement de B-002.**


### CI post-correction B-001.2 — contrôle final du code

Le [workflow **#41266259571**](https://github.com/Sijiel44/archives-alrick/actions/runs/41266259571), déclenché par la PR #56 sur le commit **`b868499b5fad2dacc5127b797604873ce5a878ab`**, est **`completed/success`**. Le [job #124729578279](https://github.com/Sijiel44/archives-alrick/actions/runs/41266259571/job/124729578279) a réussi `npm ci`, `npm test` (contrôle contenu, `tsc --noEmit`, build Quartz, site et toutes les suites 5d6) et `npm run test:m04:browser`. Les journaux attestent **1 321 assertions B-001.1/B-001.2**, soit trois contrôles de registre en plus, **1 390 assertions M05**, **369 pages choisies / 269 codes publiés uniques**, **1 111 pages HTML / 64 434 liens et ressources**, **15 scénarios Chrome / 7 confirmations**. [Artefact Chrome #13067286489](https://github.com/Sijiel44/archives-alrick/actions/runs/41266259571/artifacts/13067286489) conservé. La présente actualisation finale des rapports ne change **aucun code exécutable** ; vérifier le statut de CI de la tête courante avant fusion.

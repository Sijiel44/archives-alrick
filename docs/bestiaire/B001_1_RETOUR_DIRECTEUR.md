# B-001.1 — Compte rendu au Directeur du Bestiaire

**Mission :** synchroniser la PR #56 avec le moteur 5d6 réellement implémenté dans la branche `main` après les PR #57–#62. **Base vérifiée avant reconciliation :** `6fe3c79cfdd36e69a6eaa356abc498d29b81f580` ; branche B-001 initiale `7b4886b7296d5ff424e287abb38de4cd2063ebcb`. **État de livraison :** mise à jour documentaire et tests proposés sur la PR #56 ; **aucune fusion ni publication automatique**.

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

La suite de tests B-001.1 couvre cinq niveaux représentatifs, cinq archétypes, groupes, transfert natif, extensions et protections. Elle utilise les modules M01/M03/M04/M05 existants et vérifie l'absence d'effet automatique du texte narratif. Le statut de CI **doit être relevé après le commit**, et non supposé vert dans ce rapport. Les tests M03/M04/M05 existants, y compris le navigateur publié par M04.1 et 15 scénarios M05, sont attestés dans leurs rapports respectifs ; ils **ne sont pas** des tests humains de la nouvelle branche documentaire.

**Non réalisé dans cette mission :** playtest humain de négociation, équilibrage de campagne, authentification de MJ, migration exhaustive des anciennes sauvegardes, navigation encyclopédique publique validée, statut de publication d'une espèce, nouvelles créatures ou biomes.

## 4. Points à soumettre au Directeur

1. Valider la forme du registre inverse n:n entre fiches et profils et l'autorité des codes.
2. Approuver les conventions des nouveaux IDs de profils sans modifier IMP/REV/DRG/CRE.
3. Décider les seuils de danger collectif à partir de véritables parties ; ne pas le déduire du niveau de profil.
4. Valider les alternatives non violentes comme choix narratifs, non comme pouvoirs gratuits du moteur.
5. Faire une revue des sauvegardes personnelles et des publications à spoilers avant toute fusion.
6. Examiner le statut CI et demander la revue de la PR #56 après synchronisation.

## 5. Décision de fin

**Recommandation :** conserver la PR #56 en brouillon et non fusionnée, réconciliée avec `main`, jusqu'à validation éditoriale, compatibilité enregistrée et contrôles CI. Les travaux B-002/D-004 peuvent utiliser les conventions proposées sans les présenter comme du canon.

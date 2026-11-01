# G-001 — Compatibilité des sauvegardes Grimoire / Atelier M01–M05

**Branche :** `feat/grimoire-5d6-v1` · **PR :** #55 · **Référence :** DG-04/#65, anomalies DG04-04 et DG04-05.  
**Politique :** aucun format historique détruit ni migration des fichiers personnels en place ; les exports sont de nouveaux fichiers JSON.

## Formats et parcours

| Source entrante | Format lu | Destination / comportement |
| --- | --- | --- |
| Fiche nue historique ou tableau de fiches | `legacy`, JSON libre validable (nom + 4 stats) | Nouvelle fiche normalisée, `legacyOriginal` conserve la source de l'ancien ruleset ; Grimoire créé vide si absent. |
| Conteneur de fiches ancien | `alrick.sheets.v1` ou `alrick.sheets.v2` | Import dans l'Atelier, export `alrick.sheets.v3`, Grimoire optionnel conservé. |
| Conteneur de fiches moderne | `alrick.sheets.v3` | Import dans l'Atelier, export `alrick.sheets.v3`. |
| Campagne ancienne | `alrick.campaign.v1` | Restauration soumise à confirmation, export complet `alrick.campaign.v2`. |
| Campagne moderne | `alrick.campaign.v2` | Restauration complète soumise à confirmation, export `alrick.campaign.v2`. |
| Stockage navigateur | `archives-alrick-atelier-5d6-v1`, `...-v2` | La clé v2 a priorité ; l'ancienne reste lisible ; jamais purgée par la mission. |
| Grimoire optionnel dans une fiche | `alrick.grimoire.v1` | Sorts, attestations, matrices, effets, ressources et journal restent attachés à la fiche. |
| Extensions d'origine inconnue | Propriétés JSON, références aux sorts non reconnus | Propriétés interprétables conservées en place ; original et éléments écartés archivés dans `grimoire.legacyOriginal` et avertissements `migrationWarnings`. |

**Attention :** l'import de fiches est un **ajout au répertoire**, la restauration de campagne **remplace l'état local après confirmation**. Exporter la campagne active avant toute restauration est indispensable.

## Invariants vérifiables

1. **Aucune équation dérivée du niveau** : N5/N10/N15/N20/N25 conservent caractéristiques brutes, points de maîtrise, mana, inventaire et origine documentaire ; la régression 9 brut → +6 effectif est traitée par M01/M03.
2. **Aucun sort attribué par migration** : un personnage sans Grimoire reçoit un bloc vide ; seuls les sorts appris apparaissent dans `known`, et seule une attestation MJ donne le droit au Cercle.
3. **Matrice à objet réel** : `itemId` doit être présent dans l'inventaire pour activer ; une suppression d'objet interdit les activations sans supprimer automatiquement les matrices en JSON.
4. **MAG-050** : une matrice C8/C1 associée à un objet conserve `architectureCircle:8`, `activationCircle:1`, `spellId` et ses charges, sans attribuer la conception de C8 à l'utilisateur.
5. **Cercle IX** : `divineNinthApproved` et l'attestation ne découlent jamais du niveau de personnage ; une archive JSON n'est pas une vérification de la légitimité narrative.
6. **Extensions** : propriétés de fiche, items d'inventaire, sorts personnels, matrices, événements et effets sont transportées ; les entrées que le moteur actuel n'accepte pas restent dans l'archive brute, sans apparition automatique dans la liste jouable.
7. **Effets et historiques** : `history`, `effects`, `known`, `requests`, `matrices` sont stockés par fiche et exportés avec elle. Limites de taille existantes respectées ; le surplus reste archivé et signalé.

## Exemple de sauvegarde augmentée

```json
{
  "schema": "alrick.sheets.v2",
  "sheets": [{
    "name": "Personnage de test",
    "kind": "pj",
    "ruleset": "m02",
    "level": 5,
    "stats": {"physique": 3, "agilite": 3, "esprit": 9, "presence": 3},
    "futureSheetRule": "conserver",
    "inventory": [{"id": "artefact-test", "name": "Sceptre", "quantity": 1,
      "category": "artefact", "customInventorySource": "scelle"}],
    "grimoire": {
      "schema": "alrick.grimoire.v1",
      "circlesAttested": [1],
      "personalSpells": [],
      "known": [],
      "requests": [],
      "effects": [],
      "history": [],
      "matrices": [{
        "id": "matrice-test", "itemId": "artefact-test",
        "spellId": "demo-onde-murailles",
        "architectureCircle": 8,
        "activationCircle": 1,
        "energySource": "matrix",
        "charges": 2,
        "approvedBy": "MJ",
        "source": "Démonstration",
        "futureMatrixRule": "conserver"
      }],
      "futureGrimoireRule": {"version": 2}
    }
  }]
}
```

Résultat attendu : l'export public porte `alrick.sheets.v3` ; `futureSheetRule`, `customInventorySource` et `futureMatrixRule` survivent ; `futureGrimoireRule` est conservé et signalé. Le nombre de charges n'est pas une règle canonique déterminée par ce roundtrip.

## Exécution et preuves

- **CI de référence verte :** [Actions #41267164718](https://github.com/Sijiel44/archives-alrick/actions/runs/41267164718), `npm test` avec test du Grimoire et Chrome M04/M05.
- **Scénarios ajoutés après ce run :** dans `scripts/test-5d6-m04-browser.mjs`, import `sheets.v2`, export `sheets.v3`, inconnus, inventaire, matrice C8/C1, campagne `v1` → `v2`. Exiger un run vert du **dernier commit** avant de les déclarer acquis.
- **Non démontré :** roundtrip exhaustif de toutes les sauvegardes historiques personnelles, migration de données malformées hors limites, navigateur physique, toute plateforme serveur multi-utilisateur, données externes de modules futurs.
- **Aucune migration destructive :** ni effacement de stockage v1, ni écrasement de fichier source sur disque, ni publication dans les Archives.

## Questions d'intégration et de sécurité

- L'archive `legacyOriginal` peut grossir si les fichiers contiennent de nombreuses extensions ; examiner taille et confidentialité de l'export complet avant partage.
- Les champs inconnus sont **transportés**, pas garantis fonctionnels. Un module futur doit les valider avant exécution.
- La restauration de campagne est locale et confirmée ; l'Atelier n'est pas serveur autoritaire, n'assure pas concurrence ni idempotence multi-utilisateur.
- Le futur protocole de Tables devra conserver `sourceSnapshot`, version de ruleset, identifiants d'instance, champs bruts, maîtrise, inventaire, journal et permissions MJ, sans prétendre que l'import partiel actuel de T-001 transfère tout.

**Verdict sauvegardes :** les roundtrips synthétiques et la stratégie de conservation sont prêts à contrôle CI et revue de code. Une validation réelle d'archives de joueurs reste nécessaire avant d'autoriser une migration permanente.

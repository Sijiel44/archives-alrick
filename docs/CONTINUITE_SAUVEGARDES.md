# Continuité, sauvegardes et reprise — Archives d'Alrick

**État de la procédure : 30 octobre 2026.** Ce guide protège le projet documentaire et son code ; il ne change ni le canon ni le système de jeu. Le dépôt est **public**.

## Source de vérité et confidentialité

1. **Bruts de campagne et documents privés** : sources primaires, conservées **hors de ce dépôt public**. Ils alimentent les six volumes consolidés.
2. **Index et six volumes** : état éditorial, avec codes et références pour retrouver les sources. Une correction explicite et une scène jouée priment sur un ancien résumé.
3. **Contenus Markdown du site** : présentation publiable, avec états `faits_joues`, `lore_valide`, `projet_en_cours`, `hypothese`, `proposition_non_jouee`, `a_verifier`, etc.
4. **Décisions et parties futures** : enregistrer une nouvelle décision dans le journal de reprise privé, puis dans une PR sourcée si elle concerne le site. Ne jamais insérer automatiquement les nouvelles scènes d'une autre table dans l'Odyssée d'Orin.

Les fichiers Word, XLSX, exports ChatGPT, biographies personnelles non publiées et vrais secrets MJ ne doivent **jamais** être ajoutés à `content/`, ni même dans un autre dossier de ce dépôt. Une page `publish: false` reste présente dans Git ; un avertissement spoilers ne chiffre rien.

## Sauvegarde automatique du code sur GitHub

Le workflow [`backup-code.yml`](../.github/workflows/backup-code.yml) s'exécute **chaque dimanche** et manuellement depuis l'onglet *Actions → Sauvegarder le code public des Archives → Run workflow*.

- Récupère branches et tags distants, puis produit un `archives-alrick.bundle` avec l'historique Git.
- Vérifie le bundle et calcule son SHA256.
- Dépose le fichier dans les **artefacts de l'exécution GitHub Actions** pour **30 jours**.
- Fonctionne avec `contents: read`, sans secret ajouté et **sans publier le site**.
- **Ne sauvegarde pas** les documents privés, les chats ChatGPT, les tickets, commentaires de PR, les paramètres GitHub, ni les éléments GitHub qui ne sont pas des objets Git.
- **Ne constitue pas une sauvegarde indépendante de GitHub** : l'artefact expire et se trouve sur la même plateforme.

Dans un incident majeur, récupérer l'artefact du dernier workflow réussi, contrôler `SHA256SUMS.txt`, puis vérifier `git bundle verify archives-alrick.bundle` dans un dépôt Git local. Conserver les bundles hebdomadaires importants hors de GitHub.

## Copie locale Windows : code + documents sources

Prérequis : **Git for Windows** et Windows PowerShell. Le script [`scripts/Sauvegarde-Alrick.ps1`](../scripts/Sauvegarde-Alrick.ps1) sauvegarde localement le dépôt **et** un dossier privé séparé.

Organisation recommandée :

```text
Documents\Alrick\archives-alrick\     <- depot Git PUBLIC clone, code et fiches web
Documents\Alrick\Sources_privees\     <- Word, Excel, bruts, exports et journaux
Documents\Sauvegardes-Alrick\         <- ZIP date + SHA256, HORS du depot
```

Depuis PowerShell :

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "$HOME\Documents\Alrick\archives-alrick\scripts\Sauvegarde-Alrick.ps1" -Depot "$HOME\Documents\Alrick\archives-alrick" -SourcesPrivees "$HOME\Documents\Alrick\Sources_privees" -Destination "$HOME\Documents\Sauvegardes-Alrick"
```

Le script recueille un **Git bundle**, le dossier de travail (y compris les changements non commités, hors dossiers générés), les sources privées présentes et un SHA256 de l'archive ZIP. Le ZIP n'est **pas chiffré**. Conserver les sauvegardes sur un volume chiffré et sur un second support indépendant, jamais dans une URL ou un dépôt public.

**Sauvegarde hors site :** utiliser un disque externe ou un stockage privé sécurisé avec une copie régulière. Ce choix et l'activation d'une tâche Windows planifiée demandent une configuration sur l'ordinateur ; aucun workflow GitHub ne peut lire les fichiers du PC.

## Reprendre après une conversation ChatGPT cassée

1. Ouvrir la dernière fiche privée `POINT_DE_REPRISE.md` et le journal des décisions.
2. Vérifier le dernier brut et les six volumes/index : **lire la preuve primaire**, ne pas déduire les faits d'un titre ou d'une PR.
3. Contrôler l'état GitHub (`main`, PR ouvertes, dernier build, publication effective).
4. Continuer la scène au dernier **instant joué**, sans anticiper les projets encore en discussion.
5. Après la séance, sauvegarder les nouveautés et mettre à jour le point de reprise.

Ce dépôt ne conserve pas le contenu complet des conversations ChatGPT : exporter les conversations avec les outils disponibles dans ChatGPT et conserver les exports dans `Sources_privees`. Les liens de partage peuvent cesser de fonctionner.

## Points de retour conservés le 30 octobre 2026

- `checkpoint/2026-10-30-main` : commit `b1b4d8b176aa1ebfc3bda4cd0a258adceb8194ae`.
- `checkpoint/2026-10-30-pr28` : commit `cd979f2a96b75355355c8ef4178255f960a75246`, tête de la [PR n° 28](https://github.com/Sijiel44/archives-alrick/pull/28) au relevé. Cette PR **n'était pas fusionnée** à cette date.
- Ces branches constituent des **jalons dans le même dépôt**, pas des sauvegardes extérieures ni une garantie contre la suppression du compte.

## Contrôles avant toute fusion

- Conserver l'historique : pas de `git push --force` sur `main`, pas de suppression des checkpoints avant une restauration testée.
- PR limitée, revue documentaire, `npm test` réussi ; contrôler les avertissements sur les spoilers.
- Éviter de déclencher le workflow Pages par modification du marqueur de publication pour une simple opération de sauvegarde.
- Après fusion : vérifier Actions, puis tester de temps en temps une **restauration réelle** à partir des sauvegardes, pas seulement une création de ZIP.

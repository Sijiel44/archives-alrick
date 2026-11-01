# MAG-003.E — Plan d'intégration et matrice des conflits / risques

**Archives d'Alrick — 1er novembre 2026** · [PR #75 (DRAFT)](https://github.com/Sijiel44/archives-alrick/pull/75)  
**Branche d'intégration expérimentale :** `magie/mag003e-recette-reconciliation`  
**Responsables de la décision :** Direction générale et créateur. **Ce rapport n'autorise aucune fusion.**

## 1. Graphe de dépendances réellement observé

```text
                         main (aucune MAG-003 fusionnée)
                          │
             MAG-003.A  PR #69 (base main)
                          │
             MAG-003.B  PR #70 (base branche A)
                          │
             MAG-003.C  PR #71 (base branche B)
                          │
             MAG-003.D  PR #72 (base branche C)
                          │
             MAG-003.E  PR #75 (base main ; branche issue du HEAD D)
                          │
               Correctifs E + suites + rapports
```

En parallèle :

- Grimoire **G-001 #55** part d'un **ancien** `main`, a divergé, était **non fusionnable** et avait une CI navigateur en échec.
- **#74** est le correctif export **isolé**, posé sur la branche de G-001, CI propre [#41336804861 réussie](https://github.com/Sijiel44/archives-alrick/actions/runs/41336804861). **#55 n'a pas été modifiée**.
- Tables T-001 **#66** reste une PR ouverte indépendante ; son contrat serveur ne reçoit aucun rituel de #75.
- MAG-002 **#68** est un dossier de conception non canonique ; ses propositions n'ont pas été activées.

**État du contrôle Git au 1er novembre :** `main` était un ancêtre de D (comparaison `main...magie/mag003d-consolidation` : 66 commits en avance, 0 en retard au relevé) ; G-001 divergeait avec `main` (42 en avance, 28 en retard). Il est donc faux de traiter les PR comme toutes fusionnées, ou de remplacer le composant moderne par le fichier de la vieille branche G-001.

## 2. Matrice des fichiers communs : arbitrages de réconciliation

| Fichier | Constats comparés G-001 ↔ D/E | Stratégie adoptée |
| --- | --- | --- |
| `quartz/components/Atelier5d6.tsx` | Blob G et E **identique** : `91ead0255a9487e5a8c634c37e19a3be8531a834` | Conserver sans remplacement |
| `scripts/fixtures/5d6-parity-v1.json` | Blob identique : `6fe5607ae41847834d89343d66768d308538486a` | Conserver les valeurs M01/M03 |
| `scripts/test-5d6-grimoire.mjs` | Blob identique : `ed61bc047f63f633dc1cabd10007f96a8192f69c` | Ne supprimer aucune assertion |
| `docs/GRIMOIRE_5D6_V1.md` | Blob identique : `874b3154c5fd75ccbf86812d8bdf301c3c6edb58` | Conserver la documentation source |
| `atelier5d6-grimoire.ts` | D/E contient en plus le callback facultatif `onManaChanged` | Conserver l'extension de suivi sans modifier charges/Cercles |
| `atelier5d6.inline.ts` | D/E ajoute `ritualWorkshop`, UI de récupération et callback Grimoire ; G-001 présentait le défaut d'export navigateur | Garder le hub D/E et reporter **seulement** la réparation ciblée du bouton d'export |
| `scripts/test-5d6-m04-browser.mjs` | E contient les scénarios G-001 **et** les scénarios rites C/D | Conserver le test historique ; étendre, ne pas substituer |
| `atelier5d6-mana-recovery.ts` | Source A et évolution E, pas de remplacement par G | Empreinte optionnelle des nouvelles opérations, import ancien conservé |
| `atelier5d6-rituals-mag003b.ts` | Source B/D puis évolution E | Éligibilité explicite au soutien par rite, sans changement de M01/M03 |
| `atelier5d6-rites-mag003c.ts` | Source C/D puis évolution E | Sélection du soutien selon contrat, sans attribution de Cercle |
| `package.json` | Scripts de tests A–D/G ajoutés dans la chaîne ; E y ajoute son corpus | Ne pas revenir à l'ancien script G-001, ni écraser M01–M05 |
| `docs/rapports-missions/G_001_*.md` | Manquaient dans l'arbre D, documents de #55 distincts | Copie documentaire explicite et non destructive dans E |
| Tables T-001 `#66` | Import partiel des caractéristiques/résistances/ressources, exclusion des matrices et rituels | Aucun merge de code Tables ni transaction autoritaire fictive |

**Conflits résolus dans le prototype :** bouton d'export G-001; remplacement de la sélection de première maîtrise par une liste admissible; collision de repos à empreinte complète; réunion du corpus documentaire G-001 avec le code A→D. Les évolutions de D sur le Grimoire sont préservées.

**Non résolus volontairement :** intégration des commits Git d'origine de G-001 dans `main`, arbitrage `charges`, règle d'énergie des objets, authentification MJ, rites collectifs serveur, contrats foi/mana, essais humains et échantillon de véritables anciennes sauvegardes.

## 3. Matrice de risques et portes de décision

| Risque | Sévérité | Détecteur / garde-fou | État |
| --- | --- | --- | --- |
| Export G-001 absent | Bloquant | PR #74, CI et scénario Blob v1→v2 | Correctif validé sur G seul, à revérifier sur E |
| Régression des imports anciens | Bloquant | Tests de roundtrip, champs inconnus et `legacyOriginal`, copie originale | Tests synthétiques ; humain ouvert |
| Double crédit repos / collision | Bloquant | Empreinte V1 sur nouvelles opérations, refus ID legacy non vérifiable | Code E + régression à valider sur HEAD |
| Compétence hors sujet ou import forgé | Majeur | `supportRules`, rôle, compétence, connaissances, Cercle, +1 maximum | Local uniquement ; pas de preuve réseau |
| Perte d'inventaire, matrices, charges | Bloquant | Champ `itemId`, `grimoire.v1`, test objet absent, exports | Règle énergétique à arbitrer |
| Désynchronisation mana Grimoire ↔ ledger | Majeur | Refus de récupération et réconciliation MJ volontaire | Blocage prudent conservé |
| Recette mobile physique non réalisée | Majeur | Plan PJ/MJ + captures et appareil déclaré | **Ouvert** |
| Écrasement de développement de `main` | Bloquant | Diff tête `main`, PR distincte, revue à trois voies, CI nouveau SHA | Nouvelle revue juste avant fusion |
| Tables server/ACL et rites collectifs | Bloquant | Aucune commande serveur rituelle et aucun débit collectif | Non implémenté volontairement |
| Fusion/publish sans autorisation | Bloquant | PR DRAFT, aucun déploiement Pages, décision DG écrite | **Interdit** |

## 4. Ordre de fusion **hypothétique**, sous autorisation future distincte

0. Geler les SHA de `main`, #55, #69–#72, #74, #75, #66 et les fixtures ; vérifier toutes les CI de la tête exacte.
1. Examiner/réconcilier G-001 #55 avec `main` à l'aide du correctif #74 **sans modifier son propriétaire** ; résoudre ses conflits Git réels et obtenir une CI verte sur une branche de staging distincte.
2. Vérifier le contenu déjà porté dans C/D/E contre G-001 après ce raccordement ; ne jamais intégrer deux implémentations concurrentes de l'Atelier.
3. Contrôler la progression A (#69) → B (#70) → C (#71) → D (#72), dans cet ordre, et décider si l'adoption se fait par PR empilées ou commits validés reproduits sur une base propre.
4. Rejouer les corrections E (soutien, fingerprints, export, migrations, tests) sur **le nouvel arbre final** ; relancer **npm ci, npm test, TypeScript, Quartz, contenu/liens et Chrome**.
5. Procéder à la recette humaine et l'audit de sauvegardes autorisées, avec restauration testée et preuve de non-perte.
6. **Seulement après vote DG + créateur :** autoriser, ou non, une fusion progressive de PR dans `main`. Un éventuel déploiement Pages et la canonisation nécessitent leurs propres autorisations.
7. L'intégration des Tables #66 et toute API rituelle collective constituent une mission séparée, après définition d'une autorité serveur et d'un commit multi-participants atomique.

La PR #75 ne doit **pas** être fusionnée en remplacement de ces étapes. Son objectif est une recette commune **vérifiable**, pas de contourner la chaîne d'autorité.

## 5. Multi-participants : contrat cible, non développé

Contrôles préalables à une future API de rites : `campaignInstanceId`, identifiants sources et d'instances distincts, propriétaires des participants, consentements explicites, permissions PJ/MJ authentifiées, version de définition et `expectedRevision` de chaque ressource, prévisualisation sans crédit/débit, `actionId` idempotent, transaction atomique (tout ou rien), reçus persistants et restauration sans double débit. L'interface MJ locale et `approved:true` ne sont **pas** des contrôles réseau.

## 6. Arbre et preuve finale

Au moment de la **clôture**, consigner l'identifiant de tête exact de #75, son URL de workflow GitHub Actions, la conclusion du job, le nombre de scénarios Chrome passés, les réserves et la vérification de la signature des fichiers G-001 pertinents.

**Aucun SHA d'une ancienne CI de #72, #74 ou d'un commit intermédiaire de #75 ne vaut preuve de la tête documentaire finale.** Cette porte reste obligatoire.

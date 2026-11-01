# MAG-003.E — Recette et réconciliation expérimentale G-001 + MAG-003.A–D

**Archives d'Alrick — 1er novembre 2026**  
**Référent :** intégration Git, sauvegardes et recette 5d6 · **PR de travail :** [#75 (DRAFT)](https://github.com/Sijiel44/archives-alrick/pull/75)  
**Branche :** `magie/mag003e-recette-reconciliation` · **Base :** `main`  
**Autorité de publication :** Direction générale et créateur uniquement. Aucun merge, déploiement Pages, canonisation ou transaction réseau ne découle de ce rapport.

## 1. Sources réellement examinées

- [G-001 #55](https://github.com/Sijiel44/archives-alrick/pull/55), branche `feat/grimoire-5d6-v1`, head initial `76cabcd7423e83264099063c6e1ac76d80677027`, non fusionnable au contrôle ; [CI #41267847377 (échec)](https://github.com/Sijiel44/archives-alrick/actions/runs/41267847377).
- [Correctif autonome G-001 #74](https://github.com/Sijiel44/archives-alrick/pull/74), branche `magie/mag003e-g001-export-correctif` (base #55), head corrigé `8c4cc52661d6ea71055ada73499b101e8c682382` ; [CI #41336804861 (réussie)](https://github.com/Sijiel44/archives-alrick/actions/runs/41336804861).
- [MAG-003.A #69](https://github.com/Sijiel44/archives-alrick/pull/69) `20c6651452122b2d60ca175fe49bbb27a6274d41` ; [B #70](https://github.com/Sijiel44/archives-alrick/pull/70) `7e5cb4ce728390b8e0999106482e8581c4a935da` ; [C #71](https://github.com/Sijiel44/archives-alrick/pull/71) `72e83c6e545db698cd06758d7ac5eca82b5c42b8` ; [D #72](https://github.com/Sijiel44/archives-alrick/pull/72) `5f5a066b9f53310ee9d084fded6734739fd967b4`, toutes ouvertes en brouillon lors du relevé.
- [Tables T-001 #66](https://github.com/Sijiel44/archives-alrick/pull/66) `f4d8831304a93aaa1e2c8bb0e1dc08db59de87e4` ; MAG-002 #68 (documentation, non canonique) ; `CONTRAT_EDITORIAL.md` ; dossiers M01–M05.
- Rapports `MAG_003_D_CONSOLIDATION.md`, `MAG_003_D_RECONCILIATION.md`, `MAG_003_PILOTAGE_DIRECTION.md`, et dossiers historiques G-001 transférés tels quels dans l'arbre E.

Ces références sont un **instantané d'audit**, et non une autorisation de fusion ou une garantie contre des modifications ultérieures des branches propriétaires.

## 2. Export de campagne G-001 — incident reproduit, correctif isolé, recette

**Échec source attesté :** CI #41267847377 : `npm ci`, `npm test` passent ; `npm run test:m04:browser` échoue au scénario « G-001 : campagne v1 vers v2 avec extensions inconnues ». L'import écrit la campagne locale, mais le bouton d'export ne produit aucun Blob et le callback navigateur lève `ReferenceError: exportCampaign is not defined`.

**Diagnostic :** le gestionnaire d'événement invoquait un symbole libre `exportCampaign()` qui n'était pas résolu au moment du clic dans l'exécution Quartz observée. Le défaut est donc dans le raccordement/portée du déclencheur, non dans le JSON d'entrée, dont l'import réussissait. La cause précise de la divergence entre le TypeScript source et le symbole du bundle produit reste une hypothèse de portée/transformation du script ; elle n'est **pas** présentée comme définitivement prouvée.

**Correction minimale :** construction du contenu `alrick.campaign.v2` et du Blob directement dans la branche `data-export-campaign` du gestionnaire de clic ; suppression de l'ancien helper devenu inutilisé. Aucun test retiré. Enveloppe inconnue `__campaignEnvelopeExtras` conservée, `state` exporté intact.

**Preuve indépendante :** branche #74, CI #41336804861 **completed/success**, comprenant à la fois les tests et le scénario Chrome G-001 sur l'arbre propre de G-001. La PR #55 demeure inchangée et non fusionnée. Pour reprendre ce correctif : examiner le diff de #74 puis le porter **explicitement** dans un arbre réconcilié ; ne jamais remplacer en masse la version moderne du hub par la version plus ancienne de #55.

## 3. Soutien qualifié — contrat vérifiable et historique conservé

`RitualDefinition.supportRules` associe séparément `support` et `duree` à une liste explicite **rôle → compétences admissibles → connaissances préalables optionnelles**. `supportQualification` exige toujours l'identité, le rôle effectif, la compétence attestée chez l'assistant, l'approbation de la contribution, un assistant distinct de l'officiant et, pour les Cercles concernés, le droit exact d'assister. Le moteur relit l'éligibilité au moment de résoudre ; la première maîtrise quelconque de la fiche ne peut plus être choisie automatiquement.

La préparation de cérémonie démonstrative sélectionne maintenant une compétence répondant à cette table, ou refuse l'aide numérique si aucun candidat n'est éligible. Les contributions de matériel, de sûreté, de structure et de protection continuent à participer **sans bonus numérique**. **Maximum +1 contextuel non cumulatif**, puis saturation de la situation à +2 conformément aux moteurs M01/M03. Une ancienne définition sans `supportRules` reste importable mais ne peut pas accorder de nouveau bonus contextuel. Rien n'efface un résultat résolu antérieurement ; les preuves locales ne valent pas authentification réseau.

**Preuves à exiger sur le head final :** `test-mag003b`, `test-mag003d`, `test-mag003e` (compétence hors sujet, connaissances, non-mages, duplication, import manipulé et effet non numérique), scénarios Chrome MAG-003.C/D.

## 4. Idempotence — opérations de mana

`ManaEvent.fingerprint?` reste optionnel dans le schéma `alrick.mana.recovery.v1` pour préserver les anciens journaux. Toute **nouvelle** opération possède une empreinte `alrick.mana.operation-fingerprint.v1` produite avec tri récursif des clés et normalisation des booléens du repos. Champs inclus : identité, journée, ID de période, nature du repos, sûreté, achèvement, concentration, caractère exceptionnel et interruption, validation et provenance, paramètres spécifiques, politique complète (ID, version, taux et arrondi). L'heure navigateur n'intervient pas.

Un ID existant avec empreinte identique est un rejeu sans second crédit. Un ID existant avec empreinte divergente est un refus explicite **avant mutation**. Un ancien événement sans empreinte demeure lisible et exportable, mais l'ID correspondant n'est **pas** réutilisable sans réconciliation explicite : impossible de démontrer l'équivalence de deux requêtes a posteriori. Aucun recalcul ou rattrapage implicite des crédits historiques. Les scénarios existants qui acceptaient le recyclage d'un même ID entre `recover` et `spend` ont été **durcis**, non supprimés.

## 5. Recette automatisée et qualité de preuve

| Contrôle | Exécution prévue | Preuve de sortie |
| --- | --- | --- |
| Dépendances / types | `npm ci`, `npm run check:types` | Journal CI HEAD E |
| Règles M01–M05, G-001, MAG-A/B/C/D et MAG-E | `npm test` | Résultats et compteurs dans le job |
| Quartz, contenu et liens | Inclus dans `npm test` | Build et contrôles `check:content`, `check:site` |
| Interface / sauvegarde / scénarios G-001 + C/D | `npm run test:m04:browser` | Scénarios Chrome, Blob export et captures |
| Régression du correctif sur G seul | CI #41336804861 | Validé sur PR #74 |
| Essais humains ordinateur / téléphone physique | Non exécutés dans cette mission | **Ouverts**, protocole ci-dessous |

**Ne jamais extrapoler** le succès de #74 ou #72 à #75. La CI de la **tête de la PR #75, documentation incluse**, doit être relue et son SHA mentionné avant recevabilité.

## 6. Protocole de recette humaine — PJ, MJ et Grimoire

Préparer deux fiches **de démonstration**, l'une moderne M02 (mana partiellement dépensé), l'autre importée depuis une **copie** de fiche historique ; un inventaire avec un objet réel et une matrice de démo ; une campagne locale vierge. Capturer un export initial et son hash/nom de fichier. Exécuter sur ordinateur avec Chrome ou Firefox moderne, puis sur **téléphone physique** ; pour les actions accessibles, vérifier Tab/Entrée/Espace, focus visible et messages d'erreur.

| Profil | Étapes à exécuter manuellement | Attendu à relever |
| --- | --- | --- |
| PJ | 1er repos court, 2e repos, repos long, repos exceptionnel proposé | Budgets cohérents, refus conditionnel, aucun double crédit |
| PJ | Dépenser du mana, récupérer, recharger la page et consulter le journal | Mana synchronisé, preuves après rechargement |
| PJ | Rite personnel connu simple ; puis rite inconnu/incertain | Le premier sans jet/MJ ; le second refusé ou soumis à validation |
| MJ local | Valider rite incertain, vérifier lieu et sûreté, préparer cérémonie | Prévisualisation distincte de la validation, journal explicite |
| MJ local | Essayer une compétence hors sujet, import manipulé, doublons, assistant non-mage | Aide non pertinente refusée, non-mage admissible si contrat |
| MJ local | Interrompre un rite, créer collision d'ID, provoquer désaccord ledger/fiche | Refus et absence de débit/crédit ; réconciliation volontaire documentée |
| Grimoire | Apprendre, préparer, lancer, lier une matrice à objet existant, tenter objet absent | Attestation/contrôle, refus sans suppression de données |
| Grimoire | Vérifier charges anciennes, faire plusieurs opérations et exporter/importer | Même identité, historique, champs inconnus et charges à la fin |

**Feuille de preuve à remplir par testeur :** appareil, OS, navigateur/version, date, SHA déployé en prévisualisation **non publiée**, numéro de scénario, données anonymisées, attendu/observé, capture si autorisée, gravité, ticket éventuel. Tester l'import/export **après un rechargement complet** et restaurer le fichier d'origine en cas d'anomalie. Ne jamais joindre une sauvegarde privée à GitHub.

L'émulation mobile automatisée et les scripts Chrome **ne sont pas** une recette humaine. Aucun essai physique n'est attesté par ce rapport.

## 7. Verrous et conclusion provisoire

Les « charges » d'objets (source, stockage, usages, coût d'activation, entretien) et `energySource=caster` restent des questions créatives : **pas de conversion** vers `energyStored` ou `usesRemaining`. Prière/méditation, récupération, foi, bénédictions et intervention divine sont distinctes, sans échange foi ↔ mana.

Tables #66 : contrat de compatibilité seulement. Aucune synchronisation rituelle ni validation MJ réseau ; aucun débit collectif, aucun « commit » serveur ou reçu atomique fictif.

**État :** intégration expérimentale en PR DRAFT. Fusion, publication, transaction collective et canonisation **interdites** sans décision explicite DG + créateur.

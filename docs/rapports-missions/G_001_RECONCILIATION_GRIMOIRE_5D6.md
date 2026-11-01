# ARCHIVES D'ALRICK — RAPPORT TECHNIQUE G-001

**Mission :** G-001 — Réconciliation du Grimoire avec M01–M05 et sécurisation des sauvegardes  
**Référent :** Grimoire et systèmes magiques  
**Date de référence :** 31 octobre 2026 (Québec) — événements GitHub du 1er novembre UTC  
**Dépôt :** `Sijiel44/archives-alrick`  
**Branche propriétaire :** `feat/grimoire-5d6-v1`  
**PR propriétaire :** [#55](https://github.com/Sijiel44/archives-alrick/pull/55) (DRAFT, aucune fusion)  
**Audit de départ :** [DG-04, PR #65](https://github.com/Sijiel44/archives-alrick/pull/65), `DG_04_AUDIT_INTEGRATION_PR54_55_56.md`  
**Collaboration parallèle :** [T-001, PR #66](https://github.com/Sijiel44/archives-alrick/pull/66), fixtures `scripts/fixtures/5d6-parity-v1.json`.

## 1. Synthèse exécutive et périmètre

La branche initiale #55 était en divergence (**27 commits devant, 122 derrière**) et signalée non fusionnable. Elle utilisait la caractéristique brute comme bonus de sort et les fonctions d'opposition historiques ; la normalisation du Grimoire reconstruisait des objets whitelistés en perdant les extensions et des références inconnues. L'Atelier moderne attend `alrick.sheets.v3`, `alrick.campaign.v2`, la progression M01/M02, le combat M03 et les fiches Bestiaire M04/M05.

G-001 réconcilie le contenu de #55 avec l'arbre `main` M01–M05 par commit à deux parents, sans écraser la branche Grimoire ni les modules modernes. Les six sorts restent des **fixtures expérimentales non canoniques**. Les permissions MJ demeurent **locales**, sans autorité serveur.

**État :** corrections intégrées et première CI de référence réussie. Les commits supplémentaires ajoutant recette Chrome G-001 et rapport sont à revérifier sur le dernier head. La mission reste **terminée avec réserves de recette humaine et décision de règle**, sans autorisation de fusion.

## 2. Réconciliation Git et fichiers

- **Commit initial de correction :** `ad8abd71393ff295a4809d172d129db0a4432956` (moteur Grimoire).
- **Réconciliation à deux parents :** `8f0afde6f4b4e40cebe4dc44651c83f36d8910e0`, intégrant `main` `6fe3c79cfdd36e69a6eaa356abc498d29b81f580` et l'historique #55.
- Corrections suivantes : typage des métadonnées campagne, inclusion explicite de `test:grimoire` dans `npm test`, avertissement de migration visible, recette Chrome ciblée, documentation.
- **Comparaison attestée après réconciliation :** `behind_by=0` et `status=ahead` face à la base `main` contrôlée. L'état GitHub `mergeable` est recalculé à chaque commit ; à vérifier à la revue finale.

Fichiers fonctionnels : `quartz/components/Atelier5d6.tsx`, `quartz/components/scripts/atelier5d6.inline.ts`, `quartz/components/scripts/atelier5d6-grimoire.ts`. Tests et fixture : `scripts/test-5d6-grimoire.mjs`, `scripts/test-5d6-m04-browser.mjs`, `scripts/fixtures/5d6-parity-v1.json`, `package.json`. Documentation : `docs/GRIMOIRE_5D6_V1.md` et dossiers G-001.

Aucune modification de la PR #54, #56, #66 ou de `main`.

## 3. Contrat M01/M03 : calculs et niveaux

Le moteur de sort délègue désormais **directement** :
- les actions sans opposition à `resolveProgressionAction` (M01) ;
- les attaques/résistances/absorptions à `resolveCombatM03` (M03).

Ces fonctions utilisent les **bonus effectifs** issus de `effectiveStat` et `effectiveMastery`. Aucun nouveau calcul concurrent de 5d6, de défense ou de protection. Les statistiques **brutes** restent sur la fiche ; il n'y a pas de plafond à 12. La maîtrise du porteur n'est pas ajoutée automatiquement à l'activation d'une matrice préconçue. Une action `feasible=false` reste refusée indépendamment d'un résultat naturel spectaculaire.

Tests de parité importés du contrat T-001 pour les niveaux **5, 10, 15, 20 et 25** ; régression caractéristique brute 9 = bonus effectif +6, dés [4,4,4,4,4], total 26 face à seuil 27 (échec). L'impact magique, le seuil défensif et l'absorption restent calculés par M03 ; les dégâts affichés sont **potentiels** et ne retirent aucun PV d'une fiche adverse automatiquement. Le mode mental conserve le contrat M03, sans PV narratifs implicites.

## 4. Cercles, matrices, inventaire et canon

- **Niveau 1–25 ≠ Cercle I–IX ≠ maîtrise ≠ affinité ≠ intensité `effectLevel`.** Aucun Cercle n'est déduit du niveau.
- **MAG-050 :** un objet enregistré dans l'inventaire peut héberger une matrice **architecture VIII / activation I**, activable par un porteur attesté I si le déclenchement, les ressources et la validation de matrice le permettent. Le porteur n'apprend ni le sort, ni la maîtrise de conception du VIII. Les configurations incompatibles et matrices non enregistrées sont refusées.
- **Cercle IX :** accès réservé à une nature divine explicitement attestée ; niveau 25, réussite du dé ou objet ne confèrent pas cette nature. La révision du statut doit rester sous contrôle MJ et ne réécrit pas les récits d'Orin/Freya.
- **Inventaire :** une matrice porte `itemId`; si cet objet n'existe plus, l'activation échoue. La modification descriptive d'objet ne convertit pas une matrice en nouveau sort. Vérifier manuellement les objets supprimés puis restaurés et les identifiants dupliqués.
- **Concentration :** contrôle d'un effet concentré simultané, entretien par unité narrative, interruption et expiration consignées. Les effets et événements exportés/rechargés sont distincts du journal classique M05.
- Les six sorts `demo-*` ne sont **ni contenus canoniques, ni secrets MJ publiés**. Les valeurs d'impact expérimentales et l'entretien de matrice ne forment pas une règle cosmologique.

## 5. Sauvegardes et migrations — DG04-05

Formats **émis** : `alrick.sheets.v3` pour les fiches et `alrick.campaign.v2` pour une campagne entière. Formats **lus** : anciennes fiches directes / tableaux / conteneurs sheets v1/v2/v3, campagnes v1/v2 et stockages locaux anciens. L'ancien schéma `alrick.grimoire.v1` est conservé comme sous-document optionnel.

La normalisation ajoute le Grimoire aux fiches qui n'en ont pas. Elle conserve les propriétés inconnues à la surface de la fiche, les extensions des objets d'inventaire, les propriétés supplémentaires des sorts/matrices/effets/historiques et les métadonnées inconnues d'enveloppe et d'état de campagne. Les références ou entrées de Grimoire non interprétables sont stockées dans `grimoire.legacyOriginal` avec `migrationWarnings`, signalées dans l'interface : **les données ne sont pas silencieusement détruites**, mais une archive brute ne garantit pas qu'une extension future soit jouable avec le moteur actuel.

Les anciens jeux de données ne sont jamais écrits dans la Bibliothèque canonique. Le fichier `G_001_COMPATIBILITE_SAUVEGARDES.md` détaille les garanties, limites et essais complémentaires.

**Limite importante :** l'export complet est le moyen de conservation ; les migrations n'ont pas été validées sur un échantillon représentatif de **vraies sauvegardes utilisateur personnelles**. Les fichiers corrompus, volumes dépassant les limites et extensions externes doivent être analysés au cas par cas.

## 6. Arbitrage suspendu : coût énergétique des matrices (DG04-06)

**État du code maintenu volontairement sans canonisation :**
- `energySource=matrix` : 1 charge consommée par activation, 0 mana personnel initial.
- `energySource=caster` : **1 charge + coût de mana personnel** par activation.
- En cas d'échec d'un jet après confirmation, les ressources engagées sont toujours dépensées dans le prototype.
- La charge reste obligatoire dans `eligibility`, y compris sur `energySource=caster`. Ce comportement exige un arbitrage du créateur.

| Interprétation | Effet mécanique potentiel | Tests à imposer |
| --- | --- | --- |
| **A. Charge = réserve énergétique** | Une charge alimente le sort à la place du mana ; une matrice au mana du porteur pourrait ne consommer aucune charge. | matrix: charge −1 / mana 0 ; caster: charge inchangée / mana −coût ; charge nulle avec caster. |
| **B. Charge = nombre d'activations** | Une charge constitue une clé d'usage/limitation, peu importe l'énergie ; le double débit actuel est cohérent si explicitement voulu. | charge −1 dans les deux modes ; mana seulement caster ; rupture à zéro charge. |
| **C. Mana du porteur = énergie exclusive** | Si source `caster`, la seule limite est le mana (sauf condition indépendante de durabilité/usage). | mana −coût, charges inchangées ; porteur à mana 0 rejeté ; source matrix toujours autonome. |
| **D. Mixte explicitement autorisé** | Une matrice peut demander à la fois charge physique et mana ; il faut définir déclenchement, intensité et ordre de débit. | frais cumulés précis, échec, interruption, refus avant prélèvement, pas de double activation. |

Le code G-001 **n'adopte aucune option comme canon**. Il conserve l'ancien comportement en l'étiquetant provisoire dans l'interface et dans la documentation. L'ajout d'une nouvelle sémantique et sa migration devront passer par décision écrite du créateur, puis tests dédiés.

Autres arbitrages à soumettre : la concentration d'un effet porté par une matrice doit-elle dépendre du porteur ou de l'objet ? La perte de l'objet interrompt-elle immédiatement un effet déjà actif ? Le MJ doit-il imposer une confirmation supplémentaire pour des effets permanents, et comment tracer une attestation du Cercle IX ?

## 7. Preuves de tests, traçabilité et exclusions

**Preuve automatisée verte confirmée :** [GitHub Actions #41267164718](https://github.com/Sijiel44/archives-alrick/actions/runs/41267164718) sur `c656be4`. Steps : `npm ci`, `npm test` (check contenu, TypeScript, build, site, balance, probabilités, oppositions, origines, M01–M05, Grimoire) et `npm run test:m04:browser` réussis. Les tests Grimoire existants incluent MAG-050 C1→VIII, IX, refus, matrices/inventaire, entretien, sauvegardes et fixtures de parité. Le Chrome CI M04/M05 n'est **pas** une recette humaine.

**Le scénario Chrome spécifique G-001** a été ajouté à `scripts/test-5d6-m04-browser.mjs` après cette première CI : import sheets.v2, export sheets.v3 avec inconnus et matrice, restauration campagne v1 / export v2, maintien d'extensions. **Vérifier le workflow du dernier commit avant de créditer ces nouveaux scénarios** ; en cas d'échec, traiter comme bloquant technique.

**Non exécuté personnellement par ce référent :** `npm` local, téléphones physiques, fichiers utilisateurs historiques privés, véritable PJ+MJ simultanés en réseau, inventaire supprimé en session réelle, latence et déconnexion multijoueurs. Aucune autorité de transaction réseau n'est revendiquée.

**Sécurité dépendances :** `npm ci` de CI précédente avait remonté 4 avis (2 modérés, 2 élevés). L'analyse package par package via `npm audit --json` n'est pas effectuée ici ; ne pas faire `npm audit fix --force` aveuglément.

## 8. Conflits et coordination

La PR #66 du référent Tables apporte une fixture commune et son propre pilote serveur, **sans transfert complet du Grimoire** : aucune synchronisation réseau de charges/mana/attestations n'est implémentée. Un futur contrat d'événement autoritaire devra vérifier rôles MJ, identité de la fiche et de l'objet, `expectedRevision`, idempotence et atomicité dépenses+effets. Les valeurs du moteur M01/M03 sont la seule source de résolution.

## 9. Critères de sortie et verdict

**Recevable à revue finale de code et d'intégration** lorsque le dernier head de la PR #55 a : CI `npm test` verte, recette Chrome G-001 verte, confrontation de la fiche actuelle/ancienne réussie et aucun nouveau conflit avec `main`. **Non autorisée à fusion/publier** sans les prérequis humains et la décision du créateur.

**Réserves bloquant la mise en production :** arbitrage énergétique ; recette humaine sur appareils et sauvegardes véritables ; validation éditoriale IX/MAG-050 ; sécurité et politique de stockage ; intégration Tables/MJ réseau hors périmètre.

**Restrictions respectées :** pas de fusion automatique, pas de déploiement, pas de nouvelle cosmologie canonique, pas d'écrasement de M01–M05 et pas de purge volontaire des anciens fichiers.

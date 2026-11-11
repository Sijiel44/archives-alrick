# DG-04 — Audit technique des PR #54, #55 et #56

**Dépôt :** https://github.com/Sijiel44/archives-alrick  
**Contrôle :** 31 octobre 2026, derniers événements au 1er novembre UTC.  
**État :** audit statique et lecture des CI effectués. Aucun test npm nouveau ni recette humaine réalisés dans cet environnement (accès Git direct indisponible). Aucune fusion, publication, migration ou modification de B-001.1.

## 1. État vérifié de GitHub

Base de comparaison : main, commit 6fe3c79cfdd36e69a6eaa356abc498d29b81f580. Les PR #57 à #62 sont fusionnées. La PR #63 (DG-001), head 1e2e6e4, est encore ouverte en brouillon, avec CI réussie #41263153142.

| PR | Head | Comparaison à main | État | CI de son head |
| --- | --- | --- | --- | --- |
| [#54 Tables](https://github.com/Sijiel44/archives-alrick/pull/54) | 1f54ed6 | +15 / −122 commits | Draft, mergeable=true | [41206146216](https://github.com/Sijiel44/archives-alrick/actions/runs/41206146216), succès |
| [#55 Grimoire](https://github.com/Sijiel44/archives-alrick/pull/55) | 355f010 | +27 / −122 commits | Draft, mergeable=false | [41211549812](https://github.com/Sijiel44/archives-alrick/actions/runs/41211549812), succès |
| [#56 Bestiaire](https://github.com/Sijiel44/archives-alrick/pull/56) | e19649e | +13 / 0 commits | Draft, mergeable=true | [41263562458](https://github.com/Sijiel44/archives-alrick/actions/runs/41263562458), succès |

Attention : un statut « mergeable » ne vaut ni compatibilité des données, ni adoption de règles, ni recette humaine.

**B-001.1 est déjà livré dans #56.** Les documents B001_1_RETOUR_DIRECTEUR.md et B001_1_MATRICE_COMPATIBILITE_5D6.md, les modèles mis à jour et scripts/test-b0011-compat.mjs sont présents. Le travail spécialisé est réconcilié avec main. DG-04 ne doit ni modifier cette branche ni dupliquer son registre.

## 2. Sources examinées

- main : CONTRAT_EDITORIAL.md, package.json, modules atelier5d6-progression.ts, atelier5d6-combat-m03.ts et atelier5d6-opposition.ts, rapports M04.1/M05 et M05_CONTRAT_MOTEUR_5D6.md.
- PR #63 : rapport DG_001_CONSOLIDATION_2026-10-31.md, liste des fichiers changés et workflow.
- PR #54 : tables-pilot/server.mjs, scripts/test-tables-pilot.mjs, docs/TABLES_PILOTE_LOCAL.md, docs/DECISION_TECHNIQUE_TABLES_2026-10-31.md, package.json, liste complète des fichiers.
- PR #55 : atelier5d6-grimoire.ts, atelier5d6.inline.ts, scripts/test-5d6-grimoire.mjs, docs/GRIMOIRE_5D6_V1.md, package.json, liste complète des fichiers.
- PR #56 : rapports B-001.1, scripts/test-b0011-compat.mjs, modèles identifiés et package.json.
- Métadonnées GitHub, comparaisons de commits, jobs, étapes et journaux CI des trois PR.

**Limites :** aucun clone Git possible ici (« Could not resolve host: github.com »), donc aucune commande npm locale nouvelle ; aucune branche intégrée réunissant ces PR ; aucun échantillon de sauvegardes utilisateur réelles ; aucun audit npm JSON détaillé et aucun essai de trois navigateurs physiques.

## 3. Tests : preuves et limites

| Contrôle | Constat | Limite |
| --- | --- | --- |
| PR #54 : npm test, incluant tables:test | CI 41206146216 réussie, log « MJ + 2 joueurs, permissions, dés serveur, secrets, conflits, reconnexion et sauvegarde » | Ancien socle, pas de test de parité M01/M03 |
| PR #55 : npm test, incluant test-5d6-grimoire.mjs | CI 41211549812 réussie, test C1 vers C8, IX divin, oppositions, grimoire | Ancien socle, sans test du nouveau M03 ou du Chrome récent |
| PR #56 : npm test, incluant test:b0011 | CI 41263562458 réussie ; **1 318 assertions B-001.1** : N5/10/15/20/25, 5 archétypes, groupes 1/2/4 | Aucune sauvegarde personnelle historique complète ni playtest |
| PR #56 : test:m04:browser | Même CI : **15 scénarios Chrome M04.1/M05** et 7 confirmations réussis | Ne teste pas les tables ni le Grimoire réconciliés |
| PR #63 : npm test et test:m04:browser | CI 41263153142 réussie | DG-001 toujours en brouillon |
| main local, trois branches réconciliées et parcours multijoueurs navigateur | **Non exécutés ici** | Tests requis avant intégration |

Les logs npm ci des CI #54, #55, #56 indiquent chacun **4 avis de dépendances : 2 modérés, 2 élevés**. Ils ne permettent pas de déterminer les paquets vulnérables. Action : exécuter npm audit --json par lockfile, classer les expositions réelles, corriger de façon ciblée ; aucune mise à jour générale sans étude de compatibilité.

## 4. Registre d'anomalies

### DG04-01 — BLOQUANT — Divergence du moteur des Tables (#54)
**Fichiers :** tables-pilot/server.mjs, lignes 14–41 et 230–285 ; comparaison avec main atelier5d6-progression.ts et atelier5d6-combat-m03.ts.  
**Attendu :** utiliser effectiveStat, effectiveMastery, scores bruts >12 et conventions M03.  
**Observé en code :** resolve5d6 additionne la stat brute (natural + stat + skill + situation), la borne à 12 et refuse les imports >12.  
**Reproduction à automatiser :** dés de somme 20, stat brute 9, maîtrise 0 et seuil 27 : le serveur #54 produit 29 (réussite), M01 effectiveStat(9)=6 et total 26 (échec). Un profil Colosse N15 physique 15 doit être importable après correctif ; actuellement la validation rejette cette valeur. Il s'agit ici d'une déduction déterministe du code, non d'un test exécuté.  
**Risque :** résultat de jet contradictoire selon l'outil et perte de jouabilité pour les caractéristiques >12.  
**Correction :** référents Tables et Moteur ; module pur partagé et version de ruleset portée par le jet ; aucune seconde formule.  
**Régression :** parité des jets N5/10/15/20/25, naturels 5–7, impossibilité, oppositions, protection et import >12.

### DG04-02 — MAJEUR pour l'interopérabilité — Import réduit des fiches (#54)
**Fichiers :** server.mjs create_character et docs/TABLES_PILOTE_LOCAL.md.  
**Attendu :** transfert explicite, versionné et réversible, identité d'instance locale, inventaire/maîtrises/capacités conservés dans le contrat global.  
**Observé :** serveur ne persiste que nom, niveau, 4 stats, skill, PV et mana ; fonctionnement partiel volontaire et documenté, pas un bug de sauvegarde de l'Atelier local.  
**Risque :** prendre le transfert partiel pour une synchronisation complète ; réécrire l'identité encyclopédique.  
**Correction :** conserver l'import comme aperçu explicitement partiel tant que transfert complet et sourceSnapshot n'existent pas.  
**Régression :** champs inconnus, instance PNJ/créature, origine documentaire immuable, aucune écriture dans le canon.

### DG04-03 — MAJEUR avant usage durable — Persistance et sûreté locale (#54)
**Fichier :** server.mjs et client WebSocket.  
**Attendu :** actions cohérentes après reconnexion, réessais et restaurations.  
**Observé :** contrôles serveur de rôle et des secrets, dés par randomInt, clé hachée, file d'écritures, fichier temporaire puis rename, contrôle expectedRevision. En revanche aucune clé d'idempotence d'une action réessayée ; le pilote local n'a ni TLS, ni gestion de sauvegardes exportables complètes, ni sécurité Internet.  
**Risque :** application double après réémission autorisée avec une nouvelle révision ; indisponibilité/perte après panne ou exposition du port réseau.  
**Correction :** idempotency key, export/restauration vérifiés ; rester sur 127.0.0.1 pour le pilote. Un futur Internet exige conception TLS/WSS, authentification, Origin, tokens et droits, sans backend sur Pages.  
**Régression :** deux modifications concurrentes, réémission après ACK perdu, refus de note MJ pour joueur, redémarrage et restauration.

### DG04-04 — BLOQUANT — Grimoire non réconcilié avec M01–M05 (#55)
**Fichiers :** Atelier5d6.tsx, atelier5d6.inline.ts, atelier5d6-grimoire.ts.  
**Attendu :** maintenir formats sheets.v3/campaign.v2, moteur de combat M03 et migrations M02/M05.  
**Observé :** 122 commits de retard, GitHub mergeable=false ; documentation #55 décrivant encore sheets.v2/campaign.v1 ; resolveSpellCast additionne la stat brute et utilise resolveOpposition/effectiveProtection historiques plutôt que resolveCombatM03.  
**Risque :** conflit de hub, régression migratoire et mathématique, protections divergentes.  
**Correction :** référent Grimoire + Moteur ; réconciliation ciblée sur main avec adaptateur de fiche moderne et délégation mathématique M03, sans remplacement massif des fonctions existantes.  
**Régression :** npm test complet, test:m04:browser, imports v1/v2/v3, offensif/défensif, scénario MAG-050, IX et niveau 25.

### DG04-05 — MAJEUR — Propriétés inconnues perdues à la normalisation (#55)
**Fichier :** atelier5d6-grimoire.ts, normalizeGrimoire et normalizeSpell.  
**Attendu :** extensions inconnues compatibles conservées ou brut d'origine archivé.  
**Observé :** normalisation reconstruit un objet whitelisté et ignore les propriétés inconnues ; les références aux sorts hors catalogue peuvent être écartées.  
**Risque :** pertes au cycle import/sauvegarde/export de campagnes enrichies.  
**Correction :** conteneur extensions versionné ou legacyOriginal non destructif et signalement de schéma non compatible.  
**Régression :** roundtrip d'une ancienne fiche augmentée d'un champ inconnu.

### DG04-06 — ARBITRAGE DE RÈGLE — Charges des matrices utilisant du mana (#55)
**Fichier :** atelier5d6-grimoire.ts, eligibility et activation.  
**Observé :** toute matrice exige une charge et en consomme une à chaque activation, y compris lorsque energySource=caster débite aussi le mana du porteur.  
**Question :** charge signifie-t-elle nombre d'usages, ou énergie stockée alternative au mana selon MAG-050 ?  
**Action :** référent Magie et créateur clarifient avant correction ; cas de test distincts matrix/caster, épuisement et échec. Aucune règle cosmologique inventée.

### DG04-07 — RÉSERVE SPÉCIALISÉE — Relations et sauvegardes Bestiaire (#56)
**Fichiers :** B001_1_MATRICE_COMPATIBILITE_5D6.md et modèles B-001.1.  
**Attendu :** relation fiches/profils n:n traçable, version d'identité, sauvegardes historiques préservées.  
**Observé :** synchronisation M03/M04/M05 présente ; distinction resistanceBonus (seuil) / protection (absorption) et bestiarySource validée par CI ; registre n:n spécifié mais non implémenté, M05 ne lit qu'un lien déclaratif ; migrations de sauvegardes réelles non testées exhaustivement.  
**Risque :** liens incomplets lors de l'activation des renvois publics ou erreurs d'identité.  
**Correction :** référent Bestiaire uniquement ; revue éditoriale des IDs, puis spécification/implémentation du registre sans promotion automatique du canon.  
**Régression :** profils multiples par individu/espèce, sources croisées, legacyOriginal, spoilers et aucune écriture encyclopédique depuis le jeu.

## 5. Matrice de compatibilité

Légende : C = compatible au périmètre attesté ; R = à corriger ; S = spécifié, non implémenté ; NV = non vérifié de bout en bout.

| Interface | Statut | Motif |
| --- | --- | --- |
| M01 ↔ M03 | C | M03 consomme effectiveStat/effectiveMastery |
| M03 ↔ M04.1 | C | Contrat moteur, sauvegardes et tests modernes |
| M04.1 ↔ M05 | C | Lecture sans algorithme parallèle ; Chrome validé |
| M01/M03 ↔ Tables #54 | **R** | Formules stat brutes, borne 12 |
| M04.1/M05 ↔ Tables #54 | **R** | Import réduit et identité d'instance non définie |
| Personnage M02/M03 ↔ Grimoire #55 | **R** | Ancien hub, versions et mathématiques |
| Inventaire ↔ Matrices #55 | C en branche / NV en fusion | Liaison itemId et démo C1→C8, mais ancien Atelier |
| Grimoire #55 ↔ Tables #54 | **NV** | Aucune autorité serveur sur mana, sort, charge et MJ |
| Bestiaire B-001.1 ↔ M03/M04.1 | C documentaire | Fonctions M03 réutilisées, transfert testé |
| Bestiaire B-001.1 ↔ M05 | C en lecture / S en n:n | documentaryLink déclaratif, pas de registre inverse |
| Bestiaire M03 ↔ Tables #54 | **R** | Instance locale et données de combat modernes absentes |
| Campagne indépendante ↔ univers/Odyssée | NV en jeu | Frontière éditoriale spécifiée dans DG-001, aucun mécanisme de promotion autorisé |
| Sauvegardes et propriétés inconnues ↔ tous modules | **R/NV** | Versions, archive brute et roundtrip global à éprouver |

## 6. Dépendances, propriétaires et ordre de proposition

**Ordre recommandé :**
1. Relire DG-001/#63 en tant que gouvernance éditoriale ; elle est indépendante des correctifs mathématiques et demeure en brouillon.
2. Achever la revue humaine B-001.1/#56 sur sa branche propriétaire, valider IDs et statut documentaire, puis proposer éventuellement sa fusion avec accord explicite. Ne pas intervenir en concurrence.
3. Convenir d'un contrat d'interopérabilité unique : fonctions pures M01/M03 côté client/serveur, ruleset versionné, fixtures partagées, schémas, préservation des bruts et instances de campagne.
4. Réconcilier **#54 et #55 en parallèle** chez leurs référents respectifs. Aucun ordre de fusion ne découle du numéro : le premier prêt avec CI et recette indépendante peut être soumis, sous réserve de ne pas casser l'autre.
5. N'intégrer **Grimoire ↔ Tables** qu'après permissions MJ, événements atomiques, idempotence et identité des objets. Le prototype local ne doit pas être annoncé comme plateforme publique.

| Référent | Plan de correction |
| --- | --- |
| Tables | DG04-01/02/03, fixtures serveur, protocole d'import partiel, export, concurrence, restauration et 3 navigateurs |
| Grimoire | DG04-04/05, clarification DG04-06, migration v1/v2/v3, calcul M03, mobile réel |
| Bestiaire | DG04-07, conserver la propriété B-001.1, identités et registre, aucune espèce nouvelle |
| Moteur | Fournir adaptateurs purs et fixtures de parité sans refondre les mathématiques |
| Direction éditoriale | Valider contrats, provenance, spoilers, canon vs campagne indépendante, périmètre de #63 |
| Créateur | Arbitrer fusion, sémantique des charges, adoption des règles expérimentales et toute exposition hors LAN |

## 7. Recettes reproductibles restant à faire — NON TESTÉES MANUELLEMENT

**Tables :** sur branche corrigée, npm ci, npm run tables:test, npm run tables:dev. Ouvrir trois profils navigateurs distincts sur http://127.0.0.1:8787, créer MJ/J1/J2 ; tenter actions interdites avant approbation, approuver, vérifier journal partagé et note MJ cachée, jet officiel au serveur malgré faux dés client, import N25 >12, double modification de même révision, reconnexion avec clé, redémarrage et restauration. Aucune ouverture du port au réseau public.

**Grimoire :** sur branche réconciliée, npm ci, node scripts/test-5d6-grimoire.mjs, npm test, npm run test:m04:browser. Réimporter vraies fiches v1/v2/v3 et comparer brut avant/après ; déclencher une matrice C8 autorisée par Cercle I, refuser architecture incompatible et IX sans reconnaissance, distinguer mana/charges, vérifier concentration et interruptions, effets persistants, M03 et téléphone réel.

**Bestiaire :** sur branche B-001.1, npm ci, npm test et npm run test:m04:browser ; N5/10/15/20/25, 5 archétypes, groupes 1/2/4, profils multiples, non-combattants, sauvegardes historiques réelles, aucune canonisation, spoiler ni transfert automatique aux parties.

## 8. Décision à la Direction générale

| PR | Verdict motivé |
| --- | --- |
| **#54** | **Bloquée par incompatibilité majeure** : source mathématique divergente et import >12 impossible ; tests automatisés MJ+2 joueurs historiques positifs, insuffisants pour le système M01–M05. |
| **#55** | **Bloquée par conflit et contrat ancien** : GitHub non fusionnable, logique M03 absente du calcul du sort, migrations/extensions à préserver malgré des tests de concepts MAG-050 et IX sur l'ancienne branche. |
| **#56** | **Prête sous réserve de revue spécialisée finale et arbitrages éditoriaux** : B-001.1 livrée et CI moderne verte, 1 318 assertions et 15 scénarios Chrome hérités. Le registre n:n et les sauvegardes personnelles réelles restent en dehors des preuves. |

**Ce qui fonctionne réellement dans les preuves :** prototype réseau avec MJ+2 joueurs dans la CI #54 ; Grimoire C1→C8/IX dans la CI #55 ; compatibilité B-001.1/M03–M05 et Chrome dans la CI #56.  
**Ce qui reste non vérifié :** exécution nouvelle ici, fusion combinée, vrais navigateurs/réseaux, vrais fichiers utilisateurs, exploitation publique, playtest d'équilibrage.  
**Décisions humaines indispensables :** accord sur #56/#63, sémantique des matrices et règles non canoniques, mise en service éventuelle au-delà du prototype loopback.  
**Restrictions :** aucune fusion, aucune publication Pages, aucune réécriture massive, aucune migration destructive, aucune nouvelle espèce ou règle cosmologique et aucune retouche rétroactive d'Orin.

**Le présent rapport est documentaire : les correctifs de code recommandés ne sont pas revendiqués comme réalisés ou testés.**

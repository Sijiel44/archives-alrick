# ARCHIVES D'ALRICK — RAPPORT DE MISSION

**Mission :** MAG-003.C — Intégration Grimoire, Tables, objets et spiritualité  
**Référent :** Intégration des interfaces de magie et rites · **Date :** 1er novembre 2026  
**Dépôt :** `Sijiel44/archives-alrick`  
**Branche :** `magie/mag003c-integration-rites`  
**PR :** [#71 — brouillon](https://github.com/Sijiel44/archives-alrick/pull/71), empilée sur MAG-003.B [#70](https://github.com/Sijiel44/archives-alrick/pull/70)  
**Statut :** **terminée avec réserves techniques et éditoriales** — prototype local expérimental ; **non prêt à fusionner ou publier**.

## Livré

Le Grimoire G-001 (#55) est raccordé aux moteurs expérimentaux MAG-003.A et MAG-003.B, sans modifier les branches d'origine. Un onglet « Rites et repos » offre : mana actuel/maximal, journée et budget récupéré, choix et conditions de repos, aperçu du gain, confirmation, idempotence contre le double clic et historique par fiche. Le même panneau propose rites connus, pratiques non religieuses/religieuses sans miracle, préparation de cérémonies, participants/rôles, probabilité M01, validation MJ **locale** et dossiers de recherche ou d'objets **à soumettre au MJ**.

Les anciens `charges` de matrices et les Cercles ne sont pas requalifiés ; aucune recharge ni création automatique. Extension de sauvegarde optionnelle `alrick.mag003c.local.v1` sur la fiche et export de campagne existant conservé. Discordance du mana/du registre ou schéma étranger = refus conservateur, non une correction silencieuse.

## Résultat de vérification

- [CI #41324736498 — SUCCÈS](https://github.com/Sijiel44/archives-alrick/actions/runs/41324736498) : `npm ci`, `npm test` (181 assertions A, 44 B, **44 C**, tests G-001), **17 scénarios Chrome réussis**, dont deux parcours MAG-003.C (récupération/anti-double clic/mobile et cérémonie simulée). Preuve sur le code `90282ea8`, avant actualisation documentaire.
- La dernière CI de la PR après ajout des scénarios de récupération/mobile/cérémonie doit être consultée sur [la page Checks](https://github.com/Sijiel44/archives-alrick/pull/71/checks). Ne pas extrapoler le résultat d'un commit antérieur.
- **Tests automatisés ≠ essais humains.** Aucune vraie partie multijoueurs ni recette sur téléphone physique.

## Réserves bloquantes

Les Tables #66 possèdent un serveur local et des conventions d'idempotence, mais **aucune API transactionnelle rituelle** et un import ne contenant ni Grimoire ni matrices : C est donc **simulation/préparation locale** ; aucun paiement ou bonus collectif. Le mode MJ de l'Atelier n'est pas un rôle authentifié réseau. Les politiques de récupération MAG-003.A, soutien MAG-003.B, énergie/usages G-001, délais et sûreté des pratiques, modèle de foi et autorité serveur nécessitent des arbitrages.

Aucune création de points de foi, intervention divine, bénédiction, Autorité ou Cercle à la suite d'une prière. Aucune modification du canon.

## Décision attendue

1. **Revoir #69 et #70**, encore en brouillon et sans validation de Direction confirmée au lancement de C.
2. **Examiner #71**, résultats du dernier head, démonstrations Chrome et protections des sauvegardes.
3. Trancher les règles de récupération, le contrat énergie/usages et la faisabilité d'un serveur rituel transactionnel.
4. Organiser les recettes humaines MJ/PJ et une revue de sécurité avant toute proposition de fusion.

**Interdiction maintenue : aucune fusion dans main ; aucune publication du site ; aucune canonisation.**

**Rapports permanents :** [intégration](./MAG_003_C_INTEGRATION_JEU.md) · [recette](./MAG_003_C_RECETTE.md) · [pilotage DG](./MAG_003_PILOTAGE_DIRECTION.md).
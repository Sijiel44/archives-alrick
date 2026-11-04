# ANT-001 — Rapport technique de mission

**Référent :** ANT — Antagonistes, conflits et menaces. **Date :** 2026-11-04. **Dépôt :** `Sijiel44/archives-alrick`. **Base contrôlée :** `main@88f774f3d0d6d520d8d11443b72202b9caf4f94b`. **Branche de mission :** `docs/ant-001-cadre-antagonismes` (créée depuis main, sans modification de main). **PR :** brouillon à référencer après création.

## Contrat et sources vérifiées

Mandat ANT-001 dans `docs/chroniques-v01/05_MESSAGES_DE_LANCEMENT.md` et protocole PR #78. Le SHA initial cité `f1e578b77a39e0f995f954e483beb79d5775491b` existe ; le contrat consulté est sur un état plus récent de la PR ORG-001 `82d6b4c1096c7faa12da6b80ff09b82e11b9f259`. Ont aussi été lus : kit IA v0.1, `CONTRAT_EDITORIAL.md`, `content/monde/menaces-et-antagonismes.md`, `content/jouer/antagonistes-sans-decheance.md`, `content/monde/antagonistes-factions-propositions.md`, `content/monde/antagonistes-propositions.md`. Synthèses MATH-001/002 consultées, sans adoption de leurs arbitrages en cours.

## Conception effectuée

1. Gabarit `ant-threat/0.1` : origine, motivations, ressources, limites, signes, fronts I0–I4, conséquences et résolutions, sans formule ajoutée.
2. Faction `FAC-PROP-ANT001-01` « Commission des Hautes-Eaux », hors canon, autonome, distincte des factions de péage déjà proposées.
3. Six scènes modulaires et plusieurs issues (enquête, secours, négociation, réforme, conflit, repli), sans intrigue à solution imposée.
4. Séparation **public** / **privé MJ local**. Les fichiers de travail confidentiels ne sont pas déposés sur GitHub ; ne pas utiliser `unlisted` comme protection.
5. Aucune fiche PNJ ou bestiaire chiffrée et aucune capacité INDEX inventée ; dépendances spécialisées identifiées.

## Contrôles réellement exécutés

Sur le dossier autonome local, `python -m unittest discover -s validation -p 'test_ant001.py' -v` : **15 tests synthétiques verts**. Vérifications de structure/version, identité, statut non canonique, cinq phases, sorties variées, absence de capacités chiffrées, projection joueur whitelist, canari de confidentialité, roundtrip JSON/extensions inconnues et partition des chemins.

Ces résultats ne constituent **ni tests de production**, ni `npm test`, ni CI GitHub, ni contrôle DOM/Studio réel, ni recette tablette, ni playtest humain. La suite devra être rejouée contre le HEAD final ; CI et QA attendues avant toute intégration.

## Impact

**Canon :** aucun ajout ; `proposition_non_jouee`. **Règles :** M01–M05 conservés, aucune puissance arbitraire ; I0–I4 qualitatif. **Sauvegardes :** aucun changement, adaptateur à concevoir. **Studio :** recommandation de projection joueur whitelist, non implémentée. **Bestiaire / PNJ :** slots non chiffrés. **Publication :** aucun changement de `content/` ni Pages.

## Risques et arbitrages

**P0 :** fuite de secrets si un futur outil partage un objet MJ ; STUDIO/QA exigent test DOM/messages. **P1 :** confusion front narratif / moteur 5d6 ; INDEX/MATH doivent séparer les contrats. **P1 :** collision d'ID ou canon implicite ; LORE valide la nomenclature. **P2 :** import/export et extensions, à vérifier par ARCHIVES.

**Demandes à DG/créateur :** approuver ou corriger le cadre et l'identifiant pilote (sans canonisation), autoriser relecture AVE/QTE, cadrer confidentialité et éventuelle publication du *cadre public* seulement. Aucun merge, déploiement, migration ou canonisation autorisé.

**À revoir par :** LORE, AVE, QTE, PNJ, BEST, INDEX, MATH, COMBAT, MAG, STUDIO, ARCHIVES, QA. **À valider par DG/créateur :** décisions ci-dessus.

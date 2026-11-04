# FICHE DIRECTION — ANT-001

**Référent :** ANT. **Date :** 4 novembre 2026. **Objet :** cadre générique d'antagonisme + faction pilote indépendante. **Base :** `main@88f774f3d0d6d520d8d11443b72202b9caf4f94b`. **Mission :** ORG-001 PR #78. **Branche :** `docs/ant-001-cadre-antagonismes`.

**Verdict proposé (pas décision DG) :** **VALIDÉ AVEC RÉSERVES — étude documentaire et pilote hors canon uniquement**.

## Livrables

- Contrat proposé `ant-threat/0.1` : intérêts, ressources, limites, signes, front narratif I0–I4, conséquences, négociation, désamorçage, retraite et rencontres variées.
- Faction pilote `FAC-PROP-ANT001-01`, « Commission des Hautes-Eaux » : autorité de prévention des crues, conflits de responsabilité et d'équité ; six scènes, plusieurs issues, aucun combat obligatoire.
- Dossier MJ **local, non publié** ; documents publics sans révélations de scénario. Fiche JSON et 15 tests synthétiques locaux réussis.

## Preuves et limites

Sources relues : kit IA, PR #78, contrat éditorial et pages de menaces/factions de main, synthèses MATH. **15 tests Python locaux verts** sur contrat, fronts, confidentialité synthétique et conservation JSON. **Non réalisés :** `npm test`, CI sur HEAD, navigateur Studio/DOM, tests de sauvegardes réelles, essai humain, publication. Les tests ne homologuent pas le futur Studio.

## Risques

**P0** : transmission de secrets MJ à un joueur/au site ; protection par liste blanche à homologuer par STUDIO/QA. **P1** : interprétation des intensités comme puissance 5d6 ; aucune valeur mécanique attribuée. **P1** : collision d'identifiant ou canonisation ; contrôle LORE. **P2** : compatibilité import/export ; revue ARCHIVES.

## Décisions DG/créateur

1. Approuver ou corriger le gabarit et l'identifiant pilote sans canonisation.
2. Confier à AVE/QTE la vérification de jouabilité ; PNJ les rôles seulement si nécessaire.
3. Solliciter INDEX/MATH avant tout profil ou effet calculé.
4. Confirmer la frontière Studio/ARCHIVES/QA avant toute projection joueur.
5. Décider ultérieurement de la publication éventuelle du **cadre public**, jamais du dossier privé.

**À revoir par :** LORE, AVE, QTE, PNJ, BEST, INDEX, MATH, COMBAT, MAG, STUDIO, ARCHIVES, QA.

**À valider par DG/créateur :** cadre, ID, statut, confidentialité, étapes suivantes. **Pas de fusion, publication ni canonisation.**

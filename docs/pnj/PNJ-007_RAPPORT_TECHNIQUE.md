# PNJ-007 — Rapport technique : mémoire, savoirs et accueil

**Date :** 16 novembre 2026. **Mission :** septième lot PNJ, exclusivement des individus déjà présents dans les Archives. **Branche :** `feat/pnj-007-complements-sources-v01`. **Statut :** compléments de fiches et propositions de jeu, sans nouveau canon.

## Périmètre documentaire et dépendances

En plus des douze fiches originales, ont été relus : `content/groupes/GRP-01.md` (Compagnie des Revenants), `content/personnages/REV-08.md` (Eamon et Névane), `content/personnages/REV-07.md` (Haldrek et Dac), `content/maison/O42-09.md` (accueil des puissances), `content/monde/B42-03.md` (Sévrane, Vardhena), `content/chroniques/C42-01.md` et `C42-06.md` (Corven et Corvelis), `content/suivi-editorial.md` et les textes gouvernant publication et statut. Les références CB32, CB42 et CB43 sont **des ancres déjà portées par ces documents** ; ce travail ne prétend pas certifier de nouveau l'intégralité des campagnes brutes.

| Fiche | Complément documentaire recoupé | Limite préservée |
| --- | --- | --- |
| `FAM-04` Borin Forgecœur | Grand-père paternel, livres, souvenirs familiaux | Mort et **non Rappelé** en CB43 ; apparition vivante annulée |
| `SEC-61` Corven | Chronique C42-01, Dac, Reginald et premières bières | Souvenirs d'enfance ≠ scène de reprise actuelle |
| `SEC-07` Dac | Maître d'armes/capitaine dans les souvenirs ; commandement plus tardif à Taagral | Pas de grade de général rétroactif, pas un Revenant |
| `IMP-12` Tairin | Conseil et possibilité réelle d'opposition au fondateur | Pas de gouvernement du Palais ni pouvoir de formation universel |
| `IMP-15` Amelia | Six Cercles autonomes, essai guidé du septième, temps personnel | Huitième à l'étude, neuvième non acquis ; pas de gouvernance domestique |
| `IMP-17` Maëlys | Avec Garrik, dessert illustré et spectacle lumineux | Fête d'une semaine non automatiquement jouée |
| `REV-09` Névane | Première Revenante d'honneur, cartographie à Skalor, registre provisoire, couple avec Eamon (actualisation 3.4) | Honneur ≠ service forcé ; couple ≠ mariage ; cadeau non remis par présomption |
| `REV-12` Lévara | Études écologiques, sols, serres, centre envisagé | Collaboration ≠ adhésion aux Revenants ni centre déjà ouvert |
| `REV-13` Harald le lion | Individu conscient distinct du père et des lions figurés | Pas de fusion d'identités ni de métamorphose universelle |
| `REV-14` Halstor | Transformation en CB42, contribution au diagnostic de Taagral | Pas de don attribué à tous les animaux ou à un rang collectif |
| `REN-63` Sévrane | Premières nuits des nouveaux foyers, sanctuaire accessible | Invitée ≠ assistante d'Amelia ni recrue de la Maison |
| `REN-64` Vardhena | Refus du sacrifice inutile, retraite des civils, exercice envisagé | Pas de commandement permanent ni d'exercice déclaré accompli |

## Implémentation et protection éditoriale

- Une section **« Compléments recoupés »** et une section **« En jeu — propositions non jouées »** enrichissent chacune des douze sources : les nouvelles pistes ne sont pas des souvenirs canoniques.
- Catalogue de référence porté de **90 à 102 identités uniques** ; **93 fiches sources** enrichies depuis le premier lot. La galerie est générée depuis les métadonnées originales, sans recopier les biographies.
- **16 portraits** associés au prototype dont **9 originaux conceptuels non canoniques**, **86 emblèmes**, trois inspirations visuelles externes en chargement volontaire. Nouveau visuel : `sevrane-concept-v01.webp`, provenance détaillée dans `PNJ-007_SOURCE_VISUELLE.md`.
- Les douze sources sont déjà `publish:true`, `spoilers:true` et `unlisted:true` : ce lot peut proposer des enrichissements **après contrôle**, sans supprimer les avertissements. Le catalogue MJ global reste `publish:false` et les huit dossiers non publics précédents sont toujours exclus.
- Aucun nouveau niveau, XP, capacité, Cercle acquis ou contrat automatique. Les profils 5d6 éventuellement nécessaires seront des références versionnées indépendantes de la fiche narrative (MATH/INDEX).

## Bloc MJ — option totalement fictive, non publiée

**Sévrane, une chambre fermée :** lors d'une campagne nouvelle, les personnages découvrent qu'une famille conserve une chambre vide par choix intime. Le MJ peut retenir une simple mémoire heureuse, un deuil privé ou l'absence de raison à divulguer ; **aucune de ces variantes ne constitue un secret du canon**. L'accord des habitants précède toute enquête. La fiche publique ne fixe aucune solution ni révélation.

## Recette

```bash
node experiments/pnj-v01/build.mjs
node --test experiments/pnj-v01/test.mjs
npm test
git diff --check
```

Les résultats exacts de la CI, le SHA de commit et une éventuelle publication seront reportés après l'exécution. La recette humaine de la galerie (PC/tablette, fenêtre de détail, consentement aux médias externes) et la validation artistique sont distinctes des tests de contenu. Les autres modules STUDIO, ARCHIVES et sauvegardes ne sont pas modifiés.

## Passation préparée

- **LORE** : contrôler les recoupements Eamon–Névane, chronologie Borin/Harald lion et scène du commandement de Dac ; conserver l'incertitude des volumes bruts.
- **INDEX/MATH** : références de profils distinctes, aucun niveau ni Cercle supérieur auto-attribué.
- **STUDIO/ATELIERS** : rendre la galerie compatible avec les copies locales MJ et la liste blanche joueur ; prévoir validation visuelle de Sévrane.
- **QUÊTES/AVENTURES** : les douze amorces sont non jouées, avec droit au refus et alternatives non hostiles.
- **DG/INTÉGRATION/QA** : tests, appartenance, droits de l'image et déploiement contrôlé sur `main` après autorisation.

**À revoir par LORE, INDEX/MATH, STUDIO/ATELIERS et QA. À valider par DG/créateur : interprétations, image, exposition publique du nouveau lot.**

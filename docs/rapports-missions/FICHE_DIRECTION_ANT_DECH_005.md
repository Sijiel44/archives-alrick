# FICHE DIRECTION — ANT-DECH-005

**Mission :** visages de la Déchéance et intégration Univers / Studio. **Responsable :** ANT. **Branche :** `content/ant-dech-005-personnages`.

## Livrables

- **10 personnages canoniques** aux niveaux narratifs **2, 3, 5, 7, 8, 10, 12, 15, 17 et 20** ; états allant de Tentation à Abîme, sans niveau mécanique inventé.
- Pour chacun : pacte, prix personnel, dépendance, contradictions, réussites, revers, relations, situation actuelle et alternatives à la mort ou au combat.
- **10 portraits SVG originaux** sous `static/images/personnages-dechus` et un index public de leurs conflits.
- **Catalogue Studio MJ versionné** : dix références, recherche au rayon des factions et bouton de création d'un PNJ local modifiable ; les profils M03 et sauvegardes existants sont conservés.
- **Rapport technique et contrat** : `ANT_DECH_005_RAPPORT_TECHNIQUE.md` et `ANT_DECH_005_CONTRAT_PORTRAITS_STUDIO.md`.
- **Confidentiel séparé :** pactes cachés, Ancrages et fronts narratifs pour le MJ ; non publié dans GitHub/Quartz.

## Continuité

Les biographies sont de nouveaux faits d'univers, **pas des séances déjà jouées**. Cinq figures prolongent LAB-DECH-003 ; Terval passe du niveau 23 proposé au repère 20 demandé. Les trois Seigneurs et neuf Princes préexistants restent inchangés. Un captif n'est pas coupable et seuls des êtres effectivement transformés peuvent fournir des Chutes liées. Les employés de Maison/Chambre/Conservatoire ne sont pas Déchus par profession.

## Vérifications et réserves

- Métadonnées `lore_valide` + `publish:true` pour les dix fiches ; dix illustrations d'origine vérifiable.
- `npm run test:antagonistes` **3/3 vert**, `npm test` **vert** ; **387 pages et 285 codes**, **1 178 pages HTML et 68 796 liens/ressources** vérifiés. CI Studio avec parcours Chrome à exécuter sur GitHub.
- **Aucun profil 5d6 homologué**, aucune capacité exceptionnelle ou transfusion automatique de l'Emprise 2d6. Choisir les capacités avec INDEX/MATH et les PNJ mécaniques avec PNJ/COMBAT.
- Publication requiert CI verte, fusion autorisée par la directive créateur et contrôle HTTP réel des pages et portraits.

**À revoir par :** PNJ, LORE, INDEX, MATH, COMBAT, MAG, STUDIO, QA, AVE, QTE, BEST. **À valider par DG/créateur :** preuve CI/Pages et conversions futures ; aucune revalidation des biographies comme canon n'est demandée.

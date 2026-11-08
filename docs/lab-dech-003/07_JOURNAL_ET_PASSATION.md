# Journal de contrôle et passation DG

**Périmètre :** première tranche LAB-DECH-003, documents de travail seulement ; aucune fusion, publication du site, modification de règles, canonisation ni campagne jouée. Base `main` : 88f774f3d0d6d520d8d11443b72202b9caf4f94b.

| Livrable | État | Responsable de la suite |
|---|---|---|
| Audit des sources principales | Réalisé sur fichiers nommés et contrat éditorial ; sources brutes et toutes branches non certifiées | LORE / DG |
| Dépendance et pactes | Propositions rédigées ; loi générale nouvelle à réconcilier avec le canon | LORE / DG |
| Six PNJ A–F | Biographies et accroches, niveaux indicatifs, aucun code permanent ni fiche mécanique | PNJ / LORE / INDEX |
| Quatre histoires | Plans non joués ; B reprend Q-DECH-01 | CHRONIQUES / AVENTURES / QUÊTES |
| 19 profils supplémentaires | Non réalisés ; la galerie 1–25 n'est pas livrée | PNJ |
| MATH 5d6 | Questions et niveaux d'échantillonnage seulement ; pas de simulations ni d'homologation | MATH |
| INDEX / STUDIO | Matrice de conception uniquement ; aucun code, aucun import | INDEX / STUDIO / ARCHIVES |
| Recette | Vérifications documentaires et commandes consignées à l'exécution ; aucune recette navigateur | QA / REVUE |

## Décisions demandées

1. DG/LORE : confirmer la portée de la nouvelle dépendance avancée et ses exceptions, sans confondre croissance et maintien.
2. LORE/MATH : préciser la représentation d'une transformation forcée et d'une réserve captive ; ne jamais inférer culpabilité ni Chute volontaire.
3. PNJ/LORE : vérifier unicité des noms et les sources annexes, sélectionner ou corriger les six biographies et, le cas échéant, attribuer des codes après contrôle du registre.
4. AVENTURES : relire la continuité de l'adaptation des Sceaux de Demain ; conserver l'original Q-DECH-01.
5. MATH : produire un banc de probabilités exactes et budget des dons avant toute règle 5d6. INDEX/STUDIO : arrêter les contrats et tests de confidentialité avant code.

Les annonces de publication, diffusion de secrets MJ et intégration au site nécessitent une décision distincte. Un brouillon dans un dépôt public reste techniquement lisible : les scénarios et secrets ici sont du matériel fictif de travail, pas des secrets de campagne personnelle. Les images de référence de la demande ne sont pas reprises faute de droits vérifiés.

## Vérifications exécutées

- `npm run check:content` sous Node 24.22.1 avec les dépendances déjà présentes du même dépôt : **PASS**, 369 pages publiables et 269 codes vérifiés ; le script contrôle le contenu web existant, pas la validité narrative du dossier DG.
- Contrôles ciblés : six fiches A–F, quatre récits A–D, douze voies de tentation ; pas de modification dans `content/`, pas de code permanent nouvellement attribué.
- `git diff --check` : contrôles de forme des fichiers du lot ; ce n’est ni une contre-recette indépendante ni une validation du lore.
- `npm test` complet, tests navigateur, simulations MATH et revue LORE/QA indépendantes : **non exécutés**.

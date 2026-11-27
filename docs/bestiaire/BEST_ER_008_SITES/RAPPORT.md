# BEST-ER-008 — Rapport de préparation Sites v0.1
Date : 2026-11-26. Directive DG : Sites indépendant, GitHub versionnement uniquement.
 
## Périmètre
Branche isolée depuis main e0746d762cd9c5953bd6a74ac126273781d48418. Aucun fichier content/, studio-local/, moteur, registre ou Archive personnelle modifié. Les seuls fichiers de ce lot sont dans docs/bestiaire/BEST_ER_008_SITES/. Le JSON de préparation n'est pas le contrat natif de Sites et ne doit pas être importé directement en production. Aucun secret MJ réel ni donnée de campagne.

## Livrables
- lot-v0.1.json : dix notices structurées, ID de préparation stable, candidat ESP non attribué, description, habitat, écologie, comportement, aptitudes descriptives, limites, variantes, ressources, quatre amorces non jouées, origine et brief d'art, statut proposition.
- manifest-v0.1.json : provenance, SHA de blobs source et inventaires, états de vérification, exigences de sortie.
- RAPPORT.md : présente recette de préparation et passation Sites.

## Contrôles effectivement effectués
Lecture du catalogue GitHub épinglé : 35 références (32 espèces, 3 individus), du registre B002 épinglé, de l'inventaire B003.1 : 41 propositions. Contrôle JavaScript : dix identifiants locaux, dix slugs et dix codes candidats distincts ; aucun code candidat mentionné dans le registre ; aucune collision d'ID ni de nom exact normalisé dans les 35 références ; dix publish:false, canonValidated:false, profile:null et mjSecrets:null. Le contrôle n'est pas une validation applicative.
 
### Rapprochements historiques
Les 41 noms/chemins ont été examinés dans l'inventaire ; extraits de sept fiches historiques lus (P05, P10, P23, P28, P31, P36, P41). Les sources originales ne sont pas réécrites.
- P05 : longues pattes, fourrure saisonnière et sprints comme le Lièvre des vents. Le nouveau concept ajoute sensibilité au vent et prairie ; taxonomie distincte non démontrée. Arbitrage espèce/variante obligatoire.
- P10 : corvidé des routes mémorisant étapes de ravitaillement ; très proche du Corbeau des bornes. Rémiges argentées et repérage spatial ne suffisent pas à démontrer une nouvelle espèce. Arbitrage obligatoire.
- P23 : crustacé cavernicole bioluminescent ; Luciole de veille = coléoptère terrestre, distincte par nature et habitat. Comparer encore ESP-ER-020.
- P28 : sanglier de vallées au pelage sombre sans plaques décrites ; Sanglier cuirasse à plaques organiques. Comparer aussi ESP-ER-011 (crinière cornée, non minérale).
- P31 : héron gris bleuté des bassins froids, pêche stationnaire ; proche du Héron d'orée ocre des rivières. Arbitrage espèce/variante obligatoire et vérifier INDC-ER-003.
- P36 : arthropode cavernicole à six membres et antennes, distinct du Fouisseur de schiste mammifère.
- P41 : petit reptile insectivore des pierres refroidies, distinct du Frélin mammifère proposé ; illustration du Frélin signalée dans les échanges du 8 novembre mais non récupérée et description originale non retrouvée.
- Veilleur des racines : arbitrer nature/conscience/origine avec LORE ; ne pas inventer de filiation divine.
- Deux concepts réservés au lot ultérieur : Tortue des anciennes pierres et Grand Cerf de l'Aube ; proximité ESP-ER-006 et ESP-ER-022.

## Conditions d'intégration Sites
1. Exporter/consulter catalogue et schéma Sites par le canal autorisé ; comparer noms, alias, identités, individus, propositions et versions.
2. Résoudre les cas proches et retrouver le Frélin original ; attribuer les codes uniquement après décision. Si variante retenue, garder l'ID local de préparation comme provenance, ne pas créer une espèce en double.
3. Récupérer/créer les illustrations originales, enregistrer provenance, chemin, texte alternatif, empreinte et vérifier chaque fichier. Les briefs ne sont pas des images ; zéro binaire vérifié à ce stade.
4. Mapper les champs au vrai contrat de Sites ; ne pas déduire de statistiques d'un récit. Laisser profil M03 nul ; conserver propositions hors canon et hors publication jusqu'à décision explicite. Une publication documentaire n'homologue pas le moteur.
5. En environnement de prévisualisation, contrôler dix notices ou variantes retenues, identité unique, liens, médias, filtres, recherche, ordinateur et mobile, absence de notes MJ et conservation des références existantes. Comparer les données avant/après ; revenir à la version précédente si défaut.
6. Publication séparée sur Sites uniquement par le canal habilité et compte rendu de vérification sur URL réelle.

## Verdict
Préparation éditoriale versionnée et contrôles statiques partiels effectués. Zéro image livrée ou vérifiée dans ce lot, zéro profil homologué, zéro code permanent attribué, zéro import Sites et zéro publication. Aucun npm test, CI, recette Chrome ou mobile exécuté par cette intervention. Accès au canal de publication Sites non établi. Aucune fusion sur main ; PR éventuelle de revue uniquement.

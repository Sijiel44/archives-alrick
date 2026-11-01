---
publish: true
title: "Guide des fiches vivantes 5d6 — créatures et PNJ"
description: "Lire et imprimer une fiche, interpréter les statistiques, protéger les sources documentaires."
categorie: "guide"
canon_statut: "proposition_non_jouee"
etat_editorial: "en_cours"
portee: "univers_partage"
public_cible: ["joueurs", "mj"]
usage_en_jeu: ["reference", "guide"]
tags: [5d6, bestiaire, fiche, atelier, pedagogie]
---

# Guide des fiches vivantes 5d6

**Aide de jeu expérimentale M05.** Aucune créature, espèce, forme divine, relation de campagne ou capacité n'est créée ou canonisée par cette page.

Le [[jouer/atelier-bestiary-5d6|Bestiaire interactif 5d6]] conserve la création et la sauvegarde ; sa **fiche vivante** donne une lecture immédiate et des détails facultatifs. La même fiche reste une source unique de données : consulter ne change pas ses statistiques.

## Comprendre les trois niveaux d'identité

- **Espèce** : ce qui est établi pour un groupe vivant, avec des preuves et des limites. Ne déduire ni un pouvoir ni un habitat d'après un seul individu.
- **Individu** : un être particulier, son histoire, ses actes et ses relations ; les choses inconnues demeurent inconnues.
- **Profil de jeu** : représentation 5d6 pour une table donnée (niveau, archétype, PV, résistances). Des profils différents peuvent décrire le même individu ou la même espèce selon le contexte. Un profil ne valide jamais le canon.

Une **créature** ou un **PNJ** n'est pas automatiquement un personnage joueur : les profils M03 ne dépensent pas le budget de création M02. Le niveau 1–25 est une indication de compétence mécanique ; le danger dépend aussi du nombre d'adversaires, du terrain, des ressources et de l'objectif de la scène.

## Lire la fiche essentielle

Commencer par le nom, la catégorie, le rôle, le niveau et le statut **local**. Un portrait n'est pas obligatoire. Les quatre caractéristiques — Physique, Agilité, Esprit, Présence — affichent leur **valeur brute** et leur **bonus effectif**.

Exemple reproductible : l'archétype **Colosse N15** donne 15/7/8/8, bonus +7/+5/+5/+5, PV 194. La base de génération vaut 10 et reçoit les modificateurs +5/−3/−2/−2 ; la réserve PV de référence est 114, multipliée par 1,7 puis arrondie. Ce n'est **pas une nouvelle espèce canonique**. Un bouton « Essayer le Colosse N15 » crée un exemple de jeu local, réutilisant le moteur publié.

La formule effective des caractéristiques est `E(c) = floor(3 × log2(1 + c/3))` ; les valeurs brutes ne s'arrêtent pas à 12. Une maîtrise de rang `r` donne `floor(log2(1+r))`. Les rendements sont décroissants, et la spécialisation reste utile.

## Choisir un profil et ses limites

Choisir l'archétype **faune**, **prédateur**, **gardien**, **mystique** ou **colosse**, puis le niveau. Définir une profession ou un rôle si utile. Personnaliser les maîtrises selon les actions plausibles, sans considérer chaque maîtrise comme maîtrisée par défaut. Les capacités narratives sont **déclarées**, jamais exécutées comme bonus automatiques. Décrire leur coût, leur déclencheur, leurs limites et les validations manquantes.

En mode **rapide**, l'identité et le profil suffisent. **Guidé** donne accès aux informations supplémentaires sans tout ouvrir. **Expert** permet les réglages bruts et la liaison documentaire déclarative.

## Défense, absorption et probabilités

La **défense** est le seuil qui doit être atteint pour réussir un coup. La **protection** est l'absorption qui retire des dégâts après une réussite. Ne jamais additionner `resistanceBonus` à `protection`.

- Résistance physique = 15 + bonus de la meilleure caractéristique entre Physique/Agilité + meilleur bonus de maîtrise défensive appropriée + bonus de seuil MJ.
- Absorption = protection innée M03 + effet d'équipement M03 + protection additionnelle MJ amortie par M03.
- Réussite d'un coup, contact possible et blessure effective sont trois mesures différentes.
- Les probabilités sont exactes sur **7 776 issues de 5d6** ; les naturels 5–7 échouent, même avec un bonus élevé.
- Les dégâts attendus sont une moyenne pondérée des résultats du moteur M03. Ils ne sont pas les dommages déjà infligés lors d'une vraie partie.

L'inspecteur mathématique montre les valeurs effectivement calculées avec l'adversaire de référence choisi dans l'atelier. Sa projection simplifie beaucoup d'éléments : tactique, magie, fuite, négociation, objectifs, terrain et arbitrage du MJ ne sont pas automatiquement simulés.

## Sauvegarder, exporter et imprimer

Les fiches se conservent **dans le navigateur** sous `alrick.bestiary.v1`. Utiliser « Exporter JSON » pour sauvegarder un fichier transportable, puis « Importer JSON » pour le réutiliser. L'export vers l'Atelier principal utilise l'enveloppe `alrick.sheets.v3` et le type `m03-bestiary`, en conservant `bestiarySource`. Aucun export ne fusionne un personnage ou ne publie un dossier documentaire tout seul.

Choisir la présentation **essentielle**, **combat MJ**, **encyclopédique** ou **pédagogique**, puis « Imprimer ». Les notes personnelles du MJ ne sont pas incluses dans le rendu de consultation ou l'impression. Un export JSON local de fiche contient cependant les champs conservés dans l'objet, dont `notes` : **ne pas partager ce fichier sans le relire**.

## Associer une source documentaire

Si un code est déjà vérifié dans le chantier documentaire B-001, inscrire ce **code existant** et sa provenance. Le lien reste déclaratif : il ne permet ni d'attribuer un statut canonique ni d'ouvrir automatiquement un dossier non publié. Les champs `publish`, `canon_statut`, `etat_editorial`, `visibilite`, `spoilers` et `unlisted` sont gouvernés par la publication documentaire, jamais par la seule validation mécanique.

Le site est public : les vrais secrets et notes personnelles du MJ doivent rester **hors dépôt**. Une page `unlisted` n'est pas secrète. Les portraits nécessitent une source, un droit, un texte alternatif et une autorisation de publication ; sans portrait, la fiche reste complète.

## Ce que M05 ne fait pas

Liaison automatique au registre B-001, résolution éditoriale des identités, pouvoirs divins, grimoire, jeu multijoueur, rééquilibrage global, et publication canonique des espèces relèvent de chantiers séparés. La direction artistique pourra remplacer le style provisoire sans changer le moteur.

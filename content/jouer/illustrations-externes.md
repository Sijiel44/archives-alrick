---
publish: true
title: "Illustrer les Archives — images externes, formats et crédits"
description: "Utiliser des images hébergées ailleurs avec source, auteur, droits vérifiés, formats harmonisés et affichage agrandi."
categorie: "guide"
code: "SYS-MEDIA-01"
canon_statut: "proposition_non_jouee"
etat_editorial: "en_cours"
visibilite: "publique"
portee: "univers_partage"
public_cible: ["joueurs","mj","lecteurs"]
usage_en_jeu: ["outil","reference"]
ancre_documentaire: "Demande d'illustrations externes et de galerie plus visuelle du créateur, 31 octobre 2026"
source_brute: "Proposition du créateur, 31 octobre 2026 ; outils de galerie de l'Atelier 5d6 et cadre de publication des Archives."
derniere_revision_documentaire: "2026-10-31"
tags: [images, galerie, art, externe, sources, licences, site]
---

# Des Archives plus visuelles, sans perdre les sources

Une illustration peut se trouver sur un serveur extérieur sans que notre site en héberge les octets. La nouvelle **galerie de l'[[jouer/atelier-5d6|Atelier 5d6]]** accepte les liens directs **HTTPS**, accompagne chaque image de sa **page source**, de son **créateur**, de la **licence ou autorisation**, et impose un format de présentation homogène. Le clic ouvre l'image en grand dans une fenêtre que l'on peut fermer.

## Quatre formats harmonisés

| Format | Proportions visées | Exemples |
| --- | --- | --- |
| **Vignette** | 1:1 | Bibliothèques, miniatures de personnage, objets |
| **Portrait** | 3:4 | Personnages, dragons, tenues, lieux étroits |
| **Paysage** | 16:9 | Régions, scènes, lieux, événements |
| **Bannière** | 21:9 | En-têtes, scènes panoramiques, introductions |

Le navigateur utilise `object-fit: cover` pour uniformiser la présentation **sans modifier le fichier distant**. Le clic ouvre la version entière avec `object-fit: contain`. Une image à distance peut disparaître, refuser l'affichage tiers ou être remplacée à la source ; prévoir un texte alternatif, une référence stable et un repli.

## Droit d'utilisation : un lien ne suffit pas

**L'absence de copie locale ne rend pas une image libre de droits.** Réutiliser une image par un lien direct peut rester soumis aux droits d'auteur, aux conditions de l'hébergeur et aux règles de réutilisation. **Citer l'auteur est nécessaire dans bien des cas, mais ne constitue pas une permission à lui seul.** On privilégie :
- une image personnelle ou commandée avec des droits de présentation accordés ;
- une œuvre sous une **licence ouverte vérifiée** (par exemple Creative Commons, en respectant ses conditions et restrictions) ;
- une œuvre du **domaine public** vérifié ;
- une **autorisation expresse** de l'auteur ou du titulaire des droits.

Le site doit conserver dans son index : `title`, `alt`, `image_url` HTTPS, `source_url` HTTPS, `author`, `license`, `rights_basis`, `format`, `canon_statut` et le rattachement à une fiche publique. Une image générée pour une discussion n'est **pas** automatiquement disponible sous forme d'URL publique stable. Il faut en vérifier l'origine, l'accessibilité et les droits avant d'utiliser ce type de lien.

## Deux galeries à ne pas confondre

**Galerie locale (fonctionnelle)** — un joueur peut associer ses propres liens d'images à la fiche active, avec crédits et format. Ces informations restent dans le navigateur et les exports JSON de la fiche. Aucune publication GitHub automatique et aucun accès aux notes MJ n'est créé.

**Galerie publique des Archives (préparée, non remplie)** — le catalogue JSON `quartz/static/archives-images-externes.json` conserve les références **explicitement relues et approuvées** avant publication. Il est initialement **vide** : aucune image tierce n'a été déclarée licenciée sans vérification. Les illustrations futures d'articles passeront par une revue éditoriale et un changement GitHub, avant d'être reliées aux fiches.

## Vie privée et fiabilité

Le navigateur contacte directement le serveur de l'image, qui peut observer l'adresse IP et des informations techniques des lecteurs. L'Atelier utilise `referrerpolicy="no-referrer"` pour les images associées à des fiches : cela limite la transmission de l'URL de la page par l'en-tête Referer, mais ne rend pas la requête anonyme. Les images HTTP, les schémas `data:` ou `javascript:`, les URLs privées et les liens avec identifiants intégrés sont refusés.

**Références :** [Creative Commons — FAQ](https://creativecommons.org/faq/) ; [UBC — guide de citation d'images](https://copyright.ubc.ca/Image-citation-guide/) ; [MDN — politique des référents](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy). Les conditions et autorisations réelles doivent être vérifiées pour chaque œuvre.

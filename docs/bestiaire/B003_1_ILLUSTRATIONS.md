# B-003.1 — Audit des cinq illustrations du lot IV

**Constat vérifié sur l'arborescence GitHub de la branche de PR #73 (1er novembre 2026) : 0 fichier image sur 5 attendu dans `docs/bestiaire/B003_ILLUSTRATIONS_LOT_04/`.** Les noms sont évoqués dans les fiches, mais il ne s'agit pas de médias hébergés ; aucune illustration n'est publiable depuis GitHub à cet emplacement. Des documents Word/ZIP illustrés ont été **mentionnés** dans le rapport antérieur B-003 et le descriptif de la PR, mais **leurs fichiers binaires et les images sources ne sont pas accessibles ni vérifiables dans ce dépôt**. Ne pas les déclarer ici contrôlés.

| Fiche | Fichier attendu mais absent | Correspondance textuelle exigée | État provenance/droits | État GitHub |
| --- | --- | --- | --- | --- |
| P37 Chamoine de Verrelune | `P37_chamoine_de_verrelune.jpg` | Caprin gris perle, cornes irisées **non magiques**, corniches | Auteur, date, autorisation, fichier source : **à vérifier** | **Absent** |
| P38 Nacrevole des profondeurs | `P38_nacrevole_des_profondeurs.jpg` | Grand poisson de lac souterrain, sans affinité magique implicite | **À vérifier** | **Absent** |
| P39 Tisse-Aurore des cols | `P39_tisse_aurore_des_cols.jpg` | Grand papillon aux ailes colorées, sans poussière magique ni feu | **À vérifier** | **Absent** |
| P40 Huppe des échos bleus | `P40_huppe_des_echos_bleus.jpg` | Oiseau à huppe bleue et chant réverbéré, non prophétique | **À vérifier** | **Absent** |
| P41 Garde-Braise des fumerolles froides | `P41_garde_braise_des_fumerolles_froides.jpg` | Petit saurien sombre, **non dragon**, sans résistance au feu | **À vérifier** | **Absent** |

## Procédure de contrôle avant intégration

1. Récupérer les cinq images *réellement fournies* et leurs octets. Contrôler format, intégrité, taille et un fichier différent par fiche ; calculer des empreintes pour rechercher les doublons.
2. Relever création/source, droits d'utilisation et autorisation de dépôt public. Une direction artistique appréciée n'est **pas une cession de droits** ni une homologation de représentation canonique.
3. Comparer chaque représentation au dossier naturaliste, sans attribuer magie, identité draconique ou capacités par interprétation de la couleur, de la lumière ou de l'anatomie.
4. Faire valider le statut de représentation par le créateur (simple visuel de travail ou illustration canonique) **indépendamment** de l'existence officielle de l'espèce.
5. Si autorisé, déposer réellement chaque fichier dans `docs/bestiaire/B003_ILLUSTRATIONS_LOT_04/`, avec provenance et licence ; modifier ensuite la fiche en y associant un chemin relatif **vérifié**. Ne pas ajouter de faux lien image à présent.
6. Exécuter le contrôle automatisé `npm run test:b0031` et vérifier les liens, puis demander **séparément** la décision de publication.

**À date :** 5 références visuelles identifiées, **5/5 images récupérées dans le Word ancien**, **5/5 correspondances visuelles plausibles**, **0/5 images déposées sur la PR**, **0/5 licences / autorisations de publication vérifiées**. La description écrite reste l'autorité provisoire. Le travail graphique n'est pas perdu : les cinq identifiants et fichiers attendus sont consignés.

## Complément B-003.1 — Récupération effective des images (1er novembre 2026)

Le fichier **`B003_LOT_IV_BESTIAIRE_ILLUSTRE.docx`** a été retrouvé dans la Bibliothèque des conversations de l'utilisateur (version antérieure de B-003). Il contient **5 objets image JPEG incorporés** correspondant dans l'ordre à P37, P38, P39, P40 et P41. Chaque image mesure **1055 × 1491 pixels** ; chacune est unique (SHA-256 distinct), et l'examen visuel confirme la correspondance générale avec les cinq titres et descriptions. Ce contrôle de **présence et de silhouette** ne remplace pas une validation artistique canonique.

| Fiche | Octets récupérés | Empreinte SHA-256 de l'image extraite |
| --- | ---: | --- |
| P37 | 735765 | `186b18bd2861291b6a4fe7f15de68ce767675af304ce4e4b0e047530f80ace98` |
| P38 | 754228 | `4f2548a3ec8c516797fd91eb6bd32597d5341c19d213af96cf55566c0e33cfd5` |
| P39 | 692442 | `80265101521d0920b87dfdaea3e0b8db06c549600180b40bc91f5dc0dd0642fc` |
| P40 | 760167 | `d6c9bd5031fd05eb45a5b9939839b313b25b7a960f9c5bc24420fd05f1ce1de1` |
| P41 | 753729 | `5badfebb9fe487559087b427bdc683e882b441ebf8b0784c09a7622a40e2fddc` |

**Réserves visuelles :** P37 cornes iridescentes d'apparence remarquable mais sans magie ; P38 nageoires luminescentes/irisées pouvant suggérer un pouvoir non établi ; P39 ailes colorées sans feu ; P40 chant et huppe sans prophétie ; P41 silhouette saurienne pouvant évoquer un petit dragon **sans lien draconique canonique**. Aucun de ces signes ne modifie une aptitude écrite.

**Provenance partielle vérifiée :** extraction technique depuis le fichier Word historique contenant les cinq illustrations ; le document les présente comme « créations originales non canonisées ». Aucun auteur nommé, licence vérifiable, preuve de droits de rediffusion publique ou autorisation de dépôt GitHub n'y est établie. Les images sont conservées **hors dépôt**, dans l'archive locale récupérée `B003_LOT_IV_ILLUSTRATIONS_RECUPEREES.zip` remise au créateur. Les octets ne sont **pas** ajoutés à la branche publique : attendre l'arbitrage sur les droits puis intégrer les cinq fichiers avec liens relatifs vérifiés. Leur absence de la PR demeure exacte.

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

**À date :** 5 références visuelles identifiées, **0/5 images accessibles dans la PR**, **0/5 provenances juridiques vérifiées**, **0/5 concordances visuelles contrôlées à partir des pixels**. La description écrite reste l'autorité provisoire. Le travail graphique n'est pas perdu : les cinq identifiants et fichiers attendus sont consignés.

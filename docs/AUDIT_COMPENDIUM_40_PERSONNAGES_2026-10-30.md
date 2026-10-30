# Réconciliation des 40 dossiers du Compendium V03 — 30 octobre 2026

**Périmètre :** 40 fiches web encore `en_chantier`, rapprochées du *Compendium des personnages et des relations* v1.7, des campagnes CB1–43 et de l'état documentaire de reprise après CB43.

## Bilan

- **40/40 dossiers relus et réécrits** dans leur fichier source Markdown, sans renommer les chemins historiques ni forcer un changement de code.
- **28 biographies vérifiées proposées à publication** : `canon_statut: faits_joues`, `etat_editorial: valide`, `spoilers: true`, `unlisted: true`, `visibilite: publique_avec_avertissement`.
- **12 dossiers maintenus hors publication** : **8 profils préparatoires sans rencontre**, **1 recommandation sans mandat accepté**, **3 discussions/visites intéressées sans contrat**. Leur présence dans une page brouillon n'entraîne aucune reconnaissance comme personne officiellement rencontrée ou employée.
- **Compteur de fiches codées approuvées attendu après fusion : 244 (216 + 28)**. Les douze fiches de travail restent hors de ce compte.

Les 40 adresses de fichiers ont été **conservées**, même si le code du Compendium et le code historique du web diffèrent ; une migration ultérieure devra tenir une table d'alias avant de changer un chemin.

## Rectifications importantes

1. Les Rappelés **ne sont pas automatiquement des Revenants** : le retour à la vie, le contrat, la résidence et l'appartenance à une Maison sont des faits indépendants.
2. Les engagements déjà signés **ne sont plus affichés comme candidatures** dans les biographies corrigées ; les bilans tardifs non actualisés n'annulent pas une scène de signature.
3. Les personnes restaurées à la vie sans emploi accepté conservent le droit de disposer de leur avenir ; l'assistance reçue ne crée pas de dette de travail.
4. Les homonymes sont maintenus **distincts** : plusieurs personnes portant les mêmes prénoms et au moins deux profils professionnels aux noms proches ne sont pas fusionnés.
5. **Correction de genre fondée sur la source primaire :** une fiche ancienne utilisait le masculin pour une charpentière qui est explicitement au féminin dans le Compendium et le brut regroupé.
6. Une expérience magique **guidée jusqu'au huitième Cercle** ne signifie pas une maîtrise autonome de huit Cercles.
7. Les groupes anciens liés au vieux pont interprètent certaines fonctions de garde ; ces interprétations **ne deviennent pas une vérité cosmologique** sans arbitrage.
8. Une visite du domaine ou un séjour d'observation d'une divinité **ne suffit pas** à créer une adhésion, un ordre ou une dépendance.

## Publication et confidentialité

Le dépôt GitHub est **public**. Les 28 nouveaux textes publiables portent tous `spoilers:true` et `unlisted:true` ; le lecteur doit ouvrir un avertissement sur le site, et les fiches sont exclues de la bibliothèque et du sitemap. **Cela ne chiffre pas leur contenu** : les lecteurs connaissant l'URL, ou consultant directement GitHub, peuvent y accéder. Aucun document brut complet ni registre privé n'est ajouté à ce lot.

Les **12 dossiers incomplets** restent `publish:false` et `etat_editorial: en_cours`, mais les états de candidature, de recommandation ou de rendez-vous préliminaire ont été corrigés.

## Questions encore ouvertes

Le questionnaire **privé** accompagnant ce lot demande seulement les arbitrages de canon que les sources ne tranchent pas : statut de réalité des portraits de recrutement non rencontrés ; identité du cuisinier de bord recruté ; statut définitif ou provisoire des quatre fonctions du vieux pont. Ces questions **n'empêchent pas** la révision des 28 biographies prouvées.

## Procédure de validation

1. `npm test` réussi sur la PR : métadonnées, codes uniques, build Quartz, liens et exclusion des spoilers.
2. Vérifier le compteur exact de **244 fiches codées** dans la sortie du contrôle de contenu.
3. Fusionner sans publier le registre privé ou les bruts.
4. Contrôler séparément GitHub Actions **Pages** et la sauvegarde Git déclenchée sur `main`.
5. Consigner les réponses du créateur dans un **lot de corrections ultérieur** sans modifier rétroactivement les scènes CB.

**Sources privées utilisées, non diffusées :** Compendium V03 v1.7 ; campagne brute regroupée Volume 1 ; campagne CB42 et CB43 ; état directeur de la campagne. Le tableau individuel de 40 entrées demeure hors du dépôt public.

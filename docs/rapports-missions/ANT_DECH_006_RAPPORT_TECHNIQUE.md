# ANT-DECH-006 — Biographies développées et seconde galerie de la Déchéance

**Référent :** ANT — Antagonistes et menaces. **Branche :** `content/ant-dech-006-carnets`.

## Contrat et autorisation

Le créateur demande de poursuivre le développement **direct et canonique** du JDR, d'inclure davantage de personnages de niveaux variés, et d'enrichir les dix biographies précédentes (histoires, succès, revers, activités, pactes, contradictions, relations, subalternes). La publication des fiches d'univers est explicitement demandée. Les secrets MJ, les capacités chiffrées non validées et les sauvegardes privées demeurent exclus.

**Sources effectivement consultées :** `content/monde/decheance-canon.md` MON-DECH-01 ; `content/monde/dechus-hierarchie.md` ANT-DECH-01 ; `content/jouer/decheance-systeme.md` SYS-DECH-01 ; les dix pages PER-DECH-01–10 ; six organisations ORG-DECH-01–06 ; LAB-DECH-003 (récupéré sur `lore/lab-dech-003` pour ANT-DECH-005). Aucun fait nouveau n'est attribué aux campagnes d'Orin.

## État de livraison

- Dix personnages PER-DECH-01–10 étoffés, avec biographies étendues, PNJ ordinaires distincts des Chutes liées, événements, limites et scènes de jeu.
- Dix nouvelles fiches canoniques PER-DECH-11–20 avec parcours, situation actuelle, pacte à portée bornée, entourage, choix de repli et résolution sans combat.
- Dix portraits SVG originaux `quartz/static/images/personnages-dechus/per-dech-11.svg` à `-20.svg`, illustrations code-natives sans recours à des images tierces.
- Galerie `content/personnages/personnages-dechus.md`, index personnages et Menaces mis à jour ; catalogue `studio-local/catalogue-antagonistes.json` version 3 : vingt références, versions Git blob, niveau **indicatif** et détails publics.
- Studio MJ : même adaptateur `bibliotheque.mjs`, même création descriptive de PNJ en campagne et même politique CSP : seuls les nouveaux contenus publics sont ajoutés ; aucun effet de jeu exécuté à partir des biographies.
- Tests de contrat et navigateur révisés : intégrité des vingt sources SHA et illustrations, pagination du rayon à vingt-six fiches (six organisations + vingt PNJ), copie de PNJ sans note projetée.
- Annexe MJ confidentielle **hors dépôt GitHub et hors site public** : liens réels et fronts, à conserver dans un espace privé.

## Dix nouveaux personnages

| Code | Personnage | Niveau narratif | État | Dépendance / portée |
| --- | --- | ---: | --- | --- |
| PER-DECH-11 | Olyne des Trois Lanternes | 4 | Fêlure | Rites de veille d'Orvann, aucun tribut lié |
| PER-DECH-12 | Faël le Dénoueur | 6 | Tentation | Clef rituelle de l'atelier de Rûna, sans Chute liée |
| PER-DECH-13 | Rhéomar des Intervalles | 9 | Rupture | Mésal, véritable Chute liée ; dispositif local d'Isméria |
| PER-DECH-14 | Varune du Dernier Mot | 11 | Rupture | Iriane, Chute liée de la branche de Vézraël |
| PER-DECH-15 | Kareth la Cloche de Verre | 14 | Déchéance | Oris et Hédrune : deux branches, Oris lieur |
| PER-DECH-16 | Bastiane des Noces Muettes | 18 | Déchéance | Serel et Lavorne : deux branches, Serel lieur |
| PER-DECH-17 | Nielle des Grains Dormants | 2 | Tentation | Pacte de conservation de Terval, aucune Chute liée |
| PER-DECH-18 | Néris des Miroirs Éteints | 8 | Fêlure | Miroir rituel d'Esmor, aucune Chute liée |
| PER-DECH-19 | Idrela des Herbes de Sel | 13 | Rupture | Témia, Chute liée véritable de la branche d'Halvéra |
| PER-DECH-20 | Hévar des Archives Brûlées | 19 | Déchéance | Sorel et Véline : deux branches, Sorel lieuse |

**Déjà présent dans ANT-DECH-005 :** N2, N3, N5, N7, N8, N10, N12, N15, N17, N20. **Total :** 20 individus des niveaux 2 à 20, sans imposer qu'un niveau corresponde à un stade de corruption.

## Matrice de dépendance et garde-fous

1. Tentation / Fêlure : don limité et prix personnel ; les agents payés et proches en souffrance **ne sont pas** des Chutes liées.
2. Rupture : Chute liée nommée, effectivement transformée ; les sentiments ou un contrat de travail ordinaire ne suffisent pas. Les lieurs peuvent être détournés de leur maître.
3. Déchéance : deux branches distinctes avec au moins un lieur ; un hôpital, une audience ou un mariage ne transforme pas le public de l'institution.
4. Abîme (Terval) : trois branches dont une seconde génération, sans ajouter de Seigneur ni Prince et sans tout-pouvoir mécanique.
5. Protection des victimes : délivrer, reloger, approvisionner ou recueillir un témoignage est une victoire valable. Une transformation forcée ne transfère aucune culpabilité morale à la victime.
6. Jouabilité : niveau = cible de conception ; le mini-module SYS-DECH-01 est en 2d6 et ne renseigne ni dégâts, ni PV, ni défense du moteur 5d6 M01–M05.

## Interopérabilité

- **INDEX/MATH/COMBAT/PNJ :** profils 5d6 et capacités du catalogue commun à élaborer après contrôle, sans accorder des points ou dégâts par la description.
- **STUDIO/ARCHIVES :** `npc` descriptif référencé et versionné, copie de campagne locale distincte de la source ; aucune migration ni modification du modèle de sauvegarde ou du récepteur joueur.
- **LORE/AVE/QTE :** nouvelles scènes et liens adaptables sans occurrence imposée dans chaque campagne ; faits passés personnels intégrés à l'univers, rencontres PJ non jouées.
- **BEST/MAG :** aucune créature ni magie de la Faille inventée ; les pactes ne sont pas des sorts M03, MAG ou capacités automatiques.
- **Publication/sécurité :** SVG originaux, images et JSON publics sans secret, dossier MJ conservé hors Quartz/Pages/GitHub ; HTML de la fenêtre joueur sur liste blanche.

## Tests et preuves

À la base fusionnée ANT-DECH-005/PR #129 (`e530a5b89fe4ad81a5a986a58a5984f75008595e`) :

- `npm run test:antagonistes` **3/3 réussi** sur **vingt** portraits : code, source SHA, stades, liens de tribut, illustrations SVG, routes HTTP et CSP des régies.
- `npm test` **réussi**, incluant les moteurs 5d6 M01–M05, Bestiaire, Grimoire, compilation TypeScript, construction Quartz et contrôles de contenus : **397 pages publiables et 295 codes uniques**.
- `npm run check:site` **réussi** sur **1 225 pages HTML et 71 765 liens ou ressources internes**, avec recherche/sitemap/avertissements MJ contrôlés.
- `git diff --check` et cohérence SHA de l'arbre Git du lot : **réussis** ; aucun secret n'a été placé dans les quarante fichiers de la branche.
- **Chrome en CI GitHub : à attester au HEAD distant final.** Aucune recette humaine complète à deux joueurs n'est revendiquée. Les erreurs éventuelles du Studio héritées des PR multimédias sont suivies séparément et ne doivent pas être masquées par des adaptations de contenu.

**Décisions ouvertes :** profils chiffrés N2–N20 ; statut des Chutes de premier stade en termes de tribut ; emplacements exacts du chantier Rhéomar et des salles de Bastiane ; futures illustrations peintes éventuelles. L'identité des Seigneurs et des neuf Princes reste celle d'ANT-DECH-01.

**À revoir par PNJ, LORE, INDEX, MATH, COMBAT, MAG, STUDIO, ARCHIVES, AVE, QTE et QA. À valider par DG/créateur : profils 5d6, recettes de publication et éventuelles extensions mécaniques.**

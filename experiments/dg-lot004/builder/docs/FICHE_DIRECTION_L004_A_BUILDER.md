# Fiche Direction — L004-A / BUILDER

**Objet :** rendre le Studio DG-LOT-003 réellement lançable et vérifiable en local, sans éditer la PR produit ni le site Quartz.  
**Base fixe :** PR #85 `2ab809ef5351940e0fc272b859d10f21de894d00` ; QA référence PR #91 `20679f7bf5c744f29dd041413cc63801ce5daea1`.

**Livraison :** façade d'origines/URL exactes, guide de navigation facultatif non mutateur, sonde HTTP sur 8 routes, CLI de lancement fermé, recette Chrome ordinateur/tablette/téléphone témoin, tests Node, workflow CI dédié, guide et passations. Propriété exclusive : `experiments/dg-lot004/builder/**` + workflow L004.

**Décisions techniques** : rester sur `127.0.0.1:4173/4174`, refuser tout override Internet/LAN, conserver le modèle Studio/projection/stockage fourni par PR85, aucune API 5d6 recopiée, aucune écriture de campagne dans le guide, aucun secret réel. Le bouton ou module de navigation doit être monté ultérieurement par 05 INTÉGRATION et validé ergonomiquement par 20 STUDIO.

**Preuves locales initiales** : tests de contrats Node et analyse de syntaxe exécutés ; checkout complet, build, npm test et vrai Chrome **non exécutés dans ce conteneur** (DNS GitHub inaccessible). Preuves CI du HEAD final précisées dans la description de PR quand disponibles. L'avis QA #91, 10/10, reste celui du candidat précédent : il ne vaut pas recette L004-A.

**Risques P0** : hébergement non autorisé, origine joueur réutilisant MJ, fuite d'archive, stockage de vraies données MJ sur appareil partagé. **P1** : responsive tablette, raccourcis focus, scripts Chrome absents/interdits, compatibilité navigateur. Fail-closed et statut NON EXÉCUTÉ obligatoires.

**À transmettre :** 20 STUDIO, 05 INTÉGRATION, 02 QA ; décision ultérieure de 00 DG pour toute diffusion hors loopback. Aucun envoi interchat automatique revendiqué.
# MAG-003.C — Intégration expérimentale Grimoire, repos, rites et objets

**Archives d'Alrick — 1er novembre 2026**  
**Branche :** `magie/mag003c-integration-rites` · **PR :** [#71, DRAFT](https://github.com/Sijiel44/archives-alrick/pull/71) · **Base de comparaison :** `magie/mag003b-rites-collectifs` (#70, DRAFT)  
**Statut :** développement expérimental livré, revue DG requise ; **NON fusionné, NON publié, NON canonique**.

## 1. Périmètre et dépendances réellement vérifiés

Le dépôt a été examiné sur les branches effectives, pas seulement les descriptions de mission :
- **MAG-003.A / #69** : `alrick.mana.recovery.v1`, `atelier5d6-mana-recovery.ts` (plafonds par journée de jeu, opérations idempotentes, dépenses et historique, politiques de test). Aucun serveur.
- **MAG-003.B / #70** : `alrick.ritual.v1`, `atelier5d6-rituals-mag003b.ts` (définitions, rôles, transitions, probabilités M01/M03, prévisualisation énergétique **sans commit**). Aucun effet automatique.
- **G-001 / #55** : `atelier5d6-grimoire.ts` + interface `Atelier5d6.tsx`, `alrick.grimoire.v1`, magie connue et prérequis, matrice liée à un objet déjà présent dans l'inventaire, Cercles I–IX, migration historique, sauvegarde.
- **T-001 / #66** : pilote Tables local, `alrick.tables.local.v2` et `alrick.tables.character.v2`, permissions réelles serveur sur **son propre périmètre**, identifiants d'instance distincts et imports **partiels**. Le Grimoire, l'inventaire, les matrices, les extensions et les historiques n'y sont pas synchronisés. Aucun contrat d'opération rituelle transactionnelle.
- **MAG-002 / #68** : architecture, coûts et objets **proposés**, pas d'économie de foi ni de contrat d'énergie validé.

**Réserve de gouvernance :** au démarrage de C, #69 et #70 étaient encore ouvertes en brouillon et leur validation éditoriale n'était pas démontrée dans GitHub. La condition « A et B validées » du mandat n'est donc **pas considérée comme acquise** : C reste empilée sur B et n'autorise aucune fusion.

## 2. Architecture et fichiers

- `quartz/components/scripts/atelier5d6-rites-mag003c.ts` : panneau UI, adaptateurs de récupération et de cérémonies, propositions de travaux, schéma local optionnel `alrick.mag003c.local.v1`.
- `quartz/components/scripts/atelier5d6.inline.ts` : raccordement au hub, navigation « Rites et repos », extension optionnelle par fiche `ritualWorkshop`, rafraîchissement et sauvegarde du même état local que le Grimoire.
- `quartz/components/scripts/atelier5d6-grimoire.ts` : reprise du code G-001 ; suivi **non autoritaire** des dépenses personnelles issues des sorts et entretiens, sans toucher au contrat des matrices ni aux charges.
- `quartz/components/Atelier5d6.tsx` : panneau G-001 réutilisé avec son identité de sorts, Cercles et conditions ; aucun remplacement du système de magie M01/M03.
- `scripts/test-mag003c.mjs`, `scripts/test-5d6-grimoire.mjs`, `scripts/fixtures/5d6-parity-v1.json`, `scripts/test-5d6-m04-browser.mjs`, `package.json` : régressions moteur, UI et navigateur.

**Fonctions pures d'intégration :** `readWorkspace`, `previewRecovery`, `commitRecovery`, `trackGrimoireManaChange`, `nextRecoveryDay`, `buildParticipant`, `startCeremony`, `resolveCeremony`, `addWorkOrder`.

Les catalogues MAG-003.C sont uniquement des **démonstrations non canoniques**. La recherche et les variantes sont consignées comme **propositions soumises au MJ**, et non comme définitions automatiquement approuvées.

## 3. Expérience PJ / MJ

### Récupération ordinaire

La fiche affiche son mana actuel/maximal et, après première transaction, la journée de jeu, le plafond et la récupération consommée. Le joueur saisit la journée et l'identifiant de repos, sélectionne une pratique, atteste l'état du lieu et de la période, visualise le gain et **confirme**. Le moteur MAG-003.A décide du gain, du refus ou de la répétition ; le panneau ne recalcule pas de formule concurrente.

Le premier repos initialise un registre optionnel avec le mana **réel** de la fiche. Une divergence entre registre et fiche bloque toute récupération jusqu'à réconciliation explicite. Les dépenses Grimoire de sort/entretien sont reflétées dans le registre si celui-ci est synchronisé ; un changement manuel non suivi conduit à un blocage conservateur, pas à une régénération gratuite.

**Limite :** le « mode MJ » de l'Atelier local est un bouton, **pas une authentification serveur**. L'attestation de sûreté, le calendrier, la durée et les conditions exceptionnelles restent soumis au MJ réel. Ne pas utiliser le prototype comme autorité multijoueur.

### Rites et cérémonies

L'interface propose des pratiques personnelles, une prière sans récompense automatique, une tradition d'atelier non religieuse et une cérémonie M01 de démonstration. L'officiant est la fiche active ; le MJ local choisit les autres participants et leurs rôles. MAG-003.B vérifie rôles, faisabilité, sûreté et compétences et fournit une probabilité via les **moteurs M01/M03 existants**. Le résultat affiche une simulation et l'historique conserve les transitions.

**Interdiction technique :** aucune cérémonie MAG-003.C ne débite plusieurs réserves, n'accorde de bonus persistant, ne modifie de PV, ne décerne un Cercle, n'applique une bénédiction ou n'octroie un pouvoir. Une prévisualisation MAG-003.B ne représente **pas** un commit.

### Objets et travaux

Propositions de préparation de matrice, stabilisation, consécration, fabrication, entretien, recherche et variantes. Si un objet est cité, il doit déjà exister dans l'inventaire ; le dossier garde le statut `proposition_mj`. Les `charges` de `alrick.grimoire.v1` ne sont ni converties en `energyStored` ni en `usesRemaining`. L'ambiguïté de G-001 (`energySource=caster` consommant mana **et** charge) demeure ouverte. Aucune recharge, consommation de matériau, fabrication ou artefact automatique.

## 4. Foi, religion et traditions

L'audit d'architecture et des sources de campagne (Bible du monde et des puissances v1.7 ; *Orin, la Maison et les traditions religieuses* v1.8 ; Codex magique v1.7 ; documents MAG-002) distingue :
- pratique spirituelle, prière, lieu consacré, relation à une puissance et manifestation divine ;
- **points de foi**, bénédictions, Autorités et Cercles, qui ne disposent pas ici d'un contrat mécanique permettant une attribution automatisée vérifiable ;
- rites non religieux (méditation, étude, artisanat, recueillement) mécaniquement praticables sans divinité obligatoire.

**Décision d'intégration : aucun adaptateur chiffré de foi activé.** Aucun nouveau barème officiel. La prière n'est pas une garantie d'intervention divine ; ni foi, ni Autorité, ni Cercle, ni bénédiction automatique. L'adaptateur éventuel dépend d'un contrat approuvé par le créateur.

## 5. Intégrité, confidentialité et limites

- **Sauvegarde :** `alrick.campaign.v2` et `alrick.grimoire.v1` inchangés ; `ritualWorkshop` est un champ **optionnel** conservé dans la fiche. Une vieille fiche sans extension reçoit un espace vide à la lecture. Un schéma inconnu ou un registre appartenant à un autre identifiant est **refusé** : export préalable et migration **explicite** nécessaires.
- **Idempotence personnelle :** clé du repos `mag003c:rest:<personnage>:<journée>:<période>`. Le même repos rejoué ne recalcule pas un crédit. Les journées ne viennent ni de `Date.now()` ni du téléphone ; elles sont saisies par le joueur/MJ.
- **Impératif de sécurité :** états et confirmations locaux ne sont pas des permissions réseau ; un utilisateur modifiant son navigateur peut forger une validation locale. Ne pas exposer ce stockage comme source d'autorité partagée.
- **Tables :** aucune écriture vers le serveur T-001 ; pas de fausse synchronisation, d'ACK ou de transaction atomique inter-joueurs. Contrat futur : `campaignInstanceId`, `sourceId`, `expectedRevision`, `actionId` stable, commande serveur validée MJ, vérification complète des coûts/conditions, verrou et commit atomique, reçus durables, reprise et restauration sans double débit, ACL PJ/MJ et confidentialité MJ.
- **Périmètre retenu :** catalogue d'exemples uniquement ; pas de véritables calendriers/temps de repos imposés, ni de mécanisme de propriété des ingrédients, ni de fabrication exécutable. La gestion avancée des bénéfices collectifs réclame un moteur serveur dédié.

## 6. Recette et décisions

Voir [MAG_003_C_RECETTE.md](./MAG_003_C_RECETTE.md) pour le bilan à la tête de la PR ; **les essais humains sur mobile et les vraies parties multijoueurs restent à exécuter**. Vérifications automatisées et tests Chrome ne doivent jamais être appelés « playtest humain ».

**Décisions requises DG :** adopter/rejeter le barème MAG-003.A (y compris variantes et arrondis) ; sécurité/durée des repos ; validation MAG-003.B du soutien ; contrats d'énergie/usages des matrices ; statut et conditions des pratiques exceptionnelles ; éventuel modèle de foi ; périmètre de migration des anciennes fiches ; protocoles serveur des cérémonies et jalons de déploiement.

**Conclusion :** intégration locale de démonstration ; **pas de fusion main, pas de Pages, pas de canonisation**.

## 7. Bilan automatisé contrôlé après l'ajout de la recette Chrome C

La CI [#41324736498 — SUCCÈS](https://github.com/Sijiel44/archives-alrick/actions/runs/41324736498) sur le code `90282ea8e074730db0014be7e7598ccf4b226b73` a exécuté `npm ci`, `npm test` et `npm run test:m04:browser`, avec **44 assertions MAG-003.C**, 181 MAG-003.A, 44 MAG-003.B et **17 scénarios Chrome réussis**, dont les deux nouveaux parcours MAG-003.C (récupération confirmée, double clic, persistance, mobile émulé, cérémonie locale sans débit). Il s'agit d'un test automatisé sur Chrome, pas d'une recette humaine. La CI du commit documentaire ultérieur doit être vérifiée séparément.

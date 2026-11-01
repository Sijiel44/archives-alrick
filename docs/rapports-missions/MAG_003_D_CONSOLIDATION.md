# MAG-003.D — Consolidation corrective des rites et préparation à l'intégration

**Archives d'Alrick — 1er novembre 2026**  
**PR :** [#72 — brouillon](https://github.com/Sijiel44/archives-alrick/pull/72) · **Branche :** `magie/mag003d-consolidation` · **Base :** [MAG-003.C #71](https://github.com/Sijiel44/archives-alrick/pull/71) (elle-même empilée sur MAG-003.B #70 puis MAG-003.A #69).  
**Statut :** développement correctif **terminé techniquement avec réserves d'intégration**, soumis à revue DG ; **aucune fusion dans main, aucune publication, aucune canonisation**.

## 1. Périmètre contrôlé

Le chantier reprend les moteurs réels `atelier5d6-mana-recovery.ts` (A), `atelier5d6-rituals-mag003b.ts` (B), `atelier5d6-rites-mag003c.ts` (C), le Grimoire G-001 dupliqué depuis #55, les sauvegardes du hub et le contrat de Tables T-001 #66. Il conserve M01/M03 comme sources de vérité mathématiques, et tous les statuts documentaires. Aucun sort, miracle, nouveau barème de foi, nouveau système d'objet, interface majeure ou transaction réseau n'a été ajouté.

**Dépendances :** #69, #70 et #71 sont encore des PR ouvertes en brouillon. Leurs validations éditoriales et leurs fusions dans `main` ne doivent **pas** être déduites de la réussite CI de D.

## 2. Qualification du soutien numérique — corrigée (réserve D-01)

**Défaut constaté :** MAG-003.B donnait +1 lorsqu'une simple contribution `kind="support"` portait `approved:true`. L'identité, la compétence, le rôle et le droit d'assistance du participant n'étaient pas vérifiés.

**Correction :** `supportQualification(instance, contribution)` exige :
- participant **réellement enregistré** et distinct de l'officiant principal ;
- rôle `supportRole` correspondant exactement au rôle attesté du participant, non égal au rôle principal ;
- compétence `supportSkillId` réellement présente dans `participant.skills` et contribution approuvée ;
- si le rite requiert un Cercle, droit d'**assister** explicitement attesté au Cercle exact, sans déduction automatique depuis le niveau ou le Cercle de conception ;
- identifiants de contribution uniques, vérifiés lors de `preparer`; contrôle à nouveau en lecture au moment de `resoudre` pour empêcher un bonus après import de données modifiées.

Le maximum reste **+1 contextuel au total** ; la situation M01/M03 reste bornée par `−2..+2`. Les aides supplémentaires ne s'additionnent pas. Le champ numérique `durationSaved` utilise désormais la même qualification. Un assistant non-mage disposant d'une compétence pertinente et d'un rôle attesté reste éligible pour un rite sans prérequis magique. Les prérequis de Cercle ne sont jamais reconstruits à partir du nombre d'assistants.

**Compatibilité :** ajout seulement des champs **optionnels** `supportRole` et `supportSkillId` sur `RitualContribution` du schéma existant `alrick.ritual.v1`. Une ancienne contribution de soutien sans preuve demeure dans l'historique, mais ne peut plus produire un nouveau +1 lors d'une résolution future ; aucun résultat historique `resolu` n'est recalculé automatiquement. Les participants dupliqués dans les imports sont désormais refusés.

## 3. Rite connu ordinaire réalisable par PJ — corrigé (réserve D-02)

**Défaut constaté :** la fonction `resolveCeremony` et le bouton du panneau MAG-003.C exigeaient toujours le mode « MJ local », y compris pour une pratique personnelle triviale.

**Correction :** `canPerformOrdinaryRite` autorise le PJ exclusivement si tous les critères sont satisfaits : rite connu dans la fiche active ; identifiant et version du catalogue de démonstration **strictement identiques** ; statut préparé ; un seul officiant identique au personnage de la fiche ; `resolution="automatique"`, faisabilité, lieu sûr contrôlé par le moteur B ; aucun autre participant, effet, Cercle, énergie, composant ou contribution ; rite ne relevant pas de la préparation d'un rituel collectif.

Le PJ peut **préparer puis accomplir** son recueillement ou sa prière connue sans naturel 5d6 ni validation locale du MJ. Son historique local conserve le résultat calculé ; le plan d'application reste **`applied:false`**, sans déduction de mana, point de foi, miracle, bénédiction, Autorité ou nouveau sort. Les rites incertains, dangereux, collectifs, inconnus ou modifiés, et les validations susceptibles de toucher autrui restent sous garde MJ. Le « mode MJ » n'est qu'un mode d'interface locale, **jamais une authentification de serveur**.

## 4. Mana, journées et idempotence — corrigé / limité (réserve D-03)

- Le registre MAG-003.A reste seul responsable du plafond de récupération, des crédits réellement consommés, de l'interruption et des transitions de journée explicites.
- Un même repos rejoué garde un seul crédit. D ajoute un **refus** si la même clé de transaction historique est présentée avec une **autre nature de repos**, au lieu de traiter silencieusement le conflit comme un duplicata légitime.
- Un reçu de transition MAG-003.B **strictement identique** est rejouable même après avancement des ticks, sans refaire l'action ; empreinte différente = collision refusée.
- Le journal, la journée de campagne, les changements de mana et la fiche doivent rester cohérents. En cas d'écart entre ledger et Grimoire, la récupération est bloquée en attendant une réconciliation volontaire. Aucune correction/migration automatique du maximum ou des dépenses manuelles.
- Les périodes et jours de campagne sont explicitement définis par la table ; ni l'horloge du navigateur ni le fuseau horaire ne fixent le jour de jeu. Le stockage local n'est pas un journal autoritaire multijoueur.

**Réserve maintenue :** les sauvegardes historiques réelles et les modifications manuelles de mana hors des opérations suivies nécessitent une procédure de réconciliation MJ formalisée ; la sécurité contre la falsification d'une validation locale est impossible sans serveur.

## 5. Grimoire–Rites et Tables — documenté, NON fusionné (réserve D-04)

Voir [MAG_003_D_RECONCILIATION.md](./MAG_003_D_RECONCILIATION.md). La comparaison effective du code G-001 de [#55](https://github.com/Sijiel44/archives-alrick/pull/55) avec la base de D constate :
- **identiques byte pour byte** : `quartz/components/Atelier5d6.tsx`, `scripts/test-5d6-grimoire.mjs`, `docs/GRIMOIRE_5D6_V1.md`, `scripts/fixtures/5d6-parity-v1.json` ;
- **Grimoire TypeScript étendu seulement par des hooks** `onManaChanged` pour suivre les dépenses de sort et d'entretien ; aucune logique d'éligibilité, de résolution, de Cercle, d'objet ou de charge n'est réinterprétée ;
- **hub** étendu avec `ritualWorkshop` optionnel, son panneau et le callback de réconciliation. Le schéma `alrick.grimoire.v1` n'est pas remplacé.

L'ambiguïté G-001 de `energySource=caster` (mana du porteur **et** charge) demeure non arbitrée. `charges` ne devient **ni** `energyStored` **ni** `usesRemaining` sans décision du créateur, modèle versionné et migration non destructive séparée.

T-001 #66 : import de fiche partiel, `campaignInstanceId` distinct et `origin.sourceId`; la table **n'importe ni objets, ni matrices, ni Grimoire, ni rituel**. Son protocole `actionId`/`expectedRevision` ne constitue pas une API de cérémonie. Aucun débit collectif, aucune synchronisation ni permission serveur des rites n'a été activé. Un contrat futur devra assurer consentements PJ, validation MJ authentifiée, vérification de tous les participants et ressources, commit atomique, idempotence durable, révisions, retour d'erreur et sauvegarde/restauration.

## 6. Preuves de recette

**[CI GitHub #41326549809 — SUCCÈS](https://github.com/Sijiel44/archives-alrick/actions/runs/41326549809)** sur le commit `670471c3e3beb0908fe6b87d66b3685fba787c77` : `npm ci`, `npm test` et `npm run test:m04:browser`. Vérifications confirmées par les journaux :
- MAG-003.A : **181 assertions** ; MAG-003.B : **44 assertions / 14 scénarios** ; MAG-003.C : **44 assertions** ; MAG-003.D : **46 assertions de régression**.
- **19 scénarios Chrome** réussis, dont deux nouveaux D : accomplissement PJ d'un rite connu sans jet ni MJ, et refus d'une cérémonie incertaine en mode PJ ; parcours C de récupération, double clic, historique et mobile émulé toujours verts.
- TypeScript, compilation Quartz, contrôles de contenu/site, suites M01–M05, G-001 et B-001/B-002 inclus par `npm test`.

Les **essais humains** sur ordinateur et téléphone physique et les parties multi-appareils **n'ont pas été exécutés**. Le Chrome headless, y compris l'émulation mobile, est une recette **automatisée**, pas un test humain. La CI du **dernier commit documentaire** devra être contrôlée séparément avant la remise définitive.

## 7. Décisions DG et porte de sortie

| Réserve héritée de MAG-003.C | Verdict D |
| --- | --- |
| Soutien chiffré non qualifié | **Corrigée en code et tests** ; l'attestation reste locale et non serveur |
| Rite ordinaire bloqué pour un PJ | **Corrigée en code et tests Chrome** ; cas extraordinaires verrouillés |
| Journées, historique et double crédits | **Renforcés** ; réconciliation des changements manuels et corpus historique réel **non réalisés** |
| Réconciliation G-001/T-001 et autorité serveur | **Auditée et contractualisée** ; intégration réseau/énergie des objets **bloquée par décisions et développement serveur** |

**Arbitrages avant intégration** : validation formelle A/B/C/D et qualité éditoriale ; règle énergétique objets/charges ; authentification et transactions multi-personnages ; protocole de migration des anciens repos et fiches ; recette humaine PJ/MJ sur ordinateurs et téléphones ; contrôle de sécurité des données et secrets. Aucune de ces étapes ne peut être supposée acquise par une CI verte.

**Décision proposée :** recevoir MAG-003.D pour **revue technique expérimentale avec réserves**, maintenir #72 en DRAFT, ne pas fusionner `main`, ne pas déployer GitHub Pages, ne modifier aucun canon, et ne pas activer de transactions multijoueurs sans autorisation expresse.

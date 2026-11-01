# MAG-002 — Architecture proposée des effets, sorts, matrices et objets (NON VALIDÉE)

**Statut :** spécification de conception, sans code ni règle canonique.  
**Document maître :** `docs/rapports-missions/MAG_002_PHASE_A_B_AUDIT_CONCEPTION.md` ; contrats existants M01/M02/M03/M04/M05, G-001 et T-001.

## A. Une même définition d'effet pour plusieurs usages

**Séparer le sens d'un effet de la façon de l'exécuter.** Une définition `EffectDefinition` décrit un résultat *autorisé*, ses conditions et sa provenance. Une recette de sort, une rune, une matrice, un rituel ou un outil en font usage sans recopier une formule concurrente.

```text
EffectDefinition (intent, domaine, résultat, limites, statut documentaire)
    ├── SpellRecipe (apprentissage, maîtrise, variante, préparation)
    ├── RitualRecipe (participants, durée, interruption)
    └── MatrixDesign (architectureCircle, activationCircle, sécurité)
              └── ItemInstance (itemId d'inventaire, état, sources, usages)
Tous → CastIntent / WorkOrder → M01/M03 → historique de campagne
```

### A.1 Référentiel conceptuel (champs proposés)

```json
{
  "schema": "alrick.magic.effect-spec.proposal.v0",
  "id": "demo-effet-vent-poussieres",
  "version": 1,
  "status": "demo_non_canonique",
  "source": "Laboratoire MAG-002 fictif",
  "domain": "vent",
  "tradition": "locale",
  "intent": "deplacer",
  "result": "déplace des poussières visibles sur une surface",
  "scale": {"intensity": "faible", "range": "proche", "duration": "instantanee"},
  "mechanics": {"mode": "noncombat", "resolver": "M01"},
  "constraints": ["surface accessible", "aucune détection magique implicite"],
  "stopConditions": [],
  "extensions": {}
}
```

Ce JSON est une **illustration**, ni un format de production ni un contrat validé. Les effets M03 doivent utiliser ses paramètres existants (`kind`, `mode`, `baseDamage`, `feasible`, `defender`, `penetration`), toujours validés par le MJ ; le texte libre ne devient pas un bonus numérique.

### A.2 Trois axes indépendants

- **Compétence d'exécution** : caractéristiques brutes, maîtrises, bonus effectifs M01 et fonctions M03.
- **Connaissance et complexité** : sort connu, discipline, architecture et Cercle de **conception** attestés ; cercle d'**activation** éventuellement plus faible selon MAG-050.
- **Énergie et intensité** : réserve personnelle, réserve externe, difficulté, durée, intensité intrinsèque d'un effet/matrice ; **aucune égalité automatique** avec niveau ou Cercle.

## B. Objet magique : deux compteurs séparés

Le futur contrat doit distinguer explicitement :
- `energyStored` / `energyCapacity` : énergie disponible, mesurée dans l'unité énergétique que le créateur décidera.
- `usesRemaining` / `usesLimit` : nombre d'activations autorisées, y compris si la source `caster` fournit du mana.
- `energySource` : matrice, porteur, environnement ou autre source approuvée.
- `trigger` / `activationCircle` : droit de déclencher, conditions, sécurité, temps de préparation et permissions MJ.
- `matrixIds` / `itemId` : liaison stable aux objets existants et plusieurs matrices sur un même support.
- `builder`, `provenance`, `workOrders`, `failureLog` : identité, fabrication, contrôles et essais.

**Compatibilité absolument nécessaire :** le champ historique `charges` de `alrick.grimoire.v1` n'est pas réinterprété automatiquement. Il ne sera mappé vers aucune propriété nouvelle avant arbitrage écrit de DG04-06 et réalisation d'une migration non destructive préservant l'original.

### B.1 Exemple d'artisan : outil de sécurité (fictif)

Support : lampe de la mairie *hypothétique* ; matrice A pour lumière, matrice B pour signal de surcharge ; alimentation externe ou stockée à définir ; usage plafonné ou non à arbitrer ; panne = arrêt sûr, pas explosion narrative automatique. Le groupe peut séparer ferronnerie, recherche, installation et vérification. Les métiers réels de forge, architecture et surveillance restent utiles.

## C. API fonctionnelle à prévoir (design, aucune implémentation)

1. `validateMagicIntent` : vérifie règles du monde, faisabilité, apprentissage, Cercle, composantes matérielles, état d'objet, objet existant, permissions.
2. `estimateMagicCost` : sélectionne un **modèle économique versionné** (A/B/C) et renvoie coût, entretien, énergie externe, avertissements ; ne modifie rien.
3. `resolveMagicIntent` : délègue le jet à **M01 ou M03**, ne fait pas de calcul interne concurrent.
4. `commitMagicEvent` : enregistre, sous autorité future, débit atomique et effets ; gestion de révisions et idempotence impérative avant réseau. Dans le prototype local, signaler l'absence de serveur autoritaire.
5. `exportMagicSnapshot` : sauvegarde versionnée avec `extensions` et archive historique brute, sans promotion automatique des statuts `demo` ou `campagne`.

La résolution manuelle reste disponible pour les interventions divines, la création de conscience, les immunités et phénomènes cosmologiques non convertibles à une formule.

## D. UX : un tour de jeu rapide sans masquer les règles

**Vue PJ (3 opérations utiles)** : sélectionner un sort connu → ajuster une option simple si autorisée → confirmer le coût et lancer / consigner. Afficher conditions refusées en langage clair ; jamais de bouton « utiliser quand même » si le moteur juge l'action impossible.

**Vue MJ et inventeur** : fiches détaillées, plans de matrice, protocole de test, validation des matériaux, approbation des variantes et traçabilité d'une campagne.

**Outils non-combattants** : filtres « atelier, exploration, mairie, médecine, transmission, commerce », aucun avantage universel de +X pour une simple étiquette de domaine.

## E. Recherches de groupe et fabrication

**Programme de recherche** : intention → hypothèse → études → matériaux → prototype → essais M01/M03 → risques → verdict du MJ. Chaque étape peut être suivie dans un `WorkOrder` indépendant, et rejouée en partie sans fixer d'événement historique de l'Odyssée d'Orin.

**Garde-fou :** les compétences de plusieurs personnes ne se somment pas en une maîtrise magique supérieure par défaut. Les Cercles ne deviennent pas des nombres de dés supplémentaires.

## F. Livrables futurs CONDITIONNELS

Après phase C : spécification de `alrick.magic.v2`, prototypes, import/export tolérant, tests sur N1/5/10/15/20/25, matrices C1→C8, IX, usages combinés, consommation d'énergie et d'activations distinctes, interruptions, contrôles MJ et M03. **Ne pas modifier G-001/PR #55 sans coordination explicite.**


## Addendum de conception — ledger de récupération (Phase C, 1er novembre 2026)

Le créateur privilégie coûts **C** et récupération journalière par repos sûr, prière et repos prolongé (détails dans `MAG_002_DECISIONS_A_SOUMETTRE.md`). Pour éviter qu'un joueur puisse enchaîner des pauses artificielles, envisager un `RecoveryLedger` par personnage, journée de campagne et réserve, **non validé comme format définitif** :

- `dayKey` / `restPeriodId` : journées et périodes de repos effectivement achevées, définies par le moteur de campagne et le MJ, jamais par l'horloge du navigateur.
- `shortRestsCompleted` (maximum de test : 2), `manaRecoveredToday` et `dailyRecoveryCeilingRate` pour que les avantages 20 / 40 / 50 / 60 / 100 % soient des **plafonds alternatifs**, non des bonus additifs.
- `restType`, `safeLocation`, `focusedPractice`, `exceptionalLocationApproval`, `interrupted` et `gmDecision` : propriétés de l'événement attesté, pas des capacités auto-déclarées client faisant autorité.
- Une récupération ne crédite que `max(0, min(floor(rate * manaMax) - manaRecoveredToday, manaMax - manaCurrent))` pour les plafonds à taux fixe d'une même journée. Chaque gain validé incrémente `manaRecoveredToday` sans permettre d'en reconstituer le crédit après une dépense ultérieure.
- Aucun repos personnel ne recharge automatiquement `ItemInstance.energyStored` ni ne restaure `usesRemaining`. Les sources et transferts doivent être arbitrés à part.

La pratique spirituelle n'est ni une garantie d'intervention divine, ni un accès au Cercle IX. L'équivalence éventuelle prière/rite/méditation pour traditions non religieuses fait partie de l'arbitrage restant. Prévoir des tests de récupération partielle, reprise après interruption, sauvegarde/import, changement de jour en jeu, déconnexion et bilan mage/hybride.

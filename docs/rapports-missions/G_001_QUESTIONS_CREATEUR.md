# G-001 — Questions de règles à arbitrer par le créateur

**Statut :** questions ouvertes ; aucune réponse n'est appliquée comme règle canonique.  
**Dossier :** [PR #55](https://github.com/Sijiel44/archives-alrick/pull/55), [DG-04](https://github.com/Sijiel44/archives-alrick/pull/65) et rapport `G_001_RECONCILIATION_GRIMOIRE_5D6.md`.

## Question prioritaire QG-01 — Que représente une « charge » ?

Le comportement expérimental conservé de #55 débite une charge par activation **même** quand `energySource=caster` débite simultanément le mana du porteur. **Est-ce intentionnel ?**

| Choix à confirmer | Impact lors d'une activation `matrix` | Impact lors d'une activation `caster` | Activation lorsque charges=0 ? |
| --- | --- | --- | --- |
| A. Charge = unité d'énergie | Charge −1, mana 0 | Charge inchangée, mana −coût | Oui si mode caster et mana suffisant |
| B. Charge = nombre d'usages | Charge −1, mana 0 | Charge −1, mana −coût | Non dans les deux modes |
| C. Mana exclusivement lorsque caster | Charge −1, mana 0 | Charge inchangée, mana −coût | Oui en mode caster ; sous réserve autre restriction explicite |
| D. Consommation combinée configurable | Charge et/ou mana selon recette validée | Charge et mana selon recette | Dépend des conditions du modèle approuvé |

**Conseil de formalisation :** préciser séparément `energySource`, `activationUses` et `chargeEnergy` si les deux notions sont retenues ; ne pas renommer les champs de sauvegarde existants sans migration et tests historiques.

**Essais à rejouer après décision :** zéro charge, mana insuffisant, activation réussie/ratée, refus avant confirmation, double clic ou nouvelle tentative, concentration et entretien, reconnexion, export/import, objet disparu, matrice C8/C1.

## QG-02 — Entretien d'un effet soutenu

Une matrice alimentée par charges et produisant un effet à concentration paie actuellement son entretien depuis le mana du porteur. Faut-il autoriser un entretien autonome par objet, un entretien mixte, ou imposer le porteur ?

**Conséquence :** définir l'épuisement, l'interruption au manque de mana et la traçabilité de chaque tour/segment narratif. Ne jamais assimiler un tour à des secondes réelles sans règle explicite.

## QG-03 — Objet supprimé ou déplacé

L'activation est refusée si l'`itemId` manque. La suppression de l'objet doit-elle aussi **interrompre immédiatement** un effet déjà créé, ou seulement empêcher les prochains usages ? Faut-il permettre le transfert de la matrice vers un autre `itemId` par action MJ journalisée ?

## QG-04 — Attestation du Cercle IX

Confirmer la forme acceptable de l'attestation divine du MJ et sa portée (révocable, liée à une campagne, à un personnage ou à une source). Le **niveau 25 ne l'accorde pas**, et un artefact ne confère pas le Cercle de conception. Ne pas altérer rétroactivement les épisodes d'Orin et Freya.

## QG-05 — Effets permanents et intensité

Quels effets permanents requièrent double confirmation MJ ? Comment fixer `effectLevel` d'un artefact sans le confondre avec `level` du porteur ni avec `architectureCircle` ? Aucun ajustement de l'échelle cosmologique ne découle des tests.

**Action attendue :** consigner les choix du créateur dans une décision versionnée avant toute nouvelle sémantique et tout déploiement. G-001 conserve provisoirement l'ancienne logique sans la canoniser.

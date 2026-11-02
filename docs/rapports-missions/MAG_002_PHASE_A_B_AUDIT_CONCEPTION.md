# ARCHIVES D'ALRICK — MAG-002 · Audit et conception de l'économie magique

**Mission :** MAG-002 — Grimoire, sorts, ingénierie d'objets et économie du mana  
**État :** PHASES A/B — ÉTUDE, simulations analytiques, **aucune règle adoptée**  
**Référent :** Grimoire et systèmes magiques  
**Date :** 31 octobre 2026 (Québec)  
**Dépôt :** `Sijiel44/archives-alrick` · **Branche documentaire :** `conception/mag-002-mana-sorts-objets`  
**Contrats consultés :** M01, M02, M03, M04/M04.1, M05, G-001 [PR #55](https://github.com/Sijiel44/archives-alrick/pull/55), T-001 [PR #66](https://github.com/Sijiel44/archives-alrick/pull/66), `CONTRAT_EDITORIAL.md`, `content/univers/magie-pour-jouer.md`.  
**Portée :** exclusivement conception et propositions de laboratoire. Aucune retouche de code, sauvegarde, cosmogonie ou page canonique.

## 1. Existant : ce que disent réellement les fichiers

| Source | Constat vérifiable | Conséquence |
| --- | --- | --- |
| `quartz/components/scripts/atelier5d6.inline.ts` | Le générateur de personnages de niveau 5 donne 36 mana si `masteries.magie + masteries.runes >= 2`, sinon 0. `manaMax` est aussi éditable. | Un mage et un hybride satisfaisant le même seuil obtiennent initialement la même réserve ; aucun barème de classe n'existe. |
| Même fichier, `levelResourceGain` et `gainBetween` | Une réserve positive croît de +6/niveau (N2–12), +12 (N13–20), +24 (N21–24) et +36 (N25). | La réserve d'un personnage magique créé au N5 passe de 36 à 306 au N25, sans nouvelle décision de mana. |
| `content/jouer/systeme-5d6-base12.md` | Anciennes hypothèses 3/6/12 et récupération à éprouver ; texte explicitement historique et expérimental. | Ni 3/6/12 ni récupération complète ne sont des décisions canoniques. |
| `quartz/components/scripts/atelier5d6-grimoire.ts` (G-001) | Six sorts de démonstration : coûts 2, 2, 3, 4, 4, 16 ; concentration/entretien ; ressources débitées même si le jet échoue après confirmation. | Ces valeurs servent aux tests du prototype, pas à fixer des coûts futurs. |
| M01/M03 | Total = naturel 5d6 + `effectiveStat` + `effectiveMastery` + situation ; M03 impose défense, absorption, faisabilité et effets validés. | Aucune deuxième formule de jet ou d'impact n'est nécessaire. |
| `content/univers/magie-pour-jouer.md` | Mana = alimentation ; maîtrise = finesse, sécurité et tenue ; Cercle = architecture ; créativité = savoir-faire. Aucun seuil chiffré de mana canonique. | Ne pas déduire l'intensité, le Cercle ou l'autorité divine du niveau ou de la réserve. |
| G-001 | Une matrice `energySource=caster` débite actuellement mana **et** une charge. Une matrice C8 préfabriquée peut être activée en C1 selon MAG-050. | Énergie et nombre d'usages à distinguer conceptuellement ; comportement G-001 non modifié avant arbitrage. |

### 1.1 Réserves actuelles : projection contrôlée

Pour **une même fiche magique créée au N5 avec 36 de mana**, puis montée dans l'Atelier sans reconfiguration manuelle :

| Niveau | Maximum mana | Lecture |
| ---: | ---: | --- |
| 1 | 12 *hypothétiques* | Sensibilité théorique d'un novice doté d'une réserve ; le constructeur moderne n'attribue pas automatiquement 12 au N1. |
| 5 | 36 | Valeur effective de départ du constructeur magique. |
| 10 | 66 | 36 + cinq gains de 6. |
| 15 | 114 | 36 + 7 × 6 + 3 × 12. |
| 20 | 174 | 36 + 7 × 6 + 8 × 12. |
| 25 | 306 | 174 + 4 × 24 + 36. |

Le non-mage construit au N5 reste à **0 mana** tant qu'une règle / action validée n'ouvre pas explicitement une réserve. **Un objet autonome** ne doit pas lui attribuer artificiellement une maîtrise ou une réserve personnelle.

### 1.2 Risques détectés

1. **Coûts fixes trop faibles à haut niveau** : un sort de démonstration à 4 mana est alimentable **9 fois au N5** contre **76 fois au N25**, depuis une réserve pleine. Ce calcul n'intègre ni échec, ni récupération, ni disponibilité du sort.
2. **Impact M03 plus fort au niveau élevé** : pour une attaque fictive de base 3, maîtrise Magie brute 2 au N5 et 8 au N25, M03 donne respectivement un impact brut **7** et **23** si le jet réussit, avant protection et affinité. La dépense fixe 4 n'accompagne pas cette progression.
3. **Accès et spécialisation confondus** : actuellement deux points cumulés en Magie/Runes suffisent à ouvrir 36 mana, indépendamment de la spécialisation choisie. Cela ne doit pas être transformé sans décision en classes fermées.
4. **Récupération non formalisée** : aucune boucle autonome et officielle de récupération de mana par scène/repos n'a été établie dans le moteur G-001. Ne pas inventer des regains à partir des PV.
5. **Matrice et double débit** : `charges` confond usages et énergie ; choisir une sémantique nouvelle avant une migration sûre détruirait potentiellement la compatibilité.

## 2. Trois modèles économiques à comparer — chiffres EXPÉRIMENTAUX

Les catégories sont des **intentions/conséquences**, **pas des Cercles** :
- **Geste mineur** : lumière faible, poussière, marque visuelle sans avantage automatique, recherche de confort.
- **Action significative** : magie susceptible d'apporter un avantage chiffré, d'augmenter la puissance ou de contourner un obstacle ordinaire ; résistance ou conditions si nécessaire.
- **Action majeure** : changement d'échelle, effet puissant ou soutenu, construction complexe ; prérequis et validation MJ obligatoires.

Soit `R = manaMax`. Les résultats ci-dessous représentent le **coût initial d'un acte**, pas son entretien.

| Modèle | Mineur | Significatif | Majeur | Principal risque |
| --- | --- | --- | --- | --- |
| **A — Valeurs fixes comparables aux démos** | 2 | 4 | 16 | Les capacités qui progressent avec M03 deviennent trop faciles à répéter au N25. |
| **B — Part proportionnelle de réserve** | ceil(0,05R) | ceil(0,12R) | ceil(0,25R) | Un effet utilitaire identique devient absurdement cher avec la progression. |
| **C — Hybride (candidat à tester)** | **2 fixes** | max(4, ceil(0,12R)) si puissance croissante | max(8, ceil(0,25R)) si puissance majeure | Doit distinguer effet stable et effet qui progresse réellement, sans complexifier l'interface. |

**Ces coefficients sont des hypothèses de laboratoire.** Le coût exact dépendra également de l'intention, de la portée, de la durée, de la faisabilité et des prérequis. Aucun sort n'acquiert un effet par achat de mana seul.

### 2.1 Tableau de simulation (mineur / significatif / majeur)

| Niveau | Réserve R | A : fixes | B : proportionnels | C : hybrides |
| ---: | ---: | --- | --- | --- |
| 1* | 12 | 2 / 4 / 16 | 1 / 2 / 3 | **2 / 4 / 8** |
| 5 | 36 | 2 / 4 / 16 | 2 / 5 / 9 | **2 / 5 / 9** |
| 10 | 66 | 2 / 4 / 16 | 4 / 8 / 17 | **2 / 8 / 17** |
| 15 | 114 | 2 / 4 / 16 | 6 / 14 / 29 | **2 / 14 / 29** |
| 20 | 174 | 2 / 4 / 16 | 9 / 21 / 44 | **2 / 21 / 44** |
| 25 | 306 | 2 / 4 / 16 | 16 / 37 / 77 | **2 / 37 / 77** |

* N1 : réserve de 12 assumée uniquement pour sensibilité, pas un personnage créé automatiquement.
* C ne met **pas** la taxe de 12 % sur les sorts utilitaires qui ne gagnent aucune portée, intensité ou efficacité : leur tarif fixe (à décider) est distinct d'une action de combat dont M03 augmente l'impact.
* Ces coûts ne traduisent pas directement les niveaux d'effet `effectLevel` et ne changent pas les Cercles.

### 2.2 Jouabilité par réserve pleine — sans récupération

| Test | A (fixes) | C (hybride) |
| --- | ---: | ---: |
| N5 : actions significatives à la suite | 9 | 7 |
| N25 : actions significatives à la suite | 76 | 8 |
| N5 : actions majeures théoriques à la suite | 2 | 4 |
| N25 : actions majeures théoriques à la suite | 19 | 3 |

Le N5 n'a **pas** automatiquement accès aux sorts majeurs ; il s'agit de plafonds énergétiques abstraits, indépendants de l'apprentissage et des Cercles. Pour les effets majeurs au N25, la limitation par prérequis/concentration reste indispensable.

### 2.3 Simulations de scènes concrètes sous C

- **Mage N5, R=36** : deux gestes (2×2), trois actions significatives (3×5), une manifestation majeure accessible dans sa tradition (1×9) : **28 mana dépensés, 8 restants**. Une récupération expérimentale de 20 % de la réserve ajoutée une fois après repos sûr rend 7 mana, soit 15 restants.
- **Mage accompli N25, R=306** : trois gestes (3×2), trois actions significatives (3×37), deux majeures (2×77) : **271 mana dépensés, 35 restants**. Un repos sûr à +20 % une fois rend 61 mana, soit 96 restants.
- **Apprenti N1, R=12 hypothétiques** : deux gestes (4) et une action significative (4) laissent 4 mana ; les pratiques supérieures restent interdites par la connaissance même avec 12 mana.
- **Non-mage, R=0** : aucune dépense de mana personnel possible ; un outil magique autonome préfabriqué reste envisageable sous les conditions MAG-050 et du MJ, sans création automatique de compétence.

Ces scénarios mesurent la **consommation**, pas les chances de succès, la durée des combats ni les coûts de fabrication. Ils ne constituent pas une vraie séance de playtest.

## 3. Trois politiques de récupération — à faire arbitrer

| Politique | Exemple expérimental | Avantage | Risque |
| --- | --- | --- | --- |
| R0 : récupération seulement après repos prolongé sûr | Retour à la réserve pleine après un vrai cycle de repos | Gestion facile et tension en aventure | Peut punir l'exploration et les usages créatifs quotidiens. |
| R1 : petite récupération entre scènes | +10 % de R après une transition significative | Encourage la magie au quotidien | Optimisation abusive par scènes artificiellement répétées. |
| **R2 : récupération limitée par repos sûr** | +20 % de R **une fois par expédition** ; repos prolongé sûr → recharge complète | Réserve quelques moments de liberté sans permettre un débit infini par combat | Exige de définir « expédition », repos sûr, interruption et moyens externes. |

**C + R2** est la combinaison recommandée pour **prototype uniquement**, pas pour le canon. Tester au minimum 0/1/3 repos, repos interrompu, potions, équipement et lieux énergétiques. Toute recharge d'objet est une opération distincte d'une recharge personnelle.

## 4. Vérification de probabilités / contrat M01–M03

**Sans défense**, 5d6 a exactement 7 776 issues équiprobables. Pour des personnages illustratifs (pas des builds déclarés complets) :

| Cas | Esprit brut | Magie brute | Bonus effectif total | Succès DD21 | Succès DD27 |
| --- | ---: | ---: | ---: | ---: | ---: |
| N5 | 9 | 2 | +6 +1 = +7 | ~84,8 % | ~30,5 % |
| N25 | 27 | 8 | +9 +3 = +12 | ~99,3 % | ~77,9 % |

Énumération analytique des 7 776 combinaisons, échecs naturels 5–7 appliqués ; **pas** exécution `npm test` ni du moteur M03 ici. Avec une cible, M03 ajoute résistance, absorption, impact et impossibilités : une probabilité DD seule ne prédit ni blessures ni états. Les personnages ne réussissent pas un effet ontologiquement interdit même avec cinq 6.

**Point de vigilance :** dans G-001 la pratique personnelle utilise le niveau du lanceur comme entrée `level` de M03 ; une matrice utilise `effectLevel`. Les coûts proposés doivent reconnaître cette différence sans modifier la formule M03 ni déduire automatiquement `effectLevel` du Cercle.

## 5. Architecture des sorts et de l'ingénierie (sans code)

Une **définition d'effet** est partagée et versionnée, puis référencée sans être copiée dans quatre usages :

1. `EffectDefinition` : domaine/tradition, intention, cible, portée, durée, intensité préparée, résistances applicables, contraintes, interruption, origine, statut documentaire.
2. `SpellRecipe` : références à un ou plusieurs effets, prérequis de pratique, variantes approuvées, coût calculable, préparation, validation MJ. Elle n'accorde jamais automatiquement un Cercle.
3. `MatrixDesign` : architecture conçue, Cercle d'architecture, Cercle d'activation, règle de déclenchement, compatibilité de support, contraintes de sécurité et liens aux effets.
4. `ItemInstance` : objet réellement possédé dans l'inventaire, stable `itemId`, matrice(s) installée(s), état matériel, provenance, énergétique et journal ; une absence d'objet interdit l'activation.
5. `CastEvent` / `WorkOrder` : décision d'un joueur ou artisan, validation des prérequis, réservation de ressources, appel M01/M03, commit de la dépense et historique, sans transférer de permission MJ à partir d'un simple export.

**Énergie et activations doivent être séparées dans le futur schéma :** `energyStored` / `energyCapacity` (quantités énergétiques) et `usesRemaining` / `usesLimit` (nombre d'activations). La propriété G-001 `charges` doit rester **inchangée** jusqu'au choix du créateur et à une migration conservatoire versionnée. Une même matrice peut être reliée à un anneau, un atelier de forge ou un bâtiment, mais une instance ne crée pas à elle seule l'objet encyclopédique canonique.

**Flux joueur simple :** *choisir effet → ajuster intention/portée/durée → voir coût + conditions + risques → confirmer → lancer 5d6 / résoudre M03 → voir effet et historique*.  
**Mode avancé MJ/artisan :** *Laboratoire → variations/recherches → architecture → objet de l'inventaire → source énergétique → tests/sécurité/arrêt → validation*.

**Interface proposée :** quatre espaces — Mes sorts, Laboratoire magique, Atelier d'enchantement, Codex et recherches. Une fiche avancée est accessible par « Détails » plutôt que d'encombrer le tour de jeu.

## 6. Douze sorts de démonstration, sans valeur canonique

| Exemple non canonique | Domaine / intention | Usage / limite clé | Cercle de conception **illustratif** |
| --- | --- | --- | --- |
| 01 Lueur de veille | Lumière / produire | Éclairage local sans révéler les secrets | I |
| 02 Souffle d'atelier | Vent / déplacer | Nettoie des copeaux, sans exécuter le métier | I |
| 03 Lecture des remous | Eau / révéler | Indices visibles, sans prédire l'avenir | I |
| 04 Étincelle maîtrisée | Foudre / attaquer | M03, résistance et absorption | I |
| 05 Chaleur de forge | Feu / entretenir | Maintenir une petite température, sans matériaux gratuits | I |
| 06 Fil de repère | Lumière / relier | Marque un chemin accessible, pas de téléportation | I |
| 07 Voile provisoire | Magie / protéger | Concentration, protection validée MJ, pas d'immunité | II |
| 08 Sceau de rangement | Runes / organiser | Inventaire et contenu physiques, aucun espace infini | II |
| 09 Onde apaisante | Soins / assister | Confort et secours, pas de guérison universelle | II |
| 10 Balise d'atelier | Terre / alerter | Signal de vibration local, ne remplace pas la surveillance humaine | III |
| 11 Entrelacs de chantier | Création / coordonner | Plusieurs artisans/runes, maintien et conditions collectives | IV |
| 12 Onde du rempart | Terre / impacter | Architecture VIII préconçue, déclenchement I possible via matrice ; jamais destruction automatique | VIII |

**La liste n'est pas une distribution validée des Cercles ou des traditions.** Les neuf premiers n'attribuent aucun droit canonique ; les sorts non approuvés restent des expériences de campagne. Chacun devra recevoir coût, portée, résistances, effets, limites et risques distincts après Phase C.

## 7. Trois objets expérimentaux + deux créations libres

| Objet proposé | Matrices / énergie | Ce qu'il démontre |
| --- | --- | --- |
| **Anneau de balise** | Matrice de lumière préparée ; capacité et usages distincts | Petit outil utilitaire du voyageur, sans nouvelle maîtrise. |
| **Outil runique d'artisan** | Énergie stockée ou alimentation externe ; une matrice pour échauffer, une pour alerter | Plusieurs matrices, fabrication, entretien, artisanat et sécurité. |
| **Sceptre du rempart** | Architecture d'effet VIII, déclenchement I reconnu, stockage ou mana du porteur à arbitrer | MAG-050, protection M03, objet absent, refus, énergie/activations dissociées, IX interdit. |

**Sort personnel créé par joueur :** « Souffle qui révèle une trace » — variation de Souffle d'atelier orientant des poussières visibles sur une surface, **sans perception surnaturelle cachée** ; la demande inclut méthode, portée réduite, coût estimé, accord du MJ et nouvelle version locale.  
**Objet conçu par artisan :** « Lampe de sécurité de la mairie » — support matériel existant, lumière + alerte, conditions d'entretien, arrêt d'urgence et journal, équipe de techniciens ; exemple de campagne indépendant non canonique, pas un bâtiment annoncé comme existant dans le récit.

**Collaboration** : rechercher en groupe autorise la répartition des tâches (conception, fabrication, alimentation, sécurité) mais ne somme pas automatiquement les Cercles ni les bonus au-delà des contrats M01/M03.

## 8. Matrice de couverture des essais prévus

| Catégorie | Preuve requise en Phase D/E |
| --- | --- |
| Données et versionnement | Import/export sheets v1/v2/v3, campaign v1/v2, grimoire v1 + extensions inconnues, provenance et `legacyOriginal`. |
| Parité moteur | Fixtures T-001 N5, N10, N15, N20, N25 ; statistiques brutes >12 ; naturels 5–7, impossibilité et défenses M03. |
| Accessibilité de la magie | Mage N1/N5, hybride N5, non-mage N5, métier non combat, petits effets et maîtrise distincte. |
| Mana et repos | Trois modèles économiques et trois récupérations, tour/scène/voyage, entretien, repos interrompu, réserves épuisées. |
| Matrices et objets | C1 → C8 valide, dispositif inexistant, itemId perdu, transfert, plusieurs matrices, recharges, usages épuisés, interdiction IX. |
| Social / recherche | Soin sans guérison automatique, fabrication collective, mairie, transmissions et protection civile. |
| Jouabilité | Parours rapide en PJ, mode avancé MJ, limites explicites et **essais humains**. |
| Sécurité | Autorisation MJ locale ≠ serveur ; future idempotence, révision, transaction, provenance et sauvegardes non destructives. |

## 9. Recommandation et décisions attendues

**Hypothèse prioritaire pour la prochaine étude : modèle hybride C + récupération limitée R2**, car il préserve le coût des petits gestes, limite le spam des effets qui s'amplifient avec M03 et évite de faire du Cercle un multiplicateur d'énergie. Cela **n'est pas encore une recommandation d'adoption canonique**.

**Dépendances de Phase C à soumettre au créateur :**
1. La réserve actuelle 36→306 doit-elle rester, être réévaluée ou déclinée selon formation magique ? Quelle différence objective entre spécialisé et hybride ?
2. Les coûts des effets M03 doivent-ils suivre une fraction de réserve, leur intensité réellement choisie ou un coût fixe avec limitation d'usage ? Peut-on volontairement réduire l'intensité sans enfreindre M03 ?
3. Quels repos rendent du mana, à quelle fréquence, avec quels plafonds ? Les objets et potions sont-ils exclus du même quota ?
4. Quelle interprétation des charges MAG-050 : énergie, nombre d'activations ou consommation combinée ? **Pas de changement du comportement G-001 avant réponse.**
5. Qui entretient un effet de matrice ? Que deviennent effets, historiques et objets supprimés ? Quels critères d'approbation pour un objet permanent et un effet IX ?

**Bilan de phase :** A (audit/documentation) réalisée ; B (calculs analytiques et modèles comparés) réalisée **sur données synthétiques**, mais **aucun prototype logiciel, test npm, CI ou playtest** n'a été exécuté au titre de MAG-002. C (arbitrage créateur) attendue ; D/E (implémentation/recette) non entamées.

## 10. Sources précises

- [Atelier moderne](https://github.com/Sijiel44/archives-alrick/blob/main/quartz/components/scripts/atelier5d6.inline.ts) : `levelResourceGain`, `data-origin-build`, `manaMax`, `mana` et sauvegardes.
- [M01 progression](https://github.com/Sijiel44/archives-alrick/blob/main/quartz/components/scripts/atelier5d6-progression.ts) ; [M03 combat](https://github.com/Sijiel44/archives-alrick/blob/main/quartz/components/scripts/atelier5d6-combat-m03.ts).
- [Origines](https://github.com/Sijiel44/archives-alrick/blob/main/quartz/components/scripts/atelier5d6-origins.ts) ; [Grimoire sur #55](https://github.com/Sijiel44/archives-alrick/blob/feat/grimoire-5d6-v1/quartz/components/scripts/atelier5d6-grimoire.ts).
- [Guide de magie](https://github.com/Sijiel44/archives-alrick/blob/main/content/univers/magie-pour-jouer.md) ; [système 5d6 historique](https://github.com/Sijiel44/archives-alrick/blob/main/content/jouer/systeme-5d6-base12.md).
- [Contrat éditorial](https://github.com/Sijiel44/archives-alrick/blob/main/CONTRAT_EDITORIAL.md) ; [fixtures Tables #66](https://github.com/Sijiel44/archives-alrick/pull/66).


## Addendum — 1er novembre 2026 : orientation du créateur en Phase C

**État : choix de direction recueilli ; formulation technique à confirmer et à tester.** Ce passage n'efface pas la comparaison historique R0/R1/R2 ci-dessus. Le créateur préfère le **coût hybride C**, les **repos courts sûrs à +20 % de la réserve (jusqu'à deux par jour)**, le **repos prolongé à +50 % par journée** et la **possibilité d'une recharge totale avec repos prolongé et prière**. Sur repos court sûr, une prière pourrait permettre **20–60 %**, selon des modalités encore à calibrer.

**Proposition anti-abus pour le laboratoire :** plafonds *journaliers non cumulables* (20 % un court ; 40 % deux courts ou court avec prière structurée ; jusqu'à 60 % court en lieu favorable exceptionnel ; 50 % journée prolongée ; 100 % journée prolongée avec prière). Le jour peut comporter plusieurs phases, mais seul le plafond journalier le plus élevé s'applique au total de mana regagné. La prière court/long n'est pas un multiplicateur additionnel, les repos inachevés ne rapportent rien, et le stock ne dépasse jamais le maximum. Arrondi de simulation : partie entière inférieure de `taux × manaMax` ; convention à confirmer.

**Simulation depuis 0 mana :** N5/R36 → repos court 7, deux courts 14, long sans prière 18, court rituel exceptionnel 21, long avec prière 36. N25/R306 → 61, 122, 153, 183, 306. Un personnage à 0 mana qui ne fait que des journées de repos prolongé sans prière remonte en **deux jours** (50 % + 50 %). Un seul cycle prolongé avec prière peut lui rendre 100 %. La définition de « journée », du lieu sûr, de la pratique permise pour toutes les traditions, des interruptions et des consommables doit encore être validée.

Référence détaillée : `docs/rapports-missions/MAG_002_DECISIONS_A_SOUMETTRE.md` (C-01). Cette orientation **ne valide ni un changement de code, ni une règle canonique, ni une modification de G-001**.

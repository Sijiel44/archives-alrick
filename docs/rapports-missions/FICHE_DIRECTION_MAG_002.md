# ARCHIVES D’ALRICK — RAPPORT DE MISSION

## MAG-002 — Étude du Grimoire, de l’économie du mana et des objets magiques

**Date :** 31 octobre 2026 · **Référent :** Grimoire et systèmes magiques  
**Dépôt :** \`Sijiel44/archives-alrick\`  
**Branche documentaire :** \`conception/mag-002-mana-sorts-objets\`  
**Coordination :** G-001/PR #55, T-001/PR #66, M01–M05  
**STATUT : PHASES A/B DOCUMENTÉES — VALIDATION DU CRÉATEUR ATTENDUE ; AUCUN DÉVELOPPEMENT MAJEUR.**

### Analyse de l’existant

- Le constructeur donne **36 mana à un N5 magique**, avec progression conditionnelle **66 (N10), 114 (N15), 174 (N20), 306 (N25)** ; N1=12 n’est qu’une simulation, non une attribution automatique.
- Les six sorts de G-001 coûtent 2 à 16 mana, avec des règles d’usage expérimentales. Un sort d’attaque à 4 mana peut théoriquement être lancé 9 fois avec 36 mana contre 76 fois avec 306, sans récupération ; M03 augmente aussi l’impact des attaques.
- Aucun système complet de récupération de mana n’est encore adopté ; les coûts 3/6/12 des textes historiques ne sont **pas** officiels. Mage et hybride ayant le même seuil de Magie/Runes reçoivent initialement la même réserve.

### Trois modèles comparés — non canoniques

| Modèle | Mineur | Significatif | Majeur |
| --- | --- | --- | --- |
| A — fixe | 2 | 4 | 16 |
| B — proportionnel | 5 % de la réserve | 12 % | 25 % |
| C — **hybride à tester** | **2 fixes** | max(4 ; 12 % de la réserve) si impact évolutif | max(8 ; 25 % de la réserve) |

Sous C : **N5** = 2/5/9 mana ; **N25** = 2/37/77 mana. Le coût d’un geste utilitaire stable ne doit pas augmenter mécaniquement avec le niveau. À tester avec **R2 : récupération 20 % une fois par expédition**, suivie d’un repos long sûr — hypothèse, pas règle.

### Architecture proposée

Une même **définition d’effet** versionnée peut alimenter sort personnel, rituel, rune et matrice d’objet. Quatre interfaces futures : **Mes sorts**, **Laboratoire magique**, **Atelier d’enchantement**, **Codex et recherches**.  
**Fabrication :** support d’inventaire réel, matrices, prérequis, source d’énergie, entretien, provenance, sécurité et essais. **Séparer l’énergie stockée et les nombres d’utilisations** ; ne pas réinterpréter \`charges\` de G-001 sans arbitrage.  
**Démonstrations conceptuelles :** 12 sorts, 3 objets, variante inventée par un joueur et outil de mairie conçu par un artisan, tous **non canoniques**.

### Preuves et réserves

Calculs déterministes issus du code existant et probabilités par énumération théorique des 7 776 résultats 5d6 ; **aucun test npm, Chrome, CI, utilisateur ou nouvelle implémentation MAG-002** à créditer. Les fichiers d’analyse seuls sont ajoutés à une branche séparée. Aucun canon, aucune sauvegarde, aucune règle M01/M03 modifiés.

### Arbitrages attendus

1. Courbe de réserve et différence mage spécialisé/hybride/non-mage.
2. Modèle de coût et récupération des réserves, usages gratuits limités.
3. Charges, mana du porteur, entretien et interruptions des matrices.
4. Fabrication d’objets, Cercles, recherches collectives, validation MJ.
5. Autorisation d’un **prototype de laboratoire**, distinct de l’implémentation canonique.

**VERDICT :** étude de conception recevable pour une revue créative ; **Phase C nécessaire avant Phase D**. Pas de fusion ni publication automatique, pas de migration destructive ni remplacement de G-001.

**Rapports :** \`MAG_002_PHASE_A_B_AUDIT_CONCEPTION.md\`, \`MAG_002_DECISIONS_A_SOUMETTRE.md\`, \`docs/magie/MAG_002_ARCHITECTURE_MODULAIRE_PROPOSITION.md\`.

# B-003.1 — Canonisation du vivant et autonomie du monde

**Portée :** règle applicable au monde entier, au Bestiaire B-003.1 et à B-004 ; documentation de préparation, **sans adoption automatique** des 41 espèces.

## Règle directrice

Les Montagnes de l'Aube, et l'univers entier, existent indépendamment des voyages d'Orin ou des connaissances d'Alrick. Le créateur peut décréter canonique une espèce ou un caractère précis, sans partie jouée. Le cadre canonique d'un territoire peut donc accueillir un nouvel organisme sans que son existence ait été racontée dans la campagne. En revanche, aucune observation, rencontre ou découverte attribuée aux personnages ne peut être créée rétroactivement.

## Les trois autorités séparées

| Question | Autorité et preuve | État / propriété |
| --- | --- | --- |
| L'espèce ou la caractéristique existe-t-elle dans le monde ? | Validation explicite et traçable du créateur, nominative ou sur un lot précisément borné | `lore_valide` sur les assertions approuvées |
| Cet événement a-t-il été joué ? | Passage de séance ou source de campagne effectivement jouée | `faits_joues` sur l'événement seulement |
| Une fiche peut-elle paraître publiquement ? | Décision éditoriale de publication + contrôles d'accès et spoiler M05 | `publish`, `visibilite`, `unlisted` et politique Quartz indépendantes |

Les éléments encore soumis à arbitrage gardent `proposition_non_jouee` ; une hypothèse d'alimentation ou de migration garde `hypothese` ; des lacunes restent `a_verifier`. **Le statut de synthèse ne remplace pas le statut par affirmation.** Exemple : espèce `lore_valide` ; habitat régional `lore_valide` ; période migratoire `hypothese` ; scénario de secours `proposition_non_jouee` ; aucune occurrence `faits_joues` jusqu'à preuve.

## Décision et traçabilité

1. Définir précisément Pxx et son type : espèce distincte, faune ordinaire locale, population régionale, individu, proposition à revoir, rapprochement possible. Protéger les homonymes et les anciens codes.
2. Consigner l'accord explicite du créateur : date, formulation, auteur, référence de la décision, identifiants des lignes visées (liste ou intervalle explicite), portée des caractéristiques adoptées, réserves et refus. La simple validation du présent principe **ne vaut pas approbation du lot**.
3. Écrire la décision propre à chaque Pxx dans `B003_1_MATRICE_VALIDATION_ESPECES.md`, et idéalement dans un journal d'autorité individualisé. Si seul le nom et l'existence sont approuvés, ne pas canoniser automatiquement la migration, le biotope précis, les formes ou la scène.
4. Confirmer unicité, type et décision avant attribution dans `B002_CODES_VALIDES.json`, puis refléter le code exact dans la fiche. `ESP-` n'est pas automatiquement le type de la faune ordinaire locale ; `VARC-` exige une variante biologiquement fondée, `INDC-` un individu distinct. `BIO-` ne remplace pas les classes de travail H1–H9. Un modèle de chiffres `P5C-` suppose son propre contrat chiffré et ses tests.
5. Distinguer `lore_valide`, événements de campagne et `publish:false`. Aucune promotion publique ni liens M05 sans autorisation distincte et vérification d'accès.

## Cas de décision possibles

- **Adoption d'une espèce indépendante :** « J'approuve l'existence et la morphologie de P37 comme espèce dans les Montagnes de l'Aube ; sa répartition, sa biologie reproductive et ses illustrations restent à vérifier. » Ceci est un **exemple**, pas une décision reçue.
- **Adoption collective :** « J'approuve l'existence des espèces P21, P22, P23, P24 et P35, sans leurs formes N10–19. » Exemple fictif, à répercuter séparément sur chaque fiche.
- **Existence locale de faune commune :** le bourdon ou la loutre peut être un animal de ce monde sans créer de taxon entièrement nouveau.
- **Événements :** une espèce approuvée peut n'avoir aucun `faits_joues`, et rester inconnue d'Orin.

## État concret au 1er novembre 2026

La PR #73 est un brouillon de **41 concepts non canonisés** ; aucune décision explicite individuelle ni de lot n'est portée dans ses dossiers B-003. `B002_CODES_VALIDES.json` a `attributions: []`. Tous les nouveaux codes attendent une autorisation et les cinq illustrations restent absentes du dépôt. Aucune scène jouée attribuée. Ne pas fusionner ni publier.

**Références effectivement consultées :** `CONTRAT_EDITORIAL.md`, B-001, B-002, 41 fiches et synthèses B-003, GEO-001/009/010/012/013, M03/M05. Volumes originaux et bruts privés : pas de prétention à une relecture intégrale.

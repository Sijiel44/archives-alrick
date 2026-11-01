# MAG-003.E — Audit de sauvegardes, migration et retour arrière

**Archives d'Alrick · 1er novembre 2026** · [PR expérimentale #75](https://github.com/Sijiel44/archives-alrick/pull/75) (DRAFT)  
**Statut :** échantillons synthétiques et fixtures du dépôt ; **aucune sauvegarde personnelle réelle consultée ni publiée**, aucune recette humaine attestée.

## A. Formats et propriétaires

| Format / provenance | Entrée | Conservation attendue | Traitement |
| --- | --- | --- | --- |
| Fiche historique `alrick.sheets.v1/v2` | Conteneur ancien et fiches `legacy` | Brut, caractéristiques, identifiants, provenance, `legacyOriginal` | Import volontaire puis export nouveau `alrick.sheets.v3` |
| Fiche moderne `alrick.sheets.v3` | Atelier M01–M05 | Règles, caractéristiques brutes, maîtrise effective, XP, mana, inventaire | Aucune conversion rétroactive |
| Campagne `alrick.campaign.v1` | État global ancien | `futureEnvelope`, `futureState`, groupes, missions, fiches | Confirmation, export `v2` distinct |
| Campagne `alrick.campaign.v2` | État global moderne | Attributs inconnus de l'enveloppe et du state | Lecture/écriture sans destruction |
| Grimoire `alrick.grimoire.v1` | Sorts, matrices, charges, effets, historiques | `itemId`, Cercles, `energySource`, `charges`, journaux, `legacyOriginal` | Extension optionnelle ; ne jamais inventer un sort |
| Récupération `alrick.mana.recovery.v1` | Ledger MAG-003.A | `journal`, plafonds, jours, `restIds`, crédits réellement consommés | Nouveau `fingerprint?` **optionnel** |
| Rites `alrick.ritual.v1` | B/C/D/E | Contributions, rôles, conditions, événements, reçus | Nouveau `supportRules?` **optionnel**, anciens résultats conservés |
| Extension locale `alrick.mag003c.local.v1` | Rites, récupération, travaux | Identité personnage, `knownRites`, `rituals`, `workOrders` | Import refuse incohérence, pas de migration silencieuse |
| Tables T-001 | `alrick.tables.local.v2` / `alrick.tables.character.v2` | Identités source/instance distinguées | Import partiel, **Grimoire/rituels non transférés** |

## B. Corpus de contrôle réexécutable

| Catégorie | Fixture / script | Évidence accessible | Réserve |
| --- | --- | --- | --- |
| Cas G-001 v2→v3, propriété inconnue, matrice C8/C1 | `scripts/test-5d6-m04-browser.mjs` et `scripts/test-5d6-grimoire.mjs` | CI G isolée [#41336804861](https://github.com/Sijiel44/archives-alrick/actions/runs/41336804861) ; export JSON effectif et assertions maintenues | Test synthétique, pas d'archives privées |
| Campagne v1→v2 avec champs inconnus | Scénario Chrome « G-001 : campagne v1 vers v2 avec extensions inconnues » | Export Blob vérifié dans CI #41336804861 ; champs `futureEnvelope` et `futureState` réassertés | Test Chrome automatisé uniquement |
| Parité des fiches et mathématiques | `scripts/fixtures/5d6-parity-v1.json` | Blob identique entre G et E : `6fe5607ae41847834d89343d66768d308538486a` | Ce corpus ne remplace pas des fiches réelles |
| Repos, débits, journées, plafonds, imports | `scripts/test-mag003a.mjs`, `scripts/test-mag003c.mjs` | Test de suite `npm test` sur E | Rejeu d'un ancien ID sans empreinte volontairement bloqué |
| Compétences, import manipulé et doublons | `scripts/test-mag003b.mjs`, `scripts/test-mag003d.mjs`, `scripts/test-mag003e.mjs` | Vérifier sortie de la CI finale E | Approbation MJ locale non authentifiée |
| Journaux rites et état local | `scripts/test-mag003c.mjs`, `scripts/test-mag003d.mjs` | Roundtrip synthétique et statut de rite | Pas de synchronisation multijoueur |

**Limite des fixtures :** le corpus public ne doit comporter que des données artificielles ou des copies explicitement autorisées et anonymisées. Les fichiers du créateur, des joueurs, les portraits, les secrets MJ et l'historique de la campagne ne doivent pas être poussés dans un dépôt public.

## C. Cas négatifs et traitement conservateur

1. **Schéma inconnu** : refuser en expliquant la version attendue ; conserver l'original pour restauration.
2. **Fiche manquante / stats corrompues / JSON invalide** : refus d'import, pas d'écrasement ; capture anonymisée de l'erreur.
3. **Identifiants dupliqués de fiches ou participants** : refus ; jamais fusionner deux personnes sur la même clé.
4. **Ledger d'un autre personnage** : refus explicite `characterId` ≠ identifiant de fiche, pas de réassociation automatique.
5. **État de mana divergent** : suspendre les récupérations ; comparer fiche, ledger et journaux, laisser le MJ décider d'une transaction de réconciliation documentée.
6. **Identifiant de repos déjà validé, paramètres identiques** : renvoyer le reçu, zéro nouveau crédit.
7. **Identifiant de repos déjà validé, nature/conditions/prérequis/validation différents** : exception « collision », état inchangé.
8. **Journal ancien sans `fingerprint`** : lecture/export **acceptés** ; refuse le rejeu du même ID sans réconciliation. Ne pas fabriquer une empreinte historique a posteriori.
9. **Matrice référant un objet absent** : activation interdite ; conserver la matrice et l'historique pour réparation volontaire.
10. **Extension inconnue ou charge historique** : transporter sans exécuter implicitement ; archiver les éléments non interprétables en `legacyOriginal` et signaler les avertissements.
11. **Rite ancien sans `supportRules`** : résultat déjà enregistré inchangé ; aucune nouvelle aide numérique ne peut être calculée sans contrat.
12. **Export / réimport après rechargement** : reproduire avec données artificielles ; vérifier ID, provenance, journaux et champs inconnus à chaque passage.

Les cas ci-dessus sont des **critères de recette**, pas tous une preuve de test humain achevé. Les tests automatisés existants en couvrent une partie ; la matrice doit être complétée par des exécutions matérielles documentées.

## D. Méthode de sauvegarde avant toute migration

1. Générer un export indépendant de l'état original ; garder le nom, la version, le SHA-256 et la date de test dans un registre **privé**.
2. Travailler sur une **copie** des données et un profil navigateur de test, jamais sur la sauvegarde unique d'un joueur.
3. Lancer `npm ci`, `npm test`, `npm run test:m04:browser` sur le SHA réellement soumis à l'intégration.
4. Importer, consulter les warnings, vérifier les identifiants et l'inventaire. Après confirmation, exporter **vers un nouveau fichier** (ne jamais écraser l'ancien).
5. Comparer les champs connus et inconnus, les tableaux et leur ordre s'il est significatif, les montants, `legacyOriginal` et la provenance.
6. Recharger l'application, répéter l'export/import et vérifier que l'état est identique aux paramètres non volatils près.
7. En cas d'anomalie, abandonner la copie, restaurer **l'original inchangé**. Produire un ticket minimisé avec fixture synthétique reproductible ; ne pas joindre les données réelles.

## E. Risques et arbitrages de compatibilité

- **Énergie / usages d'objet** : `charges` reste un champ historique ambigu. Séparer stockage, alimentation, compteur d'usage, coût et entretien **conceptuellement**, sans conversion de données ni altération des journaux.
- **`energySource=caster`** : risque de consommation simultanée de mana et d'une charge ; signaler au créateur, ne pas « corriger » par une règle inventée.
- **Fraude d'import et autorité** : vérification locale des compétences et des validations, sans valeur de signature ou preuve d'identité réseau.
- **Évolutivité de schéma** : tout changement de format devra obtenir une version explicite, une migration testée non destructive et un chemin de retour arrière.
- **Foi** : aucune conversion foi↔mana, bénédiction ou intervention divine automatique.

## F. Verdict

**Reçu techniquement à titre provisoire :** code de conservation et corpus automatisé synthétique ; [G-001 #74 CI verte](https://github.com/Sijiel44/archives-alrick/actions/runs/41336804861).  
**Non reçu à ce stade :** preuve d'un corpus représentatif de **sauvegardes personnelles autorisées** sur appareils réels, scénario complet multi-appareils humain, réconciliation serveur des Tables et arbitrages énergie/usages.

L'audit ne vaut pas autorisation de fusion, diffusion ou migration imposée aux joueurs.

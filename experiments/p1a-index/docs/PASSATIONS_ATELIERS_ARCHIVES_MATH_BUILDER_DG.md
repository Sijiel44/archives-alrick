# Passations préparées — 11 INDEX / P1-A

**À centraliser par DG.** Questions formulées, aucune validation inter-référents implicitement reçue. Les autres propriétaires conservent leurs sous-arbres et leurs règles.

## 21 ATELIERS — création et expérience utilisateur

- Le formulaire guidé doit-il conserver `recordId` distinct de `identity.definitionId` et `instanceId` ? Quel geste explicite crée une `variantId` (copie, nouvel état de jeu, nouvelle définition) ?
- Confirmez-vous un PNJ narratif **sans** calcul M02 comme chemin principal possible, et une créature dont les variantes descriptives ne recalculent aucune caractéristique ?
- Comment montrer `state.lifecycle` et `state.layer` sans que « validé dans le Studio » signifie « canon » ou « approuvé mécaniquement » ?
- Où montrer avertissements « champ inconnu conservé », « image non autorisée », « sort référencé mais non jetable » et « niveau saisi N25 non financé » ?
- Test demandé : création 11 fiches fictives, variante → scène → snapshot privé ; aucun bonus numérique, malus de flûte ni secret public ; annulation ne touche pas les originaux.

## 04 ARCHIVES — données et sauvegardes

- Quelle enveloppe d'export privé et quelle signature SHA256 faut-il pour certifier une source `Uint8Array` avec BOM/espaces, version et statut intacts ? Le `exportPrivateDataset` labo n'est PAS un format ARCHIVES.
- Quels identifiants/versions doivent être immuables après création et comment gérer deux campagnes portant la même définition ? Quand la correction crée-t-elle une nouvelle `revision` ou un nouvel `instanceId` ?
- Les champs historiques inconnus seront-ils stockés comme blob opaque privé, sous-document libre, ou archive brute ? Comment restaurer `originalVersion`/`status` quand un normaliseur historique les réécrit ?
- Quelle chaîne de preuves et autorisation distincte pour `faits_joues`, `proposition_non_jouee`, `lore_valide`, statut éditorial et affichage public ? Qui peut révoquer/rectifier une attestation ?
- Test demandé : round-trip de chaque type fictif, comparaison des octets d'origine **si réellement fournis**, collision `pj:`/instance, restauration après échec, consommation mémoire/fichiers volumineux, secrets, données externes non homologuées.

## 10 MATH — mécanique, XP, non-régression

- Confirmer que le P1 n'exécute jamais les valeurs de `data.level` comme un achat ou un indice XP. Les matrices N1/5/10/15/20/25 doivent venir de `progressionAtLevel` M01 authentique ; N26 rejeté.
- Les données `mechanics.validationStatus='reported-validated'` doivent être attestées par un port extérieur ; quelle forme de reçu/version/scope est exigée avant qu'une définition puisse devenir calculable ?
- Maintenir séparés `XpSuggestion` INDEX, `previewEncounterXp` MATH, `recordEncounterXpChoice` (journal), `grantAward` M02 (application de fiche). Quelle preuve pour boss + quête, PNJ, one-shot, corrections idempotentes ?
- Statut M03 `absorption` et bonus d'objet : bloqués en données P1 tant que le résolveur et le validateur ne prouvent pas une voie autorisée.
- Test demandé : exécuter `tests/native-core-on-clone.test.mjs` dans le clone complet (npm ci/esbuild), comparer réel TS à tous les six niveaux et 7776 issues 5d6 ; puis tests natifs MATH #99.

## 01 BUILDER / 20 STUDIO / 05 INTÉGRATION

- BUILDER : confirmer port `read source/profile/instance` et `previewNativeLevel` sans DOM ni stockage importés ; règles natives comme services injectés, pas comme script global du site Quartz.
- STUDIO : la scène référence des **instances** de campagne ; elle ne donne jamais un droit de projection par défaut. `makeSelectedPlayerCandidate` n'est **pas** le protocole joueur final ; whitelisting STUDIO reste la seule autorité.
- INTÉGRATION : utiliser **une branche d'assemblage séparée** pour P1 après arbitrage, ne pas copier le laboratoire dans #95 P0 sans accord DG ; conserver les SHAs. P0 #95 reste un chantier distinct ; INDEX #97 conserve son correctif d'ID natif, aucun changement ici.
- QA : tests de pollution prototypes, getters, informations privées dans DOM/JSON/message, médias aux droits incomplets, faux `approved:true`, collisions et import non destructif.

## 00 DG — décisions et validation

Faire arbitrer l'enveloppe P1, la politique de version/attestation, le contrat de stockage, le modèle d'instance/variante et la politique médias **avant toute migration de masse**. Les 11 fixtures sont fictives et ne valent ni preuve de canon ni ouverture du Studio à un nouveau public. Livrables : rapport + fiche + historique comparé + inventaire CORE + sources SHA + logs + ZIP.

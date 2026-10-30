# Audit éditorial et expérience du site — Les Archives d'Alrick

**Date : 30 octobre 2026 · périmètre : branche `main` avant la refonte et modifications de l'atelier `editorial/audit-publication-accueil-20261030`.**

Ce rapport est une **analyse du dépôt et du code de la présentation**, complétée par des contrôles GitHub Actions. **Il ne constitue pas un audit visuel complet du site public** : l'outil web n'a pas pu ouvrir `sijiel44.github.io` dans cette session. Les conclusions relatives à l'expérience sont fondées sur le HTML généré attendu et les composants CSS/TSX, sauf vérification supplémentaire explicitement citée.

## Synthèse opérationnelle

**Décision éditoriale : aucune fiche supplémentaire à canoniser automatiquement.** Un inventaire exhaustif des métadonnées des **331 pages Markdown** de `content/` a recensé les fiches non publiées et vérifié leur état. **Aucune page `publish:false` ne porte `etat_editorial: valide`**. Les brouillons restent à vérifier, ou sont des anciens prototypes explicitement supplantés.

Le chiffre public stabilisé est **177 fiches codées approuvées** (171 lot initial + quatre Déchéance + deux Bible). Les pages de navigation et les trois guides 5d6 expérimentaux **ne sont pas des fiches canoniques supplémentaires**. L'ancien tableau vert/jaune/rouge (109 / 75 / 101 sur 285 entrées) est un **instantané historique**, pas un calcul remis à jour automatiquement lors de la création de nouveaux guides.

**Modification de navigation recommandée et implémentée dans cette PR :** l'accueil doit orienter vers quatre portes, et la bibliothèque consultable doit vivre sur `/bibliotheque`, distincte de l'accueil. Les treize rubriques thématiques deviennent secondaires, regroupées dans un menu dépliant. Le moteur de recherche interne reste accessible dans la bibliothèque.

## 1. Audit de publication

| Catégorie | Diagnostic | Décision |
|---|---|---|
| **177 fiches codées approuvées** | Déjà publiées ; protections des spoilers en place | Maintenir la publication et les statuts |
| **Trois guides 5d6** | Publics mais `proposition_non_jouee` et `en_cours` | Garder publics **comme outils d'essai**, pas canon mécanique officiel |
| **MAG-106 — essai sur la blessure d'Elyra** | `faits_joues` mais `en_chantier` | Relire les sources et les limites avant tout passage au vert |
| **Sept courants divins** | Dossier `lore_valide`, mais `en_chantier` | Distinguer les sept courants attestés de leurs intentions et alliances proposées |
| **Failles entre Couronnes** | Dossier composite `lore_valide` en chantier | Le socle des six passages est déjà publié ; séparer les hypothèses de fréquence, de fermeture et de protocoles |
| **Dix-Huit — répertoire de travail** | `faits_joues` mais ancien brouillon en chantier | Ne **pas** publier de doublon du nouveau `MON-005` déjà validé |
| **Puissances et dragons, consolidation** | `lore_valide` mais en chantier | Exclure les scénarios futurs ; comparer les noms et pouvoirs à la Bible |
| **Lieux, personnes et projets marqués `a_verifier`** | Nombreux brouillons CB1–CB43, certains avec spoilers | Validation documentaire source par source, puis publication par petits lots |
| **Anciennes propositions Déchéance** | `historique`, `publish:false` | Ne pas réactiver les prototypes remplacés |

**À éviter :** basculer une fiche en `publish:true` sur la seule base de son nom, d'un acte déjà joué ou du statut `lore_valide` d'un sous-ensemble. L'état éditorial, le périmètre des sources, les réserves et les spoilers doivent être harmonisés avant le passage en ligne.

## 2. Forces actuelles du site

1. **Univers dense, cohérent et ouvert à d'autres campagnes.** La séparation entre l'univers partageable et la continuité de l'Odyssée d'Orin est réellement présente dans les contenus.
2. **Traçabilité inhabituelle pour une encyclopédie de JDR amateur.** Les codes de fiches, repères CB et statuts `faits_joues / lore_valide / projet / proposition / a_verifier` permettent d'éviter les inventions silencieuses.
3. **Contrôles techniques solides avant publication.** `npm test` vérifie métadonnées, TypeScript, compilation Quartz, liens internes et exclusivité des spoilers ; le déploiement n'est déclenché qu'avec le marqueur de publication.
4. **Fonctionnement utilisable sans compte.** L'Atelier 5d6, ses fiches JSON et le mode MJ-IA fonctionnent sur l'appareil de l'utilisateur et ne téléversent pas automatiquement les notes de campagne.
5. **Identité visuelle assumée.** Palette sombre, cuivre et motifs de montagne donnent une personnalité reconnaissable au projet.
6. **Deux usages compatibles :** lecture de la campagne et création d'aventures indépendantes ; les guides de jeu ne prétendent pas modifier rétroactivement les événements joués.

## 3. Points faibles et remèdes

| Priorité | Point observé dans la source | Risque pour l'utilisateur | Action |
|---|---|---|---|
| **P0** | Accueil combinant grand héros d'Orin + catalogue massif de cartes + texte redondant des quatre parcours | On ne sait pas par où commencer ; plusieurs titres et longs défilements | **Corrigé dans cette PR** : héros d'univers, quatre cartes de parcours, accès Atelier, lien bibliothèque ; déplacer le catalogue |
| **P0** | Navigation latérale donnant un poids égal à ~15 entrées, plus des liens MJ et éditoriaux | Une bibliothèque devient le premier écran, surtout sur mobile | **Corrigé dans cette PR** : six portes/accès puis 13 domaines dépliables et révélations à part |
| **P0** | Accueil, À propos et suivi annonçaient encore 171 fiches sans les six ajouts | Crédibilité et cohérence des chiffres | **Corrigé dans cette PR** : 177 fiches codées, états expérimentaux distincts |
| **P1** | Catalogue initial ouvert directement sur la page d'accueil | Temps de lecture et surcharge cognitive | **Corrigé dans cette PR** : page dédiée `bibliotheque`, recherche + filtre déroulant |
| **P1** | CSS emploie souvent des corps de **11–13px** et un contraste discret sur fond sombre | Confort de lecture variable, notamment sur mobile | Révision typographique (viser 14–16px pour description et contrôles), contrôle réel des contrastes |
| **P1** | Tests de site valident le HTML et les URLs, mais **pas** les clics complets et l'ergonomie clavier du front | Régression JS possible malgré CI verte | Scénarios de test navigateur : recherche, filtre, reset, modales, profil JSON et réouverture SPA |
| **P1** | Les renvois de l'Atelier aux fiches doivent respecter les spoilers | Dévoilement involontaire de contenu | Préserver la recherche via `contentIndex.json` filtré, sans passer aux brouillons privés |
| **P2** | Bibliographie et provenance riches mais dispersées entre pages | Parcours documentaire complexe pour nouveaux MJ | Gabarit unique « ce qui est établi / ouvert / jouable / références » |
| **P2** | Les règles 5d6 et le module Déchéance 2d6 coexistent | Deux moteurs peuvent dérouter les MJ | Expliquer le choix actuellement optionnel ; convertir seulement après playtest |
| **P2** | Éléments de campagne MJ gardés dans HTML malgré `noindex` | Un avertissement spoilers est une protection narrative, **pas un secret technique** | Éviter tout dépôt de secrets confidentiels et conserver la notice explicite |
| **P3** | Pas de suivi d'usage/de performance réel fourni dans le dépôt | Priorisation UX faite par hypothèses | Mesurer taille, chargement, recherches, mobile et retours volontaires lors de vrais essais |

## 4. Architecture de navigation cible

```text
Accueil — « Les Archives d'Alrick »
├── Découvrir l'univers
├── Jouer dans ce monde
│   ├── Système 5d6 — pilote
│   └── Atelier interactif / profils JSON
├── Lire l'Odyssée d'Orin — avertissement avant révélations
├── MJ assisté par IA
└── Bibliothèque complète (page séparée, recherche + domaine)
    └── 13 rubriques documentaires détaillées

Navigation secondaire repliable : domaines, continuité de campagne, Archives MJ.
```

**Principe visuel :** une information principale par niveau : le monde et sa promesse → choix du visiteur → action concrète → encyclopédie → sources. L'accueil n'est **ni un sommaire exhaustif ni une fiche de continuité**.

## 5. Travaux à poursuivre par ordre

### Phase 0 — publication et recette des parcours
- Fusionner **après `npm test` réussi** et vérifier le déploiement Pages sur `main`.
- Vérifier en vrai navigateur la nouvelle page d'accueil sur **mobile/desktop**, la bibliothèque avec filtre, recherche, bouton de réinitialisation et accès clavier.
- S'assurer que les fiches à spoilers restent **non indexées**, avec avertissement replié.

### Phase 1 — enrichir le monde à partir du canon existant
- Corriger **MAG-106 (Elyra)** et son état avant d'envisager sa publication.
- Distinguer les **sept courants reconnus** de toute interprétation à valider, sans extrapoler des accords divins.
- Revoir les dossiers **Failles / Dragons / Couronnes** après comparaison à la Bible V01.
- Remonter les **lieux CB1–43** dont les bases sont confirmées ; publier une fiche seulement quand les réserves sont explicitées.

### Phase 2 — rendre le monde immédiatement jouable
- Compléter **l'Atlas praticable** : territoires, routes, contacts, risques, institutions et niveaux de connaissance locale.
- Produire des **profils de PNJ et créatures JSON** reliés à une fiche canonique, avec stats 5d6 **non canoniques tant qu'elles ne sont pas validées**.
- Tester la progression libre en **12 niveaux** et les incidents d12 sur des scénarios variés, puis préciser les talents de départ et les effets d'objets, sans « +1 » en série.
- Améliorer le flux MJ-IA : provenance des fiches, groupe de personnages, journal local indépendant et précautions sur les secrets.

### Phase 3 — expérience, qualité et montée en puissance
- Simplifier les fiches trop longues, ajouter des chemins « première visite » et des liens d'étape.
- Faire un audit d'accessibilité WCAG de base (contraste, taille, clavier, titres) et un audit de performance mobile réel.
- Mettre en place des tests de parcours complets (automatisés si possible).
- Décider d'une **harmonisation 5d6 / Déchéance** uniquement après essais comparatifs.

## 6. Questions et limites

- Aucune nouvelle fiche non publiée ne peut être promue sans **relecture et validation des sources**.
- La refonte s'appuie sur le **code des pages**, pas sur une capture visualisée dans cette session ; une vraie recette visuelle reste nécessaire.
- Les **177 fiches codées** ne doivent pas être confondues avec les **pages HTML générées**, qui comprennent index, tags et autres routes.
- Les anciens chiffres **285 entrées / 109 vertes / 75 jaunes / 101 rouges** restent un **inventaire historique**, pas une décomposition exhaustive actuelle des 331 Markdown.
- Chaque nouvelle campagne doit garder son journal et ses choix séparés de l'histoire fondatrice d'Orin.

**Références internes :** `content/index.md`, `content/a-propos.md`, `content/suivi-editorial.md`, `quartz/components/Alrick.tsx`, `quartz/styles/custom.scss`, `scripts/check-content.mjs`, `scripts/check-site.mjs`, `CONTRAT_EDITORIAL.md`, historique des lots approuvés et CI GitHub Actions.

# CHRON-001 — Contrat de séparation éditoriale proposé

**Version :** étude du 4 novembre 2026. **Propriétaire :** 36 ✍️ CHRONIQUES. **Statut :** proposition, non adoptée ; aucune modification de canon. Le document complète `CONTRAT_EDITORIAL.md` sans le remplacer.

## A. Trois axes indépendants

**Axe 1 — nature du document (proposition de vocabulaire, non implémentée)**

| Type | Définition |
|---|---|
| `brut_campagne` | Original intègre de séance ou conversation, source première d'un récit de table |
| `transcription_campagne` | Reproduction textuelle fidèle et versionnée de l'original |
| `adaptation_litteraire` | Texte scénarisé, condensé ou réécrit à partir d'une source, distinct du mot à mot |
| `oeuvre_originale` | Nouvelle fiction, même inspirée d'Orin, sans prétention de reconstituer des faits joués |
| `idee_lore` | Proposition documentée pour le monde commun à soumettre à LORE |
| `ressource_mj` | Aide, guide, amorce ou variante de table ; jamais un événement joué par définition |

**Axe 2 — statut de vérité :** réutiliser les valeurs existantes `faits_joues`, `lore_valide`, `declaration`, `projet_en_cours`, `hypothese`, `proposition_non_jouee`, `historique`, `a_verifier`. Une scène jouée dans une campagne n'est pas automatiquement le lore partagé ; une adaptation publiée ne transforme pas ses ajouts littéraires en faits joués. Appliquer des mentions **par assertion** si une page mélange plusieurs états.

**Axe 3 — traitement et diffusion :** conserver `etat_editorial`, `publish`, `visibilite`, `spoilers`, `unlisted`, `portee`, `public_cible`, `usage_en_jeu`, `source_brute`, `ancre_documentaire`. Les quatre décisions « rédigé », « vérifié », « autorisé » et « effectivement publié » sont différentes. Une fiction extérieure au canon doit afficher « fiction autonome / hors canon » plutôt que réutiliser `faits_joues` abusivement.

## B. Les cinq couloirs demandés

| Couloir | Preuve / responsable | Sortie autorisée |
|---|---|---|
| **Campagne brute** | Version, empreinte, original, provenance ; ARCHIVES/LORE | Hors site tant que droit et niveau de divulgation non validés |
| **Fait joué** | Ancre de campagne et recoupement | Journal de la table concernée, pas canon universel |
| **Récit publié** | Texte édité, crédits, licences, feu vert DG et intégration | Lecture explicitement étiquetée « adaptation » ou « œuvre originale » |
| **Inspiration de lore** | Fiche candidate, source et différence narrative | Dossier de proposition LORE ; pas de promotion automatique |
| **Ressource MJ** | Public, origine, facultativité, contrôle spoilers | Outil jouable, sans imposer une scène ni une règle chiffrée |

Un même événement peut exister en brut, être noté comme fait joué et être adapté en chronique. Ce ne sont **pas cinq cases exclusives**.

## C. Circuit de validation proposé

1. **Réception / provenance :** identifiant d'œuvre, version, auteur(s), édition, campagne, sources et ancrages ; jamais d'import automatique d'un original privé.
2. **Droits / consentements :** préciser propriétaires des textes, personnages originaux, illustrations, enregistrements et contributions ; autorisations exactes de citation, adaptation, crédit, diffusion publique et supports. Contrôler informations personnelles et pseudonymes. Les licences techniques du dépôt n'autorisent pas la republication des créations.
3. **Adaptation / cohérence :** plan des arcs et chapitres, cahier de continuité interne, tableau source → scène → ajouts / coupes / ambiguïtés ; ne pas compléter un fait historique par vraisemblance.
4. **Revues :** CHRONIQUES relit l'œuvre ; LORE examine uniquement ce qui prétend rejoindre l'univers commun ; ARCHIVES vérifie provenance et empreintes ; QA vérifie liens, crédits, spoilers et métadonnées ; AVE relit une éventuelle transformation en scénario.
5. **Décision DG/créateur :** œuvre et version approuvées, crédits, publics, formats, politique de retrait et absence éventuelle de calendrier imposé. Aucune décision implicite par `publish: true`.
6. **Intégration :** publication seulement par le circuit de PR, CI sur SHA final, revue de page rendue, contrôle du chemin public et possibilité de retour arrière ; INTEGRATION conserve la main sur le déploiement.
7. **Après publication :** journal de corrections, signalements, rectificatifs et retraits possibles. Une ancienne version dans Git public peut demeurer accessible ; anticiper cet effet lors de la première mise en ligne.

**Confidentialité :** `unlisted: true` et `spoilers: true` limitent l'exposition et préviennent les lecteurs, mais ne sécurisent aucun secret. Ne jamais inclure notes privées MJ, sauvegardes ou contenu non autorisé dans une branche publique, même en brouillon.

## D. Position de l'Odyssée d'Orin

L'Odyssée sert à la fois de **campagne particulière** (faits de jeu vérifiables) et de **laboratoire créatif**. Une adaptation peut réordonner ou réinventer les péripéties, à condition d'être identifiée comme œuvre distincte. Aucune réécriture ne devient une correction de la campagne brute. Elle n'est **pas automatiquement** le préquel de l'époque future « environ 500 ans plus tard », laquelle demeure une piste non canonisée. Toute idée transférable prend la forme d'une fiche candidate LORE avec décision explicite.

## E. Exemple observé et point de contrôle

Le récit `content/chroniques/cb44-la-bicoque-le-canard-et-les-caves.md` se décrit comme une chronique **non littérale** ancrée sur CB44 CCCX–CCCXIX ; le `content/jdr-alrick/cb44-bilan-et-reprise.md` documente séparément les scènes et la reprise au chapitre CCCLXXIII. L'un n'est pas substituable à l'autre.

**Écart non résolu :** ces pages mentionnent `Campagne_Brut_4.4(1).docx`, alors que le registre d'import `sources/campagnes/README.md` indique `Campagne_Brut_4.4(2).docx`. Ne pas conclure à une erreur sans comparaison des fichiers et empreintes. Les quinze sources annoncées au registre ne sont pas directement authentifiées par CHRON-001.

## F. Impacts et décisions ouvertes

- **Studio / sauvegardes :** dérivés locaux, versions stables ; projection joueur à liste blanche et sans données MJ.
- **MATH / INDEX / Bestiaire :** un récit ou une image ne crée aucun effet, pouvoir ou profil canonique ; réemployer les contrats validés.
- **Communauté :** chaque récit contributeur exige crédits et consentements propres ; droits de pseudonyme et de retrait à documenter.
- **Quartz :** aucun changement de routes ou de métadonnées de production dans CHRON-001.

**Arbitrages DG/créateur :** (D1) valider les trois axes ; (D2) autoriser ou non les fictions originales hors canon sur le site ; (D3) définir licence et preuve des droits ; (D4) politique de divulgation des bruts et séparation secrets/spoilers ; (D5) arbitrer l'identité éditoriale d'une Odyssée réécrite ; (D6) autoriser ultérieurement les gabarits/écrans après revues. **Aucun arbitrage n'est présumé adopté.**

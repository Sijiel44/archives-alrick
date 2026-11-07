# UX-STUDIO-001 — Cockpit MJ : débutant / expert, maquettes non exécutables
**21 ATELIERS, coordination 01 BUILDER + 20 STUDIO · 6 novembre 2026 · P1 CONCEPTION SEULEMENT**

## Intention et limites
L'expérience cible demeure un **site web accessible au navigateur**, avec cockpit MJ local, sauvegardes vérifiées, dossiers historiques comme sources, ateliers cohérents (PJ, PNJ, créature, objet, capacité, sort/rite), référencement INDEX, mécanique seulement via contrat officiel et projection joueur **strictement à liste blanche**. Le Studio doit pouvoir servir des campagnes *créées par n'importe quel MJ*, pas imposer l'Odyssée fondatrice. Il n'exige pas de reprendre tout le matériel ancien d'emblée.

Ces maquettes sont des **wireframes textuels** destinés à revue architecturale et tests rapides. Aucun HTML/CSS/route de production, aucun chargement automatique de la charte ardoise/cuivre/or dans #95 ou le site. Le bon flux de stockage/permissions P0 (réconciliation `pendingStudioOp`, sauvegardes ARCHIVES, projection whitelist) prime sur l'esthétique.

## 1. Architecture d'information candidate
```text
COCKPIT MJ
├─ Accueil / Mes campagnes (locales ou importées, source et dernière sauvegarde)
├─ Démarrer en 15 minutes (assistant one-shot, annulable)
├─ Campagne libre (mode expert : scènes, acteurs, chronologie, tables, notes)
├─ Bibliothèque (sources / définitions / variantes ; filtres statut-canon-époque)
├─ Ateliers (PJ, PNJ, créatures, objets, capacités, sorts/rites)
├─ Journal & sauvegardes (versions, exports, imports, conflits, récupération)
└─ Présentation joueur (sélection publique, aperçu, confirmer, CLEAR)
```

L'utilisateur peut **changer de mode d'affichage sans changer le modèle de campagne ni perdre de données**. Les fonctions expertes restent accessibles à la demande, pas cachées derrière une migration irréversible. Les raccourcis agissent sur le même contrat de données. Chaque écran indique de façon non décorative la campagne, la sauvegarde et si le contenu est **MJ privé**, **aperçu public**, ou **publié explicitement**.

## 2. Parcours A — MJ débutant : one-shot fictif en 10–15 gestes
Objectif : réussir une première séance sans devoir connaître toutes les formules ni reconstruire les fiches historiques.

1. **Créer campagne locale** : titre, période fictive, groupe; la sauvegarde est initialisée avec une identité propre.
2. **Choisir scénario** : « rive embrumée » purement fictif ou canevas vide; durée/difficulté descriptives.
3. **Ajouter PJ** : importer v2/v3 via aperçu ARCHIVES, afficher version/provenance et doublons avant confirmation.
4. **Choisir les personnages** : identité de campagne propre, aucune adoption automatique de stats.
5. **Choisir une créature** : définition source → aperçu M04 → copie d'instance STUDIO, confirmation explicite.
6. **Choisir un objet** : définition descriptive, aucune charge ni valeur inventée.
7. **Créer une capacité** : référencer INDEX ou « narration seulement ».
8. **Préparer scène 1** : titre et description publique, notes privées dans panneau distinct.
9. **Ajouter participants** : les IDs d'instances sont visibles dans une liste de participation; aucun clone silencieux.
10. **Vérifier le scénario** : liste de contrôle champs, provenance, données inconnues et droits images.
11. **Prévisualiser côté joueur** : **nouveau DTO** ne contenant que ce qui est coché; aucun message envoyé.
12. **Confirmer et afficher** : action MJ explicite, destination 4174 et reçu de projection si disponible.
13. **Changer de scène** : CLEAR avant toute nouvelle projection; secret MJ jamais envoyé.
14. **Exporter CONFIDENTIEL** : succès après écriture attestée; afficher nom, révision, empreinte.
15. **Tester restauration** : aperçu diff, conflit, consentement; sans écrasement silencieux.

À chaque moment, le MJ peut **enregistrer un brouillon**, quitter/reprendre, revenir au Studio; la vue ne présume pas qu'un jet ou une capacité devrait automatiquement s'appliquer.

## 3. Parcours B — MJ expert : campagne libre
Point d'entrée : campagne existante ou import contrôlé, sans passer par le tutoriel.

- Vue campagne multi-scènes : chronologie, factions, quêtes, relations, notes et rencontres sous onglets/commandes, sans affichage des champs privés côté joueur.
- Bibliothèque : recherche `definition / variant / instance`, filtres par provenance, statut de canon, publication, fait joué et règles M01–M05. Dupliquer produit une **instance** ou **nouvelle version** identifiée, jamais une mutation cachée.
- Ateliers : inspecteur de prérequis, différences de version, adaptations legacy en quarantaine; vue avancée sur les références mécaniques `pending/native-reference`, sans bouton d'application non homologué.
- Rencontres : menace et assistance PNJ de niveaux variables référencées sans déduire un barème XP ou valider une récompense. Affichage MATH consultatif seulement quand le port natif l'autorise.
- Scènes et tables : changement de scène provoque CLEAR; partage toujours initié depuis un aperçu whitelist; reprise après panne et conflits de sauvegarde exposés.
- Portabilité : export campagne et sélection de sources à importer avec provenance, empreinte et politique `no-overwrite`; les vieux backups non attestables restent bloqués.
- Accès tablette : sélection visible et commandes primaires accessibles au toucher, clavier intégral sur ordinateur.

## 4. Maquettes texte — structure, pas style de production

### A — Accueil / débutant
```text
┌─────────────────────────────────────────────────────────────────────────┐
│ CHRONIQUES D’ENTRE-RIVES     [Campagne: aucune]      [Sauvegarde: —]     │
│ Accueil  Bibliothèque  Ateliers  Journal                         Aide  │
├─────────────────────────────────────────────────────────────────────────┤
│ Préparer une partie                                                     │
│                                                                         │
│ ┌─────────────────────────────┐  ┌───────────────────────────────────┐  │
│ │ DÉMARRAGE GUIDÉ             │  │ CAMPAGNE LIBRE                    │  │
│ │ 15 gestes, sauvegarde locale│  │ Ouvrir / importer / continuer     │  │
│ │ [Créer un one-shot fictif]  │  │ [Ouvrir le cockpit expert]        │  │
│ └─────────────────────────────┘  └───────────────────────────────────┘  │
│                                                                         │
│ Dernière partie [nom] [reprise]   Import confidentiel [prévisualiser]   │
│ Aucun fichier existant supprimé ; sources historiques conservées.     │
└─────────────────────────────────────────────────────────────────────────┘
```

### B — Éditeur de scène (débutant et expert)
```text
┌───────────────────────────────────────────────────────────────────────────┐
│ Campagne FICTIVE / Scène Rive      [MJ PRIVÉ]  [Enregistré r7]          │
├─────────────────┬──────────────────────────────┬────────────────────────┤
│ Étapes          │ SCÈNE                        │ INSPECTEUR             │
│ ✓ PJ            │ Titre : Rive au premier jour│ Définition / instance  │
│ ✓ Créature      │ Description PUBLIC proposée │ Provenance + statut    │
│ → Scène         │ [Texte d’aperçu]             │ Références M03/M04     │
│ ○ Présentation  │                              │ Champs inconnus (0)    │
│                 │ NOTES PRIVÉES MJ             │ Droits image [inconnus]│
│                 │ [Zone distincte protégée]    │                        │
│                 │ Participants [liste IDs]     │                        │
├─────────────────┴──────────────────────────────┴────────────────────────┤
│ [Enregistrer brouillon] [Valider MJ] [Aperçu joueur sans publication]   │
│ État : copie STUDIO liée / ou « reprise requise, aucune seconde copie » │
└───────────────────────────────────────────────────────────────────────────┘
```

### C — Porte de présentation (contrôle de divulgation)
```text
[STUDIO MJ / PRIVÉ]                   →   [PRÉVISUALISATION JOUEUR]
Titre public     ☑ approuvé                Titre public
Description      ☑ approuvée               Description approuvée
Illustration     ☐ droits inconnus         Aucune illustration
Participant X    ☐ non approuvé            Aucun identifiant privé
Notes secrètes   [jamais sélectionnables]  (absentes du DTO)
[Actualiser l’aperçu]  [Publier explicitement]  [CLEAR / Révoquer]
```

### D — Console de reprise sans duplication
```text
ÉCRITURE INTERROMPUE — [MJ PRIVÉ]
Journal ATELIERS trouvé : oui / non  |  Source : [ID+version]
STUDIO mémoire : cr-01             ARCHIVES durable : cr-01 / absent
Statut : [REUSABLE] / [UNPERSISTED] / [CONFLICT] / [AMBIGUOUS]
Identité, campagne, source, hash et version vérifiés ?
[Relire les deux sauvegardes] [Confirmer MÊME ID] [Arrêt sans mutation]
Une ancienne archive non attestable ne débloque aucun bouton de création.
```

## 5. États vides, erreurs et récupérations
| Contexte | Message utile et action sûre | Risque à interdire |
|---|---|---|
| Première ouverture sans campagnes | « Aucune campagne locale. Créer / importer en aperçu. » | remplir le cockpit de fausses données canoniques |
| Source historique non reconnue | « Schéma inconnu — original conservé, adapter à arbitrer. » | coercition ou perte des inconnus |
| Collision ID/version | « Source différente pour le même ID — comparer, ne pas écraser. » | fusion silencieuse |
| Variante sans moteur | « Mécanique indisponible — utiliser narration, demander référence native. » | stats fabriquées |
| Image sans droits | « Illustration privée uniquement — droits à confirmer. » | publication automatique |
| Échec enregistrement avant STUDIO | « Journal non durable — aucune copie créée. » | retenter en boucle |
| Échec après copie STUDIO | « Copie peut exister : relire ARCHIVES, confirmer le même ID. » | deuxième création / source seulement en mémoire |
| Données STUDIO et ARCHIVES discordantes | « Conflit de provenance, intervention MJ. » | « forcer » sans preuve |
| Reprise ancienne sans journal | « Historique non attestable — nouvelle version requise, données préservées. » | détruire un ancien backup |
| Prévisualisation joueur | « Aucun champ envoyé. Vérifier sélection. » | DTO campagne complet |
| Player READY non reçu / changement de scène | « Présentation révoquée / CLEAR. » | SHOW automatique |
| Zoom tablette / clavier | erreurs résumées, focus sur premier champ invalidé, ordre conservé | piège clavier ou bouton trop petit |

Les erreurs restent **persistantes jusqu'à correction** dans un statut `role=status`, relié aux champs `aria-describedby`. Pas de toast fugitif seul. Les échecs d'archives n'affichent aucun contenu de secret dans logs/DOM/messages publics.

## 6. Direction visuelle *proposée* : ardoise / cuivre / or
Palette candidate (non installée) :
| Jeton | Hex | Usage proposé | Contraste du texte correspondant |
|---|---|---|---|
| Ardoise profonde | `#14212D` | fond cockpit MJ | `#F4EFE5` sur fond : **14,26:1** |
| Ardoise panneau | `#233347` | zones éditables, inspecteur | `#F4EFE5` sur panneau : **11,20:1** |
| Cuivre clair | `#E4B179` | CTA / accent, avec texte sombre | `#14212D` sur cuivre : **8,45:1** |
| Or | `#E9C56E` | aide contextuelle unique, pas badge décoratif | `#14212D` sur or : **9,86:1** |
| Ivoire | `#F4EFE5` | texte principal | valeurs ci-dessus |
| Focus | `#FFE299` | contour focus visible | **12,91:1** avec ardoise profonde |

Rapports calculés suivant la formule de luminance relative WCAG sur ces paires **uniquement** ; cela ne certifie pas toute l'interface. Ne jamais distinguer privé/public par couleur seule : texte explicite, icône + libellé, verrouillage fonctionnel. Aucune surcharge du sens des couleurs par les états canon/joué/validé.

## 7. Ergonomie et accessibilité — critères de revue
- Clavier : ordre Tab logique, Entrée/Espace pour actions, Échap fermant seulement des panneaux sans perdre des données, focus restauré après dialogue ; aucun raccourci global masquant la saisie.
- Touches proposées **à arbitrer** : `Ctrl/Cmd+S` enregistrer brouillon avec consentement, `?` aide, `Alt+J` journal (éviter conflits navigateur/système). Désactivées dans les champs et tant que la sauvegarde n'est pas attestée.
- Tablette 768–1024 px : passage en 1 ou 2 colonnes, inspecteur en panneau dépliable, cible tactile **≥44×44 CSS px**, scroll sans barre horizontale pour le formulaire.
- Zoom 200 % et 400 %, reflow de 320 CSS px, préférence mouvement réduit, mode contraste fort, contenu alternatif des icônes.
- Illustrations : `alt` descriptif, crédit, provenance et droits visibles MJ ; si `rights=unknown`, jamais ajouté au DTO joueur.
- Erreurs de validation : annoncer le titre du champ, conserver les données saisies, liste d'erreurs navigable, éviter le focus volatil après `render()`.
- Mentions de localisation/source du fichier brutes peuvent contenir des secrets MJ ; jamais à exposer dans la fenêtre joueur.
- Tests : axe-core / clavier humain / lecteurs d'écran à prévoir avec 01 et QA ; aucun de ces essais n'a été fait sur ces maquettes texte.

## 8. Arbitrages UX à 01 BUILDER / 20 STUDIO / DG
| Réf | Question | Proposition |
|---|---|---|
| UX-01 | Navigation unique ou deux produits séparés | **Même cockpit**, vues guidé/expert sans double stockage |
| UX-02 | Priorité de l'éditeur de scène sur téléphone/tablette | onglets accessibles / panneau inspecteur repliable |
| UX-03 | États privé vs public | séparation physique des données, aperçu DTO neuf, confirmation explicite |
| UX-04 | Galerie médias | import source+droits+alt avant galerie, jamais publication par défaut |
| UX-05 | Lien avec moteur mécanique | champ « source officielle » en lecture seule et erreur `unavailable` |
| UX-06 | Historique / versionner la variante | commande « créer nouvelle version », aperçu diff, pas de mutation de source |
| UX-07 | Charte ardoise/cuivre/or | revue contraste et test visuel **sur candidat après P0**, pas d'intégration immédiate |
| UX-08 | Session navigateur / reprise | P0 transactionnel en priorité, aucune expérience qui camoufle le blocage |

**Verdict :** maquettes de discussion et critères de recette, pas d'interface définitive ni de nouvelle dépendance de production. Les décisions de stockage/architecture de la DG peuvent modifier le parcours sans invalider les principes de confidentialité et de provenance.

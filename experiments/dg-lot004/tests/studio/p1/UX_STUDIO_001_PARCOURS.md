# UX-STUDIO-001 — conception des parcours one-shot et campagne experte

**Statut : proposition P1 de conception, non montée.** Propriétaire de l'architecture/navigation : **01 BUILDER** ; propriétaire ateliers/créations : **21 ATELIERS** ; responsable usages et confidentialités : **20 STUDIO**. Aucune modification du CSS P0 ni de la fenêtre joueur, aucune fonctionnalité déclarée implémentée par ce document.

## 1. Principes directeurs issus des contrats existants

- Le Studio local repose sur `mountStudio()` : campagne → import PJ prévisualisé → copie de créature → scène → projection à sélection manuelle → export/restauration ; les raccourcis BUILDER sont facultatifs et non mutants (`mountPreviewNavigation`).
- Les créateurs descriptifs ATELIERS lient objet/capacité/créature/scène **sans effets numériques homologués**. Le journal durable `pendingStudioOp` doit empêcher une duplication si la liaison ne se confirme pas.
- L'origine MJ possède des **notes privées** ; l'origine joueur reçoit uniquement `makePlayerProjection()` et un canal `READY/SHOW/CLEAR`. Changer de scène **efface** la sélection et ne republie pas.
- Palette ardoise/cuivre/or déjà esquissée dans `src/studio/ux-ardoise-cuivre-or.proposal.css` : reste une *proposition*, pas une charte validée.

## 2. Mode « one-shot guidé » — scénario de 10–15 gestes, pas de calendrier réel imposé

L'utilisateur choisit dès l'entrée **One-shot guidé** ou **Campagne experte** ; la distinction est une **préférence d'interface**, jamais un schéma incompatible ou un plafond mécanique. Le MJ peut changer de mode sans perdre d'état.

| Écran / geste | Première intention visible | Action principale | Issue et état secondaire |
|---|---|---|---|
| 1. Accueil | Choisir démonstration fictive, one-shot ou campagne existante ; avertir de l'espace local. | `Créer campagne fictive` / `Reprendre`. | Bouton inactif en cas d'origine/magasin absent ; aucun effacement automatique. |
| 2. Campagne | Nom, statut local, dernière sauvegarde durable, mode hors ligne. | `Créer` puis `Continuer`. | Si entrée homonyme, choisir ID existant ou nouveau ; jamais adoption silencieuse. |
| 3. PJ | Zone d'import et sources fictives ; nombre de PJ acceptés. | `Prévisualiser` puis `Accepter`. | Taille/version/ID incompatible lisibles ; 2 PJ = 2 cartes ; rien enregistré pendant aperçu. |
| 4. Créature | Choix de la source BEST et profil, provenance. | `Créer copie pour cette campagne`. | Source immuable, ID de copie affiché en MJ ; éventuel journal `pendingStudioOp`. |
| 5. Scène | Choisir PJ/PNJ/créatures ; public et secret dans deux panneaux séparés. | `Créer scène`. | Notes privées avec libellé **Jamais partagé** ; participants sélectionnables par ID/label. |
| 6. Vérification avant jeu | Résumé personnages, créature, scène et état des sauvegardes. | `Démarrer la séance`. | En absence de durabilité prouvée, avertissement et action de réparation, pas d'état vert mensonger. |
| 7. Joueur | Fenêtre distincte d'origine contrôlée, panneau public initialement vide. | `Ouvrir fenêtre joueur`. | En cas de popup refusée/origine invalide, montrer le refus, ne jamais rabattre vers une fenêtre MJ. |
| 8. Publication | Checklist **Titre**, **Description**, **Acteurs** ; aperçu identique au DTO. | `Publier cette sélection`. | Rien coché = aucune publication ; afficher « visible du côté joueur ». |
| 9. Changement de scène | Liste simple des scènes existantes. | `Ouvrir scène B`. | Toujours `PLAYER_CLEAR` si fenêtre autorisée ; sélectionner à nouveau, jamais SHOW implicite. |
| 10. Continuité | État « sauvegardé / en cours / erreur / conflit ». | `Exporter archive CONFIDENTIELLE`. | Export à ne pas envoyer aux joueurs ; SHA et taille. Aperçu avant restauration. |
| 11. Quitter | Sauvegarde privée et accès au point de reprise. | `Quitter`. | Mode démo : effacement **optionnel**, limité aux ressources attestées et confirmé ; conserver par défaut. |

**Temps d'attention visé** : moins d'un écran de vocabulaire technique par étape ; au plus une action primaire visible. Indicateur « x/y étapes préparées » sans obliger à suivre l'ordre si MJ expérimenté. Niveaux de personnages 1–25 ; ne jamais afficher le niveau comme borne 12. Aucune mise en place automatique de récompense XP ou coût magique.

## 3. Mode « campagne experte » — mêmes données, navigation plus dense

Proposition d'organisation (l'état actuel ne possède pas forcément des sessions formalisées) :

- **Colonne gauche** : campagnes, sessions (proposition future), scènes, recherche par ID/nom ; actions création/duplication sous confirmation.
- **Centre** : scène active — acteurs, description publique, note privée distincte, révisions et point de reprise.
- **Inspecteur droit** : provenance de la fiche/bestiaire, catalogue INDEX, créateurs ATELIERS, effets **désactivés** si contrat absent ; actions de copie clairement séparées des liens.
- **Barre d'état fixe** : hors ligne/stockage, révision enregistrée, export privé, fenêtre joueur connectée (pas autorisée pour autant), état `CLEAR` et lien de reprise.
- **Panneau public** entièrement différent du panneau MJ, accessible par onglet/commande clavier, avec **aperçu DTO exact**. Bouton de publication séparé des boutons de sauvegarde : enregistrer une scène n'envoie rien au joueur.
- **Deux onglets MJ** : bandeau `Une autre vue a modifié cette campagne`, différentiel de champs et actions `Recharger`, `Exporter mon brouillon privé`, `Résoudre le conflit` (selon politique choisie par ARCHIVES). Jamais remplacer un snapshot obsolète sur simple clic.

**Ne pas inventer des capacités persistantes de session** tant que BUILDER et ARCHIVES n'ont pas retenu le modèle et les identités correspondantes. En attendant, tout wireframe doit marquer les sessions comme « concept P1 ».

## 4. États UI et messages de reprise nécessaires

| État | Message recommandé au MJ | Ce que l'interface doit permettre ou refuser |
|---|---|---|
| Vide | « Aucune campagne locale. Créer une campagne ou importer une archive confidentielle. » | Afficher CTA clair ; pas de composant vierge muet. |
| Aperçu import | « Vérifiez le nom, le schéma et l'origine avant d'accepter. » | Aperçu non mutant ; bouton Accepter seulement après validation. |
| Écriture en cours | « Enregistrement en cours — ne fermez pas l'onglet. » | Désactiver actions non idempotentes, conserver le focus/logique, éviter le double-clic. |
| Enregistré | « Sauvegardé localement — révision R. » | Afficher uniquement si adaptateur confirme la durabilité selon contrat. |
| Inconnu | « Enregistrement non confirmé. Vérifier la sauvegarde avant de réessayer. » | Réconciliation/inspecter journal, aucun nouveau create/copy automatique. |
| Conflit inter-onglets | « La campagne a changé dans un autre onglet. Aucun contenu n'a été écrasé. » | Proposer rechargement/export brouillon, jamais dernier-écrivain-gagne silencieux. |
| Sauvegarde ancienne sans journal | « Cette archive ne permet pas d'attester la reprise de l'instance ; intervention MJ nécessaire. » | Bloquer relink/suppression, préserver les deux états. |
| Ambiguïté | « Plusieurs copies sont possibles. Aucune sélection automatique. » | Montrer seulement IDs et provenance MJ, jamais notes privées dans le message. |
| Origine joueur invalide | « Projection désactivée : origine/fenêtre non vérifiée. » | Refuser SHOW et éviter d'ouvrir un contenu MJ en repli. |
| Projection révoquée | « Partage effacé côté fenêtre joueur ; une nouvelle publication est nécessaire. » | CLEAR ; ne pas promettre de retirer ce qui a déjà été vu/copié. |
| Restauration | « Aperçu privé sans modification. Confirmer le remplacement explicite pour appliquer. » | Afficher taille/SHA, collisions, mode fictif/réel et date/identité ; pas de suppression préalable. |
| Hors ligne | « Mode local hors ligne ; bibliothèque distante indisponible. Vos modifications locales sont conservées si le stockage répond. » | Aucun appel réseau de récupération automatique ; commande export accessible. |

Les erreurs doivent avoir `role=alert` ou `aria-live` adapté, conserver l'étiquette du champ et cibler le focus sur le résumé/contrôle pertinent ; la couleur seule ne suffit jamais à coder un état.

## 5. Identité visuelle ardoise / cuivre / or — proposition à approuver

| Token proposé | Valeur | Usage envisagé |
|---|---|---|
| `--slate-950` | `#14212D` | Fond cockpit MJ |
| `--slate-800` | `#233347` | Panneaux et inspecteur |
| `--copper` | `#E4B179` | CTA primaire, filets et boutons |
| `--gold` | `#E9C56E` | Titres/étapes et accent parcimonieux |
| `--chalk` | `#F4EFE5` | Texte et notes publiques/privées (libellés distincts) |
| `--focus` | `#FFE299` | Anneau focus clavier ≥3 px |

Ce jeu de couleurs a fait l'objet de **calculs de contraste exploratoires** dans `L004_REPAIR_UX_PROPOSITION.md`, pas d'une validation navigateur. Examiner les états hover/disabled, textes dans les badges, contours non-textes et contraste de tous les composants ; seuils cibles WCAG 2.2 AA **4.5:1 texte normal, 3:1 UI/non texte**, sous réserve de cas particuliers de la norme.

**Séparation privé/public** : le cuivre/or ne doit pas être le seul indicateur ; bandeau textuel **« PRIVÉ — MJ »**, icône verrou, fond légèrement distinct, puis bandeau **« APERÇU JOUEUR — LISTE BLANCHE »**. Aucun style ou ressource MJ importé par défaut dans le bundle joueur.

## 6. Accessibilité, supports et images — critères vérifiables

- **Clavier** : Tab, Shift+Tab, Entrée, Espace, Escape ; focus restauré après création d'élément ou rerender, aucun piège, ordre correspondant à la hiérarchie visuelle. Les raccourcis ne déclenchent aucune dépense de ressources.
- **Tablette/téléphone** : essai 1280×800, 768×1024, 390×844, zoom 200 %, reflow sans scroll horizontal, cibles tactiles ≥44×44 px recommandées pour l'usage MJ ; zone notes agrandissable, pas de bouton de projection adjacent à Supprimer.
- **Lecteur d'écran** : labels, `<fieldset>/<legend>` pour sélection publique, `role=status` sur sauvegarde, `role=alert` sur conflit ; focus logique lors de changement de scène et du retour de dialogue, annonce CLEAR.
- **Mouvement** : réduire animations si `prefers-reduced-motion`, ne jamais cacher un processus « en cours » uniquement par animation ou couleur.
- **Images** : vignettes facultatives avec placeholder lisible, texte alternatif (fonctionnel ou descriptif selon contexte), provenance et droits visibles côté MJ ; pas de récupération URL distante implicite, pas de SVG/script HTML non fiable, pas de projection d'illustration privée sans case d'autorisation et modèle de droits. Prévoir fallback texte en absence de média ou hors ligne. Ne pas supposer que les cinq illustrations Bestiaire historiques sont autorisées pour toutes les publications.
- **Secrets** : jamais de canari/note privée dans URL, console, aria-label public, DOM joueur, messages, sessionStorage/localStorage joueur, images externes, capture côté joueur. Les tests doivent distinguer l'aperçu MJ privé de l'aperçu réellement public.
- **Réversibilité UX** : bascule guidé ↔ expert doit préserver exactement le même état versionné, les documents non convertis et les notes, sans effet sur les règles M01–M05.

## 7. Maquette fonctionnelle textuelle (pour BUILDER / ATELIERS)

```text
┌ CHRONIQUES D'ENTRE-RIVES · STUDIO MJ [LOCAL / DEMO] ──────── [Sauvegardé R7] ┐
│ Campagne ▸ PJ ▸ Créature ▸ Scène ▸ Aperçu joueur ▸ Export              [?] │
├ CAMPAGNE / SESSIONS    ┬ SCÈNE A                         ┬ INSPECTEUR ┤
│ Campagne fictive       │ Titre et description publique   │ Source BEST│
│ > Séance 1 (P1 concept)│ Participants [PJ-A][PJ-B][CR]   │ Profil v.  │
│ > Scène A [active]     │ ─ PRIVÉ — MJ ───────────────    │ Capacité ? │
│   Scène B              │ Notes secrètes (jamais publiées)│ Provenance │
├────────────────────────┴─────────────────────────────────┴────────────┤
│ APERÇU JOUEUR — LISTE BLANCHE  [ ] Titre [ ] Description [ ] Acteurs    │
│ [Prévisualiser] [Publier sélection] (jamais automatique)   [CLEAR]     │
└───────────────────────────────────────────────────────────────────────┘
```

La disposition est un **schéma conceptuel**, pas une capture ni un écran déjà implémenté. Sur tablette les zones deviennent accordéons/fiches, sans cacher la commande de projection ni l'état de sauvegarde.

## 8. Décisions demandées et plan d'essais UX

1. 01 BUILDER : choisir emplacement du sélecteur guidé/expert, navigation non mutante et système d'état global, sous réserve d'une vraie révision de sauvegarde.
2. 21 ATELIERS : aligner formulaires de création sur les mêmes états erreur/sauvegarde/journal en attente, sans glisser de règles numériques. Lien objet-capacité-créature-scène visible comme **descriptif** et privé.
3. 04 ARCHIVES : exposer états exacts d'écriture/erreur et conflits d'onglets ; éviter que STUDIO affiche « sauvegardé » sur une simple mutation mémoire.
4. 02 QA : tests clavier, contraste, zoom, tablette, lecteur d'écran et images/alt/droits sur prototype navigable, **NON EXÉCUTÉS pour P1**.
5. DG : n'arbitrer le passage à la mise en œuvre visuelle qu'après fixation des contrats de stockage P1 et stabilisation fonctionnelle de #95 P0.

**Aucune feuille CSS chargée, aucune image générée, aucune modification d'interface en production dans cette livraison.**

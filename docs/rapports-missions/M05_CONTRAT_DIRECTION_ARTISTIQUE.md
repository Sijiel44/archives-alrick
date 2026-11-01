# M05 — Contrat pour la direction artistique des Archives

**Statut :** composants fonctionnels proposés, thème visuel provisoire, sans refonte globale Quartz. Aucun portrait canonique créé.

## 1. Composants et états

| Composant | Sélecteurs stables | Propriétés et états |
| --- | --- | --- |
| Conteneur | `.m05-view`, `[data-m05-view]` | essentiel/combat/encyclopedique/pedagogique |
| Présentation | `[data-m05-content]`, `[data-m05-format]` | rendu en lecture, jamais éditeur |
| Identité et portrait | `.m05-heading`, `.m05-identity`, `.m05-portrait` | portrait optionnel ; placeholder neutre |
| Caractéristiques | `.m05-essential`, `.m05-stats`, `.m05-stat`, `.m05-stat-bonus` | brut + bonus simultanés |
| Ressources et combat | `.m05-quick`, `.m05-line` | chiffres lisibles sur mobile |
| Détails | `.m05-panel`, `.m05-panel-body`, `[data-m05-panel]` | `details/summary` natifs clavier |
| Précautions | `.m05-caution`, `.m05-status` | statut local non canonique |
| Guide | `.m05-guide` | accessible en contexte |
| Impression | `@media print`, `[data-m05-format]` | sections filtrées, contrôles absents |

Classes de la v1 d'atelier : `.bestiary-lab`, `.bestiary-tools`, `.bestiary-fields` restent inchangées. Le composant `BestiaryWorkshop.tsx` porte la structure et les styles ; `atelier5d6-m05-sheet-dom.ts` réalise le rendu par `textContent`, non par injection de HTML.

## 2. Tokens de remplacement

Déclarés sur `.m05-view` : `--m05-line` (séparateurs et contours), `--m05-surface` (fond), `--m05-ink` (texte principal), `--m05-accent` (titres). Les couleurs et dimensions intégrées sont **provisoires**, à remplacer par les tokens validés de l'audit DA. Aucun changement du thème global, police, grille Quartz ou moteur 5d6 n'est requis.

### Variantes

- **Essentielle** : nom, catégorie, statut, portrait facultatif, quatre caractéristiques, PV/mana, attaque, défense et absorption visibles sans déplier.
- **Combat MJ** : détails de combat et défenses prioritaires à l'impression.
- **Encyclopédique** : histoire déclarée et sources/lien documentaire prioritaires à l'impression.
- **Pédagogique** : valeurs brutes, maîtrises, calculs et hypothèses à l'impression.

Sur écran, les panneaux restent accessibles dans les quatre variantes. Les modes règlent principalement les **sorties imprimées** afin de ne pas rendre les informations introuvables.

## 3. Mobile, clavier, technologie d'assistance

Grille responsive à une colonne sous 670px ; portraits réduits et toujours facultatifs. Les panneaux natifs `details/summary` permettent interaction clavier, écran tactile et lecture structurée ; états `:focus-visible` visibles. Statuts et en-têtes sont du vrai texte ; aucun chiffre n'est porté seulement par une couleur. `aria-label` nomme la fiche, les formats et l'Atelier. Valider les contrastes en audit DA complet, lecteurs d'écran NVDA/VoiceOver, zoom 200/400 %, orientation et impression paginée dans le navigateur (non exécutés dans cette session).

## 4. Images et provenance

Image autorisée seulement avec URL locale, statut autorisé, auteur, droits et texte alternatif. Sans image, placeholder « Portrait facultatif ». Ne pas intégrer Pinterest, ne pas générer de portraits canoniques. B-002 et la DA arbitrent les ratios source, licences, autorisations et nouvelles illustrations.

## 5. Transmission et limites

| Besoin | Décision | Justification | Autorité | Données échangées | Limite | Validation |
| --- | --- | --- | --- | --- | --- | --- |
| Style | CSS dédié et tokens | Éviter de figer Quartz | DA | classes/tokens | Valeurs temporaires | Audit DA |
| Illustration | Placeholder + asset local approuvé | Droits / accessibilité | DA et éditorial | asset, auteur, alt, licence | Pas de galerie | Revue visuelle |
| Mobile | Grilles fluides | Lecture courte | DA/accessibilité | viewport | Non testé sur appareil réel | Chrome mobile + lecteurs d'écran |
| Impression | `@media print`, ouverture temporaire des détails | Export sans contrôle éditeur | DA/MJ | format, contenu public | Pas de moteur PDF intégré | Prévisualisation Chrome |
| Erreurs et loading | Statut de l'Atelier M04.1 conservé | Limiter duplication | Dev UI | `data-status` | Pas de spinner distant | Recette utilisateur |

L'audit DA n'a pas été confirmé comme fusionné au moment du mandat ; le présent design est explicitement révocable sans conséquence sur les nombres.

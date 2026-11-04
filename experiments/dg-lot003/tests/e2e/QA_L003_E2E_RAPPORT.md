# QA L003-E2E — Nouvelle base applicative corrigée

**Source intégrée courante : `2ab809ef5351940e0fc272b859d10f21de894d00`.** Branche QA reconstruite à partir de cette source avec uniquement les 12 fichiers du sous-arbre QA.

La recette complète L003-01..10 doit être réexécutée sur le HEAD QA descendant de 2ab. Le résultat de cette nouvelle exécution n'est **pas anticipé** dans le rapport versionné ; la description de PR #91 et la fiche DG finale indiqueront le HEAD réellement exécuté et le run correspondant, **sans commit documentaire après le dernier vert**.

## Historique immuable de la source antérieure

# QA — DG-LOT-003 / L003-E2E — rapport de recette indépendante

**Verdict au HEAD QA testé : CORRECTIONS REQUISES — 9 PASS / 1 FAIL / 0 NON EXÉCUTÉ.**  
**Le prototype intégré 4f2 reste non qualifié pour la conservation privée strictement octet à octet. Aucune homologation Alpha.**

## Traçabilité
- Dépôt : `Sijiel44/archives-alrick` ; PR QA brouillon [#91](https://github.com/Sijiel44/archives-alrick/pull/91), base `prototype/dg003-integrated`.
- `sourceIntegrationHead` : `4f2c8e020a7dcf2313610a2eb496a63bfb46dbd2`.
- `testedHead` **réellement exécuté** : `dffb9e28edc34b78270373d01b5b3b9c1e1ddf76`.
- Run QA effectif [41935211125](https://github.com/Sijiel44/archives-alrick/actions/runs/41935211125), job `126941831181` : CI **failure**, parce que le test L003-06 détecte l'écart d'octets. `npm ci`, `npm test`, build, tests unitaires, détection Chrome et checkout exact : **PASS**.
- Ce rapport est ajouté sur un commit documentaire **postérieur au testedHead**. Sa publication ne modifie pas rétroactivement le SHA testé ; si une CI du commit documentaire démarre, l'évaluer séparément. Le nouveau HEAD d'intégration corrigé devra être communiqué avant rebase de QA.

## Résultats réellement observés (Node 24 / Chrome, pages HTTP réelles)
| Scénario | État | Observation |
|---|---|---|
| L003-01 | **PASS** | HTTP 4173/4174, chargement UI |
| L003-02 | **PASS** | Scènes A/B→A, CLEAR, persistance après Recharger campagne, aucune publication automatique |
| L003-03 | **PASS** | v2/v3, score 14, inconnus, multi-sheet refusé sans mutation |
| L003-04 | **PASS** | Créature source/instance, collision sans mutation |
| L003-05 | **PASS** | Vraie popup opener/READY, choix publics après connexion, titre+description visibles et canaris absents |
| L003-06 | **FAIL** | 6 Mio : octets réexportés différents après restauration, malgré taille égale |
| L003-07 | **PASS** | Trois formulaires et persistance |
| L003-08 | **PASS** | Résolution native M03 et refus des familles non homologuées |
| L003-09 | **PASS** | Clavier et étiquetage |
| L003-10 | **PASS** | HEAD exact et ascendance |

Le test L003-05 constate le véritable canal opener/READY, sélection des champs après connexion, réception positive côté joueur et contrôles négatifs de confidentialité. La disparition des cases cochées AVANT la connexion est une **observation ergonomique**, non une fuite : le rendu après READY les remet à false ; le parcours exige un nouveau consentement explicite.

## L003-06 — défaut P1 confirmé
La restauration et le réexport de l'archive synthétique de 6 Mio ont été réellement exercés, avec contrôle de conservation exact en octets, SHA256 et premier offset divergent :

- `actualBytes=6294454` ; `expectedBytes=6294454`.
- **attendu** : `2e8079ef9c32d4038d8cda0bf0d6910e5bab56f83e4c84958e645d67cd8e0e40`
- **obtenu** : `7dd90224b391e90fa7bc6f51128ab6b82f010973c0e25c4ac0317b547d4d5ffb`
- `firstDiffOffset=2477`, octet reçu `113`, attendu `95`.
- **Qualification** : contrat d'octets strict non respecté. Une réorganisation de clés par `archiveToStudio` / `studioToArchive` est cohérente avec le diagnostic indépendant transmis par DG ; ce test ne démontre pas une perte sémantique, ni une fuite MJ.
- Correctif de production réservé à **05 INTÉGRATION** / propriétaire concerné ; QA ne change pas les adaptateurs.

Les comparaisons des gros buffers utilisent désormais `Buffer.compare`, avec diagnostic de taille, SHA256 et premier offset, sans imprimer de diff massif. Le présent run s'est **terminé normalement** par un FAIL du scénario, non par shutdown runner.

## Historique distinct / non réinterprété
- `71af5117` / run `41933138169` : ancien blocage CDP, évaluation en attente.
- `6047aff` / run `41934126677` : 01/03/04 PASS, 02/05 FAIL (cases préconnexion réinitialisées), 06 interrompu par signal runner ; autres non exécutés.
- `9871d988` / run `41934619247` : 01/03/04/05 PASS, 02 FAIL après rechargement sans geste "Recharger campagne", 06 interrompu par signal runner.
- `dffb9e28` / run `41935211125` : **10 scénarios exécutés, 9 PASS et 1 FAIL**.
- Ancien workflow historique `41931744848` : échec Chromium M04 ; ne jamais le déclarer vert. Run historique ultérieur au HEAD QA initial `41933138096` : succès distinct.

## Décision et suite bornée
**CORRECTIONS REQUISES (P1 L003-06)**. Ne pas qualifier la conservation octet exacte ni l'Alpha. Préparer la recette du prochain SHA intégré corrigé, puis contrôler ascendance et SHA exact ; ne pas modifier la branche intégrée ni les règles M01–M05.

Aucune donnée MJ réelle, aucun merge, aucun déploiement Pages, aucune canonisation.

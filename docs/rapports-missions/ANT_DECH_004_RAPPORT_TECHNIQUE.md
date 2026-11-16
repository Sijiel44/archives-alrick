# ANT-DECH-004 — Publication canonique des organisations et raccord au Studio

**Branche propriétaire :** `content/ant-dech-004-organisations` — **statut du rapport :** prêt pour CI/recette distante. **Dépôt :** `Sijiel44/archives-alrick`. **Autorisation :** déclaration explicite du créateur le 15 novembre 2026 : les organisations élaborées ensemble dans le développement du JDR sont canoniques dès ce travail et doivent être publiées ; fournir aussi des images et des fiches techniques.

## Contrat, sources examinées et limites

- Instructions : `AGENTS.md`, `CONTRIBUTING.md`, `CONTRAT_EDITORIAL.md`, protocole éditorial et marqueur Pages.
- Corpus : Déchéance, cinq états, hiérarchie déjà documentée, dossier ANT-DECH-003 et laboratoire LAB-DECH-003 ; PR #126 historique **non fusionnée**, donc pas utilisée comme preuve de publication.
- Portée : **références du monde partagé**, pas placement automatique dans les campagnes ni faits déjà joués. Les individus, profils 5d6 et créatures demeurent sous PNJ/BEST/INDEX/MATH.
- Ordre créateur de publication : ce lot fait exception au principe préalable de brouillon `publish: false` ; chacune des fiches est publique, `lore_valide`, et possède une ancre d'approbation. Aucun secret de mise en scène n'est commité.

## Fiches créées ou reliées

| ID | Organisation publique | Tension fondamentale | Image originale |
| --- | --- | --- | --- |
| `ORG-DECH-01` | Maisons du Seuil Ouvert | Secours ↔ contrôle du départ | `org-dech-01.svg` |
| `ORG-DECH-02` | Chambre des Préventions | Alerte ↔ pré-condamnation | `org-dech-02.svg` |
| `ORG-DECH-03` | Caisse des Veilles | Aide ↔ dette durable | `org-dech-03.svg` |
| `ORG-DECH-04` | Chœur des Derniers Feux | Mémoire ↔ renoncement imposé | `org-dech-04.svg` |
| `ORG-DECH-05` | Conservatoire des Noms | Archive ↔ appropriation | `org-dech-05.svg` |
| `ORG-DECH-06` | Assemblée des Portes Libres | Relève ↔ résistance excessive | `org-dech-06.svg` |

Entrées dans `content/groupes/`, index `organisations-decheance.md`, liens depuis les entrées Groupes, Univers et Menaces. La page d'ensemble donne des intensités narrative de friction à rupture régionale et des résolutions sociales, juridiques, logistiques, d'évacuation et, au besoin, martiales. Les ressources et limites figurent dans les six fiches.

**Illustrations :** six SVG héraldiques conçus pour ce lot et distribués depuis `quartz/static/images/organisations`. Pas d'hébergement tiers, de photo, de portrait sans droits ni lien de téléchargement externe. Chacun possède un texte alternatif et aucune dépendance réseau.

## Interopérabilité : le Studio ne confond pas source et campagne

- `studio-local/catalogue-organisations.json` : six références publiques (IDs, versions SHA blob Git, chemins, images, objectif, interlocuteurs, influence, limites, relations et mots-clés) ; pas de notes confidentielles ni capacités chiffrées.
- `studio-local/bibliotheque.mjs` : **nouveau rayon « Organisations et factions »**. Le catalogue historique demeure épinglé ; intégration additive, sans migration de sauvegardes.
- `studio-local/app.mjs` : fiche publique consultable, action de création d'une **copie locale modifiable** d'une faction ; lien vers l'ID canonique conservé.
- `studio-local/serve.mjs` et `scripts/assemble-pages.mjs` : JSON et emblèmes servis dans le Studio et sa version statique par une liste de fichiers fermée.
- `docs/rapports-missions/ANT_DECH_004_CONTRAT_UNIVERS_STUDIO.md` : schéma, sources, confidentialité et évolutions recommandées.

Le Studio MJ sait déjà créer des objets `faction` ; aucune nouvelle structure de sauvegarde n'est inventée. La fenêtre joueur ne reçoit aucune note privée sans une action de présentation contrôlée. Aucune implantation ou affiliation secrète n'est déduite de la charte générale. Le Chœur des Derniers Feux est distinct du Chœur du Dernier Rire déjà connu dans les sources.

## Contrôle reproductible

| Vérification | Résultat local |
| --- | --- |
| `npm test` | **Réussi** ; M01–M05, magie, Grimoire, Bestiaire, contenu, types, build et site inclus |
| `npm run test:organisations` | **3/3 réussis** : identité/source/SHA/images, absence de secrets et pouvoirs arbitraires, routes HTTP du Studio et liste blanche |
| `npm run check:content` | **Réussi** : 376 pages sélectionnées, 275 codes documentaires uniques |
| `npm run build` + `npm run check:site` | **Réussis** : 1 141 pages HTML, 66 422 liens/ressources contrôlés |
| `studio-local/tests/organisations.test.mjs` | Recette Chrome ajoutée à `.github/workflows/ci.yml` ; **non exécutable dans le conteneur local** : navigateur Chromium refuse la création de socket système (`Operation not permitted`) |
| `studio-local/tests/rayons.test.mjs` | Régression du nouveau rayon prévue dans la CI ; même impossibilité Chromium locale |

Ces résultats ne constituent **pas** une attestation de recette navigateur ni de publication Pages. La CI doit exécuter le navigateur sur son runner, puis la publication doit être constatée sur l'URL réelle après fusion. Les tests pourront être relancés avec `CHROME_BIN=/chemin/vers/chrome node --test studio-local/tests/organisations.test.mjs studio-local/tests/rayons.test.mjs` dans un environnement où Chrome dispose des permissions nécessaires.

## Contrôles de risque

1. **Canon :** six institutions et leurs principes sont fixés ; ni dirigeants précis, ni implantation universelle, ni fait joué ne sont déduits.
2. **Équité de jeu :** chaque opposition offre au moins une voie non létale. Les budgets et effets 5d6 restent inchangés.
3. **Secrets :** le JSON et les emblèmes sont publics ; aucun pacte, traître, compte à rebours caché ou note de campagne n'est présent. La fiche publique ne pointe pas vers le dossier de révélations MJ.
4. **Public et images :** URLs prévisibles sous `/archives-alrick/` ; droits maîtrisés par création originale, pas de médias de tiers importés.
5. **Sauvegardes :** les copies locales réutilisent les créations `faction` existantes ; les références versionnées demeurent distinctes des instances.

## Travaux à poursuivre et décisions ouvertes

- **STUDIO/ARCHIVES :** qualifier après CI le parcours création→sauvegarde→réouverture→projection ; envisager `sourceRef` typé et gestion des mises à jour sans écrasement.
- **PNJ/BEST :** fiches individuelles ou portraits à élaborer séparément, avec provenance de chaque illustration ; ne pas injecter de personnage par l'emblème seul.
- **INDEX/MATH/COMBAT/MAG :** capacités, affiliations surnaturelles ou effets chiffrés éventuels à homologuer avant adoption dans les profils ; rien de tel n'est accordé dans ce lot.
- **LORE/AVENTURES/QUÊTES :** situer les relais dans les campagnes indépendantes et distinguer leurs conflits locaux de la trame partagée.
- **DG/QA :** consigner le commit, la PR, l'état de la CI, le workflow Pages et un contrôle HTTP des six pages/images avant clôture.

**À revoir par :** STUDIO, ARCHIVES, PNJ, BEST, INDEX, MATH, LORE, AVE, QTE, QA. **À valider par DG/créateur :** recette navigateur et intégrité de la publication, éventuelles mécaniques ou biographies futures — **pas** la décision de canoniser les six organisations, déjà expressément donnée.

## Clôture effective de la publication — 15 novembre 2026 (heure du créateur)

- **PR #127 :** https://github.com/Sijiel44/archives-alrick/pull/127 — fusion `squash` autorisée par la demande du créateur ; SHA `6db27d2ab80fa61df259848c3027b3f5b18c1f77`.
- **CI verte** au HEAD `14a75f425897e2710bba0cfc0a77fc2d87728e44` : https://github.com/Sijiel44/archives-alrick/actions/runs/43796762278 — npm test et recette Chrome du Studio réussis.
- **Correctif trouvé par le premier run :** la politique CSP du serveur bloquait la nouvelle importation JSON. Ajout de `catalogue-organisations.json` à la seule liste de connexions du Studio MJ ; fenêtre joueur toujours `connect-src 'none'`. Le test de données vérifie désormais cette distinction.
- **Contrôle HTTP Pages après fusion :** réponse **200** pour `https://sijiel44.github.io/archives-alrick/groupes/org-dech-01.html`, `.../static/images/organisations/org-dech-01.svg` et `.../studio/catalogue-organisations.json`. Les six pages ont passé le contrôle de liens local ; une recette visuelle humaine exhaustive reste facultative.

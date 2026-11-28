# BEST-ER-009 — Les mystères des forêts anciennes

Préparation v0.1.0 du 26 novembre 2026, heure du créateur (America/Toronto). Destination : **Chroniques d’Entre-Rives**, `portee: univers_partage`.

## Livraison

Dix fiches nouvelles de travail `BEST-ER-009-043` à `BEST-ER-009-052`, chacune avec description, habitat, alimentation, cycle de vie, saisonnalité, rôle écologique, comportements et réactions, trois capacités avec conditions/limites/contre-mesures, faiblesses, deux variantes, ressources et quatre amorces ouvertes. Le lot fournit donc **30 capacités descriptives, 20 variantes et 40 amorces non jouées**. Les classements de famille sont des propositions descriptives.

Les dix images originales finales PNG sont conservées, avec dix dérivés WebP destinés à une éventuelle intégration web, texte alternatif, dimensions, empreintes et prompts de création/retouche. Toutes ont été relues visuellement ; trois ont été retouchées (ombre de Noctule, couleur du Mycélion, six pattes et lamelle indépendante du Verrier). Ce sont des illustrations d’ambiance, sans homologation anatomique. Les originaux PNG peuvent dépasser 3 Mio ; les dix WebP restent sous cette limite. Aucun média antérieur remplacé.

Les sources JSON structurées et les dix Markdown complets se lisent dans le dépôt. `APERCU.html` est un document local de relecture hors réseau, pas une application Sites enregistrée ou publiée. `PLANCHE.webp` réunit les dix illustrations. `manifest-v0.1.json` inventorie les fichiers et leur SHA-256 ; `verify-pack.mjs` vérifie leur intégrité et les contraintes documentaires. `render-pack.mjs` permet de régénérer les lectures à partir du lot JSON.

## Registre et continuité

La branche `bestiaire/best-er-008-sites` a été récupérée et contrôlée à `6e439ad1755fd817b37a60e995b1fd8d9c82d2a1`, avec ses trois fichiers et dix propositions. Elle reste inchangée. La nouvelle branche `codex/best-er-009-sites` part de ce commit ; la pull request cible la branche 008 pour ne présenter que le delta009. Aucune fusion sur `main` n’est effectuée.

Le registre B002 courant et le catalogue Studio conservent 35 attributions : 32 espèces et 3 individus. Les codes candidats ESP-ER-033..042 du lot008 ne sont toujours pas attribués. Les dix fiches009 emploient uniquement leurs IDs de travail ; `candidateRegistryId:null`, aucune réservation de code permanent et aucune écriture dans B002. Les 21 identités B001, dont onze sans code, sont préservées.

Contrôle des noms/alias et IDs : aucune collision exacte dans le corpus public épinglé (35 références, 41 anciennes candidates, dix propositions008 et sources Sites v49). Les chevauchements se recouvrent : ne pas additionner ces corpus. L’analyse sémantique garde des réserves, surtout Ronce/Veilleur et les quatre supports optiques distincts (manteau, ombre, lamelle, essaim). Le concept d’araignée à gouttes a été écarté devant la candidate historique P22 ; le Cloporte le remplace. Voir `CONTROLE_DOUBLONS.md` et l’instantané autonome sourcé.

## Statuts et limites éditoriales

Les dix créations restent `canon_statut: proposition_non_jouee`, `etat_editorial: en_chantier`, `publish:false`, `canonValidated:false`. Aucune rencontre d’Orin n’est inventée ; aucune parenté divine, implantation géographique canonique ou conscience universelle de forêt n’est imposée. Les nouvelles capacités merveilleuses restent à approuver. Les variantes et amorces ne sont pas des événements joués.

Aucune statistique 5d6, recette, bonus ou profil M03 n’est homologué : `mechanics.profile:null`. Les ressources distinguent collecte renouvelable, prélèvements nuisibles et usages proposés. Aucun secret MJ réel, sauvegarde ou paquet privé dans la livraison.

## Inspection Sites

Accès propriétaire aux outils du **projet existant** `appgprj_6aefa21ad1bc819198e86d83a74b3484` confirmé ; audience publique conservée. Source enregistrée v49 ouverte en lecture à `9e045dc12bed4ff6834639df48066c7b78773068`. Le Site contient 306 lectures, dont 35 créatures ; sa bibliothèque commune contient 411 cartes/514 accès. Les 49 cartes bestiaire comprennent créatures, prototypes, démonstrations et guides : elles ne correspondent pas à49 espèces. BEST-ER-008 n’y est pas intégré. Aucun nom du lot009 n’y est déjà présent.

**Import direct bloqué par le contrat observé :** le mapper bestiaire force « Bestiaire validé · Non joué · Sans profil 5d6 » et « contenu descriptif validé », sans propager nos refus de publication. Ajouter les propositions dans ce tableau les ferait passer pour validées. Les sources, lecteurs, index, contrôles figés et mapping requis sont détaillés dans `INTEGRATION_SITES.md`.

L’autorisation de poursuivre des lots et de publier progressivement ne décide pas à elle seule du statut adéquat de ces dix propositions encore soumises à arbitrage. Aucune promotion automatique, aucun import, version Sites, déploiement ou workflow Pages n’a été tenté. Le paquet est complet pour **relecture et choix éditorial** ; il n’est pas un import natif prêt à publier.

## Vérification

- `npm ci` réussi dans l’espace de travail isolé ; audit d’installation : zéro vulnérabilité signalée.
- `npm test` réussi : contenu, types, génération d’intégration, 1 216 pages et 94 558 liens/ressources vérifiés, suites documentaires et 5d6, puis Archives de campagne (263 pages, 31 676 liens). La construction d’intégration est un test local historique ; aucun de ses résultats n’est publié.
- Intégrité du paquet, images, noms, champs et liens : résultat final dans `validation-v0.1.json`.
- Aperçu de relecture bureau/mobile : résultat final dans `validation-v0.1.json`. Cette recette locale ne vaut pas recette d’une intégration au Site.
- Recette du lot009 sur le domaine Sites : **non exécutée**, puisque aucune intégration éditorialement validée n’existe. Il reste à adapter le mapper, attribuer les identités approuvées, intégrer depuis la dernière source et contrôler médias, liens, filtres, deux lecteurs et bureau/mobile avant toute publication.

La PR de revue et le commit ne constituent pas une publication. Les fichiers de campagne, le Studio, les registres et le Site restent inchangés par ce lot documentaire.

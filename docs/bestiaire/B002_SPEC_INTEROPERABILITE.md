# B-002 — Registre approuvé des identifiants et interopérabilité documentaire ↔ 5d6

**État : nomenclature des six préfixes APPROUVÉE par le créateur le 31 octobre 2026 ; associations n:n et accès public NON ADOPTÉS et NON BRANCHÉS sur M05.** Date : 31 octobre 2026. Branche : bestiaire/b002-registre-interop ; PR #67 (brouillon). Autorités : CONTRAT_EDITORIAL.md, B-001/B-001.1/B-001.2, M03–M05.

## A. Identités et responsabilités

- **Code documentaire permanent** : reçu de l'autorité éditoriale, conservé à travers les campagnes ; DRG, REV, IMP, CRE, MAG et autres codes existants ne sont jamais renommés, recyclés ou déduits d'un type d'entité.
- **Clé de registre B-001** : b001-001…b001-021, clé technique historique de suivi, jamais substitut au code officiel. Pour les 11 entrées sans code, cette clé ne confère aucune identité canonique.
- **Profil 5d6** : ID local de BestiaryCard dans le contexte d'une sauvegarde, sous schéma alrick.bestiary.v1 et ruleset m03 ; même chaîne d'ID dans deux sauvegardes ≠ même instance ni même fiche encyclopédique.
- **Association** : unité relationnelle séparée ; ne porte ni pouvoirs d'espèce, ni chiffres canoniques. Une espèce documentaire peut pointer vers plusieurs prototypes mécaniques ; un profil mécanique peut pointer vers plusieurs sources avec leurs rôles différents. Aucun de ces liens n'est actuellement déclaré comme établi.
- **M05** : documentaryLink reste le lien principal, unique et **déclaratif** dans une carte locale. Le registre relationnel n:n est extérieur au format M05 ; ne pas le substituer, ne pas modifier readDocumentaryLink ni canOfferDocumentaryLink (false).

## B. Convention d'identifiants future — préfixes approuvés, codes individuels à valider

| Préfixe candidat | Nature projetée | Réserve |
| --- | --- | --- |
| ESP- | espèce documentaire | Ne pas transformer un individu ou prototype en espèce |
| FAMT- | famille taxonomique | Éviter confusion avec FAM- déjà utilisé pour les familles de personnages |
| INDC- | individu de créature | Jamais renommer DRG/REV/IMP/CRE déjà attribués |
| BIO- | biome documentaire | Aucun nouveau biome local par simple indexation |
| P5C- | modèle de profil 5d6 partagé | À ne pas attribuer aux IDs de sauvegarde |
| VARC- | variante documentée | Ne signifie pas automatiquement nouvelle espèce |

Format envisagé : préfixe + suffixe stable unique réservé après validation explicite du créateur, contrôlé par registre central, avec alias d'affichage séparés. **Ces six préfixes sont adoptés pour les fiches futures, mais aucun code individuel nouveau n'est attribué par B-002.** Chaque nouveau code exige une fiche cible, une source précise, une décision éditoriale explicite du créateur, une inscription dans `docs/bestiaire/B002_CODES_VALIDES.json` et des contrôles automatiques de non-collision. Une approbation de code ne transforme pas `proposition_non_jouee` en `lore_valide`, et n'autorise aucune publication. Les 11 codes `null` du registre initial demeurent inchangés.

## C. Contrat relationnel proposé (exemple non canonique)

~~~json
{
  "schema": "alrick.b002.documentary-game-links.proposal.v1",
  "relations": [
    {
      "documentaryId": "CODE_DOCUMENTAIRE_DEJA_VALIDE",
      "documentaryType": "individu",
      "profileId": "ID_LOCAL_DE_CARTE",
      "profileNamespace": "SAUVEGARDE_LOCALE_NON_PUBLIEE",
      "profileRuleset": "m03",
      "profileSchema": "alrick.bestiary.v1",
      "typeRelation": "representation_de_jeu",
      "source": "REFERENCE_A_VERIFIER",
      "preuve": "proposee",
      "review": "a_verifier",
      "versionRelation": 1,
      "public": false
    }
  ]
}
~~~

L'unicité s'applique au tuple (documentaryId, profileNamespace, profileId, versionRelation, typeRelation). La cardinalité est **n:n**, non une propriété intrinsèque de BestiaryCard. Pour les profils partagés de type modèle, définir à l'avenir une identité de modèle distincte des instances de sauvegarde. Les liens historiques locaux ne sont jamais importés en masse sans vérification.

Les quatre degrés de preuve sont : **établie** (fiche et source réellement vérifiées), **probable** (indices convergents à arbitrer), **proposée** (hypothèse ou architecture à valider), **impossible à vérifier** (source absente, code nul, contradiction). Un lien d'affichage prouvé ne prouve pas une filiation biologique.

## D. Politique anti-spoilers et refus par défaut

En B-002, toute demande de lien public automatique **est refusée**. Un statut de carte locale « documentaire approuvé », une valeur publish:true, un publicPath ou un champ visibilite renseigné ne valent jamais attestation de droits d'accès.

Un futur changement nécessitera simultanément : registre documentaire approuvé et versionné, code existant sans ambiguïté, source de chaque relation, approbation éditoriale et preuve d'accès indépendantes, statut et portée cohérents, vérification spoilers/unlisted/visibilite, validation de la route réellement publiée, absence d'information secrète dans les métadonnées publiques et journal de décision. Une page avec spoilers/unlisted reste accessible par URL ; elle ne doit pas être révélée dans les index, recherches, exports publics ou suggestions de profil. Les véritables secrets MJ ne doivent pas être enregistrés dans le dépôt public, même sous HTML masqué.

Ne jamais traiter « lien non répertorié » comme « lien privé ». Pas de lien inverse activé par simple présence d'une relation dans un fichier JSON. Les contrôles B-002 démontrent le refus, **pas** un futur pipeline autorisé.

## E. Relations séparées et règles d'inférence

1. Espèce ↔ individu : seulement si l'espèce et le rattachement existent dans une source explicite ; les pouvoirs, maîtrises, grades, destins, affinités ou transformations d'un individu restent individuels.
2. Famille ↔ espèce : classification éditoriale et preuve indépendantes ; ne pas utiliser une liste de noms comme preuve de parenté.
3. Biome ↔ espèce/individu : habitat, préférence, observation, passage et scène projetée ne sont pas synonymes ; chacun exige un type de lien et sa source.
4. Lieux ↔ biomes : plusieurs-à-plusieurs, relations attestées ou inconnues ; aucune nouvelle région de l'Atlas.
5. Profil ↔ documentaire : lien mécanique non canonisant, et non copie des statistiques dans l'encyclopédie.
6. Sources CB35–CB39 : les renvois dans des fiches dérivées sont des **références indirectes** ; aucune relecture du brut original n'est revendiquée ici en son absence.

## F. Navigation sans migration massive

Conserver les URL, fiches DRG, REV, IMP, CRE et les index existants. Proposer ultérieurement, après revue : un index central de consultation, des filtres séparés par type et par statut, un parcours espèces/individus, un index des biomes et un onglet de profils 5d6 explicitement étiquetés « adaptation ». Un panneau « source et preuve » précédera tout renvoi au jeu ; les pages à spoilers restent écartées des listes générales. Aucune migration ou publication de pages par B-002.

**Décisions encore ouvertes :** attribution individuelle des nouveaux codes, résolution des homonymes, statuts des sept prototypes MJ publiés, accès au brut CB35–CB39, politique des identités mécaniques partagées et habilitation de publication. Ne pas lancer B-003 sans validation de la Direction.


## G. Décision du créateur et procédure de validation par fiche (31 octobre 2026)

- **Autorisation de principe :** les préfixes `ESP-`, `FAMT-`, `INDC-`, `BIO-`, `P5C-`, `VARC-` sont désormais approuvés ; les codes historiques `DRG-`, `REV-`, `IMP-`, `CRE-`, `MAG-` et autres demeurent intouchables.
- **Validation concrète :** avant fusion d'une nouvelle fiche codée, inscrire dans `B002_CODES_VALIDES.json` un enregistrement avec `code`, `fichier`, `nature`, `source_documentaire`, `preuve_validation_createur`, `canon_statut` et `etat_editorial`. Le contrôle CI exige une correspondance exacte entre cet enregistrement et son frontmatter, ainsi qu'une absence de collision. L'attribution n'est **pas** une canonisation ni une publication.
- **Fiches non encore justifiées :** laisser les codes à `null` dans le registre de travail et documenter les arbitrages ; ne pas inventer une identité pour satisfaire un test.
- **Relations n:n et accès public :** restent des propositions et sont toujours désactivés ; une approbation séparée reste nécessaire.
- **Prototypes MJ :** préserver leur `canon_statut: proposition_non_jouee` et ne pas modifier leur publication existante sans décision spécifique.

# CHRON-001 — Gabarits éditoriaux proposés (sans mise en production)

**Usage :** formulaires de travail pour CHRONIQUES, LORE, ARCHIVES, AVE et DG. Aucune valeur ci-dessous n’est canonisée ni diffusée automatiquement.

## G1 — Fiche maître d’une œuvre

```yaml
identifiant_oeuvre: "CHRON-EXEMPLE-A-REMPLACER"
titre: "[Titre de travail]"
type_documentaire: "adaptation_litteraire" # proposition non implémentée
statut_diffusion: "brouillon" # état de travail, non champ Quartz
campagne_source: "[ID ou aucune]"
source_brute: "[nom exact, version, SHA256 si disponible]"
ancres: ["[chapitre / messages / paragraphes vérifiés]"]
auteur: "[à renseigner]"
adaptation_par: "[à renseigner]"
credits: ["[à valider]"]
autorisation_publication: "non_verifiee"
licence_texte: "a_definir"
licence_illustrations: "a_definir"
spoilers: "a_evaluer"
public_cible: ["lecteurs"]
valide_par_DG: false
```

**Grille de traitement :** contrat droits lié à la version précise ; participants identifiés par rôle/pseudonyme permis ; possibilité de représenter des personnages ou dialogues ; sources réelles citées sans les confondre avec les faits ; absence de nouveau canon et de divulgâcheurs involontaires.

## G2 — Plan d’œuvre / chapitrage

| Partie | Question narrative | Source(s) exactes ou « fiction nouvelle » | Libertés d’adaptation | Risque de continuité |
|---|---|---|---|---|
| Ouverture | Quelle situation veut-on donner à lire ? | À renseigner | À renseigner | À vérifier |
| Développement | Quels points de vue et tensions ? | À renseigner | À renseigner | À vérifier |
| Pivot | Quelle révélation est vécue ou inventée ? | À renseigner | À renseigner | À vérifier |
| Dénouement | Quelle conséquence dans **l’œuvre** ? | À renseigner | À renseigner | À vérifier |

Pour une série : volume → arc → chapitre, avec version de la bible interne à l’œuvre. Aucune date de publication imposée.

## G3 — Cahier de cohérence interne

- **Acteurs :** identité dans l’œuvre, relations, savoirs personnels, changements, contradictions et provenance.
- **Temps / lieux :** ordre **narratif** des scènes, date fictive seulement si sourcée ; les codes CB ne sont pas des dates.
- **Projets / engagements :** distinguer intention, proposition, acceptation, mise en service et accomplissement.
- **Paroles et opinions :** ce qu’un personnage affirme n’est pas automatiquement la vérité du monde.
- **Adaptation :** tableau « source → traduction littéraire → ajout/suppression → risque → décision ».
- **Glossaire :** termes distincts, noms/alias, codes de fiches, lien vers sources révisables.
- **Spoilers :** niveau de divulgation par chapitre et par résumé de navigation.
- **Contradictions :** consigner « à vérifier », jamais résoudre par vraisemblance.

## G4 — Fiche de candidature LORE

```text
ID temporaire :
Origine : [œuvre, version, auteur, statut droits]
Source primaire : [fichier, empreinte, ancre exacts ou "absente"]
Extrait / observation : [reformulation sans divulguer de contenu privé]
Proposition d’usage commun :
Différences avec le fait joué / l’œuvre :
Portée souhaitée : univers partagé / campagne locale / aucune
Statut proposé : proposition_non_jouee / a_verifier / autre existant
Risque de spoilers : oui / non / à revoir
Compatibilité fiches existantes : [codes, conflits, inconnus]
Avis CHRONIQUES :
Avis LORE : NON RENDU
Décision DG/créateur : NON RENDUE
```

Le dépôt d’une idée LORE ne vaut ni preuve historique ni acte de canonisation.

## G5 — Page de lecture : contrat d’affichage, pas nouvelle page

En ouverture, indiquer **« Adaptation littéraire d’une campagne »** ou **« Fiction originale, hors canon commun »**, le public et les éventuels avertissements. En pied : crédits effectivement autorisés, source sans secrets, nature des libertés, version de l’œuvre, lien à la continuité **si autorisé**. Ne pas mélanger une voix narrative et un communiqué de validation canonique.

Pour Quartz, réutiliser les champs existants seulement après revue des contrats ; ne pas attribuer automatiquement `canon_statut: faits_joues` à une œuvre libre. Ne pas publier un gabarit rempli de noms personnels/notes secrètes sur GitHub.

## G6 — Registre de droits et crédits (stockage privé si données personnelles)

| Contribution | Titulaire / pseudonyme autorisé | Droit d’adapter | Support autorisé | Crédit approuvé | Preuve et version | État |
|---|---|---|---|---|---|---|
| Texte source | À renseigner | Inconnu | Inconnu | À décider | À conserver hors site | **BLOQUANT** |
| Intervention de joueur | À renseigner | Inconnu | Inconnu | À décider | À conserver hors site | **BLOQUANT** |
| Illustration / carte | À renseigner | Inconnu | Inconnu | À décider | À conserver hors site | **BLOQUANT** |

Ne jamais déduire l’autorisation de publier du seul fait qu’un participant a joué une séance ou qu’une image est visible dans une discussion.

## G7 — Bilan de publication

```text
Œuvre / version / décision DG :
Support et adresse réelle (si mise en ligne) :
SHA et PR de la version publiée :
Droits et crédits vérifiés (sans preuve privée divulguée) :
Liens, avertissements, recherches/sitemap contrôlés :
Écarts connus et éléments corrigés :
Incidents ou demandes de retrait :
Prochain contrôle / responsable :
```

Ces gabarits sont des **propositions CHRON-001**. Leur adoption et leur éventuelle intégration dans `modeles/` ou `content/` demandent une décision ultérieure.

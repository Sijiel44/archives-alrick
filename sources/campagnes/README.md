# Sources intégrales de campagne — registre de transfert CB01–CB04-04

**État : 30 octobre 2026.** Les **15 documents Word originaux** ont été reçus et validés localement comme DOCX, chacun avec une copie inchangée et une empreinte SHA-256. Un **paquet d'import indépendant du dépôt** a été préparé : pour chaque campagne, il comprend l'original, la transcription Markdown intégrale, l'index des chapitres, l'index des messages lorsque les en-têtes le permettent et le manifeste de provenance.

**Important :** les originaux binaires et les 3 000 fragments Markdown du paquet complet **ne sont PAS encore dans ce dépôt**. Ils doivent être importés depuis le paquet local par GitHub Desktop ou une autre méthode autorisée de transfert binaire. Une page de registre, un lien ou un fichier ZIP ailleurs ne vaut pas dépôt effectif.

| Identifiant du dossier futur | Original reçu | Paragraphes textuels | Titres de chapitre repérés | Messages / échanges repérés | Statut de source |
|---|---|---:|---:|---:|---|
| `CB01` | Campagne Brut 1.docx | 4 801 | 15 | 0 | Import à faire |
| `CB02` | Campagne Brut 2(1).docx | 11 295 | 0 | 0 | Import à faire |
| `CB03-01` | Campagne Brut 3.1(1).docx | 17 480 | 0 | 0 | Import à faire |
| `CB03-02` | Campagne Brut 3.2(1).docx | 16 798 | 0 | 0 | Import à faire |
| `CB03-03` | Campagne Brut 3.3(1).docx | 7 852 | 0 | 0 | Import à faire |
| `CB03-04` | Campagne Brut 3.4(1).docx | 45 487 | 7 | 352 | Import à faire |
| `CB03-05` | Campagne Brut 3.5(2).docx | 38 162 | 0 | 161 | Import à faire |
| `CB03-06` | Campagne Brut 3.6(2).docx | 26 146 | 0 | 202 | Import à faire |
| `CB03-07` | Campagne Brut 3.7(3).docx | 39 046 | 0 | 512 | Import à faire |
| `CB03-08` | Campagne Brut 3.8.docx | 30 619 | 0 | 344 | Import à faire |
| `CB03-09` | Campagne_Brut_3.9(2).docx | 41 550 | 0 | 311 | Import à faire |
| `CB04-01` | Campagne_Brut_4.1(3).docx | 7 126 | 0 | 119 | Import à faire |
| `CB04-02` | Campagne_Brut_4.2(2).docx | 22 041 | 27 | 293 | Import à faire |
| `CB04-03` | Campagne_Brut_4.3(3).docx | 23 694 | 198 | 175 | Import à faire |
| `CB04-04` | Campagne_Brut_4.4(2).docx | 21 008 | 67 | 135 | Import à faire |

**Ce que signifient les zéros :** pas de balise reconnue par **l'extracteur standard**, et non absence réelle de scènes, de dialogues ou de chapitrage littéraire. En CB03-05, le parseur reconnaît les « Échange NNN ». Les anciennes sources ont des formats hétérogènes ; des titres insérés au milieu de paragraphes ne sont pas toujours détectés. Les 67 occurrences de titres en CB4.4 ne signifient pas 67 chapitres distincts ; le chapitre final effectivement joué est **CCCLXXIII**. Les compteurs sont des métriques de segmentation, pas des faits du monde.

## Structure de dépôt à adopter

```text
sources/campagnes/
  README.md
  CB01/
    original/Campagne Brut 1.docx
    transcription_integrale.md
    index_chapitres.md
    index_chapitres.csv
    index_messages.md
    index_messages.csv
    chapitres/
    messages/
    manifest.json
  ...
  CB04-04/
    original/Campagne_Brut_4.4(2).docx
    transcription_integrale.md
    index_chapitres.md
    index_chapitres.csv
    index_messages.md
    index_messages.csv
    chapitres/
    messages/
    manifest.json
```

### Transfert manuel en une seule PR

1. Extraire **Alrick_Archives_15_Bruts_Markdown_Chapitres_Messages_2026-10-30.zip**, depuis la conversation ChatGPT.
2. Dans le clone local de `Sijiel44/archives-alrick`, ouvrir une branche d'import **distincte** puis copier les quinze dossiers directement sous `sources/campagnes/` sans les modifier.
3. Contrôler les empreintes des Word contre les `manifest.json` (pas de nouveaux titres ni de renumérotation par-dessus les originaux).
4. Commit, push, PR ; vérifier à distance les 15 originaux, 15 transcriptions, index et manifestes, puis fusionner.
5. Le site Quartz ne fouillera pas automatiquement ces textes parce qu'ils sont sous `sources/` : la recherche **GitHub Code** le permettra ; les fiches encyclopédiques dans `content/` pointeront vers les chapitres utiles.

**Sécurité de publication :** le créateur a autorisé expressément l'archivage public de ses campagnes. Les historiques Git restent visibles et difficiles à retirer. Les documents intégralement publiés peuvent révéler des intrigues aux lecteurs ; conserver cette distinction dans la présentation du site.

## Chantiers associés

- **Vérifications immédiates de jeu :** [[jdr-alrick/cb44-bilan-et-reprise|dernier état CB44]], [[jdr-alrick/cb44-journal-canon|journal du canon]] et [[mj/reprise-cb44|prompt de reprise]].
- **Contradictions actives :** [[jdr-alrick/verrous-de-reprise-apres-cb44|verrous de continuité vérifiés avant la prochaine séance]].
- **Mondes réutilisables :** [[lieux/cb44-iles-et-quatre-saisons|l'Atlas des îles]] et les quatre fiches de saison.

L'intégrité des quinze originaux et de leurs copies est suivie dans le **fichier INVENTAIRE_GENERAL.csv du paquet** ; les empreintes SHA-256 complètes ne sont pas recopiées dans ce registre pour éviter deux sources éditables concurrentes.

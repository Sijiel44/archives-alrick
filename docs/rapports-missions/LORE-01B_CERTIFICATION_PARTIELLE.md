# ARCHIVES D'ALRICK — LORE-01.B : état de certification des sources (rapport public expurgé)

**Date :** 1er novembre 2026  
**Branche / PR :** `lore/lore-01a-controle-sources` — PR #77 (brouillon, sans fusion)  
**Base :** `main` @ `88f774f3d0d6d520d8d11443b72202b9caf4f94b`  
**Statut : PARTIELLEMENT RÉALISÉE — aucune validation cosmologique définitive.**

## Mesures vérifiables

- Le registre `sources/campagnes/README.md` désigne **15 unités originales** et fournit des nombres indicatifs de paragraphes et de balises d'échange. Les fichiers sources et leurs manifestes ne sont **pas actuellement importés dans le dépôt**.
- Le contrôle de travail a récupéré **447 tranches d'extraction**, avec des balises correspondant à **11 588 pages sur 11 590 indexées**. Il ne s'agit pas d'une lecture sémantique exhaustive.
- **0/15** original `.docx` certifié dans cet environnement par SHA256, les octets d'origine étant inaccessibles ; **0/15** transcription relue et certifiée sémantiquement du premier au dernier échange.
- **13/15** références de noms d'originaux dans le registre de transfert diffèrent des noms des exemplaires utilisés dans le premier audit : leur équivalence textuelle et binaire reste à démontrer, sans présumer une divergence.
- Le registre bibliothécaire possède des compilations et copies homonymes : elles ne forment pas de nouveaux épisodes.
- L'audit du dépôt a couvert les **852 éléments** de l'arborescence (dont **527 fichiers Markdown**) et inspecté individuellement les **35 pages Markdown de `content/monde/`**. Les **24 codes explicites trouvés dans ce sous-ensemble** sont distincts ; **aucun audit global des 527 fichiers Markdown n'est revendiqué**. Les liens Quartz n'ont pas été validés par compilation.

## Protocole de validation restant

1. Obtenir les quinze originaux et `INVENTAIRE_GENERAL.csv`/`manifest.json` dans un espace autorisé, comparer les SHA256 binaires **et** les textes normalisés des versions homonymes.
2. Compléter la récupération des pages absentes de l'index texte, puis **relire et qualifier chaque échange** des quinze transcriptions en gardant la séparation entre action, déclaration, croyance, hypothèse et proposition.
3. Vérifier chaque correspondance `CBxx Pxxxxx` sur **l'original effectivement retenu**, sans interpolation tacite des numéros.
4. Exécuter l'audit intégral des codes, références et liens Quartz sur le clone complet et vérifier le contrat éditorial.
5. Faire approuver par la Direction tout choix relatif à la diffusion des sources et à la publication de contenu sensible. Une page `unlisted:true` **n'est pas un espace confidentiel** dans GitHub.

**Recommandation : LORE-01 NON VALIDABLE À CE STADE.** Aucune conclusion nouvelle n'est officialisée, aucune fiche canonique n'a été modifiée, aucune publication de campagne n'est demandée. Le dossier interne de preuve, ses matrices et ses fichiers dérivés restent **hors du dépôt public**.

**Sources de contrôle :** `CONTRAT_EDITORIAL.md` ; `sources/campagnes/README.md` ; documents existants dans `content/monde/` ; PR #77.
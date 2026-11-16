# L003-STORAGE — Contrat provisoire importable

Base de conception : `88f774f3d0d6d520d8d11443b72202b9caf4f94b`. **Non canonique** : `cer.studio.dg003.provisional.v0`.

Module ESM : `experiments/dg-lot003/src/storage/storage.mjs`. Aucune dépendance. Navigateurs sécurisés (WebCrypto) ou Node >= 20, Node 24 recommandé.

## Exports exacts

- `STORAGE_SCHEMA`, `PRIVATE_EXPORT_KIND`, `MAX_SOURCE_BYTES`, `MAX_EXPORT_BYTES`.
- `createCampaign({id,name}) -> Campaign` : nouveau conteneur local, sans stockage implicite.
- `previewCharacterImport(input,project,{instancePrefix='pj'}) -> Promise<ImportPreview>` ; alias `previewImport`. **Pure**, vérifie enveloppes `alrick.sheets.v2/v3`, collisions, JSON, ID, taille et SHA des octets. `input` = `Uint8Array | ArrayBuffer | string` (seuls les octets préservent l'original exact du fichier).
- `commitCharacterImport(project,preview) -> Promise<Campaign>` ; alias `commitImport`. Vérifie empreinte du projet à l'aperçu et source, retourne une **nouvelle copie**. Aucune écriture disque/localStorage et aucune dépense.
- `serializePrivateCampaign(project) -> Promise<{confidential:true,mediaType:'application/json',bytes:Uint8Array,sha256:string}>` ; alias `exportPrivate`. **Ne jamais transmettre ce résultat à l'origine joueur.**
- `previewPrivateRestore(input,{expectedSha256?}) -> Promise<RestorePreview>` ; alias `previewRestore`. Lit et vérifie les empreintes de toutes les sources, pure.
- `commitPrivateRestore(preview,{existingProject=null,replace=false}) -> Promise<Campaign>` ; alias `commitRestore`. Remplacement refusé sans `replace:true` explicite. Retourne une nouvelle valeur sans persistance.
- `recoverOriginalBytes(character) -> Promise<Uint8Array>` : vérifie puis restitue UTF-8/BOM/espaces, extensions et contenu *octet à octet*.

`Campaign`: `{schema,id,name,characters,creatures,scenes,privateNotes}` ; propriétés inconnues JSON restent privées. Chaque `character`: `{id,sourceId,source:{schema,base64,sha256,byteLength,sheetIds},sheet}`. Toute `sheet` est un **snapshot brut** JSON sans correction de niveau, caractéristiques, charges ni statut. Ne pas supposer que `sheet` est déjà un objet mécanique validé. `preview.entries[]`: `{sourceId,instanceId,name,rawStat14}`. Aperçu inerte ; import n'applique aucune règle.

## Obligations d'intégration STUDIO / 05

1. Lire le fichier réel par `await file.arrayBuffer()` puis `new Uint8Array(...)`, jamais FileReader.readAsText si l'identité des octets importe.
2. Montrer `preview` puis exiger un geste explicite pour `commitImport`. Persister uniquement la valeur retournée si acceptée.
3. Le SHA256 vérifie l'intégrité, **pas l'authenticité** : un export malveillant et son hash recomputé restent non fiables. Limiter le rendu à `textContent` et traiter les structures comme JSON inerte.
4. `privateNotes`, `characters[].source.base64`, `sheet` et toute extension inconnue sont strictement privés. Aucun DTO joueur n'est exposé par STORAGE ; STUDIO doit construire sa whitelist séparée. Jamais sérialiser le projet complet vers le joueur.
5. Le contrat accepte uniquement v2/v3 `alrick.sheets` avec IDs de fiches ; la compatibilité avec **tous** les historiques officiels et leurs particularités n'est pas homologuée ici. Pas de réparation automatique.
6. `commitRestore` ne persiste rien. Si un processus extérieur veut remplacer un projet, il doit d'abord conserver une sauvegarde indépendante et demander confirmation.
7. Chaque prévisualisation est considérée éphémère ; une UI ne doit ni publier `base64`, ni afficher des fragments secrets dans ses logs.

## Limites / décisions à DG

- Limite source 2 MiB, export privé 16 MiB : plafonds de prototype, à arbitrer.
- Collisions : refus strict ; pas de renommage implicite. Préfixe d'import explicite pour scénarios multiples.
- Absence de chiffrement et d'authentification des exports ; à protéger hors dépôt public.
- L'export JSON reproduit les octets de chaque **source importée**, pas nécessairement les octets de l'archive d'export elle-même après édition manuelle.
- N'est pas un adaptateur officiel Atelier ni un validateur mécanique : contrôle minimal de forme, pas de migration ni interprétation des charges.

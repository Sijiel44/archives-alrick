# FICHE DIRECTION — L003-PORTS / BUILDER

**Objectif :** livrer cinq façades TypeScript injectables et testées, sans recopier M01–M05, en garantissant la séparation document/source/profil/instance. **Décision DG-LOT-003 :** PR #84, base main `88f774f3d0d6d520d8d11443b72202b9caf4f94b`.

**Réalisé :** `createPorts`, `createDocumentReader`, `createRulesGateway`, `createCatalogResolver`, `createCharacterImport`, `createBestiaryAdapter`; point d'entrée `src/ports/index.ts`, types documentés, options d'injection à fournir par les propriétaires. Le retour `PortResult` est explicite. Aucune dépendance réseau, aucun écrit de campagne, aucune formule, aucun débit, aucune mutation des sources. Refus si port absent ou opération non reconnue. Créature : copie indépendante du profil d'origine.

**Preuves directes locales :** 23/23 tests Node sur les **fichiers TS réels** avec `--experimental-strip-types`; `tsc --strict` réussi. CharacterImport passe les octets copiés mais délègue à ARCHIVES le hachage et la conservation. Valeur de caractéristique fictive 14 et champ inconnu préservés. Propriétaires tiers non importés.

**Limites :** clone local impossible (DNS GitHub), Node22.16 ici (session centrale Node24), pas de `npm test`, esbuild, navigateur, preuve de sécurité joueur, parité native MATH ni intégration complète de tous les producteurs. La branche/PR individuelles sont uniquement des propositions pour la validation d'intégration, jamais un merge.

**À connecter :** MATH (`rules.previewNative`), INDEX (`catalog.resolve`, métadonnées/versions), ARCHIVES (`characters.preview`, SHA et brut), STUDIO (instances et projection joueur whitelist), BEST (lecture profil), INTÉGRATION (wiring, esbuild, SHA de provenance), QA (parité et sécurité). **Aucune autre branche historique touchée.**

**À revoir par :** 05 INTÉGRATION, 02 QA, MATH, INDEX, ARCHIVES, STUDIO. **À valider par DG/créateur :** compatibilité des contrats une fois câblés; aucune fusion/publication/canonisation.
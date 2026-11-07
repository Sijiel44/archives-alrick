# FICHE DIRECTION — 10 MATH / CORE-COMPAT-001.R2

**Références :** INDEX PR #105 `4f3dffd51f16c0c1881f925a94a677a87feff17c`, matrice MATH #103 `af27e13be443b2776a207dd870413fab33c1b76a`, M01–M03 `main@88f774f3d0d6d520d8d11443b72202b9caf4f94b`.

**Verdict : validation limitée des frontières numériques, NON homologation de l'assemblage DATA.**

- **Validé directement :** aperçu candidat fictif PJ N10 → vrai calcul M03 sans effet, résultat `total=33 / damage=15`; aperçu M01 N10 `XP=2025`; exploration pacifique fictive M01 `XP candidat=120`. Les prévisualisations ne modifient ni fiche ni journal, aucune fuite du champ privé dans les résultats. `19/19` tests locaux réussis, Node22/tsc5.8.3 ; vrai port CORE INDEX #105 Git blob `c8ced9...` vérifié.
- **Règles maintenues :** 5d6, N1–25, caractéristiques >12, M01/M03 sources seules. Créatures sans budget PJ automatique. Tout effet `absorption`, malus d'objet, déclenchement sort/rite, débit ressource, Authority/MATH-002, barème expérimental XP reste **indisponible**.
- **Réserve majeure :** la validation locale DATA est synthétique, pas le module `validateModelRecord` complet PR #105. Le test composite fail-closed exige ce module et les 11 fixtures réelles ; il a donné `INDEX_105_SOURCE_ABSENT` localement (aucune réussite simulée). Chrome, système de sauvegardes et application de fiche non testés.
- **Contrat d'interface :** `previewDataProgression(record,ports)`, `previewDataCombat(record,nativeCombat,ports)`, `previewDataXp(record,ledger,event,ports)` ; toutes réponses `appliedToSheet:false`, `executable:false`, `playerReady:false`. L'interface ne fabrique ni `approved:true` ni décision MJ.
- **Décisions à DG :** autorité de validation mécanique externe du DATA, contrat de l'identité d'événement, frontières de provenance/instance, rôle STUDIO comme seul projecteur joueur et critères de reprise des objets/sorts/ressources.
- **Dépendances :** INDEX #105 pour validateur, BUILDER pour ports/app/stockage, QA pour essai composite, 05 uniquement propriétaire de #95 P0. Aucun merge/Pages/canon.

**Raccord demandé à INDEX/BUILDER :** placer le DATA exact de #105 dans une branche composite P1 distincte, puis exécuter le test `index-105-on-clone.test.mjs`. Ne pas modifier #95. Une absence de module constitue un échec de précondition, pas un test fonctionnel réussi.

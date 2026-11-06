# FICHE DIRECTION — CORE-COMPAT-001 / P1-A — 10 MATH

**Verdict : VALIDÉ avec réserves pour la réutilisation du noyau ; intégration composite NON VALIDÉE.**

- **Noyau prêt** : probabilités 5d6, M01 N1–25 et M03 réutilisables comme appels purs ; pas de nouvelle formule, pas de second moteur. M02, profils Bestiaire, mana, rites, M05 peuvent être repris via adaptations et versions explicites.
- **Reste séparé du noyau** : DOM/localStorage et pages Quartz, Grimoire/Atelier panneau, stockage WebCrypto/exports, secrets MJ, profils historiques, décisions de commit. GameItem et WorkOrder descriptifs, pas de moteur numérique d'objets implicite.
- **Preuves directes** : fichiers GitHub aux SHA indiqués ; Git blobs exacts pour M01/M03/probabilités ; Node 22 / TypeScript 5.8.3 : **12/12 tests d'invariants natifs PASS** et **67/67 tests XP MATH PASS** sur fichiers réels identifiés par leurs blobs. Pas d'essai de l'INDEX R2 ni du navigateur dans le conteneur MATH.
- **Écart P0** : INDEX ancien de #95 b75 refuse le `pj:` natif ; INDEX propriétaire #97 R2 corrige cette identité au blob `27ffd1dbb520eed8fff3efd293948c94ea57cf95`. L'intégrateur 05 doit le copier et démontrer la parité MATH/INDEX/M01 (candidat 60 XP dans le clic fictif), sans écriture XP. Le navigateur #95 b75 échoue aussi en créateur/scene indépendamment de l'XP.
- **Risques bloquants** : M03 `absorption` non appliqué ; aucun validateur numérique d'objets ; `grantAward` M02 crédite automatiquement la suggestion ; aucune transaction serveur multi-personnages ; bornes PV legacy/bestiaire différentes ; confidentialité des projections joueur.
- **Dépendances** : 01 BUILDER (architecture de ports et adaptateurs), 11 INDEX (source/instance, provenance et versions), 05 INTÉGRATION (assemblage exact, CI et Chrome), 02 QA (adaptateurs, round-trip, sécurité), DG (priorités). MATH-002 reste indépendant/non adopté.
- **Décisions DG** : conserver modules natifs comme dépendances versionnées ; choisir conteneur UI/stockage sans imposer la reprise massive ; n'autoriser les commits de ressources/XP qu'après un contrat distinct ; aucun merge, Pages ni canonisation dans ce lot.

**Livrables :** rapport détaillé, matrice CSV 21 lignes, contrats et gates QA, test exécutable + journaux TAP natifs/XP, manifeste SHA. Les passations sont destinées à être déposées dans les issues de coordination et ne constituent pas un accusé de réception personnel.

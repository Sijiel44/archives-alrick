# FICHE_DIRECTION_L003_QA — Reprise finale sur 2ab

Source intégrée corrigée : `2ab809ef5351940e0fc272b859d10f21de894d00` (PR #85, branche prototype/dg003-integrated).
Les 10 scénarios indépendants L003-01 à L003-10 sont réappliqués avec contrôle SHA exact, CDP borné, popup opener réelle, canaris, 6 Mio de stockage et comparaison des octets sans diff massif.

**Historique conservé :** ancienne source `4f2c8e020a7dcf2313610a2eb496a63bfb46dbd2` : run 41935211125, testedHead `dffb9e28edc34b78270373d01b5b3b9c1e1ddf76`, 9 PASS / 1 FAIL (L003-06, changement d'ordre des clés). Correctif applicatif 2ab non encore recetté par QA au moment de l'écriture.

**Décision :** résultat final à consigner dans la description PR #91 et transmission DG **sans commit supplémentaire** après la CI verte. Pas de merge, Pages, canon ou formules modifiées.

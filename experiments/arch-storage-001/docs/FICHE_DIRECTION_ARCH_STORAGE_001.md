# Fiche Direction — BUILDER / P1-A ARCH-STORAGE-001

**6 novembre 2026. Responsable :** 01 BUILDER, avis attendus 04 ARCHIVES, 20 STUDIO, 10 MATH, 11 INDEX, 21 ATELIERS, 02 QA, 00 DG.

**Livrables :** ADR comparatif A/B/C, modèles candidats (12 familles), frontières de transaction/sécurité, transition sans pertes, CORE-COMPAT-001 (aucun moteur bis), UX-STUDIO-001 (reprise du travail antérieur), prototype IndexedDB autonome et navigateur sur `127.0.0.1:4181`.

**Produit existant inchangé :** PR #95 `b75e7f03af625fa1f09782cde4e480c2c6d21c84`, base L003 PR85 `2ab809ef5351940e0fc272b859d10f21de894d00`. Aucun changement des schémas existants, code Quartz, moteur, Pages, canon, données réelles.

**Verdict provisoire :** architecture B testée par un banc isolé, A à préserver comme fallback, C non sélectionnée. Rien n'est adopté sans avis DG/ARCHIVES/STUDIO. Tests Node locaux 13/13 PASS. Environnement local bloque Chromium sur loopback (`ERR_BLOCKED_BY_ADMINISTRATOR`) ; tests navigateur **NON EXÉCUTÉS localement**. Résultat CI GitHub sur le HEAD final à consigner **uniquement après run**.

**P0 résiduels avant choix B :** preuve navigateur B01-B10 sur SHA exact, lecture cohérente snapshot/journal en une transaction, provenance et originaux réels, sécurité projection joueur distincte, sauvegarde hors profil, restauration sous panne/quota/upgrade. OPFS différé.

**Arbitrage demandé :** approuver seulement la poursuite d'un prototype B avec ARCHIVES/STUDIO ; ne pas autoriser migration/passage en production via cette fiche.

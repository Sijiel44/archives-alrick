# UX-STUDIO-001.R2 — Décisions ouvertes et passation vers BUILDER / ATELIERS / DG

**Émetteur :** 20 STUDIO. **Référence d'entrée :** DG-PLAN-REPRISE-002, #101@`3499004dd47d706b06d2dc3e2f5b670df3f60220`, #102@`85f473d2005903a6fc81d37a83fcc6b3c6d16466`, #104@`f84f8c54361b3701ebb0251700f2d0d09d4acf4d`.  
**Statut de toutes les lignes : OUVERTES — aucune décision prétendue validée.**  
**P0 distinct :** #98@`35e2de3bcc702def3d37906997fb07155d2c44a3` livré, #95 intégration et preuve applicative sous contrôle de 05 ; cette livraison P1 n'y ajoute pas de code.

## 1. Registre d'arbitrage UX

| ID | Question à trancher | Option de travail STUDIO **non adoptée** | Responsable de décision | Preuve / dépendance avant validation | Priorité |
|---|---|---|---|---|---|
| UXR2-01 | Six intentions comme navigation persistante ou simple repère du guide ? | Même shell `Reprendre/Préparer/Jouer/Improviser/Journaliser/Sauvegarder`, raccourcis non mutants ; choix débutant/expert = **vue** | 01 BUILDER + 20 STUDIO | Test 1 MJ novice / 1 MJ expert sur même campagne sans conversion | P1 haute |
| UXR2-02 | Quelle source de vérité de campagne / sessions / scènes / journaux ? | Architecture A/B comparée ; identité technique campagne/scène stable ; `Session` P1 **non codée en produit** | 01 BUILDER + 04 ARCHIVES, puis DG | ADR #104 + inventaire sauvegardes + restauration sur copie | Bloquant |
| UXR2-03 | Quel reçu durable pour la barre « Enregistré R » ? | Afficher ACK de stockage vérifié, jamais mémoire/rendu, et révision associée | 04 ARCHIVES | Test panne avant/après transaction et ACK perdu, adaptateur exact | Bloquant |
| UXR2-04 | Politique entre 2 onglets MJ ? | Refuser écrasement obsolète (`STALE_REVISION`) ; proposer recharger/export brouillon privé ; aucun merge implicite | 04 ARCHIVES + 01 BUILDER | Test réel deux onglets, collision et journal d'idempotence sur A et B | Bloquant |
| UXR2-05 | Reprise créateur entre deux magasins et restaurations anciennes ? | Journal `pendingStudioOp`, deux relectures indépendantes, `await inspectStudioRecovery()`, même ID confirmé, sinon `unattestable` | 21 ATELIERS + 04 ARCHIVES + 20 STUDIO | Vrai composite #98/#100/#95 avec fichiers natifs, pas de double création | Bloquant P0 pour 05 ; P1 hérite |
| UXR2-06 | Définition / variante / instance dans l'inspecteur ? | Trois identités présentées distinctement, version/provenance/source intactes ; mécanique native seulement en lecture | 11 INDEX + 21 ATELIERS | Validation du JSON Schema #102 et concordance avec BEST/M02/M03/Grimoire/rites ; cas inconnus | P1 haute |
| UXR2-07 | Qu'est-ce qu'un événement « joué » ? | Séparer `PlayedEvent` métier à concevoir d'`EventJournal` technique de #104, de la note privée et de la chronique publiable | DG + 01 BUILDER + 04 ARCHIVES + 20 STUDIO | Modèle événements/session/provenance et tests de confidentialité ; #104 n'a pas ce journal narratif | Bloquant écran Journaliser |
| UXR2-08 | Quelle portée du consentement joueur ? | Projection champ par champ, scène par scène, CLEAR après changement/reload/restore, jamais restauration du SHOW | 20 STUDIO + 01 BUILDER | DTO exact et essais 4173/4174 sur vrai candidat, canaris absence | P1 haute ; P0 invariant |
| UXR2-09 | Quelle palette ardoise/cuivre/or ? | Comparer #101/#102 (`#14212D/#233347/#F4EFE5/#E4B179/#E9C56E`) à #104 (`#111C25/#1B2A34/#F1F4F1/#C99368/#E7C77B`) ; une seule feuille de tokens après choix | 01 BUILDER + 21 ATELIERS + QA | Contrastes réels focus, disabled, erreurs, typo, non texte et thème clair/fort contraste ; tests WCAG 2.2 AA | P1, non P0 |
| UXR2-10 | Quels écrans méritent reconstruction ? | Réutiliser serializers/ports ; refaire éventuellement shell, scène, centre de reprise, journal métier, inspecteur provenance sans double état | 01 BUILDER + 20 STUDIO + 21 ATELIERS | Revue des composants, tests de bascule de mode et de secrets, inventaire de réemploi | P1 haute |
| UXR2-11 | Médias et droits dans bibliothèques/scènes ? | Média facultatif, droits/alt/licence/version/source, `private` par défaut et opt-in public seulement si autorisé | 21 ATELIERS + 04 ARCHIVES + DG droits | Inventaire images réelles et licences, validation des droits, absence de requêtes externes implicites | P1 haute |
| UXR2-12 | Hors ligne et portabilité : jusqu'où promettre ? | Sans réseau après chargement si les ressources sont locales ; export confidentiel indépendant du navigateur ; pas de garantie si fermeture du serveur ou éviction du stockage | 04 ARCHIVES + 01 BUILDER | Quotas/évictions, offline, exports 2/16 Mio P0 vs prototype #104 2 Mio distinct, vérification restauration | P1 haute |
| UXR2-13 | Risque de snapshot+journal incohérents à l'export B ? | Lire les deux stores dans **une transaction readonly unique** avant promotion B | 04 ARCHIVES + 01 BUILDER | Correction de la réserve explicite #104, test écriture pendant export et SHA | Bloquant adoption B |
| UXR2-14 | Rapport entre 2 vues MJ et 1 fenêtre joueur ? | 2 onglets MJ = concurrence; fenêtre joueur = origine séparée sans stockage MJ ; ne jamais fusionner ces tests | 20 STUDIO + QA + 05 sur P0 | Chrome 2 onglets avec révisions + fenêtre 4174, canaris et révocation, puis QA | Bloquant confidentialité |
| UXR2-15 | Clavier/tablette/images : niveau d'acceptation ? | ≥44×44 CSS px comme cible, focus ≥3 px, zoom 200/400 %, reflow 320, desktop/tablette/téléphone ; lecteur d'écran | 01 BUILDER + 21 ATELIERS + 20 STUDIO + QA | Captures et essais réels + vérification texte alternatif et droits ; aucun essai R2 encore fait | P1 haute |
| UXR2-16 | Import du passé et migration générale ? | Aucun import destructeur ni migration automatique ; preview/contrôle original avant commit. Reprendre le matériel progressivement | 04 ARCHIVES + 11 INDEX + DG | Matrice source-native → candidat, champs inconnus, collision, conservation des octets et sauvegarde rollback | Bloquant avant migration |
| UXR2-17 | État et durée de la « démonstration fictive » ? | Namespace distinct, bannière visible, effacement attesté limité à ses clés après confirmation; jamais vrai MJ | 20 STUDIO + 04 ARCHIVES | Test isolation ancien stockage, fermeture et reprise, export/import fictif | P1 haute |
| UXR2-18 | Raccourcis clavier expert / actions rapides ? | Uniquement navigation et sauvegarde *lorsque durable* ; ne pas affecter les raccourcis de texte ou navigateur | 01 BUILDER + 20 STUDIO | Clavier réel dans notes/editors, aucun effet/mana/XP déclenché | P1 moyenne |

## 2. Arbitrages pouvant être entérinés comme principes sans choix de moteur

Il est **proposé** à DG d'acter comme garde-fous UX (pas comme décision technique de B ou C) :

1. Les deux modes affichent **exactement la même campagne et les mêmes identifiants**, sans migration cachée.
2. Le cockpit n'invente aucun calcul M01–M05 ; toute capacité native utilise le port homologué ou reste descriptive.
3. Note MJ, brouillon créateur, archive privée, source brute et journal technique ne deviennent jamais des éléments du DTO joueur.
4. Une sauvegarde locale n'est annoncée réussie qu'après preuve du stockage ; une archive hors navigateur est un geste distinct.
5. Un état incertain bloque les actions non idempotentes jusqu'à nouvelle preuve, sans suppression compensatrice.
6. Trois statuts éditoriaux restent séparés : canon / publication / fait joué ; le journal narratif futur n'en change aucun automatiquement.

Ces principes sont issus de la convergence #101/#102/#104 et du contrat P0 ; **leur validation DG n'est pas présumée**.

## 3. Passations opératoires

### 01 BUILDER — responsable architecture/navigation

- Reprendre les six intentions comme **navigation non mutante** au-dessus des ports ; vérifier que #96 `mountPreviewNavigation` peut servir de point de départ sans reprendre le contrôle des opérations métier.
- Définir l'architecture d'informations unifiée et la politique de modes UI ; garder le stockage hors de la couche navigation.
- Avec 04 ARCHIVES, décider le contrat d'ACK, de `revision`, de concurrence et de retour arrière entre A/B/C. Prendre en compte la réserve de lecture export de #104.
- Préparer les tokens de charte et critères responsive **sans activation P0**.

### 21 ATELIERS — responsable des formulaires, ateliers et provenance

- Ajuster les écrans descriptifs au cycle « Préparer/Improviser » ; conserver `pendingStudioOp` et la relecture durable, source/variante/instance séparées, brouillon ≠ fait joué.
- Soumettre à 11 INDEX la sémantique du schéma #102, des sources Grimoire/rites et des champs inconnus, avant implémentation d'un inspecteur universel.
- Proposer les états de formulaire « en cours / enregistré / erreur / reprise incertaine / collision », avec focus et clavier ; média privé en absence de droits.

### 04 ARCHIVES — responsable des garanties de stockage

- Spécifier `load/save/export/restore` avec ACK, taille, nature de transaction et erreur `STALE_REVISION` (ou équivalent), puis comparer A/B/C ; reprendre les originaux non destructifs.
- Séparer le journal technique idempotent, les notes privées et le futur journal de séance ; confirmer `operationId`/identité causale ou documenter le refus de reprise sur backup ancien.
- Réserver la gestion des deux onglets et la lecture multi-stores atomique à son contrat, pas à la vue STUDIO.

### 20 STUDIO — propriétaire usages, scènes, contrôle joueur

- Valider les écrans de scène et la présentation du DTO exact, les erreurs de sauvegarde, les chemins de reprise, la bascule des modes et la distinction des trois « journaux ».
- Ne pas modifier `mountPlayer`/serializer P0 au titre de cette proposition. Reprendre les tests canaris et revue de permissions uniquement sur une future version intégrée explicitement autorisée.

### 05 INTÉGRATION / 02 QA

- **P0** : conserver #95 et ses gates indépendants. Les fichiers R2 sont **de la documentation**, ne les importer dans aucun bundle.
- **P1 futur** : demander au responsable les SHA exacts du candidat prototype combiné avant exécution des scénarios négatifs N01–N12 ; noter PASS/FAIL/NON EXÉCUTÉ distinctement, navigateur réel, deux origines et deux onglets.

### 00 DG — arbitrages dans l'ordre recommandé

**Porte D1 :** valider principes de confidentialité, non-duplication, même campagne deux modes et absence d'effet numérique.  
**Porte D2 :** choisir ou prolonger A/B/C **avec 04/01** sur preuves de pannes, export cohérent et migration non destructive.  
**Porte D3 :** homologuer identités INDEX, `Session`, journal de séance et flux de permissions avec 21/20.  
**Porte D4 :** choisir composants/écrans à construire, charte et critères d’accessibilité, puis autoriser éventuellement un **seul** candidat UX P1.  
**Porte D5 :** QA navigateur, sécurité du DTO, clavier/tablette, sauvegarde et restauration sur SHA exact **avant publication**, non autorisée dans le mandat actuel.

## 4. Livrables du dossier R2

- `UX_STUDIO_001_R2_RAPPORT_CONSOLIDE.md` — synthèse des trois sources, boucle six gestes, parcours guidé/expert, réemploi et limites.
- `UX_STUDIO_001_R2_MATRICE_GESTES_CONTRATS.md` — gestes détaillés, état des ports, composants et scénarios de refus.
- `UX_STUDIO_001_R2_DECISIONS_PASSATIONS.md` — présent registre, responsables, exigences et gates.

**Aucune implémentation, tests de navigateur, CI P1-R2, migration ou validation d'interface ne fait partie de cette livraison.** Les réussites de #104 demeurent propres au banc isolé de #104, et les travaux #98 / #95 restent P0 distincts.

# STUDIO-CREATE-004/P0 — Aperçu d'action INDEX → M03 (lot candidat)

- **Statut : expérimental, non homologué, non publié.**
- **Sources :** PR #163 (résolution M03), PR #165 (variantes M02/BEST), PR #169 (autorisations INDEX).
- **Mission :** #166 ; **recette complète :** #167 ; sauvegardes : #157.
- **Date de préparation :** 17 novembre 2026.

## Intention

Première tranche d'intégration du moteur unique dans le Studio MJ : calculer un aperçu d'action avec le profil défenseur Bestiaire et le même résolveur M03 (appelé via INDEX), sans modifier les sources, PV, mana, charges ni sauvegardes. Le résolveur historique resolveOpposition demeure intact.

## Point d'entrée

Le fichier studio-local/opposition.mjs exporte maintenant la fonction previewIndexedOpposition(roll, defenderCard, indexSession, selections).

- roll : dice = exactement cinq entiers de 1 à 6 ; rawStat, masteryRank, situation, level, threshold, impactMode (melee/tir/magie/mental), baseDamage, penetration et feasible (facultatif ; false bloque l'action).
- selections : attackerId, defenderId, attackRefs, defenseRefs, intensityRef, intensityTier, heroicChoice. Chaque référence comprend famille, identifiant stable, révision.
- retour : {status:"preview", result, used, blocked}. result contient touche, résistance, dégâts, pénétration et absorption suivant M03. used/blocked rendent visible l'acceptation ou le refus des références.

Le retour contient également une indication **journalGate**, destinée au seul
contrôleur MJ :

| Valeur | Sens | Décision de sécurité |
| --- | --- | --- |
| `legacy-compatible` | Aucun effet INDEX, intensité ou héroïsme à conserver, faisabilité non refusée | Le journal M03 existant *peut* rester utilisable, sous sa validation indépendante. |
| `approval-required` | Une référence INDEX demandée est bloquée | Le MJ doit vérifier l'origine et l'habilitation avant toute tentative. |
| `mj-blocked` | La faisabilité narrative a été explicitement refusée | Ne pas enregistrer de dégâts au titre de cette tentative. |
| `versioned-journal-required` | Un effet autorisé, une intensité ou un choix héroïque modifie l'action | **Ne pas** utiliser `record-opposition` : il manque les preuves de résolution et de ressources. |

Ce champ est un **avertissement calculé sur l'aperçu**, et absolument pas un
permis de sauvegarde. L'absence d'effet n'autorise pas une opération à elle
seule : le stockage recalcule et valide séparément les oppositions.

Le Studio expose également **requireLocalLegacyJournalPreview(preview)** :
la fonction refuse les objets copiés ou réimportés et tout état autre que
`legacy-compatible`. Seuls les aperçus immuables émis dans **la session locale
courante** sont reconnus (contrôle WeakSet, pas une preuve cryptographique).
Même après ce contrôle, le commit historique reste soumis à l'ID d'opération,
la révision et la validation M03 du magasin.

**Aucun second jet, débit, sauvegarde ou changement d'état**.

## Frontière de confiance

La session INDEX est créée par le contrôleur MJ. Chaque définition, détenteur et révision exige une confirmation explicite du MJ via approveForHolder. Un indicateur approved:true importé n'a aucune autorité. Les propriétés effects/intensity injectées dans le jet d'origine ne sont pas recopiées : Studio reconstruit l'entrée M03 uniquement à partir des champs autorisés.

La méthode approveForHolder ne fournit pas d'authentification cryptographique. Il faut une interaction réelle du MJ côté Studio. La fenêtre joueur doit recevoir une projection par liste blanche, jamais les notes privées ni les données de provenance secrètes.

## Recette automatisée

Le script npm run test:studiocreate004 vérifie :

1. Import « approved:true » sans habilitation = aucun bonus.
2. Autorisation locale = impact borné via INDEX et le moteur M03.
3. Référence d'un autre détenteur bloquée ; injection de permissions ou effets ignorée.
4. Cinq vrais d6, rejet d'une saisie illégale.
5. Mental sans PV ; faisabilité MJ refusée sans impact.
6. Prévisualisations répétées déterministes, sans mutation de source ni débit.
7. Modules Studio et INDEX servis par le serveur local.
8. Un effet homologué, une source refusée et un choix héroïque ne peuvent pas
   être silencieusement rétrogradés en opposition historique à l'enregistrement.
9. Une copie ou un JSON importé d'aperçu ne peut pas servir de jeton local de
   compatibilité avec le journal historique.

## Audit de la couche de sauvegarde existante

Le Studio possède déjà une **transaction IndexedDB**, un identifiant
`operationId`, un contrôle `expectedRevision`, une signature de commande et un
journal de révisions dans `studio-local/store.mjs` (fonction `execute`). Une
reprise de la même commande reconnaît l'identifiant et la signature ; une
commande différente réutilisant cet identifiant ou une révision périmée est
refusée. La validation d'une sauvegarde rejoue les dégâts de chaque opposition
à partir du profil historique correspondant.

**Point bloquant pour les effets INDEX :** l'opération `record-opposition`
recalcule `resolveOpposition` **historique** lors du commit et l'import de
sauvegarde recalcule encore ce même résultat. Elle ne transporte pas les
autorisations effectives, la révision du catalogue, l'intensité, le choix
héroïque ou l'engagement du mana. Utiliser cette opération avec un aperçu
enrichi détruirait l'information ou provoquerait une divergence de dégâts.

La prochaine évolution doit donc être une opération **distincte et versionnée**
(à arbitrer avec ARCHIVES), avec une preuve locale de confirmation MJ et une
résolution rejouable, mais **sans réactiver un effet depuis un simple
`approved:true` importé**. Le coût/les charges devront être engagés au plus
une fois dans **la même transaction** que la conséquence et le journal, avec
test de double clic, deux onglets, interruption avant/après commit, export et
réimport. Un historique conservé ne constitue pas un permis pour une nouvelle
action. Cette extension du stockage n'est **pas livrée dans ce lot**.

## Travaux restants avant activation UI

- Relier un panneau « Prévisualiser » aux fiches, variantes et références autorisées.
- Séparer confirmation MJ, engagement d'une tentative identifiée, dépense de mana/charges une seule fois, application des effets, sauvegarde transactionnelle et reprise idempotente.
- Assurer la lisibilité débutant/expert, PC/tablette, saisie cinq d6 physiques, fenêtre joueur filtrée.
- Tester les erreurs et les parcours complets Chrome sur plusieurs onglets/profils, niveaux 1/5/10/15/20/21/25.
- Étudier les durées de combat, notamment la projection N25 longue recensée dans QA #167 ; **aucune formule de production n'a changé**.

**Gate :** PR en brouillon, CI, QA et revue DG avant fusion et publication. Guides illustrés maintenus non publiés.

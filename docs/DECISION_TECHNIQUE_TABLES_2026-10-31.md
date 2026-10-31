# Décision technique n° 01 — Réseau des tables 5d6
**Établie le 31 octobre 2026 — Préparation, pas de déploiement.**

## Architecture observée
- `main` : Quartz 5 sur GitHub Pages, public statique. L'Atelier 5d6 reste côté navigateur dans `quartz/components/Atelier5d6.tsx` et `atelier5d6.inline.ts`. Sauvegardes historiques locales et exports JSON préservés.
- `codex/tables-multijoueur-pilote-01` : nouveau pilote autonome Node.js + WebSocket (bibliothèque `ws` déjà dans les dépendances). Rejouer le test `npm run tables:test`, puis lancer `npm run tables:dev`. Aucun fournisseur externe configuré.

## Comparatif de services distants (offres publiques vérifiées le 31 octobre 2026)

| Offre | Gratuit ou prix de départ | Capacité/avantages | Compromis |
|---|---|---|---|
| **Supabase Free** | 0 $/mois ; Pro à partir de **25 $ US/mois** | 500 Mo PostgreSQL par projet, 50 000 utilisateurs actifs mensuels, 1 Go de fichiers, 5 Go de sortie ; **2 millions de messages Realtime/mois** et **200 connexions Realtime simultanées** | Projets Free suspendus après une semaine d'inactivité ; tests indispensables de RLS et Realtime, quotas à surveiller, sauvegardes explicites |
| **Firebase / Cloud Firestore** | Quota gratuit : **1 Gio** de données, 50 000 lectures et 20 000 écritures/jour, 10 Gio de transfert sortant/mois | API client et authentification intégrées, synchronisation Firestore simple | Tarification aux opérations ensuite ; règles Firestore et fonctions fiables à concevoir, risque de surlecture pour événements/présence |
| **Cloudflare Workers + Durable Objects SQLite** | Free : Durable Objects avec SQLite, limites de requêtes/temps et stockage ; tableau tarifaire Cloudflare selon le produit | Une instance d'objet par table avec sérialisation naturelle, WebSocket, stockage durable | Authentification, droits, migrations et récupération de comptes plus personnalisés, complexité d'exploitation plus élevée |
| **Serveur Node + SQLite/PostgreSQL autohébergé** | Aucun tarif logiciel obligatoire ; infrastructure et sauvegardes à financer/exploiter | Contrôle total et export/migration aisés | Mises à jour de sécurité, TLS, supervision, disponibilité, DDoS, backups et restauration à notre charge |

Sources officielles :
- Supabase : https://supabase.com/pricing
- Supabase facturation : https://supabase.com/docs/guides/platform/billing-on-supabase
- Supabase Realtime : https://supabase.com/docs/guides/realtime/pricing
- Supabase anonymes : https://supabase.com/docs/guides/auth/auth-anonymous
- Firestore : https://cloud.google.com/firestore/pricing
- Cloudflare : https://developers.cloudflare.com/workers/platform/pricing/ et https://developers.cloudflare.com/durable-objects/

**Choix proposé après le P0 (à confirmer au moment d'un déploiement autorisé) : Supabase**, pour sa base relationnelle portable, ses transactions et RPC/Postgres, Auth et politiques RLS fines ; en petite campagne 2–5 joueurs + MJ, les quotas Free affichés semblent suffisants pour commencer, sous réserve d'un vrai test et des interruptions possibles dues à l'inactivité. Ce n'est pas un engagement auprès du service. Ne pas activer de formule payante sans autorisation.

## Objectif produit : pourquoi ne pas migrer le local de force ?
L'Atelier 5d6 offre déjà la création niveau 5, l'import des fiches et les règles avancées. Les tables distantes exigent en revanche que le service ait l'autorité. **Ne pas envoyer depuis le navigateur une valeur de dés “officielle”, un rôle MJ, un total de dégâts, ni une nouvelle quantité d'objets sans validation**. Les modèles de résolution existants doivent être séparés de l'état local, puis testés dans un module réutilisable au client (aperçu) et serveur (décision). L'UX des tables est volontairement une route distincte, avec accès par le hub de l'Atelier.

## Contrat des permissions pour l'architecture cible
- Les utilisateurs possèdent un identifiant Auth stable, distinct de leur pseudonyme. Ils peuvent rester anonymes pendant l'essai.
- Les invitations attribuent uniquement une candidature au rôle **joueur** : même avec le lien complet, aucune auto-promotion en MJ.
- Les données privées du MJ résident dans une table dédiée avec politique RLS refusant toute lecture pour les joueurs. La simple invisibilité CSS ne protège rien.
- Une fonction SQL transactionnelle (SECURITY DEFINER rigoureusement contrôlée, droits minimaux, `search_path` fixe) ou un serveur applicatif signe les jets et les changements de ressources, vérifie l'identité, la fiche et l'appartenance à la table, utilise l'aléa cryptographique côté serveur, émet un événement append-only et renvoie le nouveau numéro de version.
- Realtime doit utiliser des canaux privés avec autorisation distincte ; n'émettre jamais de payload de notes MJ sur un canal public. Révoquer l'accès immédiatement en cas d'exclusion.
- Import et export de fiches : validation de schéma, tailles limitées, champs personnels vs publics séparés, `rules_version`, absence d'écriture de canon.
- Prévoir les clés d'idempotence sur les actions, les sauvegardes complètes exportables et des migrations SQL numérotées.

## Comptes anonymes et récupération
L'authentification anonyme Supabase ne crée pas de véritable possibilité de récupération à elle seule : supprimer le stockage du navigateur ou changer d'appareil coupe l'accès tant qu'un autre facteur n'a pas été lié. Proposer **facultativement** un email vérifié ou OAuth ; ne demander ni nom réel, ni téléphone, ni adresse postale. Une clé de récupération portable peut fonctionner, mais son échange contre un nouvel accès nécessite un flux sécurisé côté serveur, avec renouvellement et révocation de la clé ; il ne suffit pas de l'enregistrer en clair dans une table client.

## Critères d'acceptation avant connexion à GitHub Pages
1. Navigateur A = MJ, B/C = deux joueurs sur **trois appareils/réseaux distincts** en HTTPS/WSS. Le MJ accepte les comptes ; personne ne rejoint directement comme MJ.
2. Jets réellement tirés côté service, reçu par les membres autorisés ; un joueur altère manuellement son JSON de requête et ne peut imposer ni dés ni score.
3. Un joueur ne récupère pas les notes secrètes MJ en interrogeant directement la base ou le WebSocket ; les tests d'intrusion en lecture et écriture échouent.
4. PV/mana/inventaire idempotents et transactionnels : une double requête de dégâts ne s'applique pas deux fois ; deux modifications simultanées restent cohérentes.
5. Compte restaurable après changement de navigateur ; trois clients voient les mêmes fiches après reconnexion ; un export/import complet existe.
6. Système local toujours autonome, CSS mobile, tables indépendantes du canon, données sensibles jamais ajoutées au dépôt.

**État réel du P0** : serveur local Loopback, pas d'hébergement Internet, pas de RLS PostgreSQL, pas de synchro entre machines. Test réseau automatisé sur plusieurs connexions WebSocket, mais pas encore de validation manuelle multi-navigateurs/appareils. Ne pas utiliser pour une vraie campagne distante tant que P1/P2 n'ont pas passé leur revue de sécurité et de fiabilité.

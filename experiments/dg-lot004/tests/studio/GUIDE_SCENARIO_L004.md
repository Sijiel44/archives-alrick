# Guide minute — scénario fictif L004-A + préfiguration L004-C

**Préconditions (05 INTÉGRATION)** : Node 24, environnement L003 complet au SHA de PR #85, services ARCHIVES/INDEX/BEST/ATELIERS réels injectés, build local servi sur MJ `http://127.0.0.1:4173/dg004-demo.html` et joueur `http://127.0.0.1:4174/player.html`. Aucune connexion externe. Utiliser des données fictives uniquement.

1. Ouvrir le **mode démonstration fictive**. Vérifier le bandeau et la séparation de stockage. Ne pas importer de vraie sauvegarde MJ.
2. Cliquer `Créer campagne fictive`, puis `Prévisualiser PJ fictif` et lire le nom, la version v3 et la caractéristique brute 14 dans les données sources. Cliquer `Accepter copie PJ` uniquement après contrôle.
3. Cliquer `Prévisualiser créature fictive`, confirmer que code source, profil et ruleset sont distincts, puis `Accepter copie créature` : l'instance reçoit une identité nouvelle.
4. Cliquer `Créer scène et notes MJ fictives`. La description publique est une rive éclairée ; la note privée contient `SENTINELLE_MJ_L004_FICTIVE`. Les deux participants sont rattachés à la scène.
5. Utiliser les créateurs descriptifs existants : objet `Lanterne d’argile`, capacité `Lueur de passage`, sort `Voile de brume`; renseigner provenance, version, description et limites. Aucune activation/dépense chiffrée.
6. L004-C : cliquer `Prévisualiser le lien privé vers la scène` après avoir **enregistré** objet et capacité, vérifier la chaîne objet → capacité → créature → scène et `Indisponible — règle/validateur non homologué`. Rien n'est publié ni ajouté à l'archive.
7. Dans le cockpit STUDIO, ouvrir la fenêtre joueur depuis un clic explicite. Une fois READY sur l'origine 4174, cocher titre/description/participants souhaités. Cliquer **Publier uniquement la sélection** ; vérifier sur le joueur uniquement les champs autorisés. Vérifier la sentinelle absente du DOM, des messages, du stockage et de l'export public.
8. Créer une deuxième scène : la fenêtre joueur revient à « Aucune information publique transmise ». Aucune republication automatique. Pour republier, requérir une nouvelle sélection explicite.
9. Exporter la campagne **CONFIDENTIELLE**, puis sélectionner uniquement ce fichier fictif dans le sélecteur de restauration, **prévisualiser**, et **confirmer**. Vérifier persistance des notes et sources brutes. Une archive réelle ou étrangère est refusée.
10. Sur téléphone/tablette : contrôler lisibilité, focus clavier, boutons >=44px, absence de débordement horizontal, fermeture/réouverture de la fenêtre joueur. En mode expert, vérifier l'inactivité des familles non homologuées.

**P0 :** toute fuite de la sentinelle, donnée réelle en démo, rétablissement joueur sans consentement, source PJ modifiée ou règle non autorisée = FAIL. **P1 :** bouton inutilisable, rechargement impossible, archive perdue, défaut d'accès mobile = FAIL. Une recette navigateur qui ne démarre pas = NON EXÉCUTÉ. Le succès de Node seul ne qualifie pas le prototype intégré.

/**
 * PNJ-001 — angles de jeu et direction d'illustration, PAS des biographies.
 * Chaque fiche de référence est relue à partir de content/personnages/ (source unique).
 * Tout ce qui suit « scène proposée » est inédit et non joué.
 */
export const selection = [
  {
    id: "bram", file: "REV-01.md", groupe: "compagnie", symbole: "🛡️",
    accroche: "Un vétéran qui pense au chemin du retour avant de parler de victoire.",
    enScene: "Inspecte les sangles, interroge les témoins de l'arrière-garde et ose objecter lorsqu'un plan oublie les blessés.",
    rencontre: "Une escorte refuse de repartir sans les derniers marcheurs : qui organisera le repli ?",
    choix: "Négocier une route plus sûre, partager les risques ou reporter le départ.",
    image: "bram-concept.webp"
  },
  {
    id: "ragna", file: "REV-02.md", groupe: "compagnie", symbole: "🪨",
    accroche: "Une observatrice des détails que la précipitation efface.",
    enScene: "Laisse finir les autres, mesure un silence et questionne les conclusions trop rapides.",
    rencontre: "Deux récits d'un même passage se contredisent ; il faut écouter avant d'accuser.",
    choix: "Recouper, protéger un témoin vulnérable ou agir avec des preuves encore imparfaites.",
    image: "ragna-concept.webp"
  },
  {
    id: "kelm", file: "REV-03.md", groupe: "compagnie", symbole: "✊",
    accroche: "La force d'un homme se reconnaît aussi à ce qu'il refuse de briser.",
    enScene: "Se place à hauteur de son interlocuteur et cherche une issue qui n'humilie personne.",
    rencontre: "Un conflit au relais menace de devenir une démonstration de force inutile.",
    choix: "Calmer la foule, réparer un tort ou convaincre les deux parties de reculer."
  },
  {
    id: "vaera", file: "REV-04.md", groupe: "compagnie", symbole: "🌒",
    accroche: "Une éclaireuse dont la liberté compte autant que la finesse d'approche.",
    enScene: "Observe sorties et lignes de vue, puis pose une question qui révèle ce que chacun croyait évident.",
    rencontre: "Un message doit franchir un secteur surveillé sans mettre les habitants en danger.",
    choix: "Chercher un passage discret, inventer une diversion consentie ou différer l'envoi.",
    image: "vaera-portrait-intime.webp"
  },
  {
    id: "torven", file: "REV-05.md", groupe: "compagnie", symbole: "⚕️",
    accroche: "Un soignant qui juge une victoire à ceux qu'elle laisse vivants.",
    enScene: "Interrompt les bravades pour demander de l'eau, du repos et des informations utiles aux soins.",
    rencontre: "Une expédition ne possède pas de quoi traiter tous ses blessés à la fois.",
    choix: "Réorganiser les moyens, demander de l'aide ou interrompre l'objectif initial.",
    image: "torven-portrait-medecin-proposition.webp"
  },
  {
    id: "heimdall", file: "REV-06.md", groupe: "compagnie", symbole: "🔭",
    accroche: "Veiller exige de choisir, pas de tout savoir.",
    enScene: "Distingue une observation certaine d'une inquiétude et refuse de promettre l'impossible.",
    rencontre: "Plusieurs signaux inhabituels réclament l'attention d'une petite équipe.",
    choix: "Prioriser des vérifications, déléguer ou reconnaître ses limites.",
    image: "heimdall-portrait.webp", illustrationValidee: true
  },
  {
    id: "haldrek", file: "REV-07.md", groupe: "compagnie", symbole: "⚔️",
    accroche: "Le capitaine qui prépare autant la retraite que l'avance.",
    enScene: "Répartit les tâches, demande confirmation des consignes et surveille les réserves.",
    rencontre: "Un exercice collectif révèle une faille dans la chaîne de commandement.",
    choix: "Corriger l'organisation, écouter une recrue ou accepter un nouveau chef de manœuvre.",
    image: "haldrek-portrait-capitaine-proposition.webp"
  },
  {
    id: "eamon", file: "REV-08.md", groupe: "compagnie", symbole: "📜",
    accroche: "Un professeur pour qui une histoire transmise doit aussi pouvoir être discutée.",
    enScene: "Interroge la provenance d'un témoignage et laisse la place aux versions discordantes.",
    rencontre: "Un récit très populaire efface le nom d'un artisan qui y a contribué.",
    choix: "Restituer les sources, organiser une discussion ou admettre un doute.",
    image: "eamon-concept.webp"
  },
  {
    id: "torgarl", file: "PER-CB2-TORGARL.md", groupe: "proches", symbole: "🏛️",
    accroche: "Une autorité politique qui doit composer avec les métiers et les habitants.",
    enScene: "Écoute le diagnostic d'un spécialiste avant de promettre des moyens.",
    rencontre: "Des ressources sont disponibles pour un chantier, mais deux besoins sont urgents.",
    choix: "Prioriser, consulter la population ou réviser les objectifs."
  },
  {
    id: "ylva", file: "PER-CB31-YLVA.md", groupe: "proches", symbole: "👣",
    accroche: "L'instructrice qui enseigne une discrétion possible, jamais l'invisibilité.",
    enScene: "Replace un apprenti dans son environnement et adapte l'exercice au poids de son équipement.",
    rencontre: "Un groupe veut apprendre à traverser une cour sans éveiller l'attention.",
    choix: "Observer, alléger le matériel ou renoncer à un parcours trop exposé."
  },
  {
    id: "elyan", file: "PER-CB43-ELYAN-CORBEAU-GRIS.md", groupe: "proches", symbole: "📖",
    accroche: "Un mentor dont les questions sont parfois plus utiles que les réponses.",
    enScene: "Écoute, sourit d'une certitude trop assurée et n'explique pas ce qu'il ignore.",
    rencontre: "Un texte ancien pourrait avoir deux lectures également plausibles.",
    choix: "Comparer les interprétations, demander une expérience ou suspendre le jugement."
  },
  {
    id: "astrid", file: "PER-CB31-ASTRID.md", groupe: "proches", symbole: "⚖️",
    accroche: "La responsable d'un fonds d'études doit choisir sans céder à toutes les sollicitations.",
    enScene: "Demande un budget, un besoin réel et des garanties d'autonomie aux porteurs de projets.",
    rencontre: "Deux ateliers sollicitent une même bourse pour des besoins différents.",
    choix: "Comparer les dossiers, proposer un calendrier ou demander un nouvel avis."
  },
  {
    id: "freya", file: "PER-CB31-FREYA.md", groupe: "proches", symbole: "🧵",
    accroche: "Une reine qui sait la valeur des souvenirs et des liens personnels.",
    enScene: "Pose une question sur les personnes derrière les titres et corrige doucement un souvenir inexact.",
    rencontre: "Deux familles rapportent différemment un même geste ancien.",
    choix: "Laisser chacun raconter, rechercher une trace ou reconnaître les mémoires distinctes."
  },
  {
    id: "alriana", file: "PER-CB31-ALRIANA.md", groupe: "proches", symbole: "🌺",
    accroche: "Une personne dont on connaît des gestes et des souvenirs, pas toute la biographie.",
    enScene: "Dans une campagne située à son époque, faire parler les objets et les témoins plutôt que figer son sort.",
    rencontre: "Un objet ancien comporte une histoire familiale incomplète.",
    choix: "Enquêter avec délicatesse, conserver plusieurs versions ou laisser le passé privé."
  },
  {
    id: "harald", file: "FAM-06.md", groupe: "proches", symbole: "⛰️",
    accroche: "Une figure des Montagnes dont le passé militaire appelle une lecture sourcée.",
    enScene: "Parle du service concret avant la gloire et ne confond pas tous les vétérans de son époque.",
    rencontre: "Un ancien itinéraire militaire est invoqué pour régler un conflit actuel.",
    choix: "Vérifier les témoignages, consulter les habitants ou chercher un autre accord."
  },
  {
    id: "mara", file: "PER-CB31-MARA-VIFACIER.md", groupe: "metiers", symbole: "🔨",
    accroche: "Une forgeronne qui adapte le métal aux corps plutôt qu'aux légendes.",
    enScene: "Mesure une articulation, inspecte une ancienne réparation et refuse une commande dangereuse.",
    rencontre: "Une armure de famille gêne dangereusement son nouveau porteur.",
    choix: "La modifier, la préserver hors d'usage ou concevoir un équipement distinct.",
    image: "mara-concept-v01.webp"
  },
  {
    id: "sivra", file: "PER-CB31-SIVRA-BRASSEFEUILLE.md", groupe: "metiers", symbole: "🍺",
    accroche: "Une brasseuse qui préfère les essais reproductibles aux promesses spectaculaires.",
    enScene: "Fait sentir un brassin, interroge l'origine des plantes et revendique le droit de refuser une commande.",
    rencontre: "Une fermentation varie brusquement entre deux celliers de l'abbaye.",
    choix: "Comparer les conditions, consulter les artisans ou changer de recette.",
    image: "sivra-concept-v01.webp"
  },
  {
    id: "lysandra", file: "PER-CB42-LYSANDRA-DAVARENNE.md", groupe: "metiers", symbole: "🌾",
    accroche: "Une interlocutrice agricole qui attend des constats de terrain.",
    enScene: "Ramène les débats aux pertes, à l'eau et au travail de ceux qui cultivent.",
    rencontre: "Des parcelles voisines ont souffert différemment d'une même période sèche.",
    choix: "Mesurer, écouter les exploitants ou proposer plusieurs essais locaux."
  },
  {
    id: "brakka", file: "PER-CB42-RES-03-BRAKKA-MAINFRANCHE.md", groupe: "metiers", symbole: "🧳",
    accroche: "Une professionnelle des caravanes qui sait ce que coûte une route mal préparée.",
    enScene: "Contrôle les relais, les bagages et la sécurité des voyageurs sans promettre son embauche.",
    rencontre: "Une caravane doit répartir l'espace entre des voyageurs et des marchandises fragiles.",
    choix: "Repenser le chargement, négocier des étapes ou faire deux voyages."
  },
  {
    id: "dorrik", file: "PER-CB42-RES-01-DORRIK-VALECLEF.md", groupe: "metiers", symbole: "🗝️",
    accroche: "Un maître d'hôtel du passé, dont la mort ne peut être effacée par la fiche.",
    enScene: "Pour un récit situé de son vivant seulement : observe un détail d'accueil qui peut sauver l'honneur d'un hôte.",
    rencontre: "Dans une aventure historique, un banquet doit accueillir des invités de traditions rivales.",
    choix: "Adapter le protocole, consulter les invités ou refuser une place insultante."
  },
  {
    id: "heloine", file: "PER-CB44-HELOINE-VALCIR.md", groupe: "metiers", symbole: "🥂",
    accroche: "Une organisatrice de réceptions dont le métier ne se réduit pas à servir.",
    enScene: "Repère une difficulté d'accueil avant qu'elle ne devienne un affront public.",
    rencontre: "Une réception rassemble des personnes aux usages incompatibles.",
    choix: "Réaménager les tables, négocier le protocole ou permettre un accueil séparé."
  },
  {
    id: "berrik", file: "PER-CB44-BERRIK-TROIS-TONNEAUX.md", groupe: "metiers", symbole: "🛢️",
    accroche: "Un spécialiste des caves qui parle d'abord des conditions de conservation.",
    enScene: "Touche les parois, vérifie l'air et différencie un défaut de stockage d'un défaut du produit.",
    rencontre: "Des bouteilles d'une réserve se dégradent sans cause immédiatement visible.",
    choix: "Auditer les caves, discuter avec les producteurs ou déplacer les lots."
  },
  {
    id: "selya", file: "PER-CB44-SELYA-VIGNEBRUME.md", groupe: "metiers", symbole: "🍇",
    accroche: "Une interlocutrice entre collections, métiers et producteurs autonomes.",
    enScene: "Demande l'origine des lots, remercie le producteur et sépare une piste d'étude d'une promesse.",
    rencontre: "Le nom d'un petit producteur manque à une collection prestigieuse.",
    choix: "Rétablir la provenance, obtenir un accord ou suspendre l'exposition."
  },
  {
    id: "odran", file: "PER-CB44-ODRAN-VALCENDRE.md", groupe: "metiers", symbole: "🌿",
    accroche: "Un maître des pressoirs qui protège son indépendance et connaît ses limites.",
    enScene: "Pose les cartes à plat et insiste sur une visite des sols avant tout engagement.",
    rencontre: "Un domaine souhaite copier une méthode venue d'un terroir différent.",
    choix: "Tester localement, consulter des cultivateurs ou renoncer à une généralisation."
  },
  {
    id: "maelin", file: "PER-CB2-MAELIN.md", groupe: "savoirs", symbole: "🪵",
    accroche: "Une charpentière qui veut que les charges importantes soient partagées.",
    enScene: "Vérifie une poutre et rappelle qu'un serment ne doit pas isoler quatre personnes.",
    rencontre: "Une structure ancienne réclame réparation sans perturber son usage quotidien.",
    choix: "Renforcer, remplacer ou suspendre le passage pendant les travaux."
  },
  {
    id: "rudek", file: "PER-CB2-RUDEK.md", groupe: "savoirs", symbole: "🧱",
    accroche: "Un tailleur de pierre attentif au terrain autant qu'à sa famille.",
    enScene: "Parle de fondations et de charges réelles avant de discuter une théorie.",
    rencontre: "Un vieux mur menace des habitations et certains veulent préserver chaque pierre.",
    choix: "Étayer, démonter avec précaution ou évacuer d'abord les lieux."
  },
  {
    id: "sela", file: "PER-CB2-SELA.md", groupe: "savoirs", symbole: "🪢",
    accroche: "Une cordière des cités fluviales qui connaît les tensions invisibles aux passants.",
    enScene: "Tend un câble-test et écoute ceux qui devront vivre avec l'ouvrage.",
    rencontre: "Une passerelle de corde devient dangereuse à l'approche des crues.",
    choix: "Démonter, déplacer les ancrages ou aménager un passage de secours."
  },
  {
    id: "eren", file: "PER-CB2-SOREN.md", groupe: "savoirs", symbole: "⚙️",
    accroche: "Le mécanicien du bois et des roues, nommé Eren malgré un ancien nom de fichier.",
    enScene: "Explique une transmission par un mécanisme concret sans déduire les secrets du pont.",
    rencontre: "Une roue de moulin fonctionne mal après une réparation pourtant soignée.",
    choix: "Observer l'usage, modifier une pièce ou réexaminer le dessin initial."
  },
  {
    id: "eryndel", file: "PER-CB43-ERYNDEL-FORMULES-INACHEVEES.md", groupe: "savoirs", symbole: "✒️",
    accroche: "Un chercheur qui défend le droit aux résultats incomplets.",
    enScene: "Sépare ce qui a été observé de ce qu'une hypothèse prétend expliquer.",
    rencontre: "Une expérience difficile à reproduire suscite des promesses publiques.",
    choix: "Publier les limites, poursuivre l'essai ou refuser l'annonce prématurée."
  },
  {
    id: "bregan", file: "PER-CB44-BREGAN-BATISSEURS.md", groupe: "savoirs", symbole: "🔥",
    accroche: "Une puissance des bâtisseurs, autonome même lorsqu'elle accepte une alliance.",
    enScene: "Demande l'avis des artisans avant de confondre une invitation avec une décision collective.",
    rencontre: "Deux communautés d'ouvriers souhaitent partager un atelier sans perdre leurs pratiques.",
    choix: "Définir un accord commun, organiser des échanges ou garder deux espaces."
  }
];

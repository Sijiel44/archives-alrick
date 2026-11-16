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
  },
  {
    id: "edric", file: "PER-CB1-EDRIC.md", groupe: "proches", symbole: "🦁",
    accroche: "De logisticien des quais à duc de Valbrume : un même homme, à deux étapes de sa vie.",
    enScene: "Dans une scène ancienne, examine les cales et les délais ; dans une scène tardive, distingue la décision ducale des engagements des marins.",
    rencontre: "Un ancien projet de navigation refait surface, mais les artisans contestent le coût de sa relance.",
    choix: "Réunir les métiers, reprendre les calculs ou renoncer à une promesse trop hâtive."
  },
  {
    id: "sigrid", file: "PER-CB1-SIGRID.md", groupe: "savoirs", symbole: "🐦‍⬛",
    accroche: "À Brumefer, elle sait que les noms survivent grâce aux mains qui entretiennent les pierres.",
    enScene: "Attend que chacun lise l'inscription, puis demande qui connaît encore la vie derrière le nom.",
    rencontre: "Un nom gravé au Champ des Noms demeure illisible, et deux familles se souviennent différemment.",
    choix: "Confronter les témoignages avec douceur, préserver le doute ou organiser une restauration prudente.",
    image: "sigrid-concept-v01.webp"
  },
  {
    id: "soren", file: "PER-CB1-SOREN.md", groupe: "savoirs", symbole: "⚓",
    accroche: "Un vieux marin qui découvre encore du nouveau dans les vestiges qu'il croyait connaître.",
    enScene: "Regarde les pierres avec la patience de quarante années de retours et accepte qu'une interprétation lui échappe.",
    rencontre: "Un dessin de maçon ancien pourrait appartenir à plusieurs générations de bâtisseurs.",
    choix: "Demander l'avis d'artisans, conserver plusieurs lectures ou renoncer à divulguer le lieu.",
  },
  {
    id: "dagrin", file: "PER-CB2-DAGRIN.md", groupe: "savoirs", symbole: "⛏️",
    accroche: "Le géologue qui préfère un relevé honnête à une belle certitude.",
    enScene: "Fait croiser les mesures des apprentis et des arpenteurs, puis note sans honte ce qui reste inexpliqué.",
    rencontre: "De nouvelles vibrations inquiètent les ouvriers près d'un ouvrage ancien.",
    choix: "Suspendre la zone, multiplier les relevés ou chercher un diagnostic indépendant."
  },
  {
    id: "elyra", file: "PER-CB31-ELYRA.md", groupe: "metiers", symbole: "🪡",
    accroche: "L'élégance, pour elle, commence par la liberté de bouger et de dire non.",
    enScene: "Fait essayer un prototype en demandant au porteur ce qui tire, gêne ou lui semble juste.",
    rencontre: "Une tenue de cérémonie paraît admirable, mais ceux qui la portent ne peuvent travailler avec.",
    choix: "Adapter la coupe, négocier les usages ou concevoir deux vêtements plutôt qu'un."
  },
  {
    id: "aerendir", file: "PER-CB31-AERENDIR.md", groupe: "metiers", symbole: "🌲",
    accroche: "Un artisan voyageur qui préfère réparer un banc que collectionner les titres.",
    enScene: "Prend le temps de toucher le bois, de regarder les gestes locaux et d'interroger ceux qui utiliseront l'objet.",
    rencontre: "Un hameau demande une rénovation qui effacerait un aménagement apprécié de ses habitants.",
    choix: "Réparer l'existant, imaginer un compromis ou laisser le village trancher."
  },
  {
    id: "lethiel", file: "PER-CB31-LETHIEL.md", groupe: "metiers", symbole: "📐",
    accroche: "Une architecte qui écoute un bâtiment avant de le dessiner.",
    enScene: "Éprouve la résonance d'une pièce, griffonne ses contraintes et réclame l'avis des futurs usagers.",
    rencontre: "Une salle nouvelle convient aux discours, mais étouffe les voix et les instruments.",
    choix: "Revoir les matériaux, déplacer la scène ou modifier les attentes du commanditaire."
  },
  {
    id: "thaeron", file: "PER-CB31-THAERON.md", groupe: "savoirs", symbole: "🎻",
    accroche: "Un compositeur espiègle pour qui une salle répond autant qu'un instrument.",
    enScene: "Lance un motif musical, guette ce que l'écho transforme et taquine sa sœur sans nier son expertise.",
    rencontre: "Une répétition collective échoue parce que chaque groupe entend un tempo différent.",
    choix: "Essayer une autre disposition, écouter le lieu ou laisser les musiciens réinventer la pièce."
  },
  {
    id: "serelya", file: "PER-CB31-SERELYA.md", groupe: "proches", symbole: "💃",
    accroche: "Elle connaît les villages en écoutant les marchés et les chansons, pas les seuls discours officiels.",
    enScene: "S'arrête à chaque étal, fait rire une tablée puis remarque qui n'a pas été invité à parler.",
    rencontre: "Une fête locale promet de rassembler deux quartiers, mais ses préparatifs n'impliquent qu'un seul.",
    choix: "Écouter les oubliés, répartir les responsabilités ou redessiner la fête avec eux."
  },
  {
    id: "dalen", file: "PER-CB39-DALEN-MIR.md", groupe: "savoirs", symbole: "🗺️",
    accroche: "Un administrateur qui dessine des routes sur ses carnets même à table.",
    enScene: "Pose une question sur les approvisionnements, note les réponses et accepte qu'un repas ne soit pas une séance de travail.",
    rencontre: "Deux villages réclament un entretien prioritaire de leur route d'accès.",
    choix: "Comparer les usages, écouter les habitants ou proposer un calendrier de travaux."
  },
  {
    id: "sariel", file: "PER-CB39-SARIEL-VARN.md", groupe: "savoirs", symbole: "⚖️",
    accroche: "Représenter un Conseil, c'est parfois devoir dire non au souverain.",
    enScene: "Sépare l'amitié de la charge, présente les objections et exige qu'une décision puisse être expliquée.",
    rencontre: "Une proposition urgente reçoit le soutien d'une figure prestigieuse sans examen contradictoire.",
    choix: "Demander un avis du Conseil, rendre les critères publics ou différer la décision.",
    image: "sariel-concept-v01.webp"
  },
  {
    id: "mirelda", file: "PER-CB43-MIRELDA-CHENECLAIR.md", groupe: "metiers", symbole: "🍐",
    accroche: "Tonnelière de Valbrume, elle cherche la juste alliance entre bois, levure et audace.",
    enScene: "Tapote une douve, hume le tonnelet et recule franchement si la pression promet une nouvelle gerbe de mousse.",
    rencontre: "Un essai de fermentation à la poire attire un acheteur avant d'avoir été stabilisé.",
    choix: "Faire patienter, vérifier le procédé ou refuser la commande sans renoncer à l'expérience.",
    image: "mirelda-concept-v01.webp"
  },
  {
    id: "durgan", file: "PER-CB31-DURGAN.md", groupe: "metiers", symbole: "⚒️",
    accroche: "Un maître forgeron qui ne confond jamais puissance de l'outil et justesse du geste.",
    enScene: "Dépose un marteau ordinaire devant l'apprenti et attend de voir sa prise avant de parler d'acier rare.",
    rencontre: "Une commande prestigieuse imposerait une arme difficile à entretenir par son futur porteur.",
    choix: "Refaire les essais d'équilibre, adapter la commande ou refuser une fabrication trop risquée.",
    externe: {
      url: "https://upload.wikimedia.org/wikipedia/commons/b/b6/The_Blacksmith%27s_Forge_by_Alfred_Provis_-_Alfred_Provis_-_ABDAG004355.jpg",
      source: "https://commons.wikimedia.org/wiki/File:The_Blacksmith%27s_Forge_by_Alfred_Provis_-_Alfred_Provis_-_ABDAG004355.jpg",
      titre: "The Blacksmith's Forge", credit: "Alfred Provis · Aberdeen Art Gallery",
      licence: "Domaine public ; reproduction CC0", nature: "Ambiance de forge, pas un portrait de Durgan"
    }
  },
  {
    id: "maelya", file: "PER-CB31-MAELYA.md", groupe: "proches", symbole: "📓",
    accroche: "Une voyageuse qui entend la différence entre un mot traduit et une histoire comprise.",
    enScene: "Répète une expression de pêcheur à mi-voix et demande dans quelles circonstances elle est employée.",
    rencontre: "Un accord commercial achoppe sur un mot que chaque village comprend autrement.",
    choix: "Écouter les locuteurs, réécrire l'accord ou conserver plusieurs traductions avec leurs nuances."
  },
  {
    id: "mael", file: "PER-CB38-MAEL-TORVENN.md", groupe: "metiers", symbole: "🎼",
    accroche: "La valeur d'un instrument se mesure aussi à la facilité de le réparer.",
    enScene: "Observe les doigts du musicien avant d'ouvrir un étui ; il cherche le son et l'usage, pas un blason.",
    rencontre: "Un instrument de scène au son admirable devient presque impossible à réparer pendant une tournée.",
    choix: "Modifier les pièces, former un réparateur local ou choisir une conception plus sobre."
  },
  {
    id: "serah", file: "PER-CB39-SERAH-DENVAR.md", groupe: "savoirs", symbole: "🏹",
    accroche: "Une capitaine des Hautes Marches qui demande à apprendre sans prétendre déjà savoir.",
    enScene: "Reformule un ordre ambigu en consignes vérifiables et s'assure que les nouvelles recrues l'ont compris.",
    rencontre: "Un exercice de patrouille réussit sur le papier mais laisse les derniers marcheurs sans appui.",
    choix: "Réorganiser l'escorte, recueillir les objections ou reprendre l'exercice autrement."
  },
  {
    id: "mirena", file: "PER-CB42-RES-02-MIRENA-VALCOURT.md", groupe: "metiers", symbole: "🕯️",
    accroche: "Une intendante qui sait qu'une maison accueillante commence par des équipes respectées.",
    enScene: "Vérifie les tours de service et refuse qu'une fête se prépare en épuisant ceux qui la rendent possible.",
    rencontre: "Une réception imprévue doublerait la charge de l'équipe de nuit.",
    choix: "Réduire le programme, recruter une aide ponctuelle volontaire ou reporter l'événement."
  },
  {
    id: "ysanne", file: "PER-CB42-RES-05-YSANNE-TROIS-FOURS.md", groupe: "metiers", symbole: "🥘",
    accroche: "Une cuisinière qui n'oublie ni les travailleurs de passage ni la dignité d'un repas simple.",
    enScene: "Goûte la soupe avant de saluer un dignitaire et demande qui doit encore être nourri.",
    rencontre: "Une cuisine doit accueillir des invités nombreux avec des réserves modestes et des habitudes opposées.",
    choix: "Adapter le menu, consulter les convives ou répartir les préparations en ateliers."
  },
  {
    id: "thalea", file: "PER-CB42-RES-06-THALEA-BRISE-ECUME.md", groupe: "savoirs", symbole: "⛵",
    accroche: "Une capitaine de mer qui reste responsable du navire, même avec de grands pouvoirs à bord.",
    enScene: "Écoute les prévisions des marins, assigne les postes et n'accepte une manœuvre que si l'équipage peut la suivre.",
    rencontre: "Un passager important presse la capitaine de partir malgré un avertissement sur les courants.",
    choix: "Différer le départ, proposer une route plus sûre ou refuser l'instruction.",
    externe: {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/52/Christian_M%C3%B8lsted_-_Seascape_with_waves_and_sailing_ship.jpg/960px-Christian_M%C3%B8lsted_-_Seascape_with_waves_and_sailing_ship.jpg",
      source: "https://commons.wikimedia.org/wiki/File:Christian_M%C3%B8lsted_-_Seascape_with_waves_and_sailing_ship.jpg",
      titre: "Seascape with waves and sailing ship", credit: "Christian Mølsted",
      licence: "Domaine public", nature: "Paysage marin d'ambiance, pas un portrait de Thaléa"
    }
  },
  {
    id: "larek", file: "RES-28.md", groupe: "savoirs", symbole: "🪢",
    accroche: "Un apprenti marin dont la meilleure histoire ne le dispense pas d'apprendre les nœuds.",
    enScene: "Parle avec chaleur d'un chien appelé l'Amiral, puis se reprend pour vérifier une manœuvre avant de la tenter.",
    rencontre: "Pendant un apprentissage, une amarre se défait au moment où le pont devient glissant.",
    choix: "Sécuriser d'abord les gens, appeler l'instructrice ou répéter le geste à quai."
  },
  {
    id: "celianne", file: "SEC-68.md", groupe: "metiers", symbole: "🌱",
    accroche: "Une botaniste libre de choisir ses recherches, sans que les titres de sa mère ne l'engagent.",
    enScene: "Compare deux feuilles presque identiques et demande d'où elles viennent avant de parler de leurs usages.",
    rencontre: "Une herbe réputée médicinale pousse dans deux sols différents et donne des résultats incertains.",
    choix: "Observer sans prélever, obtenir un accord local ou comparer les observations avant toute conclusion.",
    externe: {
      url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/74/Plantes_m%C3%A9dicinales_planche_2_-_Medicinal_plants%2C_medical_herbs%2C_botanical_illustrations%2C_plate_2_-_Public_domain_illustration_from_Larousse_du_XX%C3%A8me_si%C3%A8cle_1932.jpg/500px-thumbnail.jpg",
      source: "https://commons.wikimedia.org/wiki/File:Plantes_m%C3%A9dicinales_planche_2_-_Medicinal_plants%2C_medical_herbs%2C_botanical_illustrations%2C_plate_2_-_Public_domain_illustration_from_Larousse_du_XX%C3%A8me_si%C3%A8cle_1932.jpg",
      titre: "Plantes médicinales, planche 2", credit: "Larousse du XXe siècle · EN NOIR & BLANC",
      licence: "CC0 1.0 (fichier Commons)", nature: "Planche botanique d'ambiance, pas un document de Célianne"
    }
  },
  {
    id: "odris", file: "SEC-74.md", groupe: "savoirs", symbole: "⚙️",
    accroche: "Un ancien des machines d'eau qui ne signe aucun plan impossible à réparer au village.",
    enScene: "Tourne la vanne à la main, laisse l'apprenti essayer et demande ce qui se passera si l'enchantement cesse.",
    rencontre: "Un système d'irrigation neuf rend une exploitation dépendante d'une pièce introuvable.",
    choix: "Fabriquer une alternative locale, revenir à un montage ancien ou suspendre les travaux."
  },
  {
    id: "tomas", file: "SEC-63.md", groupe: "savoirs", symbole: "⭕",
    accroche: "Un apprenti qui connaît la différence entre réussir guidé et tenir seul.",
    enScene: "Ajuste son siège, respire, puis décrit honnêtement ce qui demeure stable lorsqu'on retire l'aide.",
    rencontre: "Une démonstration d'atelier pousse les apprentis à masquer leurs difficultés devant des visiteurs.",
    choix: "Montrer les étapes réelles, interrompre l'essai ou demander une séance plus sûre."
  },
  {
    id: "cesar", file: "PER-CB43-CESAR.md", groupe: "proches", symbole: "🐈",
    accroche: "Un chat argenté qui peut parler, mais choisit toujours le moment de se faire entendre.",
    enScene: "S'installe sur le coussin le mieux placé, observe les invités et ne répond pas aux ordres comme à un emploi du temps.",
    rencontre: "Un hôte croit qu'un salon est réservé aux dignitaires et n'ose pas y entrer.",
    choix: "Réinventer l'accueil, écouter ce que souhaite le visiteur ou laisser le chat tranquille."
  },
  {
    id: "oren", file: "PER-CB39-OREN-DAST.md", groupe: "savoirs", symbole: "🧮",
    accroche: "Un responsable des finances qui sait que les chiffres sont des choix entre besoins réels.",
    enScene: "Sort un carnet pour chiffrer une promesse, puis le referme quand Sariel réclame une soirée sans dossiers.",
    rencontre: "Deux communes présentent des projets de développement dont les bénéfices sont difficiles à comparer.",
    choix: "Demander des données locales, organiser une consultation ou réviser les deux projets."
  },
  {
    id: "yse", file: "PER-CB39-YSE-KORR.md", groupe: "savoirs", symbole: "🛤️",
    accroche: "Une commandante qui mesure la sécurité d'une route aux voyageurs qui peuvent l'emprunter.",
    enScene: "Écoute les conducteurs de chariots, examine les haltes et détend une réunion tendue d'une remarque sèche.",
    rencontre: "Une patrouille rassure un bourg mais inquiète les communautés vivant plus loin sur la route.",
    choix: "Repenser la présence militaire, écouter les deux parties ou tester des escortes volontaires."
  },
  {
    id: "dagna_cuivre", file: "PER-CB42-RES-07-DAGNA-ROUE-CUIVRE.md", groupe: "metiers", symbole: "🔩",
    accroche: "Une ingénieure naine pour qui un appareil doit se réparer même loin de son atelier.",
    enScene: "Suit du doigt la course d'un câble et demande qui saura arrêter le treuil en cas d'incident.",
    rencontre: "Un quai veut moderniser son système de levage, au risque de dépendre d'une pièce introuvable.",
    choix: "Privilégier des matériaux courants, former des réparateurs ou différer l'installation."
  },
  {
    id: "eren_valombre", file: "PER-CB42-RES-08-EREN-VALOMBRE.md", groupe: "proches", symbole: "🍃",
    accroche: "Un voyageur revenu à la vie, libre de refuser la place qu'on avait imaginée pour lui.",
    enScene: "Écoute une proposition avec courtoisie, puis demande si l'itinéraire prévoit aussi des jours pour lui.",
    rencontre: "Une délégation compte d'avance sur ses compétences de protocole sans lui avoir demandé son accord.",
    choix: "Présenter une invitation sans obligation, trouver un autre guide ou accepter son refus."
  },
  {
    id: "liora", file: "PER-CB42-RES-10-LIORA-POMMEBRUNE.md", groupe: "metiers", symbole: "🧺",
    accroche: "Une professionnelle de l'hospitalité qui sait qu'une maison fonctionne grâce à des heures de travail invisibles.",
    enScene: "Inspecte les draps et les accès de service, puis pose la question des horaires avant celle du prestige.",
    rencontre: "Des visiteurs arrivent pendant une panne d'eau dans une auberge déjà complète.",
    choix: "Répartir l'accueil avec l'accord de chacun, réduire les services ou solliciter des voisins."
  },
  {
    id: "vaska", file: "PER-CB42-RES-12-VASKA-PERLEDOMBRE.md", groupe: "metiers", symbole: "📦",
    accroche: "Une négociante gobeline dont la réputation tient à la fiabilité des petites livraisons.",
    enScene: "Compte les colis, vérifie les échéances et demande qui supportera réellement un retard.",
    rencontre: "Un atelier éloigné réclame une matière rare, tandis que des villages manquent de fournitures ordinaires.",
    choix: "Rééquilibrer la tournée, partager le transport ou refuser un marché désavantageux."
  },
  {
    id: "nerys_silvenaine", file: "PER-CB42-RES-13-NERYS-SILVENAINE.md", groupe: "savoirs", symbole: "🕯️",
    accroche: "Une spécialiste des enchantements domestiques qui exige de comprendre l'usage avant de modifier un ouvrage.",
    enScene: "Fait décrire une panne par les habitants et inspecte l'installation sans revendiquer l'accès aux lieux interdits.",
    rencontre: "Un système d'éclairage enchanté devient instable au moment d'un accueil collectif.",
    choix: "Prévoir un éclairage de secours, faire diagnostiquer le réseau ou réduire la charge."
  },
  {
    id: "farwen", file: "PER-CB42-RES-14-FARWEN-PIERRECLAIRE.md", groupe: "metiers", symbole: "🧶",
    accroche: "Une artisane des demeures souterraines pour qui le confort se transmet par les gestes quotidiens.",
    enScene: "Examine l'humidité d'un mur, les fibres d'une tenture et les habitudes de celles et ceux qui vivent là.",
    rencontre: "Une maison ancienne doit rester habitée durant la réparation de ses chambres humides.",
    choix: "Planifier par espaces, recueillir l'avis des résidents ou choisir une solution plus légère."
  },
  {
    id: "lurne", file: "PER-CB42-RES-15-LURNE-BRISE-BOULON.md", groupe: "savoirs", symbole: "🧭",
    accroche: "Un navigateur chercheur qui tient autant à la qualité des cartes qu'à sa liberté de publier ce qui peut l'être.",
    enScene: "Compare l'horizon au relevé des étoiles et distingue observations partageables et informations confidentielles.",
    rencontre: "Une carte de côte comporte une zone incertaine, mais les passagers veulent une réponse immédiate.",
    choix: "Choisir la prudence, effectuer de nouveaux relevés ou partager l'incertitude avec le capitaine."
  },
  {
    id: "margha", file: "PER-CB42-RES-16-MARGHA-TROIS-MERS.md", groupe: "metiers", symbole: "🥣",
    accroche: "Une cuisinière de bord pour qui les réserves sont une question de sécurité commune.",
    enScene: "Contrôle les vivres, les restrictions alimentaires et l'état des foyers avant de parler de menu.",
    rencontre: "Une traversée s'allonge et l'équipage refuse que l'on réduise les repas de manière inégale.",
    choix: "Consulter l'équipage, revoir les étapes ou modifier collectivement le rationnement."
  },
  {
    id: "naeline", file: "PER-CB42-RES-18-NAELINE-FENDRELUNE.md", groupe: "proches", symbole: "✏️",
    accroche: "Une dessinatrice en devenir dont la vie retrouvée lui appartient d'abord.",
    enScene: "Observe une façade avec son carnet, écoute une suggestion puis choisit elle-même ce qu'elle dessine.",
    rencontre: "Une maison noble lui commande un portrait en pensant que son ancienne fonction la rend disponible.",
    choix: "Négocier librement le projet, refuser la commande ou proposer un autre regard sur les lieux.",
    image: "naeline-concept-v01.webp"
  },
  {
    id: "nahla", file: "PER-CB43-NAHLA-SEREVIN.md", groupe: "proches", symbole: "📚",
    accroche: "Une cheffe de cabinet qui organise des décisions sans confondre délégation et pouvoir illimité.",
    enScene: "Classe deux courriers urgents, fait préciser la personne habilitée à trancher et protège un temps de travail de l'équipe.",
    rencontre: "Trois interlocuteurs veulent obtenir une réponse du prince le même matin pour des urgences très différentes.",
    choix: "Traiter les dossiers délégués, demander des pièces ou réserver un seul arbitrage personnel."
  },
  {
    id: "saelor", file: "PER-CB42-RES-04-SAELOR-FEUILLEDOR.md", groupe: "metiers", symbole: "🪷",
    accroche: "Un professionnel de l'hospitalité elfique dont l'intérêt pour une visite ne vaut pas engagement.",
    enScene: "Observe l'espace réservé aux invités, s'informe sur leurs langues et leurs usages, puis demande quel rôle on attend réellement de lui.",
    rencontre: "Un accueil diplomatique risque d'effacer les coutumes d'un groupe moins nombreux.",
    choix: "Réorganiser les places, demander l'avis des hôtes ou repousser la réception pour mieux préparer."
  },
  {
    id: "silan", file: "PER-CB42-RES-09-SILAN-SEPT-PONTS.md", groupe: "savoirs", symbole: "✉️",
    accroche: "Un secrétaire de voyage qui sait qu'une lettre bien transmise peut éviter un conflit inutile.",
    enScene: "Vérifie les noms et les relais de courrier, reconnaît un visage familier et fait préciser le destinataire réel.",
    rencontre: "Deux délégations attendent chacune une réponse à une lettre dont les copies diffèrent.",
    choix: "Recouper les archives, entendre les messagers ou suspendre une décision pressée."
  },
  {
    id: "orvak", file: "PER-CB42-RES-11-ORVAK-MAIN-DE-VELOURS.md", groupe: "metiers", symbole: "🍽️",
    accroche: "Un ancien garde devenu maître de l'accueil, attentif à la dignité des invités et des équipes.",
    enScene: "Contrôle les accès et le service sans brusquer les travailleurs, puis désamorce un affront de préséance.",
    rencontre: "Deux invités réclament la même place d'honneur, tandis que le service manque de personnel.",
    choix: "Inventer un protocole partagé, écouter le personnel ou changer la forme de la réception."
  },
  {
    id: "soren_malderive", file: "PER-CB42-RES-17-SOREN-MALDERIVE.md", groupe: "savoirs", symbole: "🛳️",
    accroche: "Un spécialiste de l'embarquement dont la disponibilité reste à confirmer.",
    enScene: "Compare la liste des passagers aux cabines et manifeste son intérêt sans se présenter comme membre d'équipage recruté.",
    rencontre: "Des voyageurs arrivent au quai avec des autorisations incompatibles et des bagages déjà chargés.",
    choix: "Vérifier les pièces, revoir l'embarquement ou solliciter une décision de la capitaine."
  },
  {
    id: "bromvar", file: "PER-CB42-RES-19-BROMVAR-VIEILLES-CLEFS.md", groupe: "proches", symbole: "🗝️",
    accroche: "Un ancien concierge revenu à la vie, libre d'explorer avant de reprendre un métier.",
    enScene: "S'attarde près d'une serrure usée pour écouter ce que le bâtiment raconte, puis refuse qu'on décide de son emploi à sa place.",
    rencontre: "Un bâtiment ancien doit être rouvert, mais personne n'a demandé aux habitants quels espaces préserver.",
    choix: "Organiser la visite avec leur accord, étudier les traces ou remettre l'ouverture à plus tard."
  },
  {
    id: "edran", file: "PER-CB42-RES-20-EDRAN-VEILLE-AU-FEU.md", groupe: "savoirs", symbole: "🕯️",
    accroche: "Le souvenir d'un gardien de phare décédé peut encore guider une enquête sur la sécurité côtière.",
    enScene: "Dans une scène située de son vivant uniquement : inspecte la flamme, les provisions et le chemin de secours avant la marée.",
    rencontre: "Une aventure historique révèle qu'une veille de phare repose sur une seule personne épuisée.",
    choix: "Organiser une relève, demander l'aide du village ou différer une sortie en mer."
  },
  {
    id: "aurelian", file: "PER-CB42-RES-21-AURELIAN-VIRE-SEL.md", groupe: "metiers", symbole: "🍲",
    accroche: "Un chef voyageur Rappelé qui veut transmettre, apprendre et accueillir de nouveaux talents.",
    enScene: "Fait goûter une préparation modeste avant d'écouter les traditions des apprentis sans les obliger à copier la sienne.",
    rencontre: "Une fête de quartier rassemble des recettes concurrentes et des cuisines aux moyens inégaux.",
    choix: "Monter un atelier partagé, adapter le menu ou laisser chaque communauté présenter sa table."
  },
  {
    id: "hroldan", file: "PER-CB43-HROLDAN-TROIS-CLEFS.md", groupe: "savoirs", symbole: "🎒",
    accroche: "Un ancien quartier-maître rappelé à la vie qui ne doit à personne son retour au travail.",
    enScene: "Compte le matériel avec méthode, demande qui portera réellement les charges et garde du temps pour découvrir le présent.",
    rencontre: "Une troupe prépare une longue marche avec des stocks suffisants sur le papier, mais inaccessibles aux derniers rangs.",
    choix: "Répartir les vivres, raccourcir le trajet ou demander aux marcheurs leurs besoins."
  },
  {
    id: "tavian", file: "PER-CB43-TAVIAN-RELSOR.md", groupe: "savoirs", symbole: "📨",
    accroche: "Un envoyé itinérant qui collecte les besoins sans prétendre décider à la place des autorités.",
    enScene: "Classe les témoignages par provenance, visite un quai et distingue les faits observés de ses impressions.",
    rencontre: "Un bourg exige une promesse immédiate alors qu'une mission ne lui confie qu'une enquête préparatoire.",
    choix: "Rédiger un constat, demander un mandat clair ou organiser une concertation locale."
  },
  {
    id: "elwen", file: "PER-CB43-ELWEN-SAUREL.md", groupe: "savoirs", symbole: "🗂️",
    accroche: "Un organisateur de la Maison qui distingue le travail de chaque équipe et protège leurs limites.",
    enScene: "Reconstitue une chaîne de responsabilités et demande si les personnes recrutées disposent de repos et d'une formation réelle.",
    rencontre: "Deux services pensent devoir accomplir la même tâche, tandis qu'une autre fonction reste vacante.",
    choix: "Clarifier les mandats, consulter les équipes ou différer une ouverture trop ambitieuse."
  },
  {
    id: "beren", file: "RES-26.md", groupe: "savoirs", symbole: "⚓",
    accroche: "Un second de confiance qui sait rappeler à sa capitaine qu'un équipage doit aussi dormir.",
    enScene: "Examine les quarts avec Thaléa, demande l'état des amarres et écoute une objection venue du pont.",
    rencontre: "Un départ anticipé met les temps de repos et le contrôle du navire en concurrence.",
    choix: "Retarder l'appareillage, redistribuer les quarts ou réduire les ambitions de la traversée."
  },
  {
    id: "mara_ventrevent", file: "RES-27.md", groupe: "metiers", symbole: "🪢",
    accroche: "Une maîtresse d'équipage qui enseigne la mer sans demander aux apprentis de risquer leur vie pour impressionner.",
    enScene: "Resserre une amarre, vérifie qu'un jeune marin a compris la consigne et réclame une vraie relève après le quart.",
    rencontre: "Un exercice de pont devient dangereux lorsque des passagers veulent assister de trop près à la manœuvre.",
    choix: "Sécuriser le pont, reporter l'exercice ou organiser une démonstration à quai.",
    image: "mara-ventrevent-concept-v01.webp"
  },
  {
    id: "teodan", file: "SEC-69.md", groupe: "savoirs", symbole: "📊",
    accroche: "Un jeune analyste qui sait que les colonnes d'un registre ne remplacent pas la vie d'une exploitation.",
    enScene: "Rapproche les carnets de rendement des observations de terrain et demande aux cultivateurs où ses mesures sont incomplètes.",
    rencontre: "Deux fermes aux résultats similaires supportent des frais de transport très différents.",
    choix: "Vérifier les relevés, entendre les exploitants ou proposer une nouvelle observation sans conclure d'avance."
  },
  {
    id: "mara_belden", file: "SEC-70.md", groupe: "metiers", symbole: "🌾",
    accroche: "Une agricultrice qui place les familles avant l'enthousiasme pour les machines nouvelles.",
    enScene: "Demande combien de mains, de jours et de réserves un essai réclame, puis consulte ceux qui effectueront le travail.",
    rencontre: "Une invention promet d'alléger une récolte, mais les ouvriers redoutent une panne en pleine saison.",
    choix: "Convenir d'un essai limité, préparer une solution manuelle ou renoncer sans sanction."
  },
  {
    id: "helene_varrec", file: "SEC-71.md", groupe: "metiers", symbole: "🌱",
    accroche: "Une exploitante de Corvelis qui protège le droit de comparer sans imposer une seule façon de cultiver.",
    enScene: "Décrit ses terres avec précision, écoute le mécanicien puis distingue ce qui fonctionne ici de ce qui conviendrait ailleurs.",
    rencontre: "Une démonstration réussit sur une parcelle facile, tandis qu'un terrain voisin demeure incertain.",
    choix: "Faire une seconde mesure, conserver plusieurs méthodes ou demander l'avis des travailleurs."
  },
  {
    id: "jorven", file: "SEC-72.md", groupe: "metiers", symbole: "🏚️",
    accroche: "Un exploitant confronté à des pertes qui ne prouvent ni fraude ni incapacité.",
    enScene: "Suit la trace des sacs entre le moulin et la réserve, observe les retards et tient l'accusation à distance.",
    rencontre: "Des quantités manquent à l'inventaire, mais les comptes et les lieux de stockage ne concordent pas.",
    choix: "Reprendre l'inventaire, faire contrôler le matériel ou organiser un audit contradictoire."
  },
  {
    id: "hervald", file: "SEC-73.md", groupe: "metiers", symbole: "🛞",
    accroche: "À soixante-seize ans, un cultivateur sait qu'un chariot se juge sur la pente, pas dans l'atelier.",
    enScene: "Prend une poignée de terre, scrute les racines et invite l'inventeur à pousser sa machine sur le passage difficile.",
    rencontre: "Un dispositif aide sur sol plat, mais dévie dès que la piste s'incline.",
    choix: "Modifier l'essai avec Odris, laisser l'outil de côté ou demander une correction avant tout usage.",
    image: "hervald-trois-sillons-concept-v01.webp"
  },
  {
    id: "corin_avarenne", file: "SEC-54.md", groupe: "proches", symbole: "🕊️",
    accroche: "Un négociateur en devenir dont le courage consiste aussi à reconnaître les limites de son mandat.",
    enScene: "Prépare une audience, identifie les personnes habilitées à répondre et refuse d'annoncer un accord non signé.",
    rencontre: "Un messager réclame une promesse immédiate avant la rencontre avec l'autorité de Corvelis.",
    choix: "Clarifier le mandat, obtenir une entrevue ou transmettre la demande sans s'engager au nom d'autrui."
  },
  {
    id: "sigrun_varek", file: "PER-CB42-SIGRUN-VAREK.md", groupe: "savoirs", symbole: "🧱",
    accroche: "Une interlocutrice commerciale qui distingue un passage dessiné d'un passage autorisé.",
    enScene: "Déroule un tracé hypothétique, repère les accès à vérifier et demande quels habitants seraient concernés.",
    rencontre: "Un marchand veut annoncer le tunnel oriental alors que les reconnaissances ne sont pas faites.",
    choix: "Exiger l'étude du terrain, consulter les intéressés ou suspendre toute publicité trompeuse."
  },
  {
    id: "dorsa", file: "PER-CB43-DORSA-VAUN.md", groupe: "metiers", symbole: "🧺",
    accroche: "Une ancienne responsable des fournitures qui observe les besoins avant d'accepter une place.",
    enScene: "Examine l'approvisionnement du manoir, questionne l'équipe sur la charge de travail et note ce qui lui reste à comprendre.",
    rencontre: "Une réserve fonctionne grâce à des tâches informelles dont personne ne veut devenir l'unique responsable.",
    choix: "Documenter les besoins, consulter les Revenants ou définir une mission limitée sans embauche présumée."
  },
  {
    id: "sigrun_pierreval", file: "SEC-65.md", groupe: "metiers", symbole: "🏰",
    accroche: "Une femme d'Aldhammar qui conserve la mémoire d'un palais sans en posséder d'office les clefs.",
    enScene: "Interroge les anciens artisans, parcourt les réserves et note séparément souvenirs, dégradations et travaux possibles.",
    rencontre: "Un vieux bâtiment pourrait rouvrir, mais ni le personnel ni son état réel n'ont été établis.",
    choix: "Faire un inventaire, consulter les familles de métiers ou remettre l'ouverture à plus tard."
  },
  {
    id: "reginald", file: "SEC-64.md", groupe: "metiers", symbole: "🍺",
    accroche: "Le tavernier d'un souvenir d'enfance dont la vie présente demeure inconnue.",
    enScene: "Uniquement dans un retour en arrière annoncé : essuie son comptoir et tente de préserver les règles de sa salle.",
    rencontre: "Un témoin raconte les mêmes premières bières d'une façon très différente des souvenirs d'Orin.",
    choix: "Recouper les témoignages, respecter les blancs du récit ou jouer une scène historique explicitement fictive."
  },
  {
    id: "yrsa", file: "SEC-29.md", groupe: "savoirs", symbole: "⚓",
    accroche: "Une personnalité du commerce et des ports dont les liens familiaux ne valent pas mandat politique.",
    enScene: "Dans une scène nouvelle à son époque, fait préciser les itinéraires et les garanties avant de parler d'un investissement.",
    rencontre: "Un projet portuaire invoque son nom et celui de son cousin Maëron sans les avoir consultés.",
    choix: "Vérifier l'accord des intéressés, étudier les besoins ou refuser l'usage de leurs noms."
  },
  {
    id: "garrik", file: "SEC-05.md", groupe: "metiers", symbole: "🍮",
    accroche: "Un tavernier qui reçoit même les visiteurs prestigieux selon les règles de sa propre maison.",
    enScene: "Relit une recette illustrée avec Maëlys, surveille sa salle et rappelle discrètement le service ordinaire.",
    rencontre: "Des invités veulent transformer une soirée de taverne en réception officielle sans avoir demandé l'accord de l'hôte.",
    choix: "Négocier le cadre, préserver le service ou proposer une fête distincte."
  }
];

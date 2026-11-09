const fields = (...entries) => entries.map(([key, label, choices]) => ({ key, label, choices }));
const story = 'Intrigues et rencontres';
const world = 'Atlas, peuples et objets';
const rules = 'Magie et techniques';

export const CREATION_TYPES = Object.freeze({
  npc: { label: 'PNJ', shelf: 'bestiaire', group: 'Personnages non joueurs', area: story,
    detail: 'Rôle, motivation et liens.',
    fields: fields(['role', 'Rôle ou métier'], ['motivation', 'Motivation'], ['relations', 'Relations et alliés']) },
  creature: { label: 'Créature', shelf: 'bestiaire', group: 'Créatures du MJ', area: story,
    detail: 'Habitat, comportement et particularités.',
    fields: fields(['habitat', 'Habitat'], ['behavior', 'Comportement'], ['traits', 'Traits et signes de danger']) },
  encounter: { label: 'Rencontre', shelf: 'aventures', group: 'Rencontres', area: story,
    detail: 'Participants, déclencheur et issues.',
    fields: fields(['participants', 'Participants'], ['trigger', 'Déclencheur'], ['outcomes', 'Issues possibles']) },
  quest: { label: 'Quête', shelf: 'aventures', group: 'Quêtes', area: story,
    detail: 'Accroche, objectif et dénouements.',
    fields: fields(['hook', 'Accroche'], ['objective', 'Objectif'], ['outcomes', 'Dénouements possibles'], ['reward', 'Récompense envisagée']) },
  mission: { label: 'Mission', shelf: 'aventures', group: 'Missions', area: story,
    detail: 'Commanditaire, mandat et conditions.',
    fields: fields(['patron', 'Commanditaire'], ['objective', 'Mandat et objectif'], ['constraints', 'Conditions de réussite'], ['reward', 'Récompense envisagée']) },
  adventure: { label: 'Aventure', shelf: 'aventures', group: 'Aventures du MJ', area: story,
    detail: 'Point de départ, scènes et conclusions.',
    fields: fields(['hook', 'Situation initiale'], ['audience', 'Groupe et niveau conseillés'], ['scenes', 'Scènes ou jalons'], ['outcomes', 'Conclusions possibles']) },
  place: { label: 'Lieu', shelf: 'atlas', group: 'Lieux du MJ', area: world,
    detail: 'Du continent à la maison, avec un lieu parent facultatif.',
    fields: fields(['scale', 'Type de lieu', ['Continent', 'Pays', 'Région', 'Province', 'Ville', 'Village', 'Quartier', 'Maison', 'Donjon', 'Route', 'Lieu divers']],
      ['landmarks', 'Repères et particularités'], ['access', 'Accès et déplacements']) },
  faction: { label: 'Faction', shelf: 'campagne', group: 'Factions', area: world,
    detail: 'Objectifs, membres et influence.',
    fields: fields(['purpose', 'Objectifs'], ['members', 'Membres et interlocuteurs'], ['influence', 'Territoire et influence']) },
  object: { label: 'Objet', shelf: 'objets', group: 'Objets du MJ', area: world,
    detail: 'Catégorie, propriétés et usages.',
    fields: fields(['category', 'Catégorie', ['Outil', 'Arme', 'Armure', 'Potion', 'Artefact', 'Document', 'Matériau', 'Autre']],
      ['use', 'Usage et propriétés proposées'], ['origin', 'Provenance']) },
  spell: { label: 'Sort', shelf: 'sorts', group: 'Sorts du MJ', area: rules,
    detail: 'Cercle, coût proposé, effet et limites.',
    fields: fields(['circle', 'Cercle proposé', ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX']],
      ['cost', 'Coût et composantes proposés'], ['effect', 'Effet proposé'], ['limits', 'Portée, durée et limites']) },
  ritual: { label: 'Rituel', shelf: 'sorts', group: 'Rituels du MJ', area: rules,
    detail: 'Participants, préparation et effet.',
    fields: fields(['participants', 'Participants et prérequis'], ['preparation', 'Durée et préparation'], ['effect', 'Effet proposé'], ['limits', 'Limites et interruptions']) },
  ability: { label: 'Capacité', shelf: 'actions', group: 'Capacités du MJ', area: rules,
    detail: 'Domaine, déclenchement, effet et limites.',
    fields: fields(['category', 'Famille proposée', ['Aptitude', 'Technique', 'Signature', 'Autre']],
      ['requirements', 'Domaine et prérequis'], ['effect', 'Effet proposé'], ['limits', 'Coût et limites']) },
});

export const CREATION_STATES = Object.freeze({
  draft: 'Brouillon MJ', ready: 'Prête pour la séance', shelved: 'Mise de côté',
});

export const ADVENTURE_SCENE_LIMIT = 12;

export function adventureMilestones(text) {
  return text.split(/\r\n?|\n/).map(line => line.trim().replace(/^(?:[-*•]|\d+[.)])(?:\s+|$)/, '')).filter(Boolean).map(content => {
    const separator = content.indexOf(' :: ');
    return separator < 0 ? { title: content, privateNotes: '' }
      : { title: content.slice(0, separator).trim(), privateNotes: content.slice(separator + 4).trim() };
  });
}

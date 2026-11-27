/**
 * MATH-ACTOR-006 — brouillon de rencontre PUREMENT CONSULTATIF.
 * Pas de nouveau moteur de dégâts, pas d'échelle de danger homologuée.
 * Ne lit ni ne sérialise les secrets MJ ; ne crédite ni ne débite aucune ressource.
 */
export const ENCOUNTER_SCHEMA = 'entre-rives.encounter-draft.v1';
const SIDES = new Set(['allies', 'adversaries', 'neutral']);
const KINDS = new Set(['pj', 'pnj', 'creature']);
const ROLES = new Set(['defense', 'assaut', 'soutien', 'controle', 'eclaireur', 'boss', 'personnalise']);

const isObj = value => value !== null && typeof value === 'object' && !Array.isArray(value);
function requiredText(value, label) {
  if (typeof value !== 'string' || !value.trim() || value.length > 200) throw new TypeError(label + ' doit être une chaîne non vide (200 caractères maximum).');
  return value;
}
function ref(value, label) {
  if (!isObj(value)) throw new TypeError(label + ' invalide.');
  return { id: requiredText(value.id, label + '.id'), version: requiredText(value.version, label + '.version') };
}
function actor(value) {
  if (!isObj(value)) throw new TypeError('Participant invalide.');
  if (!KINDS.has(value.kind) || !SIDES.has(value.side) || !ROLES.has(value.role)) throw new RangeError('Type, camp ou rôle non reconnu.');
  if (!Number.isInteger(value.level) || value.level < 1 || value.level > 25) throw new RangeError('Niveau attendu : 1 à 25 (25+ n’est pas un niveau).');
  if (!isObj(value.profileRef) || value.profileRef.engine !== 'M03') throw new TypeError('Profil M03 vérifié requis.');
  if (!Number.isInteger(value.profileRef.level) || value.profileRef.level !== value.level) throw new RangeError('Le niveau du profil M03 doit correspondre à celui du participant.');
  return {
    actorId: requiredText(value.actorId, 'actorId'), kind: value.kind, side: value.side,
    label: requiredText(value.label, 'label'), level: value.level, role: value.role,
    sourceRef: ref(value.sourceRef, 'sourceRef'),
    profileRef: { ...ref(value.profileRef, 'profileRef'), engine: 'M03', level: value.level },
  };
}
function validateDraft(input) {
  if (!isObj(input) || input.schema !== ENCOUNTER_SCHEMA) throw new TypeError('Version de brouillon non prise en charge.');
  if (!Number.isSafeInteger(input.revision) || input.revision < 0) throw new RangeError('Révision invalide.');
  if (!Array.isArray(input.participants) || input.participants.length > 200) throw new RangeError('Liste de participants invalide ou trop grande.');
  const participants = input.participants.map(actor);
  const unique = new Set();
  for (const entry of participants) {
    if (unique.has(entry.actorId)) throw new RangeError('Participant dupliqué : ' + entry.actorId);
    unique.add(entry.actorId);
  }
  return {
    schema: ENCOUNTER_SCHEMA,
    encounterId: requiredText(input.encounterId, 'encounterId'),
    campaignId: requiredText(input.campaignId, 'campaignId'),
    revision: input.revision, participants,
  };
}
export function createEncounterDraft({ encounterId, campaignId, participants = [] }) {
  return validateDraft({ schema: ENCOUNTER_SCHEMA, encounterId, campaignId, revision: 0, participants });
}
export function importEncounterDraft(serialized) {
  const data = typeof serialized === 'string' ? JSON.parse(serialized) : serialized;
  return validateDraft(data);
}
export function exportEncounterDraft(draft) { return JSON.stringify(validateDraft(draft)); }
export function addEncounterParticipant(draft, selected, expectedRevision) {
  const current = validateDraft(draft);
  if (current.revision !== expectedRevision) throw new Error('Révision périmée : recharger la rencontre avant modification.');
  return validateDraft({ ...current, revision: current.revision + 1, participants: [...current.participants, actor(selected)] });
}
export function removeEncounterParticipant(draft, actorId, expectedRevision) {
  const current = validateDraft(draft);
  if (current.revision !== expectedRevision) throw new Error('Révision périmée : recharger la rencontre avant modification.');
  if (!current.participants.some(x => x.actorId === actorId)) throw new Error('Participant inconnu.');
  return validateDraft({ ...current, revision: current.revision + 1, participants: current.participants.filter(x => x.actorId !== actorId) });
}
const median = nums => nums.length === 0 ? null : nums.length % 2 ? nums[(nums.length - 1) / 2] : (nums[nums.length / 2 - 1] + nums[nums.length / 2]) / 2;
export function summarizeEncounter(draft) {
  const {participants} = validateDraft(draft);
  const bySide = {};
  for (const side of SIDES) {
    const group = participants.filter(x => x.side === side);
    const levels = group.map(x => x.level).sort((a,b)=>a-b);
    const roles = Object.fromEntries([...ROLES].filter(role => group.some(x => x.role === role)).map(role => [role, group.filter(x => x.role === role).length]));
    bySide[side] = { count: group.length, levels, minimum: levels[0] ?? null, maximum: levels.at(-1) ?? null, median: median(levels), roles };
  }
  const a = bySide.allies; const b = bySide.adversaries;
  return {
    status: 'consultatif', bySide,
    comparison: {
      differenceInHeadcount: b.count - a.count,
      differenceInMedianLevel: b.median === null || a.median === null ? null : b.median - a.median,
    },
    threatRating: null,
    warning: 'Comparaison descriptive, pas un calcul officiel de difficulté ou de PV ; consulter les profils M03 et valider la rencontre avec le MJ.',
  };
}
export async function previewEncounterAction(draft, { attackerId, defenderId, action, resolveM03 }) {
  const current = validateDraft(draft);
  if (typeof resolveM03 !== 'function') throw new TypeError('Résolveur M03 officiel requis.');
  if (!isObj(action) || 'effects' in action || 'resourceDebit' in action || 'apply' in action)
    throw new TypeError('Action de base uniquement : effets INDEX, dépenses et application nécessitent une validation séparée.');
  const attacker = current.participants.find(x => x.actorId === attackerId);
  const defender = current.participants.find(x => x.actorId === defenderId);
  if (!attacker || !defender || attacker.actorId === defender.actorId) throw new RangeError('Attaquant ou cible invalide.');
  const input = structuredClone({attacker, defender, action});
  const result = await resolveM03(input);
  return { status: 'preview', engine: 'M03', attackerId, defenderId, result: structuredClone(result), applied: false, spent: false };
}

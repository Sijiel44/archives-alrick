export const QUESTS_KEY = 'entreRivesQuestStepsV21';
export const QUEST_STEP_FIELDS = ['id', 'kind', 'questId', 'title', 'playerText', 'notes', 'sceneIds', 'references'];
export const QUEST_KINDS = Object.freeze({ clue: 'Indice', objective: 'Objectif' });
export const QUEST_STATES = Object.freeze({
  clue: { planned: 'À découvrir', revealed: 'Découvert', resolved: 'Exploité', abandoned: 'Écarté' },
  objective: { planned: 'À entreprendre', revealed: 'En cours', resolved: 'Accompli', abandoned: 'Abandonné' },
});
export const questSteps = campaign => campaign?.[QUESTS_KEY] ?? [];
export const questState = step => step.history.at(-1)?.to ?? 'planned';
export const questParents = campaign => (campaign?.entreRivesCreationsV10 ?? []).filter(item => ['quest', 'mission', 'adventure'].includes(item.kind));
export function unlinkQuestReference(campaign, id) {
  for (const step of questSteps(campaign)) step.references = step.references.filter(ref => ref.scope !== 'campaign' || ref.id !== id);
}
const record = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const exact = (value, fields) => record(value) && Object.keys(value).length === fields.length && fields.every(key => Object.hasOwn(value, key));
const id = value => typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9:_-]{0,127}$/.test(value);
const text = (value, max) => typeof value === 'string' && value.length <= max;
const ids = (value, max) => Array.isArray(value) && value.length <= max && value.every(id) && new Set(value).size === value.length;
const timestamp = value => typeof value === 'string' && /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString() === value;
export function validQuestStep(value) {
  return record(value) && id(value.id) && /^quest-step-[a-z0-9-]+$/.test(value.id) && Object.hasOwn(QUEST_KINDS, value.kind) &&
    (value.questId === null || id(value.questId)) && text(value.title, 160) && Boolean(value.title.trim()) &&
    text(value.playerText, 4000) && text(value.notes, 8000) && ids(value.sceneIds, 20) &&
    Array.isArray(value.references) && value.references.length <= 12 && value.references.every(ref =>
      exact(ref, ['id', 'scope']) && id(ref.id) && ['campaign', 'catalogue'].includes(ref.scope) && ref.id !== value.id) &&
    new Set(value.references.map(ref => `${ref.scope}:${ref.id}`)).size === value.references.length;
}
export function validQuestDecision(value) {
  return record(value) && id(value.id) && Object.hasOwn(QUEST_STATES.clue, value.state) &&
    timestamp(value.at) && text(value.note, 1000) && Boolean(value.note.trim());
}
export function validateQuestSteps(campaign) {
  const steps = campaign[QUESTS_KEY];
  const fail = message => { throw new Error(message); };
  if (!Array.isArray(steps) || steps.length > 500) fail('Le suivi est invalide ou dépasse 500 indices et objectifs.');
  const unique = new Set(steps.map(step => step?.id));
  const local = new Set([...(campaign.characters ?? []), ...(campaign.creatures ?? []), ...(campaign.entreRivesCreationsV10 ?? []),
    ...(campaign.entreRivesFresqueMarkersV4 ?? []), ...(campaign.entreRivesLinkedImagesV15 ?? [])].map(item => item.id));
  if (unique.size !== steps.length || steps.some(step => local.has(step.id))) fail('Deux fiches de suivi portent le même identifiant.');
  const parents = new Set(questParents(campaign).map(item => item.id)), scenes = new Set(campaign.scenes.map(scene => scene.id));
  for (const step of steps) {
    if (!exact(step, [...QUEST_STEP_FIELDS, 'history']) || !validQuestStep(step)) fail('Un indice ou objectif ne correspond pas au format du suivi.');
    if (step.questId !== null && !parents.has(step.questId) || step.sceneIds.some(sceneId => !scenes.has(sceneId)) ||
        step.references.some(ref => ref.scope === 'campaign' && !local.has(ref.id) && !unique.has(ref.id))) {
      fail('Les quêtes, scènes et fiches privées doivent appartenir à cette campagne.');
    }
    if (!Array.isArray(step.history) || step.history.length > 100) fail('L’historique de décisions est invalide ou plein (100 décisions).');
    let state = 'planned'; const events = new Set();
    for (const event of step.history) {
      if (!exact(event, ['id', 'at', 'from', 'to', 'note']) || !id(event.id) || events.has(event.id) ||
          !validQuestDecision({ id: step.id, at: event.at, state: event.to, note: event.note }) || event.from !== state || event.to === state) {
        fail('La succession des décisions du suivi est incohérente.');
      }
      events.add(event.id); state = event.to;
    }
  }
}

/** Public DTO ONLY. Never spread or serialize the campaign, scene or imported sheets. */
export const PLAYER_DTO_SCHEMA = 'cer.studio.player.whitelist.dg003.v0';
export const PLAYER_READY = 'cer.dg003.player.ready';
export const PLAYER_SHOW = 'cer.dg003.player.show';
export const PLAYER_CLEAR = 'cer.dg003.player.clear';
export const STUDIO_ORIGIN = 'http://127.0.0.1:4173';
export const PLAYER_ORIGIN = 'http://127.0.0.1:4174';
export const PROVISIONAL_CAMPAIGN_SCHEMA = 'cer.studio.dg003.provisional.v0';

export function plainText(value, max = 2000) {
  if (typeof value !== 'string') return '';
  return value.slice(0, max);
}

export function checkedPlayerOrigins(studioOrigin, playerOrigin) {
  // No wildcard, localhost alias, file:, data:, same-origin, public host or arbitrary port.
  return studioOrigin === STUDIO_ORIGIN && playerOrigin === PLAYER_ORIGIN && studioOrigin !== playerOrigin;
}

export function makePlayerProjection(campaign, choices = {}) {
  if (!campaign || !Array.isArray(campaign.scenes)) throw new TypeError('Campagne absente');
  const scene = campaign.scenes.find((x) => x && x.id === choices.sceneId);
  if (!scene) throw new Error('Scène non sélectionnée');
  const allowed = new Set(Array.isArray(scene.participantIds) ? scene.participantIds : []);
  const selected = new Set(Array.isArray(choices.actorIds) ? choices.actorIds : []);
  const actors = [...(Array.isArray(campaign.characters) ? campaign.characters : []),
    ...(Array.isArray(campaign.creatures) ? campaign.creatures : [])];
  // Explicit literal field names, no object spread, profile, notes, provenance or unknown extensions.
  const visibleActors = actors.filter((actor) => actor && allowed.has(actor.id) && selected.has(actor.id))
    .slice(0, 50).map((actor) => ({label: plainText(actor.publicLabel, 120)}))
    .filter((actor) => !!actor.label);
  return {
    schema: PLAYER_DTO_SCHEMA,
    revision: Number.isSafeInteger(campaign.revision) && campaign.revision >= 0 ? campaign.revision : 0,
    scene: {
      title: choices.shareTitle === true ? plainText(scene.title, 160) : '',
      description: choices.shareDescription === true ? plainText(scene.publicDescription, 2000) : '',
      visibleActors,
    },
  };
}

/** Sanitizes a possibly hostile remote payload again on the player origin. */
export function validatePlayerDTO(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw) || raw.schema !== PLAYER_DTO_SCHEMA) return null;
  if (!Number.isSafeInteger(raw.revision) || raw.revision < 0) return null;
  const scene = raw.scene;
  if (!scene || typeof scene !== 'object' || Array.isArray(scene) ||
      typeof scene.title !== 'string' || scene.title.length > 160 ||
      typeof scene.description !== 'string' || scene.description.length > 2000 ||
      !Array.isArray(scene.visibleActors) || scene.visibleActors.length > 50) return null;
  if (scene.visibleActors.some((item) => !item || typeof item !== 'object' || Array.isArray(item) ||
    typeof item.label !== 'string' || item.label.length > 120)) return null;
  // Allow only the known DTO structure, even when a trusted window accidentally sends extras.
  if (Object.keys(raw).some((key) => !['schema','revision','scene'].includes(key)) ||
      Object.keys(scene).some((key) => !['title','description','visibleActors'].includes(key)) ||
      scene.visibleActors.some((item) => Object.keys(item).some((key) => key !== 'label'))) return null;
  return {
    schema: PLAYER_DTO_SCHEMA,
    revision: raw.revision,
    scene: {title: plainText(scene.title, 160), description: plainText(scene.description, 2000),
      visibleActors: scene.visibleActors.map((item) => ({label: plainText(item.label, 120)}))},
  };
}

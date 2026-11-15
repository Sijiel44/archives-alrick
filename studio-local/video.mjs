import { validAudioUrl } from './audio.mjs';

// Les sources restent des liens privés de campagne. Les fichiers ne sont pas encodés.
export const VIDEO_KEY = 'entreRivesVideoV19';

const record = value => value !== null && typeof value === 'object' &&
  [Object.prototype, null].includes(Object.getPrototypeOf(value));
const keys = (value, fields) => record(value) && Object.keys(value).length === fields.length &&
  fields.every(field => Object.hasOwn(value, field));
const id = value => typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9:_-]{0,127}$/.test(value);

export const validVideoUrl = validAudioUrl;

export function validSceneVideo(value) {
  return keys(value, ['sceneId', 'url', 'imageId', 'loop', 'dim', 'credit']) &&
    id(value.sceneId) && validVideoUrl(value.url) && id(value.imageId) && typeof value.loop === 'boolean' &&
    Number.isInteger(value.dim) && value.dim >= 0 && value.dim <= 80 &&
    typeof value.credit === 'string' && value.credit.length <= 600;
}

export function videoForScene(campaign, sceneId) {
  return campaign?.[VIDEO_KEY]?.find(video => video.sceneId === sceneId);
}

export function validateSceneVideos(videos, sceneIds) {
  if (!Array.isArray(videos) || videos.length > sceneIds.size || !videos.every(validSceneVideo)) {
    throw new Error('Les fonds vidéo contiennent des champs invalides ou dépassent le nombre de scènes.');
  }
  const selected = new Set();
  for (const video of videos) {
    if (!sceneIds.has(video.sceneId) || selected.has(video.sceneId)) {
      throw new Error('Chaque fond vidéo doit viser une scène unique de cette campagne.');
    }
    selected.add(video.sceneId);
  }
  return true;
}

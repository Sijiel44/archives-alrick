import { validAudioUrl } from './audio.mjs';

export const SCENE_IMAGES_KEY = 'entreRivesSceneImagesV20';
export const SCENE_IMAGE_MODES = Object.freeze({ contain: 'Image entière', cover: 'Panorama recadré', map: 'Carte détaillée' });
export const sceneImage = (campaign, sceneId) => campaign?.[SCENE_IMAGES_KEY]?.find(image => image.sceneId === sceneId);
export function validSceneImage(value) {
  const fields = ['sceneId', 'url', 'alt', 'credit', 'mode'];
  return value && typeof value === 'object' && Object.keys(value).length === fields.length && fields.every(key => Object.hasOwn(value, key)) &&
    typeof value.sceneId === 'string' && /^[A-Za-z0-9][A-Za-z0-9:_-]{0,127}$/.test(value.sceneId) && validAudioUrl(value.url) &&
    typeof value.alt === 'string' && value.alt.trim().length > 0 && value.alt.length <= 300 &&
    typeof value.credit === 'string' && value.credit.length <= 600 && Object.hasOwn(SCENE_IMAGE_MODES, value.mode);
}
export function validateSceneImages(images, sceneIds) {
  if (!Array.isArray(images) || images.length > sceneIds.size || !images.every(validSceneImage) ||
      images.some(image => !sceneIds.has(image.sceneId)) || new Set(images.map(image => image.sceneId)).size !== images.length) {
    throw new Error('Chaque image doit avoir un lien HTTPS, une description, un affichage et une scène unique de cette campagne.');
  }
}
export function sceneImageIllustration(campaign, scene) {
  const image = sceneImage(campaign, scene?.id);
  return image && { id: scene.id, name: `Image de scène · ${scene.title}`, art: {
    src: image.url, alt: image.alt, remote: true, map: image.mode === 'map', mode: image.mode,
  } };
}

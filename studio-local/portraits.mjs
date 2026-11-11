import { validImageUrl } from './store.mjs';

const MAX_PORTRAIT_LENGTH = 180000;

export function validPortrait(value) {
  return typeof value === 'string' && (value === '' || validImageUrl(value) ||
    (value.length < MAX_PORTRAIT_LENGTH && /^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(value)));
}

export async function readPortrait(file) {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 3 * 1024 * 1024) {
    throw new Error('Choisis une image JPG, PNG ou WebP de 3 Mio maximum.');
  }
  const url = URL.createObjectURL(file);
  const image = new Image();
  try {
    image.src = url;
    await image.decode();
    if (Math.max(image.naturalWidth, image.naturalHeight) > 8192) throw new Error('Le portrait dépasse 8 192 pixels.');
    const canvas = document.createElement('canvas');
    const scale = Math.min(1, 320 / Math.max(image.naturalWidth, image.naturalHeight));
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('La préparation du portrait est indisponible dans ce navigateur.');
    context.fillStyle = '#1c2933';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const portrait = canvas.toDataURL('image/jpeg', 0.68);
    if (!validPortrait(portrait)) throw new Error('Le portrait reste trop volumineux après réduction.');
    return portrait;
  } catch (error) {
    if (error.name === 'EncodingError') throw new Error('Cette image est illisible. Choisis un autre fichier.');
    throw error;
  } finally { URL.revokeObjectURL(url); }
}

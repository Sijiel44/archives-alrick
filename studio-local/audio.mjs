// Métadonnées privées de régie sonore. Les fichiers restent chez leur hébergeur.
export const AUDIO_KEY = 'entreRivesMediaV18';
export const AUDIO_LIMITS = Object.freeze({ tracks: 100, playlists: 20, tracksPerPlaylist: 50 });

const record = value => value !== null && typeof value === 'object' &&
  [Object.prototype, null].includes(Object.getPrototypeOf(value));
const keys = (value, fields) => record(value) && Object.keys(value).length === fields.length &&
  fields.every(field => Object.hasOwn(value, field));
const id = value => typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9:_-]{0,127}$/.test(value);
const name = value => typeof value === 'string' && Boolean(value.trim()) && value.length <= 160;

export function validAudioUrl(value) {
  if (typeof value !== 'string' || value.length > 2048 || !value.startsWith('https://') || /[\s\u0000-\u001f\u007f\\]/u.test(value)) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && Boolean(url.hostname) && !url.username && !url.password;
  } catch { return false; }
}

export function validAudioTrack(value) {
  return keys(value, ['id', 'name', 'url', 'credit']) && id(value.id) && name(value.name) && validAudioUrl(value.url) &&
    typeof value.credit === 'string' && value.credit.length <= 600;
}

export function validAudioPlaylist(value) {
  return keys(value, ['id', 'name', 'trackIds', 'loop']) && id(value.id) && name(value.name) &&
    Array.isArray(value.trackIds) && value.trackIds.length <= AUDIO_LIMITS.tracksPerPlaylist && value.trackIds.every(id) &&
    typeof value.loop === 'boolean';
}

export function audioLibrary(campaign) {
  return campaign?.[AUDIO_KEY] ?? { tracks: [], playlists: [], scenePlaylists: [] };
}

export function validateAudioLibrary(value, sceneIds) {
  const invalid = message => { throw new Error(message); };
  if (!keys(value, ['tracks', 'playlists', 'scenePlaylists']) ||
      !Array.isArray(value.tracks) || value.tracks.length > AUDIO_LIMITS.tracks || !value.tracks.every(validAudioTrack) ||
      !Array.isArray(value.playlists) || value.playlists.length > AUDIO_LIMITS.playlists || !value.playlists.every(validAudioPlaylist) ||
      !Array.isArray(value.scenePlaylists) || value.scenePlaylists.length > sceneIds.size) {
    invalid('La régie sonore contient des champs invalides ou dépasse ses limites.');
  }
  const tracks = new Set(value.tracks.map(track => track.id));
  const playlists = new Set(value.playlists.map(playlist => playlist.id));
  if (tracks.size !== value.tracks.length || playlists.size !== value.playlists.length ||
      value.playlists.some(playlist => tracks.has(playlist.id))) {
    invalid('Deux éléments de la régie sonore ont le même identifiant.');
  }
  if (value.playlists.some(playlist => playlist.trackIds.some(trackId => !tracks.has(trackId)))) {
    invalid('Une playlist contient une piste absente de cette campagne.');
  }
  const assignments = new Set();
  for (const assignment of value.scenePlaylists) {
    if (!keys(assignment, ['sceneId', 'playlistId']) || !id(assignment.sceneId) || !id(assignment.playlistId) ||
        !sceneIds.has(assignment.sceneId) || !playlists.has(assignment.playlistId) || assignments.has(assignment.sceneId)) {
      invalid('La playlist suggérée doit appartenir à cette campagne et viser une scène unique.');
    }
    assignments.add(assignment.sceneId);
  }
  return true;
}

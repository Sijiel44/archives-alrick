const youtubeHosts = new Set(['youtube.com', 'www.youtube.com', 'm.youtube.com', 'music.youtube.com', 'youtube-nocookie.com', 'www.youtube-nocookie.com', 'youtu.be']);
const videoId = /^[A-Za-z0-9_-]{11}$/;
const playlistId = /^[A-Za-z0-9_-]{10,100}$/;
const spotifyId = /^[A-Za-z0-9]{22}$/;
const songId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const invalid = message => { throw new Error(message); };

// Une URL inconnue en HTTPS peut être un fichier direct ; jamais une iframe arbitraire.
export function parseServiceMediaURL(value) {
  if (typeof value !== 'string' || value.length > 2048 || /[\s\u0000-\u001f\u007f\\]/u.test(value)) return invalid('Collez un lien HTTPS complet, sans espace.');
  let parsed;
  try { parsed = new URL(value); } catch { return invalid('Ce lien n’est pas une adresse valide.'); }
  if (parsed.protocol !== 'https:' || parsed.username || parsed.password) return invalid('Utilisez un lien HTTPS sans identifiant ni mot de passe.');
  const host = parsed.hostname.toLowerCase(), segments = parsed.pathname.split('/').filter(Boolean);
  const known = youtubeHosts.has(host) || ['open.spotify.com', 'suno.com', 'www.suno.com'].includes(host);
  if (known && parsed.port) return invalid('Utilisez l’adresse habituelle du service, sans port personnalisé.');
  if (youtubeHosts.has(host)) {
    let id, list;
    if (host === 'youtu.be' && segments.length === 1) id = segments[0];
    else if (segments.length === 1 && segments[0] === 'watch') id = parsed.searchParams.get('v');
    else if (segments.length === 2 && ['embed', 'shorts', 'live'].includes(segments[0])) id = segments[1];
    const listOnly = segments.length === 1 && segments[0] === 'playlist' || segments.length === 2 && segments[0] === 'embed' && segments[1] === 'videoseries';
    if (listOnly) id = undefined;
    if (parsed.searchParams.has('list')) list = parsed.searchParams.get('list');
    if ((id && !videoId.test(id)) || (list && !playlistId.test(list)) || (!id && !(listOnly && list))) {
      return invalid('Collez le lien d’une vidéo ou d’une playlist YouTube avec son identifiant complet.');
    }
    const url = new URL(id ? 'https://www.youtube.com/watch' : 'https://www.youtube.com/playlist');
    if (id) url.searchParams.set('v', id);
    if (list) url.searchParams.set('list', list);
    const embed = new URL(`https://www.youtube-nocookie.com/embed/${id || 'videoseries'}`);
    if (list) embed.searchParams.set('list', list);
    embed.searchParams.set('autoplay', '0'); embed.searchParams.set('controls', '1'); embed.searchParams.set('playsinline', '1');
    return { provider: 'youtube', label: 'YouTube', url: url.href, embedUrl: embed.href };
  }
  if (host === 'open.spotify.com') {
    if (segments[0]?.match(/^intl-[a-z]{2}$/i) || segments[0] === 'embed') segments.shift();
    if (segments.length !== 2 || !['playlist', 'album', 'track'].includes(segments[0]) || !spotifyId.test(segments[1])) {
      return invalid('Collez le lien complet open.spotify.com d’une playlist, d’un album ou d’un titre.');
    }
    return { provider: 'spotify', label: 'Spotify', url: `https://open.spotify.com/${segments.join('/')}` };
  }
  if (host === 'suno.com' || host === 'www.suno.com') {
    if (segments.length !== 2 || !['song', 'embed'].includes(segments[0]) || !songId.test(segments[1])) {
      return invalid('Ouvrez la chanson sur Suno puis copiez son lien complet suno.com/song/…');
    }
    return { provider: 'suno', label: 'Suno', url: `https://suno.com/song/${segments[1].toLowerCase()}` };
  }
  return null;
}

export const MAX_LOCAL_AUDIO_BYTES = 50 * 1024 * 1024;

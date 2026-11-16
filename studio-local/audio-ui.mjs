import { AUDIO_LIMITS, audioLibrary, validAudioUrl } from './audio.mjs';
import { parseServiceMediaURL } from './service-media.mjs';
import { createServiceMediaUI } from './service-media-ui.mjs';

const $ = id => document.getElementById(id);
const node = (tag, text, className) => {
  const element = document.createElement(tag);
  if (text !== undefined) element.textContent = text;
  if (className) element.className = className;
  return element;
};
function button(text, label, click, className = 'secondary') {
  const element = node('button', text, className);
  element.type = 'button';
  element.setAttribute('aria-label', label);
  element.addEventListener('click', click);
  return element;
}
const clock = seconds => Number.isFinite(seconds) && seconds >= 0
  ? `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}` : '—';

export function createAudioUI({ getCampaign, canWrite, save, refresh, open }) {
  const audio = $('audio-element');
  audio.volume = .7;
  let ownerId, loadedId, loadedSignature, queue = [], position = 0, playlistName = '';
  let phase = 'idle', playToken = 0, formAttempt, quickAttempt, working = false;
  let returnFocus;
  const current = () => queue[position];
  const library = () => audioLibrary(getCampaign());
  const playlistSnapshot = (playlist, collection) => ({ ...playlist,
    tracks: playlist.trackIds.map(id => collection.tracks.find(track => track.id === id)) });
  const say = text => { $('audio-status').textContent = text; };
  const services = createServiceMediaUI({ host: $('audio-panel'), onStart: () => {
    ++playToken; audio.pause(); phase = current() ? 'paused' : 'idle';
    say('Régie en pause pendant la consultation du média.'); updatePlayer();
  } });
  const localFileButton = button('Lire un fichier audio', 'Lire un fichier audio local, par exemple obtenu via Suno', () => services.openLocal());
  const serviceLinkButton = button('Ajouter un lien YouTube, Spotify ou Suno', 'Ajouter un lien YouTube, Spotify ou Suno', () => startForm('track'));
  const serviceActions = node('div', undefined, 'actions'); serviceActions.append(serviceLinkButton, localFileButton);
  $('audio-library-tools').before(serviceActions);
  const serviceTrack = track => { try { return parseServiceMediaURL(track?.url); } catch { return { invalid: true }; } };

  function updateTime() {
    const duration = Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : 0;
    $('audio-progress').max = duration || 1;
    $('audio-progress').value = duration ? Math.min(audio.currentTime, duration) : 0;
    $('audio-clock').textContent = `${clock(audio.currentTime || 0)} / ${duration ? clock(duration) : '—'}`;
  }
  function updatePlayer() {
    const track = current(), hasSource = audio.hasAttribute('src');
    $('audio-now-title').textContent = track?.name || 'Composez votre ambiance';
    $('audio-now-context').textContent = loadedId ? `${playlistName} · ${track ? position + 1 : 0} / ${queue.length}` : 'Aucune playlist chargée';
    $('audio-now-credit').textContent = track?.credit || '';
    $('audio-play').disabled = !track || ['playing', 'loading', 'buffering'].includes(phase);
    $('audio-pause').disabled = !hasSource || !['playing', 'loading', 'buffering'].includes(phase);
    $('audio-stop').disabled = !hasSource;
    $('audio-previous').disabled = !track || (position === 0 && !$('audio-loop').checked);
    $('audio-next').disabled = !track || (position === queue.length - 1 && !$('audio-loop').checked);
    $('audio-global-open').hidden = !loadedId;
    $('audio-global-stop').hidden = !hasSource;
    $('audio-global-open').textContent = phase === 'playing' ? 'Son en cours · Régie' : 'Régie sonore';
    $('audio-panel').dataset.audioState = phase;
    for (const [index, entry] of [...$('audio-queue').children].entries()) {
      if (index === position) entry.setAttribute('aria-current', 'true');
      else entry.removeAttribute('aria-current');
    }
    updateTime();
  }
  function releaseMedia() {
    services.stop();
    ++playToken;
    audio.pause();
    audio.removeAttribute('src');
    audio.load();
  }
  function stop(message = 'Son arrêté. Lecture reprendra au début de cette piste.') {
    releaseMedia(); phase = current() ? 'ready' : 'idle';
    say(message); updatePlayer();
  }
  function clearQueue(message) {
    releaseMedia(); loadedId = undefined; loadedSignature = undefined;
    queue = []; position = 0; playlistName = ''; phase = 'idle';
    $('audio-queue').replaceChildren(); $('audio-loop').checked = false;
    say(message); updatePlayer();
  }
  function failure(error) {
    releaseMedia(); phase = 'error';
    say(error?.name === 'NotAllowedError'
      ? 'Lecture refusée par le navigateur. Cliquez sur Lecture pour réessayer.'
      : 'Piste indisponible ou format non lisible. Vérifiez le lien direct puis réessayez, ou choisissez une autre piste.');
    updatePlayer();
  }
  async function play() {
    const track = current();
    if (!track || ['playing', 'loading', 'buffering'].includes(phase)) return;
    const service = serviceTrack(track);
    if (service) {
      if (service.invalid) { say('Lien de service non reconnu. Modifiez la piste avec son lien de partage complet.'); return; }
      services.open(track); say('Utilisez les commandes du média choisi ; retour et arrêt restent disponibles.'); return;
    }
    services.stop();
    const token = ++playToken;
    phase = 'loading'; say('Chargement de la piste…');
    if (audio.getAttribute('src') !== track.url) audio.src = track.url;
    updatePlayer();
    try {
      await audio.play();
      if (token !== playToken || !audio.hasAttribute('src')) return;
      phase = audio.paused ? 'paused' : 'playing';
      say(audio.paused ? 'Lecture en pause.' : 'Lecture en cours.'); updatePlayer();
    } catch (error) { if (token === playToken) failure(error); }
  }
  function choose(index, resume = false) {
    if (index < 0 || index >= queue.length) return;
    releaseMedia(); position = index; phase = 'ready';
    say('Piste prête. Cliquez sur Lecture.'); updatePlayer();
    if (resume && !serviceTrack(current())) void play();
  }
  function advance(direction, auto = false) {
    if (!current()) return;
    let index = position + direction;
    if (index < 0 || index >= queue.length) {
      if ($('audio-loop').checked) index = (index + queue.length) % queue.length;
      else {
        if (auto) { stop('Fin de la playlist.'); phase = 'ended'; updatePlayer(); }
        return;
      }
    }
    choose(index, auto || ['playing', 'loading', 'buffering'].includes(phase));
  }
  function drawQueue() {
    $('audio-queue').replaceChildren(...queue.map((track, index) => {
      const item = node('li');
      item.append(node('span', String(index + 1).padStart(2, '0'), 'audio-number'),
        button(track.name, `Choisir la piste ${index + 1} : ${track.name}`, () => choose(index), 'text-button'));
      return item;
    }));
  }
  function loadPlaylist(id) {
    const collection = library(), playlist = collection.playlists.find(entry => entry.id === id);
    if (!playlist?.trackIds.length) return;
    if (audio.hasAttribute('src') && !window.confirm('Charger cette playlist arrêtera la lecture en cours. Continuer ?')) return;
    releaseMedia();
    const snapshot = playlistSnapshot(playlist, collection);
    loadedId = id; loadedSignature = JSON.stringify(snapshot);
    queue = structuredClone(snapshot.tracks); position = 0; playlistName = playlist.name; phase = 'ready';
    $('audio-loop').checked = playlist.loop;
    drawQueue(); say('Playlist chargée. Cliquez sur Lecture pour démarrer le son.'); updatePlayer();
  }

  function command(attempt, type, data) {
    const signature = JSON.stringify({ type, data });
    if (signature !== attempt.signature) {
      attempt.signature = signature;
      attempt.command = { id: attempt.campaignId, expectedRevision: attempt.revision,
        operationId: crypto.randomUUID(), type, data };
    }
    return attempt.command;
  }
  function formError(form, error) {
    form.querySelector('.form-feedback').hidden = false;
    form.querySelector('.form-error').textContent = error.message;
    form.querySelector('.reload-draft').hidden = error.code !== 'conflict';
  }
  function startForm(kind, record) {
    if (!canWrite()) return;
    const campaign = getCampaign(), form = $(`audio-${kind}-form`);
    returnFocus = document.activeElement;
    form.reset(); form.querySelector('.form-feedback').hidden = true;
    formAttempt = { kind, campaignId: campaign.id, revision: campaign.revision,
      id: record?.id || crypto.randomUUID(), trackIds: [...(record?.trackIds ?? [])] };
    $(`audio-${kind}-name`).value = record?.name || '';
    if (kind === 'track') {
      $('audio-track-heading').textContent = record ? 'Modifier une piste' : 'Ajouter une piste';
      $('audio-track-url').value = record?.url || ''; $('audio-track-credit').value = record?.credit || '';
    } else {
      $('audio-playlist-heading').textContent = record ? 'Modifier une playlist' : 'Créer une playlist';
      $('audio-playlist-loop').checked = record?.loop || false;
      $('audio-playlist-track').replaceChildren(...library().tracks.map(track => new Option(track.name, track.id)));
      drawOrder();
    }
    $(`audio-${kind}-dialog`).showModal();
  }
  function drawOrder(focusIndex, focusAction) {
    const ids = formAttempt.trackIds, tracks = library().tracks;
    $('audio-playlist-order').replaceChildren(...ids.map((id, index) => {
      const item = node('li'), controls = node('div', undefined, 'actions');
      const change = direction => {
        const target = index + direction;
        [ids[index], ids[target]] = [ids[target], ids[index]];
        drawOrder(target, direction === -1 ? 'up' : 'down');
      };
      const up = button('Monter', `Monter la piste ${index + 1}`, () => change(-1), 'text-button');
      up.disabled = index === 0; up.dataset.orderAction = 'up';
      const down = button('Descendre', `Descendre la piste ${index + 1}`, () => change(1), 'text-button');
      down.disabled = index === ids.length - 1; down.dataset.orderAction = 'down';
      const remove = button('Retirer', `Retirer la piste ${index + 1}`, () => {
        ids.splice(index, 1); drawOrder(Math.min(index, ids.length - 1), 'remove');
      }, 'text-button');
      remove.dataset.orderAction = 'remove'; controls.append(up, down, remove);
      item.append(node('span', `${index + 1}. ${tracks.find(track => track.id === id)?.name || 'Piste retirée de la bibliothèque'}`), controls);
      return item;
    }));
    $('audio-playlist-order-status').textContent = `${ids.length} / ${AUDIO_LIMITS.tracksPerPlaylist} pistes. L’ordre ci-dessus sera enregistré.`;
    $('audio-playlist-track-add').disabled = !tracks.length || ids.length >= AUDIO_LIMITS.tracksPerPlaylist;
    if (focusIndex !== undefined) {
      const item = $('audio-playlist-order').children[focusIndex];
      const target = item?.querySelector(`[data-order-action="${focusAction}"]:enabled`) || item?.querySelector('button:enabled') || $('audio-playlist-track-add');
      target.focus();
    }
  }
  async function submit(kind, event) {
    event.preventDefault();
    if (!formAttempt || working || !canWrite()) return;
    const attempt = formAttempt, form = $(`audio-${kind}-form`);
    const campaign = getCampaign();
    if (campaign.id !== attempt.campaignId || campaign.revision !== attempt.revision) {
      formError(form, Object.assign(new Error('La campagne a changé. Actualisez avant de reprendre ce brouillon.'), { code: 'conflict' })); return;
    }
    const name = $(`audio-${kind}-name`).value.trim();
    const data = kind === 'track' ? { id: attempt.id, name, url: $('audio-track-url').value.trim(), credit: $('audio-track-credit').value.trim() }
      : { id: attempt.id, name, trackIds: [...attempt.trackIds], loop: $('audio-playlist-loop').checked };
    if (!name) { formError(form, new Error('Donnez un nom à cet élément.')); return; }
    if (kind === 'track' && !validAudioUrl(data.url)) { formError(form, new Error('Utilisez un lien HTTPS direct de 2 048 caractères maximum, sans identifiant ni mot de passe.')); return; }
    if (kind === 'track') {
      try { const service = parseServiceMediaURL(data.url); if (service) data.url = service.url; }
      catch (error) { formError(form, error); return; }
    }
    working = true;
    try {
      await save(command(attempt, `save-audio-${kind}`, data), { form, onSaved: () => { $(`audio-${kind}-dialog`).close(); } });
    } finally { working = false; }
  }
  async function mutate(type, data, after) {
    if (!canWrite()) return;
    const campaign = getCampaign();
    if (!quickAttempt || quickAttempt.campaignId !== campaign.id || quickAttempt.revision !== campaign.revision) {
      quickAttempt = { campaignId: campaign.id, revision: campaign.revision };
    }
    await save(command(quickAttempt, type, data), { onSaved: () => { quickAttempt = undefined; after?.(); } });
  }
  function remove(kind, entry) {
    if (!canWrite()) return;
    const message = kind === 'track'
      ? `Supprimer « ${entry.name} » ? Ses occurrences seront retirées des playlists. Une playlist chargée concernée devra être rechargée.`
      : `Supprimer la playlist « ${entry.name} » et ses associations aux scènes ? Les pistes seront conservées.`;
    if (window.confirm(message)) void mutate(`remove-audio-${kind}`, { id: entry.id }, () => $(`audio-${kind}-add`).focus());
  }

  function render() {
    const campaign = getCampaign(), collection = library();
    if (ownerId !== campaign?.id) {
      const wasOpen = Boolean(ownerId); ownerId = campaign?.id;
      quickAttempt = undefined;
      clearQueue(wasOpen ? 'Campagne changée : le son est arrêté.' : 'Aucun son ne démarre à l’ouverture de la campagne.');
    } else if (loadedId) {
      const playlist = collection.playlists.find(entry => entry.id === loadedId);
      if (!playlist || JSON.stringify(playlistSnapshot(playlist, collection)) !== loadedSignature) {
        clearQueue('La playlist chargée a été modifiée ou supprimée. Chargez sa nouvelle version avant Lecture.');
      }
    }
    $('quick-audio').disabled = !campaign;
    $('audio-track-add').disabled = !campaign || collection.tracks.length >= AUDIO_LIMITS.tracks;
    serviceLinkButton.disabled = $('audio-track-add').disabled;
    $('audio-playlist-add').disabled = !campaign || collection.playlists.length >= AUDIO_LIMITS.playlists;
    $('audio-track-count').textContent = `· ${collection.tracks.length} / ${AUDIO_LIMITS.tracks}`;
    $('audio-tracks-empty').hidden = collection.tracks.length > 0;
    $('audio-playlists-empty').hidden = collection.playlists.length > 0;
    $('audio-tracks').replaceChildren(...collection.tracks.map(track => {
      const item = node('li'), copy = node('div', undefined, 'audio-record-copy'), controls = node('div', undefined, 'actions');
      copy.append(node('h4', track.name), node('p', new URL(track.url).hostname, 'muted'));
      if (track.credit) copy.append(node('p', track.credit, 'muted'));
      const service = serviceTrack(track);
      if (service && !service.invalid) controls.append(button('Ouvrir le média', `Ouvrir le média ${track.name}`, () => services.open(track)));
      controls.append(button('Modifier', `Modifier la piste ${track.name}`, () => startForm('track', track), 'text-button'),
        button('Supprimer', `Supprimer la piste ${track.name}`, () => remove('track', track), 'text-button'));
      item.append(copy, controls); return item;
    }));
    $('audio-playlists').replaceChildren(...collection.playlists.map(playlist => {
      const item = node('li'), copy = node('div', undefined, 'audio-record-copy'), controls = node('div', undefined, 'actions');
      copy.append(node('h4', playlist.name), node('p', `${playlist.trackIds.length} piste(s)${playlist.loop ? ' · En boucle' : ''}`, 'muted'));
      const load = button('Charger', `Charger la playlist ${playlist.name}`, () => loadPlaylist(playlist.id));
      load.disabled = !playlist.trackIds.length;
      controls.append(load, button('Modifier', `Modifier la playlist ${playlist.name}`, () => startForm('playlist', playlist), 'text-button'),
        button('Supprimer', `Supprimer la playlist ${playlist.name}`, () => remove('playlist', playlist), 'text-button'));
      item.append(copy, controls); return item;
    }));
    const scene = campaign?.scenes.find(entry => entry.id === campaign.activeSceneId);
    const assignment = collection.scenePlaylists.find(entry => entry.sceneId === scene?.id);
    $('audio-scene-context').textContent = scene ? scene.title : 'Préparez une scène pour lui associer une playlist.';
    $('audio-scene-playlist').replaceChildren(new Option('Aucune playlist suggérée', ''),
      ...collection.playlists.map(playlist => new Option(playlist.name, playlist.id)));
    $('audio-scene-playlist').value = assignment?.playlistId || '';
    $('audio-scene-playlist').disabled = !scene;
    $('audio-scene-save').disabled = !scene;
    $('audio-scene-load').disabled = !collection.playlists.find(entry => entry.id === assignment?.playlistId)?.trackIds.length;
    updatePlayer();
  }

  for (const kind of ['track', 'playlist']) {
    const form = $(`audio-${kind}-form`), dialog = $(`audio-${kind}-dialog`);
    $(`audio-${kind}-add`).addEventListener('click', () => startForm(kind));
    form.addEventListener('submit', event => void submit(kind, event));
    form.querySelector('.audio-cancel').addEventListener('click', () => { if (!working) dialog.close(); });
    form.querySelector('.reload-draft').addEventListener('click', async () => { if (!working) { dialog.close(); await refresh(); } });
    dialog.addEventListener('cancel', event => { if (working) event.preventDefault(); });
    dialog.addEventListener('close', () => {
      formAttempt = undefined;
      queueMicrotask(() => (returnFocus?.isConnected && returnFocus.getClientRects().length ? returnFocus : $('audio-title')).focus());
    });
  }
  $('audio-playlist-track-add').addEventListener('click', () => {
    if (working || !formAttempt || formAttempt.trackIds.length >= AUDIO_LIMITS.tracksPerPlaylist || !$('audio-playlist-track').value) return;
    formAttempt.trackIds.push($('audio-playlist-track').value); drawOrder();
  });
  $('audio-scene-save').addEventListener('click', () => {
    const campaign = getCampaign();
    if (campaign?.activeSceneId) void mutate('set-scene-playlist', { sceneId: campaign.activeSceneId,
      playlistId: $('audio-scene-playlist').value || null }, () => say('Suggestion de scène enregistrée. La lecture reste sous votre contrôle.'));
  });
  $('audio-scene-load').addEventListener('click', () => {
    const assignment = library().scenePlaylists.find(entry => entry.sceneId === getCampaign()?.activeSceneId);
    if (assignment) loadPlaylist(assignment.playlistId);
  });
  $('quick-audio').addEventListener('click', open);
  $('audio-global-open').addEventListener('click', open);
  $('audio-global-stop').addEventListener('click', () => stop());
  $('audio-play').addEventListener('click', () => void play());
  $('audio-pause').addEventListener('click', () => {
    ++playToken; audio.pause(); phase = 'paused'; say('Lecture en pause.'); updatePlayer();
  });
  $('audio-stop').addEventListener('click', () => stop());
  $('audio-previous').addEventListener('click', () => advance(-1));
  $('audio-next').addEventListener('click', () => advance(1));
  $('audio-loop').addEventListener('change', updatePlayer);
  $('audio-volume').addEventListener('input', () => {
    audio.volume = Number($('audio-volume').value) / 100;
    $('audio-volume-value').value = `${$('audio-volume').value} %`;
  });
  audio.addEventListener('ended', () => { if (audio.hasAttribute('src') && audio.ended) advance(1, true); });
  audio.addEventListener('error', () => { if (audio.hasAttribute('src') && audio.error) failure(); });
  audio.addEventListener('playing', () => {
    if (audio.hasAttribute('src') && !audio.paused) { phase = 'playing'; say('Lecture en cours.'); updatePlayer(); }
  });
  audio.addEventListener('pause', () => {
    if (audio.hasAttribute('src') && audio.paused && !audio.ended && ['playing', 'buffering'].includes(phase)) {
      phase = 'paused'; say('Lecture en pause.'); updatePlayer();
    }
  });
  for (const event of ['waiting', 'stalled']) audio.addEventListener(event, () => {
    if (audio.hasAttribute('src') && !audio.paused && audio.readyState < 3) {
      phase = 'buffering'; say('Mise en mémoire tampon… Pause et arrêt restent disponibles.'); updatePlayer();
    }
  });
  for (const event of ['timeupdate', 'durationchange', 'loadedmetadata', 'emptied']) audio.addEventListener(event, updateTime);
  window.addEventListener('pagehide', () => stop('Son arrêté en quittant cette page. Cliquez sur Lecture pour reprendre.'));
  return { render, stop, canAdd: () => Boolean(canWrite() && library().tracks.length < AUDIO_LIMITS.tracks),
    pause() {
      services.stop();
      if (!audio.hasAttribute('src')) return;
      ++playToken; audio.pause(); phase = 'paused'; say('Régie en pause pendant l’écoute du catalogue.'); updatePlayer();
    },
    prefill(entry) {
      if (!canWrite() || library().tracks.length >= AUDIO_LIMITS.tracks) return;
      startForm('track');
      $('audio-track-name').value = entry.name;
      $('audio-track-url').value = entry.url;
      $('audio-track-credit').value = entry.credit;
    },
  };
}

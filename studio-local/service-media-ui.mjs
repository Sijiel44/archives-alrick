import { MAX_LOCAL_AUDIO_BYTES, parseServiceMediaURL } from './service-media.mjs';

const element = (tag, text, className) => {
  const value = document.createElement(tag);
  if (text !== undefined) value.textContent = text;
  if (className) value.className = className;
  return value;
};

export function createServiceMediaUI({ host, onStart = () => {} }) {
  const dialog = element('dialog', undefined, 'service-media-dialog'); dialog.id = 'service-media-dialog';
  dialog.setAttribute('aria-labelledby', 'service-media-title');
  const header = element('header', undefined, 'panel-heading');
  const title = element('h2', 'Média de service'); title.id = 'service-media-title'; title.tabIndex = -1; title.autofocus = true;
  const close = element('button', 'Fermer', 'secondary'); close.type = 'button'; close.id = 'service-media-close';
  header.append(title, close);
  const description = element('p', '', 'muted'), credit = element('p', '', 'muted');
  const actions = element('div', undefined, 'actions');
  const external = element('a', 'Ouvrir la source'); external.id = 'service-media-external'; external.target = '_blank'; external.rel = 'noopener noreferrer';
  const load = element('button', 'Charger le lecteur YouTube', 'secondary'); load.type = 'button'; load.id = 'service-media-load';
  const stopButton = element('button', 'Arrêter et retirer le lecteur', 'secondary'); stopButton.type = 'button'; stopButton.id = 'service-media-stop';
  actions.append(load, external, stopButton);
  const local = element('section'); local.id = 'service-media-local';
  const label = element('label', 'Choisir un fichier audio · MP3, WAV ou OGG · 50 Mio maximum'); label.htmlFor = 'service-media-file';
  const file = element('input'); file.type = 'file'; file.id = 'service-media-file'; file.accept = '.mp3,.wav,.ogg,audio/mpeg,audio/wav,audio/ogg';
  const localHelp = element('p', 'Par exemple, un son ou une voix téléchargés depuis Suno avec les droits correspondants. Le fichier reste temporaire sur cet appareil ; il ne sera pas inclus dans la sauvegarde de campagne.', 'muted');
  local.append(label, file, localHelp);
  const player = element('div'); player.id = 'service-media-player';
  const status = element('p', '', 'muted'); status.id = 'service-media-status'; status.setAttribute('role', 'status');
  dialog.append(header, description, credit, local, actions, player, status); host.append(dialog);
  let source, objectURL, media, returnFocus, request = 0;

  function clearPlayer() {
    ++request;
    if (media) { media.pause(); media.removeAttribute('src'); media.load(); media = undefined; }
    player.replaceChildren();
    if (objectURL) { URL.revokeObjectURL(objectURL); objectURL = undefined; }
    stopButton.hidden = true; load.disabled = false;
  }
  function stop() {
    clearPlayer(); file.value = ''; source = undefined;
    if (dialog.open) dialog.close();
  }
  function show() {
    clearPlayer(); file.value = ''; status.textContent = ''; returnFocus = document.activeElement;
    if (!dialog.open) dialog.showModal();
    title.focus();
  }
  function open(track) {
    const next = parseServiceMediaURL(track?.url);
    if (!next) throw new Error('Ce lien est un fichier direct. Utilisez la régie sonore.');
    source = next; show();
    title.textContent = track.name || next.label;
    credit.textContent = track.credit || ''; credit.hidden = !track.credit;
    local.hidden = true; load.hidden = next.provider !== 'youtube';
    external.hidden = false; external.href = next.url; external.textContent = `Ouvrir dans ${next.label}`;
    description.textContent = next.provider === 'youtube'
      ? 'Chargez le lecteur officiel, puis utilisez ses commandes. YouTube recevra l’origine du site ; la vidéo peut comporter des annonces ou être indisponible en intégration. La projection joueur reste inchangée.'
      : next.provider === 'spotify'
        ? 'Ouvrez cette sélection dans Spotify. La lecture et ses commandes restent dans le service ; elle n’est pas synchronisée avec les scènes.'
        : 'Ouvrez cette chanson dans Suno. Pour écouter un fichier sur cet appareil, utilisez un téléchargement autorisé depuis Suno puis « Lire un fichier audio ».';
  }
  function openLocal() {
    source = undefined; show(); title.textContent = 'Lire un fichier audio';
    credit.hidden = true; local.hidden = false; load.hidden = true; external.hidden = true; external.removeAttribute('href');
    description.textContent = 'Choisissez un fichier, puis lancez sa lecture avec les commandes du lecteur. Fermer retire le fichier du lecteur.';
  }
  load.addEventListener('click', () => {
    if (source?.provider !== 'youtube' || !dialog.open) return;
    clearPlayer(); onStart();
    const iframe = element('iframe'); iframe.id = 'service-media-frame'; iframe.title = `Lecteur YouTube : ${title.textContent}`;
    iframe.referrerPolicy = 'strict-origin-when-cross-origin'; iframe.allow = 'autoplay; encrypted-media; fullscreen; picture-in-picture';
    iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-presentation');
    iframe.allowFullscreen = true; iframe.src = source.embedUrl;
    player.append(iframe); load.disabled = true; stopButton.hidden = false;
    status.textContent = 'Lecteur demandé. Utilisez Lecture dans YouTube ; si le service refuse cette vidéo, ouvrez sa source.';
  });
  file.addEventListener('change', async () => {
    clearPlayer(); const selected = file.files[0]; if (!selected) return;
    const token = ++request;
    if (!/\.(mp3|wav|ogg)$/i.test(selected.name) || selected.size === 0 || selected.size > MAX_LOCAL_AUDIO_BYTES) {
      status.textContent = 'Choisissez un fichier MP3, WAV ou OGG non vide de 50 Mio maximum.'; file.value = ''; return;
    }
    status.textContent = 'Vérification du fichier…';
    try {
      const bytes = new Uint8Array(await selected.slice(0, 12).arrayBuffer());
      if (token !== request || !dialog.open) return;
      const ascii = (start, end) => String.fromCharCode(...bytes.slice(start, end));
      const type = ascii(0, 3) === 'ID3' || bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0 ? 'audio/mpeg'
        : ascii(0, 4) === 'RIFF' && ascii(8, 12) === 'WAVE' ? 'audio/wav' : ascii(0, 4) === 'OggS' ? 'audio/ogg' : undefined;
      if (!type) throw new Error('Le contenu ne correspond pas à un fichier MP3, WAV ou OGG reconnu.');
      objectURL = URL.createObjectURL(new Blob([selected], { type }));
      media = element('audio'); const audio = media;
      audio.controls = true; audio.preload = 'none'; audio.src = objectURL; audio.setAttribute('aria-label', `Audio local : ${selected.name}`);
      audio.addEventListener('play', () => { if (media === audio) onStart(); });
      audio.addEventListener('error', () => { if (media === audio) status.textContent = 'Ce fichier ne peut pas être décodé. Choisissez un autre fichier.'; });
      player.append(audio); stopButton.hidden = false;
      status.textContent = `${selected.name} · prêt sur cet appareil. Appuyez sur Lecture. Ce fichier ne sera pas sauvegardé dans la campagne.`;
    } catch (error) { if (token === request && dialog.open) { clearPlayer(); status.textContent = error.message || 'Lecture du fichier impossible.'; } }
  });
  stopButton.addEventListener('click', () => { clearPlayer(); file.value = ''; status.textContent = 'Lecteur arrêté et source retirée.'; });
  close.addEventListener('click', stop);
  dialog.addEventListener('cancel', () => { clearPlayer(); file.value = ''; });
  dialog.addEventListener('close', () => {
    if (dialog.open) return; // Un ancien événement close peut arriver après une réouverture.
    clearPlayer(); file.value = ''; source = undefined;
    queueMicrotask(() => { if (!document.querySelector('dialog[open]') && returnFocus?.isConnected) returnFocus.focus(); });
  });
  window.addEventListener('pagehide', stop);
  return { open, openLocal, stop };
}

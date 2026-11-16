const $ = id => document.getElementById(id);
const node = (tag, text, className) => {
  const element = document.createElement(tag);
  if (text !== undefined) element.textContent = text;
  if (className) element.className = className;
  return element;
};
function button(text, click, label) {
  const element = node('button', text, 'secondary'); element.type = 'button';
  if (label) element.setAttribute('aria-label', label);
  element.addEventListener('click', click); return element;
}
function link(text, href) {
  const element = node('a', text); element.href = href;
  element.target = '_blank'; element.rel = 'noopener noreferrer'; return element;
}
const duration = seconds => seconds === null ? 'Durée non indiquée' : seconds < 1 ? 'Moins d’une seconde'
  : `≈ ${Math.floor(Math.round(seconds) / 60)} min ${Math.round(seconds) % 60} s`;

export function createMediaCatalogueUI({ canChoose, chooseAudio, chooseVideo, stopAudio, selectionHelp }) {
  const dialog = $('media-catalogue-dialog');
  let catalogue, loading, limit = 12, preview, request = 0, returnFocus, currentKind = 'all';
  async function load() {
    loading ??= import('./medias-catalogue.mjs').catch(error => { loading = undefined; throw error; });
    return loading;
  }
  function stopPreview() {
    ++request;
    if (preview) { preview.pause(); preview.removeAttribute('src'); preview.load(); preview.remove(); preview = undefined; }
    $('media-preview-player').replaceChildren(); $('media-preview').hidden = true;
  }
  async function play(entry) {
    stopPreview(); if (entry.kind === 'audio') stopAudio();
    const token = ++request;
    const media = document.createElement(entry.kind === 'audio' ? 'audio' : 'video');
    preview = media; media.controls = true; media.preload = 'none';
    if (entry.kind === 'video') {
      media.muted = media.defaultMuted = true; media.volume = 0; media.playsInline = true; media.loop = true;
      media.addEventListener('volumechange', () => { if (preview === media && (!media.muted || media.volume !== 0)) { media.muted = true; media.volume = 0; } });
    }
    media.setAttribute('aria-label', `Aperçu : ${entry.name}`);
    $('media-preview-player').replaceChildren(media); $('media-preview-title').textContent = entry.name;
    $('media-preview').hidden = false; $('media-preview-status').textContent = 'Chargement à votre demande…';
    media.addEventListener('error', () => {
      if (token === request && dialog.open) $('media-preview-status').textContent = 'Ce fichier est indisponible ou illisible. Consultez sa source ou choisissez un autre média.';
    });
    media.src = entry.url;
    try {
      await media.play();
      if (token === request && dialog.open) $('media-preview-status').textContent = entry.kind === 'video' ? 'Aperçu vidéo muet. La scène joueur reste inchangée.' : 'Écoute du catalogue sur cet appareil.';
    } catch (error) {
      if (token === request && dialog.open) $('media-preview-status').textContent = error.name === 'NotAllowedError'
        ? 'Utilisez la commande Lecture du lecteur pour lancer cet aperçu.' : 'Lecture interrompue. Vous pouvez réessayer ou choisir un autre média.';
    }
  }
  function render() {
    if (!catalogue) return;
    const matches = catalogue.filterMedia(catalogue.MEDIA_ENTRIES, { kind: currentKind,
      category: $('media-category').value, query: $('media-search').value });
    $('media-results-status').textContent = `${matches.length} média(s) · ${Math.min(limit, matches.length)} affiché(s).`;
    $('media-results').replaceChildren(...matches.slice(0, limit).map(entry => {
      const item = node('li', undefined, 'media-card'); item.dataset.mediaId = entry.id;
      const banner = node('div', undefined, `media-card-banner media-category-${entry.category}`);
      banner.setAttribute('aria-hidden', 'true'); banner.append(node('span', entry.kind === 'audio' ? '♫' : '▷'), node('span', catalogue.MEDIA_CATEGORIES[entry.category]));
      const copy = node('div', undefined, 'media-card-copy');
      copy.append(node('p', `${entry.kind === 'audio' ? 'Son' : 'Vidéo muette'} · ${duration(entry.duration)}`, 'eyebrow'), node('h3', entry.name), node('p', entry.description, 'muted'));
      const controls = node('div', undefined, 'actions');
      const previewLabel = entry.kind === 'audio' ? 'Écouter' : 'Voir l’extrait';
      const chooseLabel = entry.kind === 'audio' ? 'Préparer la piste' : 'Préparer ce fond';
      controls.append(button(previewLabel, () => void play(entry), `${previewLabel} ${entry.name}`));
      const choose = button(chooseLabel, () => {
        if (!canChoose(entry.kind)) return;
        const credit = catalogue.mediaCredit(entry); stopPreview(); dialog.close();
        queueMicrotask(() => (entry.kind === 'audio' ? chooseAudio : chooseVideo)({ ...entry, credit }));
      }, `${chooseLabel} ${entry.name}`);
      choose.disabled = !canChoose(entry.kind); controls.append(choose);
      const proof = node('details'); proof.append(node('summary', `${catalogue.MEDIA_LICENSES[entry.license]} · Source et crédit`),
        node('p', entry.author), node('p', entry.licenseNote, 'muted'), link('Fiche source', entry.sourceUrl), document.createTextNode(' · '), link('Licence', entry.licenseUrl));
      copy.append(controls, proof); item.append(banner, copy); return item;
    }));
    $('media-more').hidden = limit >= matches.length;
    $('media-use-help').textContent = selectionHelp();
  }
  async function open(kind = 'all') {
    returnFocus = document.activeElement; currentKind = kind; limit = 12;
    $('media-search').value = ''; $('media-category').value = ''; $('media-kind').value = kind;
    $('media-results').replaceChildren(); $('media-results-status').textContent = 'Ouverture du catalogue…';
    $('media-more').hidden = true; dialog.showModal();
    try {
      catalogue = await load();
      if (!dialog.open) return;
      $('media-category').replaceChildren(new Option('Toutes les ambiances', ''), ...Object.entries(catalogue.MEDIA_CATEGORIES).map(([id, name]) => new Option(name, id)));
      $('media-catalogue-summary').textContent = `50 sons et 50 vidéos · CC0 ou domaine public · Sources contrôlées le ${catalogue.MEDIA_CHECKED_AT.split('-').reverse().join('/')}.`;
      render();
    } catch { if (dialog.open) $('media-results-status').textContent = 'Le catalogue ne peut pas être chargé. Vos liens personnels restent utilisables dans les régies.'; }
  }
  $('media-kind').addEventListener('change', () => { currentKind = $('media-kind').value; limit = 12; render(); });
  for (const id of ['media-search', 'media-category']) $(id).addEventListener('input', () => { limit = 12; render(); });
  $('media-more').addEventListener('click', () => { limit += 12; render(); });
  $('media-preview-stop').addEventListener('click', stopPreview);
  $('media-catalogue-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => { stopPreview(); queueMicrotask(() => {
    if (!document.querySelector('dialog[open]')) (returnFocus?.isConnected && returnFocus.getClientRects().length ? returnFocus : $('nav-library')).focus();
  }); });
  window.addEventListener('pagehide', stopPreview);
  $('library-media').addEventListener('click', () => void open());
  $('audio-catalogue-open').addEventListener('click', () => void open('audio'));
  $('video-catalogue-open').addEventListener('click', () => void open('video'));
  return { open };
}

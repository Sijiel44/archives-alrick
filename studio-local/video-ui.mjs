import { validVideoUrl, videoForScene } from './video.mjs';

export function createSceneVideoUI({ getCampaign, canWrite, images, save, refresh, prepare }) {
  const $ = id => document.getElementById(id);
  const form = $('scene-video-form'), dialog = $('scene-video-dialog');
  let attempt, quickAttempt, working = false, returnFocus;
  const scene = () => getCampaign()?.scenes.find(entry => entry.id === getCampaign().activeSceneId);
  const error = message => { form.querySelector('.form-feedback').hidden = false; form.querySelector('.form-error').textContent = message; };
  function command(draft, type, data) {
    const signature = JSON.stringify({ type, data });
    if (signature !== draft.signature) {
      draft.signature = signature;
      draft.command = { id: draft.campaignId, expectedRevision: draft.revision, operationId: crypto.randomUUID(), type, data };
    }
    return draft.command;
  }
  function edit() {
    if (!canWrite() || !scene()) return;
    const campaign = getCampaign(), selected = scene(), config = videoForScene(campaign, selected.id);
    returnFocus = document.activeElement;
    form.reset(); form.querySelector('.form-feedback').hidden = true;
    attempt = { campaignId: campaign.id, revision: campaign.revision, sceneId: selected.id };
    $('scene-video-context').textContent = selected.title;
    $('scene-video-url').value = config?.url || '';
    $('scene-video-credit').value = config?.credit || '';
    $('scene-video-loop').checked = config?.loop ?? true;
    $('scene-video-dim').value = config?.dim ?? 45;
    $('scene-video-dim-value').value = `${$('scene-video-dim').value} %`;
    $('scene-video-image').replaceChildren(new Option('Choisir une image…', ''), ...images.map(image => new Option(image.name, image.id)));
    if (config?.imageId && !images.some(image => image.id === config.imageId)) {
      $('scene-video-image').append(new Option('Image indisponible dans le catalogue', config.imageId));
    }
    $('scene-video-image').value = config?.imageId || '';
    dialog.showModal();
  }
  function render() {
    const selected = scene(), config = videoForScene(getCampaign(), selected?.id);
    $('quick-video').disabled = $('scene-video-edit').disabled = !selected;
    $('scene-video-prepare').hidden = $('scene-video-remove').hidden = !config;
    $('scene-video-summary').textContent = config
      ? `Fond enregistré · ${new URL(config.url).hostname} · ${config.loop ? 'En boucle' : 'Une lecture'} · Assombrissement ${config.dim} %. Relisez l’aperçu avant de le diffuser.`
      : selected ? 'Aucun fond enregistré. Associez un fichier vidéo et une image de remplacement à cette scène.'
        : 'Choisissez une scène pour préparer son fond vidéo.';
  }
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!attempt || working || !canWrite()) return;
    const campaign = getCampaign();
    if (campaign.id !== attempt.campaignId || campaign.revision !== attempt.revision) {
      error('La campagne a changé. Actualisez avant de reprendre ce réglage.'); form.querySelector('.reload-draft').hidden = false; return;
    }
    const data = { sceneId: attempt.sceneId, url: $('scene-video-url').value.trim(), imageId: $('scene-video-image').value,
      loop: $('scene-video-loop').checked, dim: Number($('scene-video-dim').value), credit: $('scene-video-credit').value.trim() };
    if (!validVideoUrl(data.url)) { error('Utilisez un lien HTTPS direct de 2 048 caractères maximum, sans identifiant ni mot de passe.'); return; }
    if (!images.some(image => image.id === data.imageId)) { error('Choisissez une image de remplacement disponible dans le catalogue.'); return; }
    working = true;
    try { await save(command(attempt, 'save-scene-video', data), { form, onSaved: () => dialog.close() }); }
    finally { working = false; }
  });
  $('scene-video-remove').addEventListener('click', async () => {
    const selected = scene();
    if (!canWrite() || !selected || !window.confirm('Supprimer le réglage vidéo de cette scène ? Le fichier hébergé sera conservé.')) return;
    const campaign = getCampaign();
    if (!quickAttempt || quickAttempt.campaignId !== campaign.id || quickAttempt.revision !== campaign.revision) {
      quickAttempt = { campaignId: campaign.id, revision: campaign.revision };
    }
    await save(command(quickAttempt, 'remove-scene-video', { sceneId: selected.id }), { onSaved: () => { quickAttempt = undefined; $('scene-video-edit').focus(); } });
  });
  $('scene-video-prepare').addEventListener('click', prepare);
  $('scene-video-edit').addEventListener('click', edit);
  $('quick-video').addEventListener('click', () => $('video-scene-title').focus());
  $('scene-video-cancel').addEventListener('click', () => { if (!working) dialog.close(); });
  $('scene-video-dim').addEventListener('input', () => { $('scene-video-dim-value').value = `${$('scene-video-dim').value} %`; });
  form.querySelector('.reload-draft').addEventListener('click', async () => { if (!working) { dialog.close(); await refresh(); } });
  dialog.addEventListener('cancel', event => { if (working) event.preventDefault(); });
  dialog.addEventListener('close', () => {
    attempt = undefined;
    queueMicrotask(() => (returnFocus?.isConnected && returnFocus.getClientRects().length ? returnFocus : $('nav-play')).focus());
  });
  return { render };
}

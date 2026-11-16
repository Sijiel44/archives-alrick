import { sceneImage, SCENE_IMAGE_MODES, validSceneImage } from './scene-images.mjs';
const $ = id => document.getElementById(id);
export function createSceneImageUI({ getCampaign, canWrite, save, prepare }) {
  const dialog = $('scene-image-dialog'), form = $('scene-image-form');
  let attempt, working = false, token = 0, returnFocus;
  const current = () => getCampaign()?.scenes.find(scene => scene.id === getCampaign().activeSceneId);
  function clearPreview() { ++token; const img = $('scene-image-preview'); img.removeAttribute('src'); img.hidden = true; $('scene-image-preview-status').textContent = ''; }
  function data() { return { sceneId: attempt.sceneId, url: $('scene-image-url').value.trim(), alt: $('scene-image-alt').value.trim(), credit: $('scene-image-credit').value.trim(), mode: $('scene-image-mode').value }; }
  function open(scene = current()) {
    if (!scene || !canWrite()) return;
    returnFocus = document.activeElement; clearPreview(); form.reset(); form.querySelector('.form-feedback').hidden = true;
    const campaign = getCampaign(), image = sceneImage(campaign, scene.id);
    attempt = { campaignId: campaign.id, revision: campaign.revision, sceneId: scene.id };
    $('scene-image-context').textContent = scene.title;
    $('scene-image-url').value = image?.url ?? ''; $('scene-image-alt').value = image?.alt ?? '';
    $('scene-image-credit').value = image?.credit ?? ''; $('scene-image-mode').value = image?.mode ?? 'contain';
    $('scene-image-remove').hidden = !image;
    dialog.showModal();
  }
  function error(message) { form.querySelector('.form-feedback').hidden = false; form.querySelector('.form-error').textContent = message; }
  function command(type, value) {
    const signature = JSON.stringify({ type, value });
    if (signature !== attempt.signature) { attempt.signature = signature; attempt.command = { id: attempt.campaignId, expectedRevision: attempt.revision, operationId: crypto.randomUUID(), type, data: value }; }
    return attempt.command;
  }
  async function submit(type) {
    if (!attempt || working || !canWrite()) return;
    if (getCampaign().id !== attempt.campaignId || getCampaign().revision !== attempt.revision) { error('La campagne a changé. Fermez ce formulaire puis rouvrez l’image pour actualiser.'); return; }
    const value = type === 'remove-scene-image' ? { sceneId: attempt.sceneId } : data();
    if (type === 'save-scene-image' && !validSceneImage(value)) { error('Indiquez un lien HTTPS direct, une description courte et un mode d’affichage.'); return; }
    working = true;
    try { await save(command(type, value), { form, onSaved: () => dialog.close() }); }
    finally { working = false; }
  }
  $('scene-image-preview-button').addEventListener('click', () => {
    clearPreview(); if (!attempt) return;
    const value = data(); if (!validSceneImage(value)) { error('Complétez le lien HTTPS et la description avant l’aperçu.'); return; }
    const requested = ++token, img = $('scene-image-preview');
    img.alt = value.alt; img.dataset.mode = value.mode; img.referrerPolicy = 'no-referrer';
    $('scene-image-preview-status').textContent = 'Chargement de l’image à votre demande…';
    img.onload = () => { if (requested === token) { img.hidden = false; $('scene-image-preview-status').textContent = 'Aperçu privé. Enregistrer ne diffuse pas l’image.'; } };
    img.onerror = () => { if (requested === token) $('scene-image-preview-status').textContent = 'Image indisponible : vérifiez que le lien ouvre directement une image.'; };
    img.src = value.url;
  });
  for (const id of ['scene-image-url', 'scene-image-alt', 'scene-image-mode']) $(id).addEventListener('input', clearPreview);
  form.addEventListener('submit', event => { event.preventDefault(); void submit('save-scene-image'); });
  $('scene-image-remove').addEventListener('click', () => { if (!working && window.confirm('Retirer l’image de cette scène ? Le fichier hébergé sera conservé.')) void submit('remove-scene-image'); });
  $('scene-image-close').addEventListener('click', () => { if (!working) dialog.close(); });
  dialog.addEventListener('cancel', event => { if (working) event.preventDefault(); });
  dialog.addEventListener('close', () => { clearPreview(); attempt = undefined; queueMicrotask(() => (returnFocus?.isConnected && returnFocus.getClientRects().length ? returnFocus : $('nav-play')).focus()); });
  $('scene-image-edit').addEventListener('click', () => open());
  $('scene-image-present').addEventListener('click', prepare);
  return { open, render() {
    const scene = current(), image = sceneImage(getCampaign(), scene?.id);
    $('scene-image-edit').disabled = !scene; $('scene-image-present').hidden = !image;
    $('scene-image-summary').textContent = image ? `${image.alt} · ${SCENE_IMAGE_MODES[image.mode]}` : 'Collez le lien direct d’une image pour illustrer la scène, puis choisissez son cadrage.';
  } };
}

import { CREATIONS_KEY, PJ_SOURCE_KEY } from './store.mjs';
import { ITEM_CATEGORIES, objectGrantFields, prepareObjectGrant } from './objets-mj.mjs';

export function createObjectGrantUI({ getCampaign, canOpen, save, exportCharacter, refresh, status }) {
  const $ = id => document.getElementById(id);
  const form = $('object-grant-form'), dialog = $('object-grant-dialog');
  let attempt, working = false, returnFocus;
  for (const [id, name] of Object.entries(ITEM_CATEGORIES)) $('object-grant-category').append(new Option(name, id));
  const fields = () => ({ name: $('object-grant-name').value.trim(), category: $('object-grant-category').value,
    quantity: $('object-grant-quantity').valueAsNumber, description: $('object-grant-description').value.trim(),
    value: $('object-grant-value').value.trim(), equipped: $('object-grant-equipped').checked });
  function update() {
    const target = attempt?.campaign.characters.find(character => character.id === $('object-grant-character').value);
    $('object-grant-target').textContent = target ? `${target.name} · ${target[PJ_SOURCE_KEY].inventory?.length ?? 0} entrée(s) avant attribution. La copie sera ajoutée séparément.` : 'Importer ou créer un PJ 5d6 avec un inventaire compatible pour l’attribuer.';
    $('object-grant-submit').disabled = working || !target || !$('object-grant-reviewed').checked;
  }
  function open(creationId) {
    if (!canOpen()) return;
    const campaign = structuredClone(getCampaign());
    const creation = campaign?.[CREATIONS_KEY]?.find(item => item.id === creationId && item.kind === 'object');
    if (!creation) return;
    returnFocus = document.activeElement;
    form.reset();
    const initial = objectGrantFields(creation);
    for (const [key, value] of Object.entries(initial)) {
      const control = $('object-grant-' + key);
      if (control) { if (control.type === 'checkbox') control.checked = value; else control.value = value; }
    }
    $('object-grant-model').textContent = `Modèle privé · ${creation.name}. Relire les champs ci-dessous : ils rejoindront la fiche partageable du PJ.`;
    const recipients = campaign.characters.filter(character => character[PJ_SOURCE_KEY] &&
      (character[PJ_SOURCE_KEY].inventory === undefined || Array.isArray(character[PJ_SOURCE_KEY].inventory)));
    $('object-grant-character').replaceChildren(...recipients.map(character => new Option(character.name, character.id)));
    form.querySelector('.form-feedback').hidden = true;
    attempt = { campaign, creationId, itemId: crypto.randomUUID(), at: new Date().toISOString() };
    update(); dialog.showModal();
  }
  form.addEventListener('input', event => {
    if (event.target.id !== 'object-grant-reviewed') $('object-grant-reviewed').checked = false;
    update();
  });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!attempt || working || !canOpen() || !$('object-grant-reviewed').checked) return;
    const current = attempt;
    working = true; form.inert = true; update();
    try {
      const campaign = getCampaign();
      if (campaign.id !== current.campaign.id || campaign.revision !== current.campaign.revision) throw new Error('La campagne a changé. Relire son état avant une nouvelle attribution.');
      const characterId = $('object-grant-character').value;
      const signature = JSON.stringify({ characterId, fields: fields() });
      if (signature !== current.signature) {
        const data = await prepareObjectGrant(current.campaign, { creationId: current.creationId, characterId,
          itemId: current.itemId, fields: fields(), at: current.at });
        current.command = { id: current.campaign.id, expectedRevision: current.campaign.revision,
          operationId: crypto.randomUUID(), type: 'update-pj-source', data };
        current.signature = signature;
      }
      await save(current.command, { form, onSaved: () => {
        attempt = undefined; dialog.close(); status('Copie attribuée. Relire l’échange avant de le transmettre.');
        queueMicrotask(() => void exportCharacter(characterId));
      } });
    } catch (error) {
      const feedback = form.querySelector('.form-feedback'); feedback.hidden = false;
      feedback.querySelector('.form-error').textContent = error.message;
    } finally { working = false; form.inert = false; update(); }
  });
  $('object-grant-close').addEventListener('click', () => { if (!working) dialog.close(); });
  form.querySelector('.reload-draft').addEventListener('click', async () => { if (!working) { dialog.close(); await refresh(); } });
  dialog.addEventListener('cancel', event => { if (working) event.preventDefault(); });
  dialog.addEventListener('close', () => {
    attempt = undefined;
    queueMicrotask(() => { if (!$('pj-export-dialog').open) (returnFocus?.isConnected && returnFocus.getClientRects().length ? returnFocus : $('nav-creations')).focus(); });
  });
  return { open };
}

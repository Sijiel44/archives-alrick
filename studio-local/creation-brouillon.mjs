import { DRAFT_MAX_BYTES, checkCreationDraft, creationDraftBackup, readCreationDraftFile } from './brouillons-pj.mjs';

const $ = id => document.getElementById(id);
const date = new Intl.DateTimeFormat('fr', { dateStyle: 'medium', timeStyle: 'short' });

export async function creationDraftController({ store, capture, restore, reset, validate, isLoading, download, canOpen }) {
  const dialog = $('player-create-dialog');
  let saved, working = false, baseline, failed = false, restoring = false, flight, importPreview, fileRequest = 0;
  const serialize = () => JSON.stringify(capture());
  const dirty = () => working && serialize() !== baseline;
  function status(text, error = false) {
    $('creation-draft-status').textContent = text;
    $('creation-draft-status').toggleAttribute('data-error', error);
    $('creation-draft-reload').hidden = !error;
    if (error && !dialog.open) {
      $('player-error').textContent = text;
      $('player-error').hidden = false;
    }
  }
  function renderCard() {
    $('creation-draft-card').hidden = !saved?.snapshot;
    if (!saved?.snapshot) return;
    $('creation-draft-name').textContent = saved.snapshot.fields['new-player-name'] || 'Un personnage à imaginer';
    $('creation-draft-date').textContent = `Brouillon conservé le ${date.format(saved.updatedAt)}`;
  }
  async function read() {
    saved = await store.readDraft();
    renderCard();
  }
  function apply(snapshot) {
    restoring = true;
    try {
      if (snapshot) { validate(snapshot); restore(snapshot); }
      else reset();
      working = true;
      baseline = serialize();
      failed = false;
    } finally { restoring = false; }
  }
  async function flush(force = false) {
    if (flight) { await flight; return flush(force); }
    if (!working || restoring) return saved;
    if (isLoading()) throw new Error('Le portrait est en cours de préparation. Attends son aperçu pour garder le brouillon.');
    if (failed && !force) throw new Error('Le brouillon attend une nouvelle tentative ou une relecture.');
    if (!dirty() && saved?.snapshot) return saved;
    const snapshot = checkCreationDraft(capture());
    const text = JSON.stringify(snapshot);
    status('Enregistrement du brouillon…');
    flight = (async () => {
      try {
        saved = await store.saveDraft(snapshot, saved?.revision ?? 0);
        baseline = text;
        failed = false;
        renderCard();
        status('Brouillon enregistré dans ce navigateur.');
      } catch (error) { failed = true; status(error.message, true); throw error; }
    })();
    try { await flight; } finally { flight = undefined; }
    if (dirty()) return flush();
    return saved;
  }
  function changed() {
    if (!working || restoring) return;
    if (isLoading()) { status('Préparation du portrait avant enregistrement…'); return; }
    if (dirty() && !failed) void flush().catch(() => {});
  }
  async function open() {
    if (!canOpen()) return;
    if (!working || !dirty()) {
      await read();
      apply(saved?.snapshot);
      status(saved?.snapshot ? 'Brouillon repris. Vérifie la fiche avant de créer le personnage.' : 'Tes choix seront conservés dans ce navigateur.');
    }
    if (!dialog.open) dialog.showModal();
  }
  async function close() {
    if (!dirty() && !saved?.snapshot && !flight && !isLoading()) { working = false; dialog.close(); return; }
    try { await flush(); dialog.close(); }
    catch (error) { status(error.message, true); }
  }
  $('creation-draft-resume').addEventListener('click', () => void open().catch(error => status(error.message, true)));
  $('creation-draft-save').addEventListener('click', () => void flush(true).catch(() => {}));
  $('creation-draft-export').addEventListener('click', async () => {
    try {
      if (isLoading()) throw new Error('Attends la préparation du portrait avant de télécharger le brouillon.');
      download(await creationDraftBackup(capture()), 'personnage-brouillon.json');
      status('Fichier de brouillon téléchargé. Il contient tes choix personnels.', failed);
    } catch (error) { status(error.message, true); }
  });
  $('creation-draft-reload').addEventListener('click', async () => {
    if (!window.confirm('Relire le brouillon enregistré et remplacer les choix affichés ? Télécharge-les d’abord si tu veux les garder.')) return;
    try { if (flight) await flight.catch(() => {}); await read(); apply(saved?.snapshot); status('Brouillon enregistré relu.'); }
    catch (error) { status(error.message, true); }
  });
  $('creation-draft-new').addEventListener('click', async () => {
    if (!window.confirm('Recommencer et retirer ce brouillon ? Télécharge-le d’abord pour conserver tes choix.')) return;
    try {
      if (flight) await flight.catch(() => {});
      saved = await store.saveDraft(null, saved?.revision ?? 0);
      apply(); renderCard(); status('Nouveau brouillon. Les personnages enregistrés sont conservés.');
    } catch (error) { failed = true; status(error.message, true); }
  });
  for (const event of ['input', 'change', 'toggle']) $('player-create-form').addEventListener(event, changed, event === 'toggle');
  window.addEventListener('beforeunload', event => {
    if (dirty() || (working && isLoading())) { event.preventDefault(); event.returnValue = ''; }
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && dirty() && !failed) void flush().catch(() => {});
  });
  function enableImport() {
    $('creation-draft-import-confirm').disabled = !importPreview ||
      (Boolean(importPreview.previous?.snapshot) && !$('creation-draft-replace').checked);
  }
  $('creation-draft-import-open').addEventListener('click', () => {
    if (!canOpen()) return;
    fileRequest++;
    importPreview = undefined;
    $('creation-draft-import-form').reset();
    $('creation-draft-replace-wrap').hidden = true;
    $('creation-draft-import-preview').textContent = 'Choisis un fichier pour voir son contenu.';
    enableImport();
    $('creation-draft-import-dialog').showModal();
  });
  $('creation-draft-file').addEventListener('change', async event => {
    const request = ++fileRequest;
    importPreview = undefined; enableImport();
    $('creation-draft-replace-wrap').hidden = true;
    $('creation-draft-replace').checked = false;
    const file = event.target.files[0];
    $('creation-draft-import-preview').textContent = file ? 'Lecture du brouillon…' : 'Choisis un fichier pour voir son contenu.';
    if (!file) return;
    try {
      if (file.size > DRAFT_MAX_BYTES) throw new Error('Le brouillon dépasse 512 Kio.');
      const archive = await readCreationDraftFile(await file.text());
      validate(archive.payload);
      const previous = await store.readDraft();
      if (request !== fileRequest) return;
      importPreview = { archive, previous };
      $('creation-draft-import-preview').textContent = `${archive.payload.fields['new-player-name'] || 'Personnage sans nom'} · ${archive.payload.fields['new-player-mode'] === 'free' ? 'Création libre' : 'Parcours de vie'} · Brouillon à terminer, sans personnage créé.`;
      $('creation-draft-replace-wrap').hidden = !previous?.snapshot;
      enableImport();
    } catch (error) { if (request === fileRequest) $('creation-draft-import-preview').textContent = error.message; }
  });
  $('creation-draft-replace').addEventListener('change', enableImport);
  $('creation-draft-import-form').addEventListener('submit', async event => {
    event.preventDefault();
    if (!importPreview || $('creation-draft-import-confirm').disabled) return;
    const form = event.currentTarget;
    form.inert = true;
    try {
      const snapshot = { ...importPreview.archive.payload, id: `pj-${crypto.randomUUID()}` };
      saved = await store.saveDraft(snapshot, importPreview.previous?.revision ?? 0);
      apply(snapshot); renderCard();
      $('creation-draft-import-dialog').close();
      dialog.showModal();
      status('Copie du brouillon importée. Termine les choix et vérifie la fiche.');
    } catch (error) { $('creation-draft-import-preview').textContent = error.message; }
    finally { form.inert = false; }
  });
  await read();
  $('creation-draft-import-open').disabled = false;
  return {
    open, close, changed,
    async prepareCreation() { await flush(true); return { revision: saved.revision, snapshot: saved.snapshot }; },
    consumed() {
      saved = { ...saved, revision: saved.revision + 1, snapshot: null };
      working = false; baseline = undefined; failed = false; renderCard();
    },
  };
}

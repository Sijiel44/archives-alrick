import { playerNotebook, readPlayerNotebook, comparePlayerNotebook } from './carnet-joueur.mjs';
import { PLAYER_NOTEBOOK_LIMIT, MAX_PLAYER_NOTEBOOK_BYTES } from './espace-joueur-store.mjs';
import { isPlayerArchived } from './rangement-joueur.mjs';
import { validPortrait } from './portraits.mjs';

const normalized = value => String(value ?? '').normalize('NFKD').replace(/\p{M}/gu, '').toLocaleLowerCase('fr');
const date = new Intl.DateTimeFormat('fr', { dateStyle: 'medium', timeStyle: 'short' });
const node = (tag, text = '', className) => { const el = document.createElement(tag); el.textContent = text; if (className) el.className = className; return el; };

export function createPlayerNotebookUI({ store, getRecords, beforeImport, imported, setBusy, canOpen, download }) {
  const $ = id => document.getElementById(id);
  const dialog = $('notebook-dialog');
  let mode, archive, rows = [], selected = new Set(), expected = [], limit = 20;
  let request = 0, loading = false, busy = false, reviewRequired = false, returnFocus;
  const message = text => { $('notebook-message').textContent = text; };
  function matches() {
    const terms = normalized($('notebook-query').value).split(/\s+/u).filter(Boolean);
    const state = $('notebook-state').value;
    return rows.map((row, index) => ({ row, index })).filter(({ row }) =>
      (state === 'all' || isPlayerArchived(row.payload) === (state === 'archived')) &&
      terms.every(term => normalized([row.payload.sheet.name, row.payload.sheet.profession, row.payload.sheet.level].join(' ')).includes(term)));
  }
  function render() {
    const results = matches();
    $('notebook-preview').hidden = !rows.length;
    $('notebook-list').replaceChildren(...results.slice(0, limit).map(({ row, index }) => {
      const { sheet } = row.payload;
      const card = node('li', '', 'player-file-card notebook-card');
      card.dataset.entry = index;
      const heading = node('div', '', 'player-file-heading');
      const portrait = node('span', sheet.name.trim().split(/\s+/u).slice(0, 2).map(part => Array.from(part)[0]).join(''), 'player-file-portrait');
      portrait.setAttribute('aria-hidden', 'true');
      if (sheet.portrait && validPortrait(sheet.portrait)) {
        const image = document.createElement('img'); image.src = sheet.portrait; image.alt = ''; image.loading = 'lazy'; image.referrerPolicy = 'no-referrer';
        image.addEventListener('error', () => image.remove()); portrait.append(image);
      }
      const title = node('div'); title.append(node('p', isPlayerArchived(row.payload) ? 'Archive personnelle' : 'En activité', 'eyebrow accent'), node('h3', sheet.name));
      heading.append(portrait, title);
      card.append(heading, node('p', `Niveau ${sheet.level}${sheet.profession ? ` · ${sheet.profession}` : ''}`, 'field-help'), node('p', `Enregistrée le ${date.format(row.savedAt)}`, 'field-help'));
      if (mode === 'import') {
        const label = row.identical ? `Contenu identique à ${row.identical} fiche${row.identical > 1 ? 's' : ''} déjà présente${row.identical > 1 ? 's' : ''}.` :
          row.repeated ? 'Contenu identique à une autre entrée de ce fichier.' : row.related ? `${row.related} autre${row.related > 1 ? 's' : ''} copie${row.related > 1 ? 's' : ''} de cette identité déjà présente${row.related > 1 ? 's' : ''}.` : 'Nouvelle identité sur cet appareil.';
        card.append(node('p', label, 'notebook-comparison'));
      }
      const choice = node('label', '', 'notebook-choice');
      const check = document.createElement('input'); check.type = 'checkbox'; check.checked = selected.has(index); check.disabled = busy || loading;
      check.setAttribute('aria-label', `${mode === 'export' ? 'Sauvegarder' : 'Ajouter une copie de'} ${sheet.name}`);
      check.addEventListener('change', () => { if (check.checked) selected.add(index); else selected.delete(index); updateCount(); });
      choice.append(check, node('span', mode === 'export' ? 'Inclure cette fiche' : 'Ajouter une nouvelle copie'));
      card.append(choice); return card;
    }));
    if (!results.length) $('notebook-list').append(node('li', 'Aucun résultat avec ces filtres.', 'empty'));
    $('notebook-more').hidden = results.length <= limit;
    for (const control of dialog.querySelectorAll('button, input, select')) control.disabled = busy;
    for (const id of ['notebook-query', 'notebook-state', 'notebook-select-results', 'notebook-clear', 'notebook-more']) $(id).disabled = busy || loading;
    $('notebook-refresh').disabled = busy || loading || (mode === 'import' && !archive);
    updateCount();
  }
  function updateCount() {
    const results = matches();
    const archived = [...selected].filter(index => isPlayerArchived(rows[index].payload)).length;
    $('notebook-count').textContent = `${selected.size} fiche${selected.size !== 1 ? 's' : ''} cochée${selected.size !== 1 ? 's' : ''}, dont ${archived} archive${archived !== 1 ? 's' : ''} · ${results.length} résultat${results.length !== 1 ? 's' : ''} · ${Math.min(limit, results.length)} affiché${Math.min(limit, results.length) !== 1 ? 's' : ''}${selected.size > PLAYER_NOTEBOOK_LIMIT ? ' · Choisis au plus 100 fiches par fichier.' : ''}`;
    $('notebook-confirm').textContent = mode === 'export' ? `Télécharger ${selected.size} fiche${selected.size !== 1 ? 's' : ''}` : `Ajouter ${selected.size} copie${selected.size !== 1 ? 's' : ''}`;
    $('notebook-confirm').disabled = busy || loading || reviewRequired || !selected.size || selected.size > PLAYER_NOTEBOOK_LIMIT;
  }
  async function prepare() {
    const id = ++request;
    loading = true; reviewRequired = false; selected.clear(); rows = []; render(); message('Lecture des fiches enregistrées…');
    try {
      const local = await store.list();
      const next = mode === 'import' ? await comparePlayerNotebook(archive, local) : local.map(record => ({ sourceId: record.id, savedAt: record.updatedAt, payload: record, selected: true }));
      if (id !== request || !dialog.open) return;
      expected = local.map(({ id, revision }) => ({ id, revision })); rows = next;
      selected = new Set(rows.flatMap((row, index) => row.selected ? [index] : [])); limit = 20;
      message(mode === 'import' ? 'Les contenus identiques sont décochés. Chaque ajout crée une copie et conserve les fiches locales.' : 'Fiches enregistrées uniquement. Enregistre tes notes en cours pour les inclure.');
    } catch (error) { if (id === request) message(error.message); }
    finally { if (id === request && dialog.open) { loading = false; render(); $('notebook-title').focus(); } }
  }
  function open(nextMode) {
    if (!canOpen()) return;
    mode = nextMode; returnFocus = document.activeElement; archive = undefined; rows = []; selected.clear(); expected = []; reviewRequired = false; loading = false; limit = 20;
    $('notebook-query').value = ''; $('notebook-state').value = 'all'; $('notebook-file').value = '';
    $('notebook-query').placeholder = mode === 'export' ? 'Une fiche à emporter…' : 'Une fiche à retrouver…';
    $('notebook-title').textContent = mode === 'export' ? 'Emporter mes personnages' : 'Restaurer mon carnet';
    $('notebook-file-group').hidden = mode !== 'import';
    message(mode === 'import' ? 'Choisis un carnet pour vérifier son contenu avant de sélectionner les copies.' : 'Lecture…');
    render(); dialog.showModal();
    if (mode === 'export') void prepare(); else $('notebook-file').focus();
  }
  $('player-notebook-export').addEventListener('click', () => open('export'));
  $('player-notebook-import').addEventListener('click', () => open('import'));
  $('notebook-file').addEventListener('change', async event => {
    const id = ++request, file = event.target.files[0];
    archive = undefined; rows = []; selected.clear(); loading = Boolean(file); reviewRequired = false; render();
    message(file ? 'Vérification du carnet…' : 'Choisis un carnet.');
    if (!file) return;
    try {
      if (file.size > MAX_PLAYER_NOTEBOOK_BYTES) throw new Error('Le carnet dépasse 20 Mio.');
      const next = await readPlayerNotebook(await file.text());
      if (id !== request || !dialog.open) return;
      archive = next; await prepare();
    } catch (error) { if (id === request) { loading = false; message(error instanceof SyntaxError ? 'Le carnet doit contenir du JSON valide.' : error.message); render(); } }
  });
  for (const id of ['notebook-query', 'notebook-state']) $(id).addEventListener('input', () => { limit = 20; render(); });
  $('notebook-more').addEventListener('click', () => { limit += 20; render(); });
  $('notebook-select-results').addEventListener('click', () => { for (const { index } of matches()) selected.add(index); render(); });
  $('notebook-clear').addEventListener('click', () => { selected.clear(); render(); });
  $('notebook-refresh').addEventListener('click', () => void prepare());
  $('notebook-close').addEventListener('click', () => { if (!busy) dialog.close(); });
  dialog.addEventListener('cancel', event => { if (busy) event.preventDefault(); });
  dialog.addEventListener('close', () => { request++; queueMicrotask(() => returnFocus?.isConnected && returnFocus.focus({ preventScroll: true })); });
  $('notebook-confirm').addEventListener('click', async () => {
    if (busy || loading || reviewRequired || !selected.size || selected.size > PLAYER_NOTEBOOK_LIMIT) return;
    if (mode === 'import' && !beforeImport()) return;
    busy = true; setBusy(true); render(); message(mode === 'export' ? 'Préparation du fichier…' : 'Ajout des copies…');
    try {
      const chosen = rows.filter((_, index) => selected.has(index));
      if (mode === 'export') {
        const file = await playerNotebook(chosen.map(row => ({ ...row.payload, id: row.sourceId, updatedAt: row.savedAt })));
        download(file, `carnet-personnages-${file.created.slice(0, 10)}.json`);
        message('Fichier proposé au téléchargement. Conserve-le dans un emplacement personnel.');
      } else {
        const result = await store.importNotebook({ entries: chosen.map(row => row.payload), expected });
        imported(result); returnFocus = $('player-name'); dialog.close();
      }
    } catch (error) { reviewRequired = mode === 'import'; message(`${error.message}${reviewRequired ? ' Actualise l’aperçu pour reprendre.' : ''}`); }
    finally { busy = false; setBusy(false); render(); }
  });
  function update() { $('player-notebook-export').disabled = !getRecords().length; $('player-notebook-import').disabled = false; }
  update();
  return { update };
}

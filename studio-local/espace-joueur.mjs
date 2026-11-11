import { PLAY_STATS } from './store.mjs';
import { buildFreePJ, createFreePJ, createGuidedPJ, EDUCATION_PATHS, FREE_PJ_MASTERIES, LITERACY_LEVELS,
  MAX_PJ_FILE_BYTES, ORIGIN_STEPS } from './pj-m02.mjs';
import { resolvePlayAction, studioDice } from './protocole.mjs';
import { checkPlayerSheet, openPlayerStore, playerBackup, playerExchange, readPlayerFile } from './espace-joueur-store.mjs';

const $ = id => document.getElementById(id);
const stats = Object.entries(PLAY_STATS);
const masteryName = key => ({ negociation: 'Négociation', resistance_magique: 'Résistance magique', volonte: 'Volonté' })[key] ?? key;
const storyFields = [['profession', 'Métier'], ['backstory', 'Histoire personnelle'], ['connections', 'Liens'], ['goal', 'Objectif']];
const archiveDate = new Intl.DateTimeFormat('fr', { dateStyle: 'medium', timeStyle: 'short' });
const notes = $('personal-notes');
let store;
let records = [];
let active;
let pending = false;
let reviewed;
let imports = [];
let fileRequest = 0;

function node(tag, content) {
  const element = document.createElement(tag);
  element.textContent = content;
  return element;
}

function field(parent, control, id, label) {
  control.id = control.name = id;
  control.required = true;
  const caption = node('label', label);
  caption.htmlFor = id;
  const wrapper = document.createElement('div');
  wrapper.append(caption, control);
  $(parent).append(wrapper);
}

function select(parent, id, label, entries) {
  const input = document.createElement('select');
  input.append(new Option('Choisir…', ''), ...entries.map(entry => new Option(entry.label, entry.id)));
  field(parent, input, id, label);
}

function number(parent, id, label, value, min, max) {
  const input = document.createElement('input');
  input.type = 'number';
  input.defaultValue = value;
  input.min = min;
  input.max = max;
  field(parent, input, id, label);
}

function inventory(sheet) {
  return Array.isArray(sheet.inventory) ? sheet.inventory : [];
}

function render(record) {
  const changed = active?.id !== record?.id;
  active = record;
  $('player-library').hidden = records.length === 0;
  $('player-selection').replaceChildren(...records.map(entry => new Option(`${entry.sheet.name} · niveau ${entry.sheet.level}`, entry.id)));
  $('player-selection').value = active?.id ?? '';
  $('player-selection').disabled = records.length === 0;
  $('player-sheet').hidden = !active;
  if (!active) return;
  const { sheet } = active;
  $('player-name').textContent = sheet.name;
  $('player-resources').textContent = `Niveau ${sheet.level} · PV ${sheet.pv} / ${sheet.pvMax} · Mana ${sheet.mana} / ${sheet.manaMax} · ${sheet.xp} XP`;
  $('player-pv').value = sheet.pv;
  $('player-pv').max = sheet.pvMax;
  $('player-mana').value = sheet.mana;
  $('player-mana').max = sheet.manaMax;
  $('player-stat-line').textContent = stats.map(([key, label]) => `${label} ${sheet.stats[key]}`).join(' · ');
  const story = storyFields.filter(([key]) => typeof sheet[key] === 'string' && sheet[key]);
  $('player-story').hidden = story.length === 0;
  $('player-story-fields').replaceChildren(...story.flatMap(([key, label]) => [node('dt', label), node('dd', sheet[key])]));
  const masteries = Object.entries(sheet.masteries).filter(([, rank]) => rank > 0);
  $('player-mastery-line').textContent = masteries.length ? masteries.map(([key, rank]) => `${masteryName(key)} ${rank}`).join(' · ') : 'Aucune maîtrise renseignée.';
  $('roll-mastery').replaceChildren(new Option('Aucune', ''), ...masteries.map(([key, rank]) => new Option(`${masteryName(key)} · ${rank}`, key)));
  const items = inventory(sheet).filter(item => typeof item?.name === 'string');
  $('player-items').replaceChildren(...(items.length ? items.map(item => node('li', `${item.name} × ${item.quantity ?? 1}${typeof item.description === 'string' && item.description ? ` · ${item.description}` : ''}`)) : [node('li', 'Inventaire vide.') ]));
  const abilities = sheet.development.abilities.map(ability => {
    const item = document.createElement('details');
    item.append(node('summary', `${ability.name} · ${ability.status === 'defined' ? ability.domain : 'Emplacement à définir'}`));
    for (const key of ['description', 'effect', 'limitations', 'provenance']) {
      if (ability[key]) item.append(node('p', ability[key]));
    }
    return item;
  });
  $('player-ability-list').replaceChildren(...(abilities.length ? abilities : [node('p', 'Aucune capacité renseignée.') ]));
  if (changed) {
    notes.value = active.notes;
    $('player-roll-result').textContent = '';
  }
}

function report(error, target = $('player-error')) {
  target.textContent = error.message;
  target.hidden = false;
}

async function save(record, dialog) {
  if (pending) return false;
  pending = true;
  $('player-error').hidden = true;
  $('player-save-status').textContent = 'Enregistrement…';
  try {
    const saved = await store.save(record);
    records = [saved, ...records.filter(entry => entry.id !== saved.id)];
    render(saved);
    $('player-save-status').textContent = 'Sauvegarde locale confirmée';
    if (dialog) {
      dialog.close();
      $('player-name').focus();
    }
    return true;
  } catch (error) {
    $('player-save-status').textContent = 'Enregistrement interrompu';
    report(error, dialog?.querySelector('[role="status"]'));
    return false;
  } finally { pending = false; }
}

for (const step of ORIGIN_STEPS) select('origin-fields', `origin-${step.id}`, step.title, step.options);
select('origin-fields', 'origin-education', 'Transmission et éducation', EDUCATION_PATHS);
select('origin-fields', 'origin-literacy', 'Lecture et écriture', LITERACY_LEVELS);
for (const [key, label] of stats) {
  number('free-stats', `base-${key}`, `${label} de départ`, 3, 1, 5);
  number('free-stats', `final-${key}`, `${label} finale`, 3, 1, Number.MAX_SAFE_INTEGER);
}
for (const key of FREE_PJ_MASTERIES) number('free-masteries', `mastery-${key}`, masteryName(key), 0, 0, Number.MAX_SAFE_INTEGER);
$('roll-stat').append(...stats.map(([key, label]) => new Option(label, key)));

function resetCreationReview() {
  reviewed = undefined;
  $('confirm-player-create').disabled = true;
  $('player-create-result').textContent = '';
}

function leaveNotes() {
  return !active || notes.value === active.notes || window.confirm('Quitter cette fiche et abandonner les notes en cours ?');
}

function updateMode() {
  const guided = $('new-player-mode').value === 'guided';
  $('new-player-guided').hidden = $('new-player-guided').disabled = !guided;
  $('new-player-free').hidden = $('new-player-free').disabled = guided;
  resetCreationReview();
}

$('player-create').addEventListener('click', () => {
  if (pending || !leaveNotes()) return;
  $('player-create-form').reset();
  updateMode();
  $('player-create-dialog').showModal();
});
$('new-player-mode').addEventListener('change', updateMode);
$('player-create-form').addEventListener('input', resetCreationReview);
$('player-create-form').addEventListener('submit', event => {
  event.preventDefault();
  if (pending) return;
  const fields = new FormData(event.currentTarget);
  const identity = { id: `pj-${crypto.randomUUID()}`, name: fields.get('name').trim(),
    backstory: fields.get('backstory').trim(), connections: fields.get('connections').trim(), goal: fields.get('goal').trim() };
  const values = (prefix, keys) => Object.fromEntries(keys.map(key => [key, Number(fields.get(`${prefix}-${key}`))]));
  try {
    if ($('new-player-mode').value === 'guided') {
      reviewed = createGuidedPJ({ ...identity, choices: ORIGIN_STEPS.map(step => fields.get(`origin-${step.id}`)),
        education: fields.get('origin-education'), literacy: fields.get('origin-literacy') });
    } else {
      const keys = Object.keys(PLAY_STATS);
      const build = buildFreePJ({ level: Number(fields.get('level')), startingStats: values('base', keys),
        stats: values('final', keys), masteries: values('mastery', FREE_PJ_MASTERIES) });
      reviewed = createFreePJ(build, { ...identity, profession: '' }).source;
    }
    checkPlayerSheet(reviewed);
    $('player-create-result').textContent = `${reviewed.name} · niveau ${reviewed.level} · ${reviewed.pvMax} PV · ${reviewed.manaMax} mana. Fiche M02 vérifiée. Présente cette fiche au MJ avant la partie.`;
    $('confirm-player-create').disabled = false;
  } catch (error) { report(error, $('player-create-result')); }
});
$('confirm-player-create').addEventListener('click', () => {
  if (reviewed) void save({ sheet: reviewed, notes: '' }, $('player-create-dialog'));
});

$('player-import').addEventListener('click', () => {
  if (pending || !leaveNotes()) return;
  fileRequest++;
  $('player-import-form').reset();
  $('player-import-choice').replaceChildren();
  $('player-import-choice').disabled = $('confirm-player-import').disabled = true;
  $('player-import-preview').textContent = 'Choisis un fichier pour voir son contenu.';
  $('player-import-dialog').showModal();
});
$('player-file').addEventListener('change', async event => {
  const id = ++fileRequest;
  const file = event.target.files[0];
  $('confirm-player-import').disabled = $('player-import-choice').disabled = true;
  $('player-import-choice').replaceChildren();
  imports = [];
  $('player-import-preview').textContent = file ? 'Lecture du fichier…' : 'Choisis un fichier pour voir son contenu.';
  if (!file) return;
  try {
    if (file.size > MAX_PJ_FILE_BYTES) throw new Error('Le fichier dépasse 2 Mio.');
    const archive = await readPlayerFile(await file.text());
    const items = archive.records.filter(({ sheet }) => {
      try { checkPlayerSheet(sheet); return true; } catch { return false; }
    });
    if (id !== fileRequest) return;
    if (!items.length) throw new Error('Aucune fiche M02 ne passe la vérification des règles.');
    imports = items;
    $('player-import-choice').replaceChildren(...items.map(({ sheet }, index) => new Option(`${sheet.name} · niveau ${sheet.level}`, index)));
    const timestamp = typeof archive.created === 'string' ? Date.parse(archive.created) : NaN;
    const date = Number.isFinite(timestamp) ? ` du ${archiveDate.format(timestamp)}` : '';
    const count = items.length === 1 ? '1 fiche compatible' : `${items.length} fiches compatibles`;
    $('player-import-preview').textContent = `${archive.format}${date} · ${count}. Chaque import crée une copie dans ton espace.`;
    $('confirm-player-import').disabled = $('player-import-choice').disabled = false;
  } catch (error) {
    if (id === fileRequest) report(error instanceof SyntaxError ? new Error('Le fichier doit contenir du JSON valide.') : error, $('player-import-preview'));
  }
});
$('player-import-form').addEventListener('submit', event => {
  event.preventDefault();
  const record = imports[$('player-import-choice').value];
  if (record) void save(record, $('player-import-dialog'));
});

for (const button of document.querySelectorAll('[data-close]')) button.addEventListener('click', () => {
  if (!pending) button.closest('dialog').close();
});
for (const dialog of document.querySelectorAll('dialog')) dialog.addEventListener('cancel', event => {
  if (pending) event.preventDefault();
});

$('player-selection').addEventListener('change', event => {
  if (pending || !leaveNotes()) {
    event.target.value = active.id;
    return;
  }
  render(records.find(record => record.id === event.target.value));
});
window.addEventListener('beforeunload', event => {
  if (active && notes.value !== active.notes) event.preventDefault();
});
$('player-notes').addEventListener('submit', event => {
  event.preventDefault();
  void save({ ...active, notes: notes.value });
});
$('player-resources-form').addEventListener('submit', event => {
  event.preventDefault();
  const { sheet } = active;
  void save({ ...active, sheet: { ...sheet, pv: $('player-pv').valueAsNumber, mana: $('player-mana').valueAsNumber } });
});
$('player-item-form').addEventListener('submit', async event => {
  event.preventDefault();
  if (pending) return;
  const form = event.currentTarget;
  const fields = new FormData(form);
  const name = fields.get('name').trim();
  if (!name) return report(new Error('Saisis le nom de l’objet.'));
  const item = { id: crypto.randomUUID(), templateId: '', name, quantity: Number(fields.get('quantity')),
    description: fields.get('description').trim(), category: 'autre', value: '' };
  if (await save({ ...active, sheet: { ...active.sheet, inventory: [...inventory(active.sheet), item] } })) form.reset();
});

$('player-free-roll').addEventListener('click', () => {
  const dice = studioDice();
  $('player-roll-result').textContent = `Jet libre · ${dice.join(' + ')} = ${dice.reduce((sum, die) => sum + die, 0)}`;
});
$('player-roll-form').addEventListener('submit', event => {
  event.preventDefault();
  const stat = $('roll-stat').value;
  const dice = studioDice();
  const result = resolvePlayAction({ mode: 'roll', roll: { dice, stat, rawStat: active.sheet.stats[stat],
    masteryRank: active.sheet.masteries[$('roll-mastery').value] ?? 0, threshold: $('roll-threshold').valueAsNumber, situation: 0, source: 'studio' } });
  $('player-roll-result').textContent = `${result.title} · ${dice.join(' + ')} · ${result.balance} · ${result.bonuses}`;
});

function download(content, name) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(content)], { type: 'application/json' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

$('player-backup').addEventListener('click', async () => {
  try { download(await playerBackup({ ...active, notes: notes.value }), 'personnage-sauvegarde.json'); }
  catch (error) { report(error); }
});
$('player-exchange').addEventListener('click', () => download(playerExchange(active.sheet), 'personnage-pour-le-mj.m02.json'));

try {
  store = await openPlayerStore();
  records = await store.list();
  render(records[0]);
  $('player-create').disabled = $('player-import').disabled = false;
  $('player-save-status').textContent = 'Stockage joueur prêt';
} catch (error) {
  $('player-save-status').textContent = 'Stockage inaccessible';
  report(error);
}

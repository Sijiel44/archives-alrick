import { PLAY_STATS, validImageUrl } from './store.mjs';
import { buildFreePJ, createFreePJ, createGuidedPJ, EDUCATION_PATHS, FREE_PJ_MASTERIES, LITERACY_LEVELS,
  MAX_PJ_FILE_BYTES, ORIGIN_STEPS, developmentBudget, effectiveMastery, effectiveStat, evaluatePJ, masteryCost, statCost } from './pj-m02.mjs';
import { resolvePlayAction, studioDice } from './protocole.mjs';
import { checkPlayerSheet, openPlayerStore, playerBackup, playerExchange, readPlayerFile } from './espace-joueur-store.mjs';
import { readPortrait, validPortrait } from './portraits.mjs';

const $ = id => document.getElementById(id);
const stats = Object.entries(PLAY_STATS);
const masteryLabels = { lames: 'Lames', haches: 'Haches', arcs: 'Arcs', esquive: 'Esquive', parade: 'Parade',
  magie: 'Magie', runes: 'Runes', soins: 'Soins', negociation: 'Négociation', resistance_magique: 'Résistance magique',
  volonte: 'Volonté', survie: 'Survie', artisanat: 'Artisanat', commerce: 'Commerce', histoire: 'Histoire',
  commandement: 'Commandement', intendance: 'Intendance', agriculture: 'Agriculture', navigation: 'Navigation', arts: 'Arts' };
const masteryName = key => Object.hasOwn(masteryLabels, key) ? masteryLabels[key] : key;
const storyFields = [['profession', 'Métier'], ['backstory', 'Histoire personnelle'], ['connections', 'Liens'], ['goal', 'Objectif'],
  ['mentor', 'Mentor ou école'], ['training', 'Apprentissage en cours']];
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
  (typeof parent === 'string' ? $(parent) : parent).append(wrapper);
  return wrapper;
}

function select(parent, id, label, entries) {
  const input = document.createElement('select');
  input.append(new Option('Choisir…', ''), ...entries.map(entry => new Option(entry.label, entry.id)));
  return field(parent, input, id, label);
}

function number(parent, id, label, value, min, max) {
  const input = document.createElement('input');
  input.type = 'number';
  input.defaultValue = value;
  input.min = min;
  input.max = max;
  field(parent, input, id, label);
  return input;
}

function portraitEditor(container, prefix, onChange = () => {}) {
  container.append($('portrait-editor-template').content.cloneNode(true));
  const find = selector => container.querySelector(selector);
  const image = find('[data-portrait-preview]');
  const placeholder = find('[data-portrait-placeholder]');
  const status = find('[data-portrait-status]');
  const file = find('[data-portrait-field="file"]');
  const url = find('[data-portrait-field="url"]');
  for (const input of [file, url]) {
    input.id = `${prefix}-portrait-${input.dataset.portraitField}`;
    find(`[data-portrait-label="${input.dataset.portraitField}"]`).htmlFor = input.id;
  }
  let portrait = '', loading = false, request = 0;
  function show(value) {
    portrait = validPortrait(value) ? value : '';
    image.hidden = !portrait;
    placeholder.hidden = Boolean(portrait);
    if (portrait) image.src = portrait;
    else image.removeAttribute('src');
  }
  image.addEventListener('error', () => {
    image.hidden = true;
    placeholder.hidden = false;
    status.textContent = 'L’image ne s’affiche pas. Vérifie que le lien mène directement à une image accessible.';
  });
  file.addEventListener('change', async () => {
    const selected = file.files[0];
    const id = ++request;
    loading = Boolean(selected);
    onChange();
    if (!selected) return;
    status.textContent = 'Préparation du portrait…';
    try {
      const value = await readPortrait(selected);
      if (id !== request) return;
      show(value);
      url.value = '';
      status.textContent = 'Portrait prêt. Sa copie réduite sera enregistrée avec le personnage.';
    } catch (error) {
      if (id === request) status.textContent = error.message;
    } finally {
      if (id === request) { loading = false; file.value = ''; onChange(); }
    }
  });
  find('[data-portrait-action="link"]').addEventListener('click', () => {
    const value = url.value.trim();
    if (!validImageUrl(value)) {
      status.textContent = 'Saisis un lien HTTPS direct vers une image.';
      return;
    }
    request++;
    loading = false;
    show(value);
    status.textContent = 'Le lien sera conservé dans la fiche. L’image reste chez son hébergeur.';
    onChange();
  });
  find('[data-portrait-action="clear"]').addEventListener('click', () => {
    request++;
    loading = false;
    show('');
    file.value = url.value = '';
    status.textContent = 'Le personnage sera enregistré sans portrait.';
    onChange();
  });
  return {
    get value() { return portrait; },
    get loading() { return loading; },
    reset(value = '') {
      request++;
      loading = false;
      file.value = '';
      url.value = validImageUrl(value) ? value : '';
      show(value);
      status.textContent = 'Choisis le portrait qui accompagnera ton personnage.';
    },
  };
}

const creationPortrait = portraitEditor($('creation-portrait'), 'creation', resetCreationReview);
const sheetPortrait = portraitEditor($('sheet-portrait'), 'sheet');

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
  $('player-welcome').hidden = Boolean(active);
  if (!active) return;
  const { sheet } = active;
  const portrait = validPortrait(sheet.portrait) ? sheet.portrait : '';
  $('player-portrait').hidden = !portrait;
  $('player-portrait-placeholder').hidden = Boolean(portrait);
  $('player-portrait-message').hidden = true;
  if (portrait) {
    $('player-portrait').src = portrait;
    $('player-portrait').alt = `Portrait de ${sheet.name}`;
  } else $('player-portrait').removeAttribute('src');
  $('player-name').textContent = sheet.name;
  $('player-resources').textContent = `Niveau ${sheet.level} · PV ${sheet.pv} / ${sheet.pvMax} · Mana ${sheet.mana} / ${sheet.manaMax} · ${sheet.xp} XP`;
  $('player-pv').value = sheet.pv;
  $('player-pv').max = sheet.pvMax;
  $('player-mana').value = sheet.mana;
  $('player-mana').max = sheet.manaMax;
  $('player-stat-line').textContent = stats.map(([key, label]) => `${label} ${sheet.stats[key]} (+${effectiveStat(sheet.stats[key])})`).join(' · ');
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
    $('player-dice').replaceChildren();
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
    report(error, dialog?.querySelector('[data-save-message]') ?? $('player-error'));
    return false;
  } finally { pending = false; }
}

for (const step of ORIGIN_STEPS) {
  const wrapper = select('origin-fields', `origin-${step.id}`, step.title, step.options);
  const help = node('p', step.question);
  help.id = `origin-${step.id}-help`;
  help.className = 'field-help';
  wrapper.append(help);
  const control = $(`origin-${step.id}`);
  control.setAttribute('aria-describedby', help.id);
  control.addEventListener('change', () => {
    help.textContent = step.options.find(option => option.id === control.value)?.description ?? step.question;
  });
}
select('origin-fields', 'origin-education', 'Transmission et éducation', EDUCATION_PATHS);
select('origin-fields', 'origin-literacy', 'Lecture et écriture', LITERACY_LEVELS);
for (const [key, label] of stats) {
  const group = document.createElement('div');
  group.className = 'stat-card';
  group.append(node('h3', label));
  number(group, `base-${key}`, `${label} de départ`, 3, 1, 5);
  number(group, `final-${key}`, `${label} au niveau choisi`, 3, 1, Number.MAX_SAFE_INTEGER);
  const cost = node('p', '');
  cost.id = `stat-cost-${key}`;
  cost.className = 'field-help';
  group.append(cost);
  $('free-stats').append(group);
}
function masteryField(parent, id, key) {
  const control = number(parent, id, masteryName(key), 0, 0, Number.MAX_SAFE_INTEGER);
  control.dataset.mastery = key;
  const cost = node('p', '');
  cost.id = `cost-${id}`;
  cost.className = 'field-help';
  control.setAttribute('aria-describedby', cost.id);
  control.parentElement.append(cost);
  return control;
}
const martial = ['lames', 'haches', 'arcs', 'esquive', 'parade'];
const magical = ['magie', 'runes', 'soins', 'resistance_magique', 'volonte'];
for (const [title, keys] of [['Armes et défenses', martial], ['Magie et soins', magical],
  ['Savoirs, voyages et métiers', FREE_PJ_MASTERIES.filter(key => !martial.includes(key) && !magical.includes(key))]]) {
  const group = document.createElement('section');
  group.className = 'mastery-group';
  group.append(node('h3', title));
  if (keys === magical) {
    const help = node('p', 'Dans ce parcours, un total d’au moins 2 rangs en Magie et Runes ouvre la réserve de mana de départ. Le MJ précise l’accès aux sorts et aux écoles.');
    help.className = 'field-help';
    group.append(help);
  }
  const fields = document.createElement('div');
  fields.className = 'creation-fields';
  group.append(fields);
  for (const key of keys) masteryField(fields, `mastery-${key}`, key);
  $('free-masteries').append(group);
}
for (const level of [1, 5, 10, 15, 20, 25]) {
  const row = document.createElement('tr');
  row.append(...[level, 12, developmentBudget(level)].map(value => node('td', value)));
  $('creation-level-budgets').append(row);
}
$('roll-stat').append(...stats.map(([key, label]) => new Option(label, key)));

function freeBuild() {
  const values = prefix => Object.fromEntries(stats.map(([key]) => [key, $(`${prefix}-${key}`).valueAsNumber]));
  const masteries = Object.fromEntries([...$('new-player-free').querySelectorAll('[data-mastery]')]
    .map(control => [control.dataset.mastery, control.valueAsNumber]));
  return buildFreePJ({ level: $('new-player-level').valueAsNumber, startingStats: values('base'), stats: values('final'), masteries });
}

function updateCreationPreview() {
  if ($('new-player-mode').value === 'guided') {
    try {
      const sheet = createGuidedPJ({ id: 'pj-apercu', name: $('new-player-name').value.trim() || 'Votre personnage',
        choices: ORIGIN_STEPS.map(step => $(`origin-${step.id}`).value),
        education: $('origin-education').value, literacy: $('origin-literacy').value, backstory: '', connections: '', goal: '' });
      $('guided-preview').textContent = `Niveau ${sheet.level} · ${stats.map(([key, label]) => `${label} ${sheet.stats[key]}`).join(' · ')} · ${sheet.pvMax} PV · ${sheet.manaMax} mana.`;
    } catch { $('guided-preview').textContent = 'Complète les choix pour découvrir les valeurs de ton personnage.'; }
    return;
  }
  const total = stats.reduce((sum, [key]) => sum + ($(`base-${key}`).valueAsNumber || 0), 0);
  $('creation-base-count').textContent = `${total} / 12`;
  $('creation-base-count').toggleAttribute('data-invalid', total !== 12);
  try {
    const budget = evaluatePJ(freeBuild());
    $('creation-spent-count').textContent = `${budget.spent} / ${budget.budget}`;
    $('creation-remaining-count').textContent = budget.remaining;
    $('creation-remaining-count').toggleAttribute('data-invalid', budget.remaining < 0);
    $('creation-budget-help').textContent = `Niveau ${$('new-player-level').value} · ${budget.budget} points de développement en plus des 12 points de départ.`;
    $('creation-budget-issues').textContent = budget.issues.join(' ');
  } catch (error) {
    $('creation-spent-count').textContent = 'À vérifier';
    $('creation-remaining-count').textContent = '—';
    $('creation-budget-issues').textContent = error.message;
  }
  for (const [key] of stats) {
    try {
      const current = $(`final-${key}`).valueAsNumber;
      $(`stat-cost-${key}`).textContent = `Développement · ${statCost($(`base-${key}`).valueAsNumber, current)} pts. Bonus +${effectiveStat(current)}. Prochain point · ${statCost(current, current + 1)} pts.`;
    } catch { $(`stat-cost-${key}`).textContent = 'Le score au niveau choisi doit être au moins égal au score de départ.'; }
  }
  for (const control of $('new-player-free').querySelectorAll('[data-mastery]')) {
    try {
      const rank = control.valueAsNumber;
      $(`cost-${control.id}`).textContent = `Dépense · ${masteryCost(0, rank)} pts. Bonus +${effectiveMastery(rank)}. Prochain rang · ${masteryCost(rank, rank + 1)} pts.`;
    } catch { $(`cost-${control.id}`).textContent = 'Saisis un rang entier positif ou zéro.'; }
  }
}

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
  updateCreationPreview();
}

$('player-create').addEventListener('click', () => {
  if (pending || !leaveNotes()) return;
  $('player-create-form').reset();
  creationPortrait.reset();
  $('custom-masteries').replaceChildren();
  $('custom-mastery-message').textContent = '';
  for (const step of ORIGIN_STEPS) $(`origin-${step.id}-help`).textContent = step.question;
  updateMode();
  $('player-create-dialog').showModal();
});
$('new-player-mode').addEventListener('change', updateMode);
$('player-create-form').addEventListener('input', () => { resetCreationReview(); updateCreationPreview(); });
$('add-custom-mastery').addEventListener('click', () => {
  const name = $('custom-mastery-name').value.trim();
  const normalize = value => value.normalize('NFKD').replace(/\p{M}/gu, '').toLocaleLowerCase('fr');
  const controls = [...$('new-player-free').querySelectorAll('[data-mastery]')];
  if (!name || ['__proto__', 'constructor', 'prototype'].includes(name) ||
      controls.some(control => normalize(masteryName(control.dataset.mastery)) === normalize(name)) ||
      $('custom-masteries').childElementCount >= 12) {
    $('custom-mastery-message').textContent = 'Choisis un nom distinct et jusqu’à douze domaines personnalisés.';
    return;
  }
  const control = masteryField($('custom-masteries'), `mastery-custom-${crypto.randomUUID()}`, name);
  const remove = node('button', 'Retirer');
  remove.type = 'button';
  remove.className = 'secondary';
  remove.setAttribute('aria-label', `Retirer le domaine ${name}`);
  remove.addEventListener('click', () => { control.parentElement.remove(); resetCreationReview(); updateCreationPreview(); });
  control.parentElement.append(remove);
  $('custom-mastery-name').value = '';
  $('custom-mastery-message').textContent = 'Domaine proposé à la table. Son rang utilise le budget commun.';
  resetCreationReview();
  updateCreationPreview();
  control.focus();
});
$('player-create-form').addEventListener('submit', event => {
  event.preventDefault();
  if (pending) return;
  const fields = new FormData(event.currentTarget);
  const identity = { id: `pj-${crypto.randomUUID()}`, name: fields.get('name').trim(),
    backstory: fields.get('backstory').trim(), connections: fields.get('connections').trim(), goal: fields.get('goal').trim() };
  try {
    if (creationPortrait.loading) throw new Error('Le portrait est en cours de préparation.');
    if ($('new-player-mode').value === 'guided') {
      reviewed = createGuidedPJ({ ...identity, choices: ORIGIN_STEPS.map(step => fields.get(`origin-${step.id}`)),
        education: fields.get('origin-education'), literacy: fields.get('origin-literacy') });
    } else {
      reviewed = createFreePJ(freeBuild(), { ...identity, profession: '' }).source;
    }
    reviewed.portrait = creationPortrait.value;
    reviewed.mentor = fields.get('mentor').trim();
    reviewed.training = fields.get('training').trim();
    checkPlayerSheet(reviewed);
    const budget = evaluatePJ(reviewed);
    $('player-create-result').textContent = `${reviewed.name} · niveau ${reviewed.level} · ${reviewed.pvMax} PV · ${reviewed.manaMax} mana. Fiche M02 vérifiée. Développement ${budget.spent} / ${budget.budget} points, ${budget.remaining} disponibles. Présente cette fiche au MJ avant la partie.`;
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
$('player-portrait').addEventListener('error', () => {
  $('player-portrait').hidden = true;
  $('player-portrait-placeholder').hidden = false;
  $('player-portrait-message').textContent = 'Le portrait par lien est indisponible. Tu peux choisir une image depuis ton appareil.';
  $('player-portrait-message').hidden = false;
});
$('player-edit-portrait').addEventListener('click', () => {
  if (pending) return;
  sheetPortrait.reset(active.sheet.portrait);
  $('player-portrait-dialog').querySelector('[data-save-message]').textContent = '';
  $('player-portrait-dialog').showModal();
});
$('player-portrait-form').addEventListener('submit', event => {
  event.preventDefault();
  if (sheetPortrait.loading) return;
  void save({ ...active, sheet: { ...active.sheet, portrait: sheetPortrait.value } }, $('player-portrait-dialog'));
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

function showRoll(dice, text) {
  $('player-dice').replaceChildren(...dice.map(value => {
    const face = node('span', value);
    face.className = 'die';
    return face;
  }));
  $('player-roll-result').textContent = text;
}

$('player-free-roll').addEventListener('click', () => {
  const dice = studioDice();
  showRoll(dice, `Jet libre · ${dice.join(' + ')} = ${dice.reduce((sum, die) => sum + die, 0)}`);
});
$('player-roll-form').addEventListener('submit', event => {
  event.preventDefault();
  const stat = $('roll-stat').value;
  const dice = studioDice();
  const result = resolvePlayAction({ mode: 'roll', roll: { dice, stat, rawStat: active.sheet.stats[stat],
    masteryRank: active.sheet.masteries[$('roll-mastery').value] ?? 0, threshold: $('roll-threshold').valueAsNumber, situation: 0, source: 'studio' } });
  showRoll(dice, `${result.title} · ${dice.join(' + ')} · ${result.balance} · ${result.bonuses}`);
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
  if (new URLSearchParams(location.search).get('creer') === '1') {
    $('player-create').click();
    const url = new URL(location.href);
    url.searchParams.delete('creer');
    history.replaceState(null, '', url);
  }
} catch (error) {
  $('player-save-status').textContent = 'Stockage inaccessible';
  report(error);
}

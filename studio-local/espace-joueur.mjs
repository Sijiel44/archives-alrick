import { PLAY_STATS, validImageUrl } from './store.mjs';
import { buildFreePJ, createFreePJ, createGuidedPJ, EDUCATION_PATHS, FREE_PJ_MASTERIES, LITERACY_LEVELS,
  MAX_PJ_FILE_BYTES, ORIGIN_STEPS, developmentBudget, effectiveMastery, effectiveStat, evaluatePJ, masteryCost, statCost } from './pj-m02.mjs';
import { resolvePlayAction, studioDice } from './protocole.mjs';
import { checkPlayerSheet, openPlayerStore, playerBackup, playerExchange, PLAYER_ROLL_LIMIT, readPlayerFile } from './espace-joueur-store.mjs';
import { readPortrait, validPortrait } from './portraits.mjs';
import { EXCHANGE_KEY, compareExchange, makeExchange, receivedSheet, renderExchangePreview } from './echanges-pj.mjs';
import { PLAYER_GRIMOIRE_LIMIT, PLAYER_MAGIC_DOMAINS, PLAYER_MAGIC_REFERENCES, PLAYER_SPELLS,
  grimoireRows, grimoireSearchText, playerSpell } from './grimoire-joueur.mjs';
import { creationDraftController } from './creation-brouillon.mjs';
import { checkCreationDraft } from './brouillons-pj.mjs';

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
const itemCategories = { monnaie: 'Monnaie', arme: 'Arme', armure: 'Armure', artefact: 'Artefact',
  consommable: 'Consommable', ingredient: 'Ingrédient', outil: 'Outil', munition: 'Munition',
  livre: 'Livre', bijou: 'Bijou', provision: 'Provision', materiau: 'Matériau', quete: 'Objet de quête', autre: 'Autre' };
const notes = $('personal-notes');
const tabs = [...document.querySelectorAll('.sheet-nav [role="tab"]')];
let selectedPanel = tabs.find(tab => tab.hash === location.hash)?.getAttribute('aria-controls') ?? 'player-stats';
let store;
let records = [];
let active;
let pending = false;
let reviewed;
let imports = [];
let fileRequest = 0;
let latestRoll;
let itemEdit;
let inventoryLimit = 30;
let incomingExchange;
let comparedRecord;
let comparisonRequest = 0;
let importReady = false;
let grimoireEdit;
let grimoireLimit = 12;
let creationDraft;
let creationId;
let creating = false;

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

const creationPortrait = portraitEditor($('creation-portrait'), 'creation', () => { resetCreationReview(); creationDraft?.changed(); });
const sheetPortrait = portraitEditor($('sheet-portrait'), 'sheet');

function inventory(sheet) {
  return Array.isArray(sheet.inventory) ? sheet.inventory : [];
}

const searchText = value => String(value ?? '').normalize('NFD').replace(/\p{M}/gu, '').toLocaleLowerCase('fr');
const categoryName = key => typeof key === 'string' && Object.hasOwn(itemCategories, key) ? itemCategories[key] : 'Autre';

function selectPanel(id, focus = false) {
  if (!tabs.some(tab => tab.getAttribute('aria-controls') === id)) return;
  selectedPanel = id;
  for (const tab of tabs) {
    const selected = tab.getAttribute('aria-controls') === id;
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
    $(tab.getAttribute('aria-controls')).hidden = !selected;
    if (selected && focus) {
      tab.focus();
      tab.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }
  }
}
for (const tab of tabs) {
  tab.addEventListener('click', event => {
    event.preventDefault();
    selectPanel(tab.getAttribute('aria-controls'));
    history.replaceState(null, '', tab.hash);
  });
  tab.addEventListener('keydown', event => {
    const current = tabs.indexOf(tab);
    const target = { ArrowRight: (current + 1) % tabs.length, ArrowLeft: (current + tabs.length - 1) % tabs.length,
      Home: 0, End: tabs.length - 1 }[event.key];
    if (target === undefined) return;
    event.preventDefault();
    selectPanel(tabs[target].getAttribute('aria-controls'), true);
    history.replaceState(null, '', tabs[target].hash);
  });
}
function followPanelLink() {
  const id = location.hash.slice(1);
  if (!tabs.some(tab => tab.getAttribute('aria-controls') === id)) return;
  selectPanel(id);
  if (active) {
    $(id).focus({ preventScroll: true });
    $(id).scrollIntoView({ block: 'start' });
  }
}
window.addEventListener('hashchange', followPanelLink);

function renderInventory() {
  if (!active) return;
  const items = inventory(active.sheet);
  const query = searchText($('player-item-search').value);
  const equippedOnly = $('player-item-filter').value === 'equipped';
  const readable = items.map((item, index) => ({ item, index })).filter(({ item }) => typeof item?.name === 'string');
  const matches = readable.filter(({ item }) => (!equippedOnly || item.equipped === true) &&
    searchText([item.name, categoryName(item.category), typeof item.description === 'string' ? item.description : ''].join(' ')).includes(query));
  $('player-item-count').textContent = `${readable.length} objet${readable.length > 1 ? 's' : ''}`;
  const rows = matches.slice(0, inventoryLimit).map(({ item, index }) => {
    const row = document.createElement('li');
    row.className = 'inventory-item';
    const symbol = node('span', categoryName(item.category).slice(0, 2));
    symbol.className = 'item-token';
    symbol.setAttribute('aria-hidden', 'true');
    const copy = document.createElement('div');
    const tag = node('span', `${categoryName(item.category)}${item.equipped === true ? ' · Porté' : ''}`);
    tag.className = 'item-kind';
    const quantity = item.quantity ?? 1;
    const quantityLabel = typeof quantity === 'number' || typeof quantity === 'string' ? quantity : '?';
    copy.append(tag, node('h4', `${item.name || 'Objet sans nom'} × ${quantityLabel}`));
    if (typeof item.description === 'string' && item.description) copy.append(node('p', item.description));
    const button = node('button', 'Détails');
    button.type = 'button';
    button.className = 'secondary';
    button.setAttribute('aria-label', `Modifier ${item.name || 'cet objet'}`);
    button.addEventListener('click', () => editItem(index));
    row.append(symbol, copy, button);
    return row;
  });
  const empty = node('li', readable.length ? 'Aucun objet ne correspond à cette recherche.' : 'Ton inventaire attend les premiers préparatifs.');
  empty.className = 'empty';
  $('player-items').replaceChildren(...(rows.length ? rows : [empty]));
  $('player-items-more').hidden = matches.length <= inventoryLimit;
  const supported = active.sheet.inventory === undefined || Array.isArray(active.sheet.inventory);
  for (const control of $('player-item-form').querySelectorAll('input, select, button')) control.disabled = !supported;
  $('player-item-status').textContent = supported
    ? `Résultats affichés · ${Math.min(inventoryLimit, matches.length)} / ${matches.length}.${items.length > readable.length ? ' Les entrées de format inconnu restent dans la sauvegarde personnelle.' : ''}`
    : 'Cet inventaire utilise un format encore inconnu. Sa sauvegarde personnelle conserve les données d’origine.';
}

function renderAbilities() {
  if (!active) return;
  const query = searchText($('player-ability-search').value);
  const abilities = active.sheet.development.abilities.filter(ability =>
    searchText([ability.name, ability.domain, ability.description, ability.effect, ability.provenance].join(' ')).includes(query));
  $('player-ability-count').textContent = `${abilities.length} capacité${abilities.length > 1 ? 's' : ''} · ouvrir une fiche pour consulter sa source et ses limites.`;
  const rows = abilities.map(ability => {
    const item = document.createElement('details');
    item.className = 'ability-card';
    item.append(node('summary', `${ability.name} · ${ability.status === 'defined' ? ability.domain : 'Emplacement à définir'}`));
    const badge = node('p', `Niveau ${ability.levelRequired} · ${ability.approvedByGM ? 'Validation MJ indiquée' : 'À discuter avec le MJ'}`);
    badge.className = 'field-help';
    item.append(badge);
    for (const key of ['description', 'effect', 'limitations', 'provenance']) {
      if (ability[key]) item.append(node('p', ability[key]));
    }
    return item;
  });
  const empty = node('p', 'Aucune capacité à afficher.');
  empty.className = 'empty';
  $('player-ability-list').replaceChildren(...(rows.length ? rows : [empty]));
}

function syncRollButton() {
  const kept = Boolean(latestRoll && active?.rolls?.some(roll => roll.id === latestRoll.id));
  $('player-keep-roll').disabled = pending || !latestRoll || kept;
  $('player-keep-roll').textContent = kept ? 'Jet consigné' : 'Consigner ce jet';
}

function renderHistory() {
  const rolls = active?.rolls ?? [];
  $('player-roll-count').textContent = `${rolls.length} / ${PLAYER_ROLL_LIMIT}`;
  const rows = rolls.map(roll => {
    const row = document.createElement('li');
    const heading = document.createElement('div');
    heading.className = 'roll-entry-heading';
    const date = node('time', archiveDate.format(new Date(roll.createdAt)));
    date.dateTime = roll.createdAt;
    heading.append(node('strong', roll.label), date);
    row.append(heading, node('p', roll.summary));
    return row;
  });
  const empty = node('li', 'Après un lancer, choisis « Consigner ce jet » pour le retrouver ici.');
  empty.className = 'empty';
  $('player-roll-history').replaceChildren(...(rows.length ? rows : [empty]));
  syncRollButton();
}

function fillCategories(control, selected = 'autre') {
  control.replaceChildren(...Object.entries(itemCategories).map(([key, label]) => new Option(label, key, key === selected, key === selected)));
  if (typeof selected === 'string' && !Object.hasOwn(itemCategories, selected)) control.append(new Option(selected, selected, true, true));
}
fillCategories($('item-category'));

function editItem(index) {
  if (pending || !active) return;
  const item = inventory(active.sheet)[index];
  if (!item || typeof item.name !== 'string') return;
  itemEdit = { record: active, index };
  $('player-item-dialog-title').textContent = item.name || 'Détails de l’objet';
  $('edit-item-name').value = item.name;
  $('edit-item-quantity').value = typeof item.quantity === 'number' || typeof item.quantity === 'string' ? item.quantity : 1;
  $('edit-item-description').value = typeof item.description === 'string' ? item.description : '';
  $('edit-item-equipped').checked = item.equipped === true;
  fillCategories($('edit-item-category'), typeof item.category === 'string' ? item.category : 'autre');
  $('player-item-dialog').querySelector('[data-save-message]').textContent = '';
  $('player-item-dialog').showModal();
}

function itemFromForm(form, previous) {
  const values = new FormData(form);
  const name = values.get('name').trim();
  const quantity = Number(values.get('quantity'));
  if (!name || name.length > 90 || !Number.isInteger(quantity) || quantity < 1 || quantity > 999) {
    throw new Error('Renseigne un nom et une quantité entière entre 1 et 999.');
  }
  return { ...previous, name, quantity, description: values.get('description').trim(),
    category: values.get('category'), equipped: values.has('equipped') };
}

function render(record) {
  const previous = active;
  const changed = active?.id !== record?.id;
  active = record;
  $('player-library').hidden = records.length === 0;
  $('player-selection').replaceChildren(...records.map(entry => {
    const revision = entry.sheet[EXCHANGE_KEY]?.revision;
    const version = typeof revision === 'string' ? ` · version ${revision.slice(0, 8)}` : '';
    return new Option(`${entry.sheet.name} · niveau ${entry.sheet.level}${version}`, entry.id);
  }));
  $('player-selection').value = active?.id ?? '';
  $('player-selection').disabled = records.length === 0;
  $('player-sheet').hidden = !active;
  $('player-welcome').hidden = Boolean(active);
  document.body.classList.toggle('has-character', Boolean(active));
  if (!active) return;
  selectPanel(selectedPanel);
  if (changed) {
    latestRoll = undefined;
    inventoryLimit = 30;
    $('player-item-search').value = $('player-ability-search').value = '';
    $('player-item-filter').value = 'all';
    $('grimoire-search').value = $('grimoire-domain').value = $('grimoire-circle').value = '';
    $('grimoire-scope').value = 'catalogue';
    grimoireLimit = 12;
  }
  const { sheet } = active;
  $('player-portrait-placeholder').textContent = sheet.name.trim().split(/\s+/u).slice(0, 2)
    .map(word => Array.from(word)[0]).join('').toLocaleUpperCase('fr');
  const portrait = validPortrait(sheet.portrait) ? sheet.portrait : '';
  if (changed || ($('player-portrait').getAttribute('src') ?? '') !== portrait) {
    $('player-portrait').hidden = !portrait;
    $('player-portrait-placeholder').hidden = Boolean(portrait);
    $('player-portrait-message').hidden = true;
    if (portrait) $('player-portrait').src = portrait;
    else $('player-portrait').removeAttribute('src');
  }
  $('player-portrait').alt = `Portrait de ${sheet.name}`;
  $('player-name').textContent = sheet.name;
  $('player-resources').textContent = `Niveau ${sheet.level} · PV ${sheet.pv} / ${sheet.pvMax} · Mana ${sheet.mana} / ${sheet.manaMax} · ${sheet.xp} XP`;
  if (changed || previous.sheet.pv !== sheet.pv || previous.sheet.mana !== sheet.mana) {
    $('player-pv').value = sheet.pv;
    $('player-mana').value = sheet.mana;
  }
  $('player-pv').max = sheet.pvMax;
  $('player-mana').max = sheet.manaMax;
  $('player-stat-line').replaceChildren(...stats.map(([key, label]) => {
    const card = document.createElement('div');
    card.append(node('span', label), node('strong', sheet.stats[key]), node('small', `Bonus +${effectiveStat(sheet.stats[key])}`));
    return card;
  }));
  const story = storyFields.filter(([key]) => typeof sheet[key] === 'string' && sheet[key]);
  $('player-story').hidden = story.length === 0;
  $('player-story-fields').replaceChildren(...story.flatMap(([key, label]) => [node('dt', label), node('dd', sheet[key])]));
  const masteries = Object.entries(sheet.masteries).filter(([, rank]) => rank > 0);
  $('player-mastery-line').replaceChildren(...(masteries.length
    ? masteries.map(([key, rank]) => { const chip = node('span', `${masteryName(key)} ${rank}`); chip.className = 'mastery-chip'; return chip; })
    : [node('p', 'Aucune maîtrise renseignée.')]));
  const selectedMastery = changed ? '' : $('roll-mastery').value;
  $('roll-mastery').replaceChildren(new Option('Aucune', ''), ...masteries.map(([key, rank]) => new Option(`${masteryName(key)} · ${rank}`, key)));
  $('roll-mastery').value = masteries.some(([key]) => key === selectedMastery) ? selectedMastery : '';
  renderInventory();
  renderAbilities();
  renderGrimoire();
  renderHistory();
  if (changed) {
    notes.value = active.notes;
    $('player-roll-result').textContent = '';
    $('player-dice').replaceChildren();
  }
}

const spellCircle = entry => entry.details?.find(([label]) => label === 'Cercle indiqué')?.[1] ?? '';

function renderGrimoire() {
  if (!active) return;
  const bookmarks = active.grimoire ?? [];
  const terms = grimoireSearchText($('grimoire-search').value).split(/\s+/u).filter(Boolean);
  const scope = $('grimoire-scope').value;
  const entries = grimoireRows(bookmarks).filter(entry =>
    (scope === 'catalogue' || Boolean(entry.bookmark && (scope !== 'session' || entry.bookmark.session))) &&
    (!$('grimoire-domain').value || entry.domain === $('grimoire-domain').value) &&
    (!$('grimoire-circle').value || spellCircle(entry) === $('grimoire-circle').value) &&
    terms.every(term => grimoireSearchText([entry.id, entry.name, entry.description, entry.domainName, entry.categoryName].join(' ')).includes(term)))
    .sort((a, b) => Number(Boolean(b.bookmark?.session)) - Number(Boolean(a.bookmark?.session)) || a.name.localeCompare(b.name, 'fr'));
  $('grimoire-count').textContent = `${entries.length} référence${entries.length > 1 ? 's' : ''} · ${bookmarks.length} / ${PLAYER_GRIMOIRE_LIMIT} dans mon grimoire · ${bookmarks.filter(entry => entry.session).length} pour ma séance`;
  const symbols = { lumiere: '✧', vent: '≋', eau: '≈', foudre: 'ϟ', terre: '◇', magie: '✦' };
  $('grimoire-list').replaceChildren(...entries.slice(0, grimoireLimit).map(entry => {
    const item = node('li', '');
    item.className = 'grimoire-card';
    const mark = node('span', symbols[entry.domain] ?? '◇');
    mark.className = 'grimoire-symbol';
    mark.setAttribute('aria-hidden', 'true');
    const head = node('div', '');
    const domain = node('p', entry.domainName ?? 'Référence conservée');
    domain.className = 'eyebrow accent';
    head.append(domain, node('h4', entry.name));
    const heading = node('div', '');
    heading.className = 'grimoire-card-heading';
    heading.append(mark, head);
    const meta = node('p', entry.domain ? `${entry.categoryName} · Cercle ${spellCircle(entry)} · Prototype` : 'Absente du catalogue courant');
    meta.className = 'field-help';
    const copy = node('p', entry.description);
    copy.className = 'grimoire-card-copy';
    const bottom = node('div', '');
    bottom.className = 'grimoire-card-actions';
    const status = node('span', entry.bookmark ? entry.bookmark.session ? '✦ Pour ma séance' : 'Dans mon grimoire' : 'À découvrir');
    status.className = 'grimoire-saved';
    const open = node('button', 'Consulter');
    open.type = 'button';
    open.className = 'secondary';
    open.setAttribute('aria-label', `Consulter le sort ${entry.name}`);
    open.addEventListener('click', () => openGrimoireEntry(entry.id));
    bottom.append(status, open);
    item.append(heading, meta, copy, bottom);
    return item;
  }));
  if (!entries.length) {
    const empty = node('li', scope === 'catalogue' ? 'Aucun sort ne correspond à ces filtres.' : 'Aucune référence ici. Consulte le catalogue pour composer ton grimoire, ou ajuste les filtres.');
    empty.className = 'empty';
    $('grimoire-list').append(empty);
  }
  $('grimoire-more').hidden = entries.length <= grimoireLimit;
}

function openGrimoireEntry(id) {
  if (!active || pending) return;
  const entry = playerSpell(id);
  const bookmark = active.grimoire?.find(item => item.id === id);
  if (!entry && !bookmark) return;
  grimoireEdit = { record: active, id };
  const changed = Boolean(entry && bookmark && entry.version !== bookmark.version);
  $('grimoire-detail-title').textContent = entry?.name ?? bookmark.name;
  $('grimoire-detail-status').textContent = entry ? 'Prototype · Démonstration non canonique' : 'Référence absente · Repères conservés';
  $('grimoire-detail-description').textContent = entry?.description ?? 'Le catalogue courant ne contient plus cette référence. Tes notes restent consultables et modifiables.';
  $('grimoire-detail-fields').replaceChildren(...(entry ? [['Domaine / affinité', entry.domainName], ...entry.details] : [['Identifiant conservé', bookmark.id]])
    .flatMap(([label, value]) => [node('dt', label), node('dd', value)]));
  $('grimoire-detail-version').textContent = changed ? `La référence a changé depuis l’ajout de « ${bookmark.name} ». L’aperçu montre le catalogue courant ; tes repères restent conservés.` : '';
  $('grimoire-detail-version').hidden = !changed;
  const link = $('grimoire-detail-source');
  link.hidden = !entry;
  if (entry) link.href = entry.href;
  else link.removeAttribute('href');
  $('grimoire-update-reference').hidden = !changed;
  $('grimoire-adopt-version').checked = false;
  $('grimoire-session').checked = bookmark?.session ?? false;
  $('grimoire-notes').value = bookmark?.notes ?? '';
  $('grimoire-remove').hidden = !bookmark;
  const full = !bookmark && (active.grimoire?.length ?? 0) >= PLAYER_GRIMOIRE_LIMIT;
  $('grimoire-save').disabled = full;
  $('grimoire-save').textContent = bookmark ? 'Enregistrer mes repères' : 'Ajouter à mon grimoire';
  $('grimoire-form').querySelector('[data-save-message]').textContent = full ? 'Le grimoire contient déjà 80 références. Retire un repère avant d’en ajouter un autre.' : '';
  $('grimoire-dialog').showModal();
}

for (const [id, label] of PLAYER_MAGIC_DOMAINS) $('grimoire-domain').append(new Option(label, id));
for (const circle of [...new Set(PLAYER_SPELLS.map(spellCircle))].sort((a, b) => Number(a) - Number(b))) {
  $('grimoire-circle').append(new Option(`Cercle ${circle}`, circle));
}
for (const entry of PLAYER_MAGIC_REFERENCES) {
  const link = node('a', entry.name);
  link.href = entry.href;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  const row = node('li', '');
  row.append(link, node('p', entry.description));
  $('grimoire-references').append(row);
}
for (const id of ['grimoire-search', 'grimoire-domain', 'grimoire-circle', 'grimoire-scope']) $(id).addEventListener('input', () => {
  grimoireLimit = 12;
  renderGrimoire();
});
$('grimoire-more').addEventListener('click', () => { grimoireLimit += 12; renderGrimoire(); });
$('grimoire-form').addEventListener('submit', async event => {
  event.preventDefault();
  if (pending || !grimoireEdit) return;
  const { record, id } = grimoireEdit;
  const entry = playerSpell(id);
  const previous = record.grimoire?.find(item => item.id === id);
  if (!previous && !entry) return;
  const reference = entry && (!previous || $('grimoire-adopt-version').checked) ? { id, name: entry.name, version: entry.version } : previous;
  const next = { ...previous, ...reference, notes: $('grimoire-notes').value, session: $('grimoire-session').checked };
  const grimoire = [...(record.grimoire ?? []).filter(item => item.id !== id), next];
  $('grimoire-edit-fields').disabled = true;
  try { await save({ ...record, grimoire }, $('grimoire-dialog'), $('player-grimoire-title')); }
  finally { $('grimoire-edit-fields').disabled = false; }
});
$('grimoire-remove').addEventListener('click', async () => {
  if (pending || !grimoireEdit || !window.confirm('Retirer cette référence et ses notes de ton grimoire ?')) return;
  const { record, id } = grimoireEdit;
  $('grimoire-edit-fields').disabled = true;
  try { await save({ ...record, grimoire: record.grimoire.filter(item => item.id !== id) }, $('grimoire-dialog'), $('player-grimoire-title')); }
  finally { $('grimoire-edit-fields').disabled = false; }
});

function report(error, target = $('player-error')) {
  target.textContent = error.message;
  target.hidden = false;
}

async function save(record, dialog, focusTarget = $('player-name'), compared, fromDraft) {
  if (pending) return false;
  pending = true;
  syncRollButton();
  $('player-error').hidden = true;
  $('player-save-status').textContent = 'Enregistrement…';
  try {
    const saved = await store.save(record, compared, fromDraft);
    records = [saved, ...records.filter(entry => entry.id !== saved.id)];
    render(saved);
    $('player-save-status').textContent = 'Sauvegarde locale confirmée';
    if (dialog) {
      dialog.close();
      focusTarget.focus();
    }
    return true;
  } catch (error) {
    $('player-save-status').textContent = 'Enregistrement interrompu';
    report(error, dialog?.querySelector('[data-save-message]') ?? $('player-error'));
    return false;
  } finally { pending = false; syncRollButton(); }
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

function resetCreationForm() {
  creationId = `pj-${crypto.randomUUID()}`;
  $('player-create-form').reset();
  creationPortrait.reset();
  $('custom-masteries').replaceChildren();
  for (const detail of $('player-create-form').querySelectorAll('details')) detail.open = false;
  $('custom-mastery-message').textContent = '';
  for (const step of ORIGIN_STEPS) $(`origin-${step.id}-help`).textContent = step.question;
  updateMode();
}
const draftControls = () => [...$('player-create-form').querySelectorAll('input[id], select[id], textarea[id]')]
  .filter(control => control.type !== 'file' && !control.closest('#custom-masteries'));
function captureCreation() {
  return { id: creationId, fields: Object.fromEntries(draftControls().map(control => [control.id, control.value])),
    customMasteries: [...$('custom-masteries').querySelectorAll('[data-mastery]')].map(control => ({ name: control.dataset.mastery, rank: control.value })),
    portrait: creationPortrait.value, expanded: [...$('player-create-form').querySelectorAll('details')].flatMap((detail, index) => detail.open ? [index] : []) };
}
function validateCreationSnapshot(snapshot) {
  checkCreationDraft(snapshot);
  const controls = draftControls();
  if (Object.keys(snapshot.fields).length !== controls.length || controls.some(control => {
    const value = snapshot.fields[control.id];
    return typeof value !== 'string' || (control.maxLength >= 0 && value.length > control.maxLength) ||
      (control.tagName === 'SELECT' && ![...control.options].some(option => option.value === value)) ||
      (control.type === 'number' && value !== '' && !Number.isFinite(Number(value)));
  }) || snapshot.expanded.some(index => index >= $('player-create-form').querySelectorAll('details').length)) {
    throw new Error('Ce brouillon contient des champs ou choix que cette version ne peut pas reprendre. Le brouillon local est conservé.');
  }
  const names = new Set([...$('free-masteries').querySelectorAll('[data-mastery]')].map(control => normalizedMastery(masteryName(control.dataset.mastery))));
  for (const entry of snapshot.customMasteries) {
    if (entry.name !== entry.name.trim() || ['__proto__', 'constructor', 'prototype'].includes(entry.name) ||
        names.has(normalizedMastery(entry.name)) || (entry.rank !== '' && !Number.isFinite(Number(entry.rank)))) {
      throw new Error('Un domaine personnalisé de ce brouillon ne peut pas être repris sans modification.');
    }
    names.add(normalizedMastery(entry.name));
  }
}
function restoreCreation(snapshot) {
  validateCreationSnapshot(snapshot);
  resetCreationForm();
  creationId = snapshot.id;
  for (const entry of snapshot.customMasteries) addCustomMastery(entry.name, entry.rank, false);
  creationPortrait.reset(snapshot.portrait);
  for (const control of draftControls()) control.value = snapshot.fields[control.id];
  for (const [index, detail] of [...$('player-create-form').querySelectorAll('details')].entries()) detail.open = snapshot.expanded.includes(index);
  for (const step of ORIGIN_STEPS) $(`origin-${step.id}-help`).textContent = step.options.find(option => option.id === $(`origin-${step.id}`).value)?.description ?? step.question;
  updateMode();
}
$('player-create').addEventListener('click', async () => {
  if (pending || creating || !creationDraft) return;
  try { await creationDraft.open(); } catch (error) { report(error); }
});
$('new-player-mode').addEventListener('change', updateMode);
$('player-create-form').addEventListener('input', () => { resetCreationReview(); updateCreationPreview(); });
const normalizedMastery = value => value.normalize('NFKD').replace(/\p{M}/gu, '').toLocaleLowerCase('fr');
function addCustomMastery(name, rank = '0', focus = true) {
  const controls = [...$('new-player-free').querySelectorAll('[data-mastery]')];
  if (!name || ['__proto__', 'constructor', 'prototype'].includes(name) ||
      controls.some(control => normalizedMastery(masteryName(control.dataset.mastery)) === normalizedMastery(name)) ||
      $('custom-masteries').childElementCount >= 12) {
    $('custom-mastery-message').textContent = 'Choisis un nom distinct et jusqu’à douze domaines personnalisés.';
    return;
  }
  const control = masteryField($('custom-masteries'), `mastery-custom-${crypto.randomUUID()}`, name);
  control.value = rank;
  const remove = node('button', 'Retirer');
  remove.type = 'button';
  remove.className = 'secondary';
  remove.setAttribute('aria-label', `Retirer le domaine ${name}`);
  remove.addEventListener('click', () => { control.parentElement.remove(); resetCreationReview(); updateCreationPreview(); creationDraft?.changed(); });
  control.parentElement.append(remove);
  $('custom-mastery-name').value = '';
  $('custom-mastery-message').textContent = 'Domaine proposé à la table. Son rang utilise le budget commun.';
  resetCreationReview();
  updateCreationPreview();
  if (focus) control.focus();
  creationDraft?.changed();
}
$('add-custom-mastery').addEventListener('click', () => addCustomMastery($('custom-mastery-name').value.trim()));
$('player-create-form').addEventListener('submit', event => {
  event.preventDefault();
  if (pending) return;
  const fields = new FormData(event.currentTarget);
  const identity = { id: creationId, name: fields.get('name').trim(),
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
$('confirm-player-create').addEventListener('click', async () => {
  if (!reviewed || creating || pending || !creationDraft) return;
  const approved = reviewed;
  creating = true;
  $('player-create-form').inert = true;
  try {
    const fromDraft = await creationDraft.prepareCreation();
    if (reviewed !== approved) throw new Error('La création a changé. Vérifie de nouveau la fiche.');
    if (await save({ id: creationId, sheet: approved, notes: '' }, $('player-create-dialog'), $('player-name'), undefined, fromDraft)) creationDraft.consumed();
  } catch (error) { report(error, $('player-create-result')); }
  finally { creating = false; $('player-create-form').inert = false; }
});

$('player-import').addEventListener('click', () => {
  if (pending || !leaveNotes()) return;
  fileRequest++;
  comparisonRequest++;
  incomingExchange = comparedRecord = undefined;
  importReady = false;
  $('player-exchange-review').hidden = true;
  $('player-exchange-accept').checked = $('player-exchange-accept').required = false;
  $('confirm-player-import').textContent = 'Importer une nouvelle copie';
  $('player-import-form').reset();
  $('player-import-file-choice').open = true;
  $('player-import-choice').replaceChildren();
  $('player-import-choice').disabled = $('confirm-player-import').disabled = true;
  $('player-import-preview').textContent = 'Choisis un fichier pour voir son contenu.';
  $('player-import-dialog').showModal();
});
$('player-file').addEventListener('change', async event => {
  const id = ++fileRequest;
  const file = event.target.files[0];
  $('player-import-file-choice').open = true;
  $('confirm-player-import').disabled = $('player-import-choice').disabled = true;
  $('player-import-choice').replaceChildren();
  imports = [];
  comparisonRequest++;
  incomingExchange = comparedRecord = undefined;
  importReady = false;
  $('player-exchange-review').hidden = true;
  $('player-exchange-accept').checked = $('player-exchange-accept').required = false;
  $('confirm-player-import').textContent = 'Importer une nouvelle copie';
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
    if (archive.exchange) {
      incomingExchange = archive.exchange;
      const matches = records.filter(record => record.sheet.id === incomingExchange.sheet.id);
      $('player-compare-choice').replaceChildren(new Option('Créer une fiche indépendante', ''), ...matches.map(record =>
        new Option(`${record.sheet.name} · ${archiveDate.format(record.updatedAt)} · copie ${record.id.slice(0, 8)}`, record.id)));
      $('player-compare-choice').value = matches.some(record => record.id === active?.id) ? active.id : matches[0]?.id ?? '';
      $('player-exchange-review').hidden = false;
      $('player-import-file-choice').open = false;
      $('player-import-preview').textContent = `${incomingExchange.sheet.name} · niveau ${incomingExchange.sheet.level} · échange joueur / MJ v1`;
      $('player-exchange-accept').required = true;
      $('confirm-player-import').textContent = 'Adopter dans une nouvelle copie';
      await reviewIncomingExchange();
    }
  } catch (error) {
    if (id === fileRequest) report(error instanceof SyntaxError ? new Error('Le fichier doit contenir du JSON valide.') : error, $('player-import-preview'));
  }
});
async function reviewIncomingExchange() {
  const request = ++comparisonRequest;
  const exchange = incomingExchange;
  if (!exchange) return;
  importReady = false;
  comparedRecord = undefined;
  $('confirm-player-import').disabled = true;
  $('player-exchange-accept').checked = false;
  $('player-compare-preview').textContent = 'Comparaison…';
  try {
    const record = records.find(item => item.id === $('player-compare-choice').value);
    const comparison = record ? await compareExchange(record.sheet, exchange) : undefined;
    if (request !== comparisonRequest || exchange !== incomingExchange) return;
    renderExchangePreview($('player-compare-preview'), exchange, comparison);
    comparedRecord = record;
    importReady = !comparison?.identical;
  } catch (error) {
    if (request === comparisonRequest) report(error, $('player-compare-preview'));
  }
}
$('player-compare-choice').addEventListener('change', reviewIncomingExchange);
$('player-exchange-accept').addEventListener('change', () => {
  $('confirm-player-import').disabled = !importReady || !$('player-exchange-accept').checked;
});
$('player-import-form').addEventListener('submit', event => {
  event.preventDefault();
  const record = imports[$('player-import-choice').value];
  if (!record) return;
  if (incomingExchange) {
    if (!importReady || !$('player-exchange-accept').checked) return;
    const next = { sheet: receivedSheet(incomingExchange, comparedRecord?.sheet), notes: comparedRecord?.notes ?? '', rolls: comparedRecord?.rolls ?? [],
      grimoire: comparedRecord?.grimoire ?? [] };
    void save(next, $('player-import-dialog'), $('player-name'), comparedRecord);
  } else void save(record, $('player-import-dialog'));
});

for (const button of document.querySelectorAll('[data-close]')) button.addEventListener('click', () => {
  if (pending || creating) return;
  if (button.closest('dialog').id === 'player-create-dialog') void creationDraft?.close();
  else button.closest('dialog').close();
});
for (const dialog of document.querySelectorAll('dialog')) dialog.addEventListener('cancel', event => {
  if (pending || creating || dialog.id === 'player-create-dialog') event.preventDefault();
  if (!pending && !creating && dialog.id === 'player-create-dialog') void creationDraft?.close();
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
$('player-notes-form').addEventListener('submit', event => {
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
  try {
    const item = itemFromForm(form, { id: crypto.randomUUID(), templateId: '', value: '' });
    if (await save({ ...active, sheet: { ...active.sheet, inventory: [item, ...inventory(active.sheet)] } })) {
      form.reset();
      inventoryLimit = 30;
      $('player-item-search').value = '';
      $('player-item-filter').value = 'all';
      renderInventory();
    }
  } catch (error) { report(error); }
});

for (const control of [$('player-item-search'), $('player-item-filter')]) control.addEventListener('input', () => {
  inventoryLimit = 30;
  renderInventory();
});
$('player-items-more').addEventListener('click', () => { inventoryLimit += 30; renderInventory(); });
$('player-ability-search').addEventListener('input', renderAbilities);

$('player-item-edit-form').addEventListener('submit', async event => {
  event.preventDefault();
  if (pending || !itemEdit) return;
  try {
    const { record, index } = itemEdit;
    const items = [...inventory(record.sheet)];
    items[index] = itemFromForm(event.currentTarget, items[index]);
    await save({ ...record, sheet: { ...record.sheet, inventory: items } }, $('player-item-dialog'), $('player-inventory-title'));
  } catch (error) { report(error, $('player-item-dialog').querySelector('[data-save-message]')); }
});
$('player-remove-item').addEventListener('click', async () => {
  if (pending || !itemEdit || !window.confirm('Retirer cet objet de l’inventaire ?')) return;
  const { record, index } = itemEdit;
  const items = inventory(record.sheet).filter((_, position) => position !== index);
  await save({ ...record, sheet: { ...record.sheet, inventory: items } }, $('player-item-dialog'), $('player-inventory-title'));
});

function showRoll(dice, text, kind, label) {
  latestRoll = { id: crypto.randomUUID(), createdAt: new Date().toISOString(), kind, label, summary: text, dice };
  $('player-dice').replaceChildren(...dice.map(value => {
    const face = node('span', value);
    face.className = 'die';
    return face;
  }));
  $('player-roll-result').textContent = text;
  syncRollButton();
}

$('player-free-roll').addEventListener('click', () => {
  if (pending) return;
  const dice = studioDice();
  showRoll(dice, `Jet libre · ${dice.join(' + ')} = ${dice.reduce((sum, die) => sum + die, 0)}`, 'free', 'Jet libre 5d6');
});
$('player-roll-form').addEventListener('submit', event => {
  event.preventDefault();
  if (pending) return;
  const stat = $('roll-stat').value;
  const dice = studioDice();
  const result = resolvePlayAction({ mode: 'roll', roll: { dice, stat, rawStat: active.sheet.stats[stat],
    masteryRank: active.sheet.masteries[$('roll-mastery').value] ?? 0, threshold: $('roll-threshold').valueAsNumber, situation: 0, source: 'studio' } });
  showRoll(dice, `${result.title} · ${dice.join(' + ')} · ${result.balance} · ${result.bonuses}`, 'action', $('roll-intent').value.trim() || 'Action 5d6');
});
$('player-keep-roll').addEventListener('click', async () => {
  if (pending || !latestRoll || active.rolls.some(roll => roll.id === latestRoll.id)) return;
  await save({ ...active, rolls: [latestRoll, ...active.rolls].slice(0, PLAYER_ROLL_LIMIT) });
});

function download(content, name) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(content)], { type: 'application/json' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  $('player-download-status').textContent = 'Fichier proposé au téléchargement. Choisis où le conserver dans ton navigateur.';
}

$('player-backup').addEventListener('click', async () => {
  try { download(await playerBackup({ ...active, notes: notes.value }), 'personnage-sauvegarde.json'); }
  catch (error) { report(error); }
});
$('player-exchange').addEventListener('click', () => download(playerExchange(active.sheet), 'personnage-pour-le-mj.m02.json'));
$('player-send').addEventListener('click', async () => {
  try { download(await makeExchange(active.sheet, 'joueur'), 'personnage-echange-table.json'); }
  catch (error) { report(error); }
});

try {
  store = await openPlayerStore();
  records = await store.list();
  render(records[0]);
  try {
    creationDraft = await creationDraftController({ store, capture: captureCreation, restore: restoreCreation, reset: resetCreationForm,
      validate: validateCreationSnapshot, isLoading: () => creationPortrait.loading, download, canOpen: () => !pending && !creating && leaveNotes() });
  } catch (error) { report(error); }
  $('player-create').disabled = !creationDraft;
  $('player-import').disabled = false;
  $('player-save-status').textContent = 'Stockage joueur prêt';
  if (new URLSearchParams(location.search).get('creer') === '1') {
    $('player-create').click();
    const url = new URL(location.href);
    url.searchParams.delete('creer');
    history.replaceState(null, '', url);
  } else followPanelLink();
} catch (error) {
  $('player-save-status').textContent = 'Stockage inaccessible';
  report(error);
}

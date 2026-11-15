import { checkJSON } from './store.mjs';
import { validPortrait } from './portraits.mjs';
import { EXCHANGE_KEY } from './echanges-pj.mjs';

export const isPlayerArchived = record => Boolean(record?.filing?.archivedAt);
export function checkPlayerFiling(filing) {
  checkJSON(filing);
  if (!filing || typeof filing !== 'object' || Array.isArray(filing) ||
      (filing.archivedAt !== null && (typeof filing.archivedAt !== 'string' ||
        !Number.isFinite(Date.parse(filing.archivedAt)) || new Date(filing.archivedAt).toISOString() !== filing.archivedAt))) {
    throw new Error('Le rangement personnel de cette fiche est incomplet ou invalide.');
  }
  return filing;
}
const identity = record => typeof record.sheet?.id === 'string' ? record.sheet.id : record.id;
const normalized = value => String(value ?? '').normalize('NFKD').replace(/\p{M}/gu, '').toLocaleLowerCase('fr');
const date = new Intl.DateTimeFormat('fr', { dateStyle: 'medium', timeStyle: 'short' });
const node = (tag, text = '', className) => { const el = document.createElement(tag); el.textContent = text; if (className) el.className = className; return el; };

export function createPlayerDirectory({ getRecords, getActive, select, refresh }) {
  const $ = id => document.getElementById(id);
  let limit = 20, group, returnFocus, loading = false;
  const dialog = $('player-directory-dialog');
  function entries() {
    const terms = normalized($('player-directory-query').value).split(/\s+/u).filter(Boolean);
    const records = getRecords();
    const counts = new Map();
    for (const record of records) counts.set(identity(record), (counts.get(identity(record)) ?? 0) + 1);
    return records.filter(record => (!group || identity(record) === group.id) &&
      ($('player-directory-state').value === 'all' || isPlayerArchived(record) === ($('player-directory-state').value === 'archived')) &&
      (!$('player-directory-copies').checked || counts.get(identity(record)) > 1) &&
      terms.every(term => normalized([record.sheet.name, record.sheet.profession, record.sheet.level].join(' ')).includes(term)))
      .map(record => ({ record, copies: counts.get(identity(record)) })).sort((a, b) => {
        const sort = $('player-directory-sort').value;
        return (sort === 'level' ? b.record.sheet.level - a.record.sheet.level : sort === 'recent' ? b.record.updatedAt - a.record.updatedAt : 0) ||
          a.record.sheet.name.localeCompare(b.record.sheet.name, 'fr', { sensitivity: 'base', numeric: true }) || a.record.id.localeCompare(b.record.id);
      });
  }
  async function choose(id) {
    if (loading || !(await select(id))) return;
    returnFocus = $('player-name');
    dialog.close();
  }
  function render() {
    const matches = entries();
    const records = getRecords();
    const archivedCount = records.filter(isPlayerArchived).length;
    $('player-directory-count').textContent = `${matches.length} fiche${matches.length !== 1 ? 's' : ''} · ${Math.min(limit, matches.length)} affichée${Math.min(limit, matches.length) !== 1 ? 's' : ''} · ${archivedCount} archive${archivedCount !== 1 ? 's' : ''}`;
    $('player-directory-group').textContent = group ? `Copies de ${group.name}` : '';
    $('player-directory-group-tools').hidden = !group;
    $('player-directory-list').replaceChildren(...matches.slice(0, limit).map(({ record, copies }) => {
      const row = node('li', '', 'player-file-card');
      row.dataset.recordId = record.id;
      const heading = node('div', '', 'player-file-heading');
      const portrait = node('span', record.sheet.name.trim().split(/\s+/u).slice(0, 2).map(part => Array.from(part)[0]).join(''), 'player-file-portrait');
      portrait.setAttribute('aria-hidden', 'true');
      if (record.sheet.portrait && validPortrait(record.sheet.portrait)) {
        const image = document.createElement('img');
        image.alt = ''; image.loading = 'lazy'; image.referrerPolicy = 'no-referrer'; image.src = record.sheet.portrait;
        image.addEventListener('error', () => image.remove());
        portrait.append(image);
      }
      const text = node('div');
      text.append(node('p', isPlayerArchived(record) ? 'Archive personnelle' : 'En activité', 'eyebrow accent'), node('h3', record.sheet.name));
      heading.append(portrait, text);
      const revision = record.sheet[EXCHANGE_KEY]?.revision;
      const source = typeof revision === 'string' ? `Version d’échange ${revision.slice(0, 8)}` : 'Fiche personnelle';
      row.append(heading, node('p', `Niveau ${record.sheet.level}${record.sheet.profession ? ` · ${record.sheet.profession}` : ''}`, 'field-help'),
        node('p', `${source} · ${copies} copie${copies > 1 ? 's' : ''} de cette identité`, 'field-help'),
        node('p', `Modifiée le ${date.format(record.updatedAt)}`, 'field-help'));
      const actions = node('div', '', 'actions');
      const open = node('button', 'Ouvrir la fiche', 'secondary');
      open.type = 'button'; open.disabled = loading;
      open.setAttribute('aria-label', `Ouvrir la fiche de ${record.sheet.name}`);
      if (record.id === getActive()?.id) { open.setAttribute('aria-current', 'true'); row.append(node('p', 'Fiche ouverte', 'player-file-current')); }
      open.addEventListener('click', () => void choose(record.id));
      actions.append(open);
      if (copies > 1) {
        const related = node('button', 'Voir les copies', 'text-button'); related.type = 'button';
        related.addEventListener('click', () => {
          group = { id: identity(record), name: record.sheet.name }; limit = 20;
          $('player-directory-query').value = ''; $('player-directory-state').value = 'all'; $('player-directory-copies').checked = false;
          render(); $('player-directory-query').focus();
        });
        actions.append(related);
      }
      row.append(actions); return row;
    }));
    if (!matches.length) $('player-directory-list').append(node('li', 'Aucune fiche ne correspond. Ajuste les filtres ou choisis « Archives » pour retrouver les copies rangées.', 'empty'));
    $('player-directory-more').hidden = matches.length <= limit;
    $('player-directory-refresh').disabled = loading;
  }
  async function open() {
    if (!dialog.open) returnFocus = document.activeElement;
    loading = true;
    $('player-directory-message').textContent = 'Lecture des fiches…';
    if (!dialog.open) dialog.showModal();
    render();
    try { await refresh(); $('player-directory-message').textContent = ''; }
    catch (error) { $('player-directory-message').textContent = error.message; }
    finally { loading = false; render(); $('player-directory-query').focus(); }
  }
  for (const id of ['player-directory-query', 'player-directory-state', 'player-directory-sort', 'player-directory-copies']) $(id).addEventListener('input', () => { limit = 20; render(); });
  $('player-directory-query').addEventListener('keydown', event => {
    if (event.key === 'Enter') { event.preventDefault(); const first = entries()[0]; if (first) void choose(first.record.id); }
  });
  $('player-directory-group-clear').addEventListener('click', () => { group = undefined; limit = 20; render(); });
  $('player-directory-more').addEventListener('click', () => { limit += 20; render(); });
  $('player-directory-refresh').addEventListener('click', () => void open());
  $('player-directory-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => queueMicrotask(() => returnFocus?.isConnected && returnFocus.focus({ preventScroll: true })));
  return { open, render };
}

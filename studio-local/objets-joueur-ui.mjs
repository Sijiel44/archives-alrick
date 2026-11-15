import { PLAYER_OBJECTS, OBJECT_CATEGORIES, OBJECT_STATUSES, objectSearchText, objectReference } from './objets-joueur.mjs';

const node = (tag, text, className) => { const el = document.createElement(tag); el.textContent = text; if (className) el.className = className; return el; };
export function createObjectPicker({ canOpen }) {
  const $ = id => document.getElementById(id);
  const dialog = $('object-catalogue-dialog');
  let context, selected, returnFocus, limit = 12;
  for (const [key, label] of Object.entries(OBJECT_CATEGORIES)) $('object-catalogue-category').append(new Option(label, key));
  function matches() {
    const terms = objectSearchText($('object-catalogue-query').value).split(/\s+/u).filter(Boolean);
    const category = $('object-catalogue-category').value;
    return PLAYER_OBJECTS.filter(entry => (!category || entry.category === category) && terms.every(term =>
      objectSearchText([entry.name, entry.description, entry.id, entry.tags].join(' ')).includes(term)));
  }
  function renderList() {
    const entries = matches();
    $('object-catalogue-count').textContent = `${entries.length} référence${entries.length !== 1 ? 's' : ''} · ${Math.min(limit, entries.length)} affichée${Math.min(limit, entries.length) !== 1 ? 's' : ''}`;
    $('object-catalogue-list').replaceChildren(...entries.slice(0, limit).map(entry => {
      const row = node('li', '', 'object-catalogue-card');
      const title = node('button', entry.name, 'secondary'); title.type = 'button'; title.setAttribute('aria-label', `Consulter ${entry.name}`);
      title.setAttribute('aria-pressed', String(selected?.id === entry.id));
      title.addEventListener('click', () => choose(entry));
      row.append(node('p', OBJECT_CATEGORIES[entry.category], 'eyebrow accent'), title, node('p', entry.id, 'field-help')); return row;
    }));
    if (!entries.length) $('object-catalogue-list').append(node('li', 'Aucune référence ne correspond. Tu peux aussi saisir librement ton objet dans l’inventaire.', 'empty'));
    $('object-catalogue-more').hidden = entries.length <= limit;
  }
  function renderDetail() {
    $('object-catalogue-detail').hidden = !selected;
    $('object-catalogue-use').hidden = context.mode === 'view';
    $('object-catalogue-use').closest('footer').hidden = context.mode === 'view';
    $('object-catalogue-use').disabled = !selected || context.readOnly;
    $('object-catalogue-use').textContent = context.mode === 'create' ? 'Préparer une adaptation pour ma table' : 'Relier cette référence à mon objet';
    const source = objectReference(context.source);
    $('object-catalogue-saved').textContent = source.state === 'none' ? '' : source.label +
      (source.state === 'changed' ? ' · Le catalogue courant a changé depuis ce lien.' : source.state === 'missing' ? ' · Absente du catalogue courant.' : '');
    if (!selected) return;
    $('object-catalogue-detail-title').textContent = selected.name;
    $('object-catalogue-description').textContent = selected.description;
    $('object-catalogue-status').textContent = `${OBJECT_STATUSES[selected.status]} · ${selected.id} · version ${selected.version.slice(0, 8)}`;
    $('object-catalogue-source').href = selected.href;
    $('object-catalogue-shortcut').value = `[[${selected.id}|${selected.name}]]`;
    $('object-catalogue-copy-status').textContent = '';
  }
  function choose(entry) {
    selected = entry; renderList(); renderDetail();
    $('object-catalogue-detail-title').focus();
    $('object-catalogue-detail').scrollIntoView({ block: 'nearest' });
  }
  function open(next) {
    if (!canOpen()) return;
    context = next; returnFocus = document.activeElement; limit = 12;
    selected = objectReference(next.source).entry;
    $('object-catalogue-query').value = ''; $('object-catalogue-category').value = '';
    renderList(); renderDetail(); dialog.showModal();
    if (selected) $('object-catalogue-detail-title').focus(); else $('object-catalogue-query').focus();
  }
  for (const id of ['object-catalogue-query', 'object-catalogue-category']) $(id).addEventListener('input', () => { limit = 12; renderList(); });
  $('object-catalogue-query').addEventListener('keydown', event => { if (event.key === 'Enter') { event.preventDefault(); const first = matches()[0]; if (first) choose(first); } });
  $('object-catalogue-more').addEventListener('click', () => { limit += 12; renderList(); });
  $('object-catalogue-close').addEventListener('click', () => dialog.close());
  $('object-catalogue-use').addEventListener('click', () => {
    if (!selected || context.readOnly || !canOpen()) return;
    const result = context.onChoose?.(selected);
    if (result) { if (result instanceof HTMLElement) returnFocus = result; dialog.close(); }
  });
  $('object-catalogue-copy').addEventListener('click', async () => {
    if (!selected) return;
    const value = $('object-catalogue-shortcut').value;
    try { await navigator.clipboard.writeText(value); $('object-catalogue-copy-status').textContent = 'Raccourci Markdown copié.'; }
    catch { $('object-catalogue-shortcut').focus(); $('object-catalogue-shortcut').select(); $('object-catalogue-copy-status').textContent = 'Le raccourci est sélectionné. Copie-le avec la commande de ton appareil.'; }
  });
  dialog.addEventListener('close', () => queueMicrotask(() => returnFocus?.isConnected && returnFocus.focus({ preventScroll: true })));
  return { open };
}

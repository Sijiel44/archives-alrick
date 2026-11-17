// Rendu volontairement restreint du Markdown public importé : seuls des nœuds
// DOM textuels sont créés, sans innerHTML ni liens sortants automatiques.
// Les images externes figurant dans les textes originaux sont remplacées par
// l'illustration locale de la fiche, déjà affichée dans l'en-tête du lecteur.

function el(tag, className) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  return element;
}

function inline(parent, source, resolveReference) {
  const text = source.replace(/\\([*_`\[\]])/g, '$1');
  const expressions = /(\[\[([^\]|]+)(?:\|([^\]]+))?\]\]|\*\*([^*]+)\*\*|`([^`]+)`|\*([^*\n]+)\*|\[([^\]]+)\]\(([^)]+)\))/g;
  let cursor = 0;
  for (const match of text.matchAll(expressions)) {
    const offset = match.index ?? 0;
    if (offset > cursor) parent.append(document.createTextNode(text.slice(cursor, offset)));
    if (match[2]) {
      const sourcePath = match[2].split('#')[0].replace(/\.md$/, '');
      const label = match[3] ?? match[2].split('/').at(-1).replace(/-/g, ' ');
      const targetId = resolveReference?.(sourcePath);
      const reference = el(targetId ? 'a' : 'span', targetId ? 'inline-reference-link' : 'inline-reference');
      reference.textContent = label;
      if (targetId) reference.href = `#fiche/${encodeURIComponent(targetId)}`;
      parent.append(reference);
    }
    else if (match[4]) { const strong = el('strong'); strong.textContent = match[4]; parent.append(strong); }
    else if (match[5]) { const code = el('code'); code.textContent = match[5]; parent.append(code); }
    else if (match[6]) { const emphasis = el('em'); emphasis.textContent = match[6]; parent.append(emphasis); }
    else if (match[7]) {
      // Le titre de la référence reste lisible ; l'adresse externe n'est pas
      // transformée en navigation vers l'ancien hébergement.
      const label = el('span', 'inline-reference');
      label.textContent = match[7];
      parent.append(label);
    }
    cursor = offset + match[0].length;
  }
  if (cursor < text.length) parent.append(document.createTextNode(text.slice(cursor)));
}

function renderTable(lines, start, resolveReference) {
  const rows = [];
  let index = start;
  while (index < lines.length && /^\s*\|/.test(lines[index])) {
    const cells = lines[index].trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((cell) => cell.trim());
    if (!cells.every((cell) => /^:?-{3,}:?$/.test(cell))) rows.push(cells);
    index += 1;
  }
  const wrapper = el('div', 'article-table-scroll');
  const table = el('table', 'article-table');
  rows.forEach((cells, rowIndex) => {
    const tr = el('tr');
    cells.forEach((value) => { const cell = el(rowIndex === 0 ? 'th' : 'td'); inline(cell, value, resolveReference); tr.append(cell); });
    table.append(tr);
  });
  wrapper.append(table);
  return { node: wrapper, next: index };
}

export function renderPublicArticle(markdown, resolveReference) {
  const lines = markdown.replace(/\r\n?/g, '\n').split('\n');
  let start = 0;
  if (lines[0].trim() === '---') {
    const end = lines.findIndex((line, index) => index > 0 && line.trim() === '---');
    if (end < 0) throw new Error('Métadonnées de source incomplètes.');
    start = end + 1;
  }
  const article = el('div', 'public-article-body');
  let paragraph = [];
  let list = null;
  let listKind;
  const flushText = () => {
    if (paragraph.length) {
      const p = el('p');
      inline(p, paragraph.join(' '), resolveReference);
      article.append(p);
      paragraph = [];
    }
  };
  const flushList = () => { list = null; listKind = null; };
  for (let i = start; i < lines.length; i += 1) {
    const line = lines[i].trim();
    if (!line) { flushText(); flushList(); continue; }
    if (/^!\[[^\]]*\]\([^)]+\)$/.test(line) || /^---+$/.test(line)) {
      flushText(); flushList(); continue;
    }
    const heading = /^(#{1,4})\s+(.+)$/.exec(line);
    if (heading) {
      flushText(); flushList();
      if (heading[1].length === 1) continue; // Titre déjà présent avec l'image
      const title = el(heading[1].length === 2 ? 'h3' : 'h4');
      inline(title, heading[2], resolveReference);
      article.append(title);
      continue;
    }
    if (/^\|/.test(line)) {
      flushText(); flushList();
      const table = renderTable(lines, i, resolveReference);
      article.append(table.node);
      i = table.next - 1;
      continue;
    }
    if (/^>\s?/.test(line)) {
      flushText(); flushList();
      const quote = el('blockquote');
      const content = line.replace(/^>\s?/, '').replace(/^\[!(info|tip|important|warning|note)\]\s*/i, (_, kind) => ({info:'À retenir : ',tip:'Conseil : ',important:'Important : ',warning:'Attention : ',note:'Note : '})[kind.toLowerCase()]);
      inline(quote, content, resolveReference);
      article.append(quote);
      continue;
    }
    const bullet = /^[-*]\s+(.+)$/.exec(line);
    const numbered = /^\d+\.\s+(.+)$/.exec(line);
    if (bullet || numbered) {
      flushText();
      const kind = bullet ? 'ul' : 'ol';
      if (!list || listKind !== kind) { list = el(kind); listKind = kind; article.append(list); }
      const item = el('li');
      inline(item, (bullet || numbered)[1], resolveReference);
      list.append(item);
      continue;
    }
    flushList();
    paragraph.push(line);
  }
  flushText();
  return article;
}

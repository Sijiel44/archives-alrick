import { renderPublicArticle } from './article-renderer.mjs';
const $ = id => document.getElementById(id);
const labels = { bestiaire: 'Bestiaire', pnj: 'Personnages', atlas: 'Atlas et lieux', univers: 'Univers', regles: 'Jouer et règles',
  magie: 'Magie', sorts: 'Sorts', capacites: 'Capacités', objets: 'Objets', factions: 'Factions', aventures: 'Aventures', imagerie: 'Imagerie', protocole: 'Protocole de jeu' };
const normalize = value => value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase('fr');
let entries = [], byId = new Map(), paths = {};
function list() {
  const query = normalize($('search').value);
  const matches = entries.filter(entry => (!$('category').value || entry.category === $('category').value) && normalize(`${entry.id} ${entry.title} ${entry.description}`).includes(query));
  $('cards').replaceChildren(...matches.map(entry => {
    const a = document.createElement('a'); a.href = `#fiche/${encodeURIComponent(entry.id)}`;
    const label = document.createElement('small'); label.textContent = `${labels[entry.category] ?? entry.category} · ${entry.id}`;
    const title = document.createElement('h2'); title.textContent = entry.title;
    const description = document.createElement('p'); description.textContent = entry.description;
    a.append(label, title, description); return a;
  }));
  $('count').textContent = `${matches.length} fiche${matches.length > 1 ? 's' : ''}`;
}
function route() {
  const id = decodeURIComponent(location.hash.replace(/^#(?:fiche\/)?/, ''));
  const entry = byId.get(id);
  $('directory').hidden = Boolean(entry); $('reader').hidden = !entry;
  $('error').textContent = id && !entry ? 'Cette référence n’est pas disponible dans les fiches publiques. Retrouvez une autre fiche dans la bibliothèque.' : '';
  if (!entry) return;
  $('title').textContent = entry.title; $('code').textContent = `${entry.id} · ${entry.status ?? 'référence'}`;
  $('description').textContent = entry.description; $('provenance').textContent = entry.provenance;
  const image = $('illustration'); image.hidden = true; image.removeAttribute('src');
  if (entry.image) { image.alt = entry.imageAlt ?? entry.title; image.src = entry.image; image.onload = () => { image.hidden = false; }; image.onerror = () => { image.hidden = true; }; }
  $('body').replaceChildren(renderPublicArticle(entry.markdown, source => paths[source]));
  $('related').replaceChildren(...entry.links.filter(link => byId.has(link)).map(id => { const a = document.createElement('a'); a.href = `#fiche/${encodeURIComponent(id)}`; a.textContent = byId.get(id).title; return a; }));
  $('copy').textContent = 'Copier le lien Markdown';
  $('title').focus(); window.scrollTo({ top: 0, behavior: 'instant' });
  document.title = `${entry.title} · Les Chroniques d’Entre-Rives`;
}
$('copy').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(`[${$('title').textContent}](${location.href})`); $('copy').textContent = 'Lien Markdown copié'; }
  catch { $('copy').textContent = 'Copie indisponible — utilisez l’adresse de la page'; }
});
$('search').addEventListener('input', list); $('category').addEventListener('change', list); window.addEventListener('hashchange', route);
try {
  const response = await fetch('./public-documents.json'); if (!response.ok) throw new Error('La bibliothèque ne peut pas être chargée. Réessayez plus tard.');
  const data = await response.json(); entries = data.entries; byId = new Map(entries.map(entry => [entry.id, entry])); paths = data.pathIds;
  for (const category of [...new Set(entries.map(entry => entry.category))].sort()) { const option = document.createElement('option'); option.value = category; option.textContent = labels[category] ?? category; $('category').append(option); }
  list(); route();
} catch (error) { $('error').textContent = error.message; }

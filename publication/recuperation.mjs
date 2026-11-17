import { openStudioStore } from '../studio-local/store.mjs';
import { openPlayerStore, playerBackup } from '../studio-local/espace-joueur-store.mjs';
import { creationDraftBackup } from '../studio-local/brouillons-pj.mjs';
const $ = id => document.getElementById(id);
function download(text, filename) {
  const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  const anchor = document.createElement('a'); anchor.href = url; anchor.download = filename; anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function row(container, label, work, filename) {
  const li = document.createElement('li'); li.append(document.createTextNode(label));
  const button = document.createElement('button'); button.type = 'button'; button.textContent = 'Télécharger';
  button.addEventListener('click', async () => {
    button.disabled = true;
    try { const value = await work(); download(typeof value === 'string' ? value : JSON.stringify(value), filename); $('status').textContent = 'Copie téléchargée. Les données locales sont conservées.'; }
    catch (error) { $('status').textContent = error.message; }
    finally { button.disabled = false; }
  });
  li.append(button); $(container).append(li);
}
$('inspect').addEventListener('click', async () => {
  $('inspect').disabled = true; $('status').textContent = 'Lecture des sauvegardes de ce navigateur…';
  $('campaigns').replaceChildren(); $('players').replaceChildren();
  const errors = [];
  try {
    const store = await openStudioStore();
    const { campaigns, unreadableCount } = await store.listRecoverable();
    if (unreadableCount) errors.push(`${unreadableCount} sauvegarde(s) illisible(s), conservée(s) dans le navigateur. Ne videz pas le stockage.`);
    for (const campaign of campaigns) row('campaigns', campaign.name, () => store.exportBackup(campaign.id), `campagne-${campaign.id}.json`);
    if (!campaigns.length) $('campaigns').textContent = 'Aucune campagne trouvée sur cette origine.';
  } catch (error) { errors.push(`Campagnes : ${error.message}`); }
  try {
    const player = await openPlayerStore(); const records = await player.list();
    for (const record of records) row('players', record.sheet?.name ?? 'Personnage', () => playerBackup(record), `personnage-${record.id}.json`);
    const draft = await player.readDraft();
    if (draft?.snapshot) row('players', 'Brouillon de création', () => creationDraftBackup(draft.snapshot), 'brouillon-personnage.json');
    if (!records.length && !draft?.snapshot) $('players').textContent = 'Aucune fiche ni brouillon trouvé sur cette origine.';
  } catch (error) { errors.push(`Personnages : ${error.message}`); }
  $('status').textContent = errors.length ? errors.join(' · ') : 'Inventaire terminé. Choisissez les copies à conserver.';
  $('inspect').disabled = false;
});

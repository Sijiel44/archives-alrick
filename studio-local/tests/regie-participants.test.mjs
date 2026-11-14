import assert from 'node:assert/strict';
import { test } from 'node:test';
import { browserFixture } from './browser.mjs';

async function seed(page, url, options = {}) {
  await page.goto(url);
  await page.locator('#save-status').getByText('Stockage local prêt', { exact: true }).waitFor();
  await page.evaluate(async ({ many = 0, empty = false }) => {
    const { openStudioStore, BESTIARY_SCHEMA } = await import('./store.mjs');
    const { createFreePJ, buildFreePJ } = await import('./pj-m02.mjs');
    const { createProfile } = await import('./atelier-bestiaire.mjs');
    const store = await openStudioStore();
    let campaign;
    const send = async (type, data) => {
      campaign = await store.execute({ id: 'table-regie', operationId: crypto.randomUUID(), expectedRevision: campaign?.revision ?? 0, type, data });
    };
    try {
      await send('create', { name: 'Table des Rives', description: 'Recette fictive', style: 'campaign', startingLevel: 5 });
      if (!empty) {
        const base = { physique: 3, agilite: 3, esprit: 3, presence: 3 };
        const { source } = createFreePJ(buildFreePJ({ level: 5, startingStats: base, stats: base, masteries: { navigation: 2 } }),
          { id: 'source-eloise', name: 'Éloïse des Saules', profession: 'Batelière', backstory: 'CANARI_HISTOIRE', connections: '', goal: '' });
        source.pv = 18;
        await send('attach-pj-source', { id: 'eloise', attach: false, source });
        await send('save-character', { id: 'eloise', name: source.name, level: 5, notes: 'CANARI_NOTES_PJ' });
        await send('save-character', { id: 'lio', name: 'Lio l’apprenti', level: 1, notes: 'CANARI_NOTES_LIO' });
        for (const [id, name, kind, profession] of [['ordan', 'Ordan du Pont', 'pnj', 'Garde du pont'], ['renarde', 'Renarde du gué', 'creature', 'Prédateur des berges']]) {
          const profile = createProfile({ name, description: 'Rencontre fictive de recette', level: 5, archetype: 'faune', kind, role: 'offensif' });
          profile.card.profession = profession;
          profile.card.notes = 'CANARI_NOTES_BESTIAIRE';
          await send('save-bestiary-profile', { id, name, description: 'Rencontre fictive de recette', source: { id: profile.card.id, version: BESTIARY_SCHEMA }, profile });
        }
        await send('save-creation', { id: 'creation-sanna', kind: 'npc', name: 'Sanna des Écluses', description: 'Une rencontre à préparer.', notes: 'CANARI_NOTES_CREATION',
          state: 'ready', details: { role: 'Passeuse', motivation: '', relations: '' }, parentId: null, links: [] });
        for (let index = 1; index <= many; index++) await send('save-character', { id: 'voyageur-' + index, name: 'Voyageur ' + String(index).padStart(2, '0'), level: 1, notes: '' });
      }
      await send('save-scene', { id: 'scene-regie', title: 'Le passage du gué', description: 'Une scène fictive de recette.', privateNotes: 'CANARI_SCENE_MJ', participantIds: empty ? [] : ['eloise', 'ordan', 'renarde'] });
      await send('save-scene', { id: 'scene-suite', title: 'Après le gué', description: '', privateNotes: '', participantIds: empty ? [] : ['lio'] });
      await store.execute({ id: 'autre-table', expectedRevision: 0, operationId: crypto.randomUUID(), type: 'create', data: { name: 'Autre table', description: '', style: 'campaign', startingLevel: 1 } });
      await store.execute({ id: 'autre-table', expectedRevision: 1, operationId: crypto.randomUUID(), type: 'save-character', data: { id: 'etranger', name: 'PERSONNAGE_AUTRE_TABLE', level: 1, notes: 'CANARI_AUTRE_TABLE' } });
      localStorage.setItem('entre-rives:derniere-campagne', 'table-regie');
    } finally { store.close(); }
  }, options);
  await page.goto(url + '?recette=1#reprendre');
  await page.locator('#current-scene-title').getByText('Le passage du gué', { exact: true }).waitFor();
}

async function archive(page) {
  return page.evaluate(async () => {
    const { openStudioStore } = await import('./store.mjs');
    const store = await openStudioStore();
    try { return await store.exportBackup('table-regie'); } finally { store.close(); }
  });
}

test('Le répertoire passe entre PJ, PNJ et créatures sans écrire dans la campagne', { timeout: 45000 }, async t => {
  const f = await browserFixture(t);
  const { page } = await f.open('regie-fiches');
  await seed(page, f.url);
  const before = await archive(page);
  await page.locator('#open-session-roster').click();
  const dialog = page.locator('#resource-dialog');
  await page.locator('#roster-count').getByText('3 fiches · 3 affichées', { exact: true }).waitFor();
  await page.locator('#roster-search').fill('eloise bateliere');
  await page.locator('#roster-search').press('Enter');
  await page.locator('#resource-title').getByText('Éloïse des Saules', { exact: true }).waitFor();
  await page.locator('#resource-profile').getByText('18 / 36 PV', { exact: true }).waitFor();
  await page.locator('#resource-creation-notes summary').click();
  await page.locator('#resource-creation-notes-text').getByText('CANARI_NOTES_PJ', { exact: true }).waitFor();
  await page.locator('#roster-search').fill('');
  await page.locator('#roster-scope').selectOption('campaign');
  await page.locator('#roster-kind').selectOption('PNJ');
  assert.equal(await page.locator('#roster-list button').count(), 2);
  await page.locator('#roster-search').fill('passeuse');
  await page.locator('#roster-search').press('Enter');
  await page.locator('#resource-title').getByText('Sanna des Écluses', { exact: true }).waitFor();
  assert.equal(await page.locator('#resource-profile').isVisible(), false);
  await dialog.getByRole('button', { name: 'Préremplir un profil 5d6', exact: true }).waitFor();
  await page.locator('#roster-search').fill('CANARI');
  assert.equal(await page.locator('#roster-list button').count(), 0);
  assert.equal(await page.locator('#roster-next').isDisabled(), true);
  await page.locator('#roster-outside-filter').waitFor();
  await page.locator('#roster-search').fill('');
  await page.locator('#roster-kind').selectOption('Créature');
  await page.getByRole('button', { name: 'Consulter la fiche de Renarde du gué', exact: true }).click();
  await page.locator('#resource-title').getByText('Renarde du gué', { exact: true }).waitFor();
  await page.locator('#roster-kind').selectOption('all');
  assert.equal(await page.locator('#roster-list button').count(), 5);
  assert.doesNotMatch(await page.locator('#roster-list').textContent(), /PERSONNAGE_AUTRE_TABLE|CANARI/);
  await page.keyboard.press('Escape');
  await dialog.waitFor({ state: 'hidden' });
  await page.waitForFunction(() => document.activeElement === document.getElementById('open-session-roster'));
  await page.locator('#open-session-roster').click();
  await page.locator('#resource-title').getByText('Renarde du gué', { exact: true }).waitFor();
  await page.locator('#roster-return').click();
  await page.waitForFunction(() => document.activeElement === document.getElementById('current-scene-title'));
  assert.equal(await archive(page), before);
});

test('La navigation au clavier, les longues listes et la lecture mobile gardent la fiche choisie', { timeout: 45000 }, async t => {
  const f = await browserFixture(t);
  const { page } = await f.open('regie-mobile', { reducedMotion: 'reduce' });
  await seed(page, f.url, { many: 35 });
  await page.locator('#open-session-roster').click();
  await page.locator('#roster-scope').selectOption('campaign');
  await page.locator('#roster-kind').selectOption('PJ');
  assert.equal(await page.locator('#roster-list button').count(), 30);
  await page.locator('#roster-more').click();
  assert.equal(await page.locator('#roster-list button').count(), 37);
  await page.locator('#roster-list button').first().focus();
  await page.keyboard.press('End');
  assert.equal(await page.getByRole('button', { name: 'Consulter la fiche de Voyageur 35', exact: true }).evaluate(el => el === document.activeElement), true);
  await page.keyboard.press('Enter');
  await page.locator('#resource-title').getByText('Voyageur 35', { exact: true }).waitFor();
  await page.locator('#roster-previous').click();
  await page.locator('#resource-title').getByText('Voyageur 34', { exact: true }).waitFor();
  await page.locator('#roster-next').click();
  await page.locator('#roster-next').click();
  await page.locator('#resource-title').getByText('Éloïse des Saules', { exact: true }).waitFor();
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    assert.equal(await page.locator('#resource-dialog').evaluate(el => el.scrollWidth <= el.clientWidth), true, `répertoire ${width}px`);
    for (const id of ['roster-previous', 'roster-next', 'roster-return']) assert.ok(await page.locator('#' + id).evaluate(el => el.getBoundingClientRect().height >= 44));
  }
  await page.locator('#roster-toggle').click();
  assert.equal(await page.locator('#roster-search').evaluate(el => el === document.activeElement), true);
  await page.locator('#roster-search').fill('Voyageur 12');
  await page.locator('#roster-search').press('Enter');
  await page.locator('#resource-title').getByText('Voyageur 12', { exact: true }).waitFor();
  assert.equal(await page.locator('#session-roster').isVisible(), false);
  assert.equal(await page.locator('#resource-title').evaluate(el => el === document.activeElement), true);
  await page.locator('#roster-return').click();
  await page.locator('#current-scene-title').getByText('Le passage du gué', { exact: true }).waitFor();
});

test('Un changement dans un autre onglet bloque les actions jusqu’à la relecture des fiches', { timeout: 45000 }, async t => {
  const f = await browserFixture(t);
  const { page, context } = await f.open('regie-actualiser');
  await seed(page, f.url);
  await page.locator('#participant-list').getByRole('button', { name: 'Ouvrir la fiche de Éloïse des Saules', exact: true }).click();
  const second = await context.newPage();
  await second.goto(f.url);
  await second.getByRole('button', { name: 'Ouvrir Table des Rives', exact: true }).click();
  const packet = await second.evaluate(async () => {
    const { openStudioStore, PJ_SOURCE_KEY } = await import('./store.mjs');
    const { makeExchange } = await import('./echanges-pj.mjs');
    const store = await openStudioStore();
    try { const c = await store.get('table-regie'); return makeExchange({ ...c.characters[0][PJ_SOURCE_KEY], name: 'Éloïse actualisée', pv: 7 }, 'joueur'); }
    finally { store.close(); }
  });
  await second.locator('#import-pj').click();
  await second.locator('#pj-import-file').setInputFiles({ name: 'version-fictive.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(packet)) });
  await second.locator('#pj-compare-preview .notice').waitFor();
  await second.locator('#pj-exchange-mode').selectOption('update');
  await second.locator('#pj-import-submit').getByText('Actualiser le PJ existant', { exact: true }).waitFor();
  await second.locator('#pj-exchange-accept').check();
  await second.locator('#pj-import-submit').click();
  await second.locator('#pj-import-dialog').waitFor({ state: 'hidden' });
  await page.locator('#roster-freshness').getByText(/changé dans un autre onglet/).waitFor();
  for (const button of await page.locator('#resource-actions button').all()) assert.equal(await button.isDisabled(), true);
  const saved = await archive(second);
  await page.locator('#roster-refresh').click();
  await page.locator('#resource-title').getByText('Éloïse actualisée', { exact: true }).waitFor();
  await page.locator('#resource-profile').getByText('7 / 36 PV', { exact: true }).waitFor();
  assert.equal(await page.locator('#roster-freshness').isVisible(), false);
  assert.equal(await archive(page), saved);
  await second.locator('#nav-play').click();
  await second.locator('#jump-scene').selectOption('scene-suite');
  await second.locator('#current-scene-title').getByText('Après le gué', { exact: true }).waitFor();
  await page.locator('#roster-freshness').getByText(/changé dans un autre onglet/).waitFor();
  await page.locator('#roster-refresh').click();
  await page.locator('#resource-dialog').waitFor({ state: 'hidden' });
  await page.locator('#current-scene-title').getByText('Après le gué', { exact: true }).waitFor();
  await page.locator('#open-session-roster').click();
  assert.equal(await page.locator('#roster-search').inputValue(), '');
  assert.equal(await page.locator('#roster-list button').count(), 1);
  await page.locator('#resource-title').getByText('Lio l’apprenti', { exact: true }).waitFor();
});

test('Une scène vide peut relire ses nouvelles fiches et les noms restent du texte', { timeout: 40000 }, async t => {
  const f = await browserFixture(t);
  const { page, context } = await f.open('regie-vide');
  await seed(page, f.url, { empty: true });
  await page.locator('#open-session-roster').click();
  await page.locator('#resource-title').getByText('Aucune fiche à consulter', { exact: true }).waitFor();
  assert.equal(await page.locator('#roster-next').isDisabled(), true);
  const second = await context.newPage();
  await second.goto(f.url);
  await second.getByRole('button', { name: 'Ouvrir Table des Rives', exact: true }).click();
  await second.locator('#add-character').click();
  const name = 'Mira <img src=x onerror=alert(1)>';
  await second.locator('#character-name').fill(name);
  await second.getByRole('button', { name: 'Enregistrer le PJ', exact: true }).click();
  await second.locator('#character-dialog').waitFor({ state: 'hidden' });
  await page.locator('#roster-freshness').waitFor();
  await page.locator('#roster-refresh').click();
  await page.locator('#resource-title').getByText(name, { exact: true }).waitFor();
  assert.equal(await page.locator('#resource-dialog img').count(), 0);
  assert.equal(await page.locator('#roster-list button').count(), 1);
  await page.locator('#roster-return').click();
  assert.equal(await page.locator('#participant-list > li').count(), 0);
});

test('Consulter un autre participant laisse la fiche joueur approuvée inchangée', { timeout: 40000 }, async t => {
  const f = await browserFixture(t);
  const { page, context } = await f.open('regie-projection');
  await seed(page, f.url);
  const before = await archive(page);
  await page.locator('#participant-list').getByRole('button', { name: 'Ouvrir la fiche de Éloïse des Saules', exact: true }).click();
  await page.getByRole('button', { name: 'Préparer la fiche joueur', exact: true }).click();
  const fields = page.locator('#player-share-fields');
  assert.equal(await fields.locator('input:checked').count(), 0);
  await fields.getByRole('checkbox', { name: 'Nom', exact: true }).check();
  await fields.getByRole('checkbox', { name: 'Points de vie', exact: true }).check();
  const preview = await page.locator('#player-share-preview iframe').getAttribute('srcdoc');
  assert.match(preview, /Éloïse des Saules/);
  assert.doesNotMatch(preview, /CANARI|Répertoire|Ordan|Renarde|Sanna|Table des Rives/);
  const [player] = await Promise.all([context.waitForEvent('page'), page.locator('#open-player-window').click()]);
  const projected = player.locator('#player-sheet iframe');
  await projected.waitFor();
  assert.equal(await projected.getAttribute('srcdoc'), preview);
  await page.locator('#open-session-roster').click();
  await page.getByRole('button', { name: 'Consulter la fiche de Ordan du Pont', exact: true }).click();
  await page.locator('#resource-title').getByText('Ordan du Pont', { exact: true }).waitFor();
  assert.equal(await projected.getAttribute('srcdoc'), preview);
  await page.locator('#roster-return').click();
  await page.locator('#stop-player-window').click();
  assert.equal(await archive(page), before);
});

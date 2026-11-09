import assert from 'node:assert/strict';
import { test } from 'node:test';
import { browserFixture } from './browser.mjs';

test('La mini-carte repère les scènes et leurs liens en préservant le point de reprise', { timeout: 55000 }, async t => {
  const fixture = await browserFixture(t);
  const { page } = await fixture.open('mini-carte-fresque', { viewport: { width: 1440, height: 950 }, hasTouch: true });
  await page.goto(fixture.url);
  const revision = await page.evaluate(async () => {
    const { openStudioStore } = await import('/store.mjs');
    const store = await openStudioStore();
    let revision = 0;
    const execute = async (type, operationId, data) => {
      const saved = await store.execute({ id: 'fresque-fictive', type, operationId, expectedRevision: revision, data });
      revision = saved.revision;
    };
    try {
      await execute('create', 'campagne', { name: 'La route du gué', description: '', style: 'campaign', startingLevel: 1 });
      for (let index = 1; index <= 14; index += 1) {
        await execute('save-scene', 'scene-' + index, { id: 'scene-' + index, title: 'Scène du gué ' + index,
          description: '', privateNotes: 'CANARI_NOTE_MJ', participantIds: [] });
      }
      await execute('add-scene-link', 'depart', { id: 'lien-un', fromId: 'scene-1', toId: 'scene-9', label: 'Si le fleuve baisse' });
      await execute('add-scene-link', 'suite', { id: 'lien-deux', fromId: 'scene-9', toId: 'scene-4', label: 'Retour par la rive' });
      return revision;
    } finally { store.close(); }
  });
  await page.reload();
  await page.getByRole('button', { name: 'Ouvrir La route du gué', exact: true }).click();
  await page.locator('#prepare-title').waitFor();
  const map = page.locator('#fresque-minimap');
  await map.locator('summary').click();
  const markers = map.locator('#fresque-map-markers');
  const scene = id => markers.locator('[data-map-scene="scene-' + id + '"]');
  const card = id => page.locator('#scene-list > [data-scene-id="scene-' + id + '"]');
  assert.equal(await markers.getByRole('button').count(), 14);
  assert.equal(await scene(1).getAttribute('aria-current'), 'true');
  assert.equal(await scene(1).getAttribute('aria-pressed'), 'true');
  assert.equal(await map.locator('#fresque-map-arcs path').count(), 1);
  assert.doesNotMatch(await map.textContent(), /CANARI_NOTE_MJ/);
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'mini-carte à ' + width + 'px');
  }
  await scene(1).focus();
  await page.keyboard.press('End');
  assert.equal(await scene(14).evaluate(el => document.activeElement === el), true);
  assert.equal(await scene(14).getAttribute('aria-pressed'), 'true');
  assert.ok(await map.locator('#fresque-map-scroll').evaluate(el => el.scrollLeft > 0));
  await page.keyboard.press('ArrowLeft');
  assert.equal(await scene(13).evaluate(el => document.activeElement === el), true);
  await map.getByLabel('Scène à repérer').selectOption('scene-9');
  await map.getByRole('heading', { name: '9. Scène du gué 9', exact: true }).waitFor();
  const links = map.locator('#fresque-map-branches');
  await links.getByText('Depuis Scène du gué 1', { exact: true }).waitFor();
  await links.getByText('Vers Scène du gué 4', { exact: true }).waitFor();
  await links.getByText('Retour par la rive', { exact: true }).waitFor();
  assert.equal(await map.locator('#fresque-map-arcs path').count(), 2);
  await links.getByRole('button', { name: 'Repérer Scène du gué 4', exact: true }).tap();
  assert.equal(await scene(4).evaluate(el => document.activeElement === el), true);
  await map.getByRole('button', { name: 'Rejoindre la carte' }).tap();
  assert.equal(await card(4).evaluate(el => document.activeElement === el), true);
  assert.equal(await card(1).getAttribute('aria-current'), 'true');
  assert.ok(await page.locator('#scene-list').evaluate(el => el.scrollLeft > 0));
  const actualRevision = await page.evaluate(async () => {
    const { openStudioStore } = await import('/store.mjs');
    const store = await openStudioStore();
    try { return (await store.get('fresque-fictive')).revision; }
    finally { store.close(); }
  });
  assert.equal(actualRevision, revision);

  await card(4).getByRole('button', { name: 'Déplacer Scène du gué 4 vers la droite' }).click();
  await map.getByRole('heading', { name: '5. Scène du gué 4', exact: true }).waitFor();
  assert.equal(await scene(4).textContent(), '5');
  assert.equal(await map.locator('#fresque-map-arcs path').count(), 1);
  await page.locator('#toggle-scene-list').click();
  await map.getByRole('button', { name: 'Repérer la scène courante' }).click();
  await map.getByRole('heading', { name: '1. Scène du gué 1 · Scène courante', exact: true }).waitFor();
  await map.getByRole('button', { name: 'Rejoindre la carte' }).click();
  assert.equal(await card(1).evaluate(el => document.activeElement === el), true);

  await page.locator('#nav-play').click();
  await page.locator('#jump-scene').selectOption('scene-9');
  await page.locator('#current-scene-title').getByText('Scène du gué 9', { exact: true }).waitFor();
  await page.locator('#nav-prepare').click();
  assert.equal(await scene(9).getAttribute('aria-current'), 'true');
  assert.equal(await scene(9).getAttribute('aria-pressed'), 'true');
});

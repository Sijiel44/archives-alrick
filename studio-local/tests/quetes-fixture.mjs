export async function seedQuestCampaign(page, url) {
  await page.goto(url);
  await page.locator('#save-status').getByText('Stockage local prêt').waitFor();
  await page.evaluate(async () => {
    const { openStudioStore } = await import('./store.mjs'); const store = await openStudioStore();
    let campaign;
    const send = async (type, data) => campaign = await store.execute({ id: 'table-enquete', expectedRevision: campaign?.revision ?? 0, operationId: crypto.randomUUID(), type, data });
    try {
      await send('create', { name: 'Les lanternes disparues', description: 'CANARI_CAMPAGNE', style: 'campaign', startingLevel: 5 });
      for (const [id, title] of [['scene-quai', 'Le quai'], ['scene-moulin', 'Le moulin']]) await send('save-scene', { id, title, description: '', privateNotes: 'CANARI_SCENE', participantIds: [] });
      await send('save-creation', { id: 'creation-quete', kind: 'quest', name: 'Retrouver les lanternes', description: '', notes: 'CANARI_QUETE', state: 'ready', parentId: null, links: [], details: { hook: 'Une absence', objective: 'Retrouver', outcomes: '', reward: '' } });
      await send('save-creation', { id: 'creation-temoin', kind: 'npc', name: 'La batelière', description: '', notes: 'CANARI_PNJ', state: 'ready', parentId: null, links: [], details: { role: 'Témoin', motivation: '', relations: '' } });
    } finally { store.close(); }
  });
  await page.reload(); await page.getByRole('button', { name: 'Ouvrir Les lanternes disparues', exact: true }).click();
  await page.locator('#nav-prepare[aria-current="page"]').waitFor();
}
export async function createClue(page) {
  await page.locator('#nav-quests').click();
  await page.getByRole('button', { name: 'Nouvel indice', exact: true }).click();
  await page.locator('#quest-step-title').fill('CANARI_TITRE · Une corde bleue');
  await page.locator('#quest-step-parent').selectOption('creation-quete');
  await page.locator('#quest-scene-scene-quai').check(); await page.locator('#quest-scene-scene-moulin').check();
  await page.locator('#quest-step-reference').selectOption('campaign:creation-temoin');
  await page.getByRole('button', { name: 'Relier la fiche', exact: true }).click();
  await page.locator('#quest-step-notes').fill('CANARI_NOTES [[creation-temoin|Interroger la batelière]]');
  await page.locator('#quest-step-player-text').fill('Une corde bleue est prise dans les roseaux.');
  await page.locator('#quest-edit-form button[type=submit]').click(); await page.locator('#quest-edit-dialog').waitFor({ state: 'hidden' });
  return page.locator('.quest-card').first();
}

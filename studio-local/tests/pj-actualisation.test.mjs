import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { browserFixture } from './browser.mjs';
import { PJ_SOURCE_KEY, PJ_UPDATES_KEY, PLAY_ACTIONS_KEY } from '../store.mjs';

const file = value => ({ name: 'version-fictive.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(value)) });
async function seed(page, url) {
  await page.goto(url);
  await page.locator('#campaign-name').fill('Table des versions');
  await page.locator('#create-campaign-submit').click();
  const source = await page.evaluate(async () => {
    const { createFreePJ, buildFreePJ } = await import('./pj-m02.mjs');
    const base = { physique: 3, agilite: 3, esprit: 3, presence: 3 };
    const { source } = createFreePJ(buildFreePJ({ level: 5, startingStats: base, stats: { ...base, physique: 5 }, masteries: { lames: 1 } }),
      { id: 'pj-source-versions', name: 'Néria', profession: 'Éclaireuse', backstory: '', connections: '', goal: '' });
    return { ...source, pv: 32, gmNotes: 'CANARI_SOURCE_MJ', futureExtension: { notes: 'CANARI_EXTENSION' } };
  });
  await page.locator('#import-pj').click();
  await page.locator('#pj-import-file').setInputFiles(file({ schema: 'alrick.sheets.v3', sheets: [source] }));
  await page.locator('#pj-import-submit').click();
  await page.locator('#pj-import-dialog').waitFor({ state: 'hidden' });
  await page.getByRole('button', { name: 'Modifier Néria', exact: true }).click();
  await page.locator('#character-notes').fill('CANARI_NOTES_MJ');
  await page.getByRole('button', { name: 'Enregistrer le PJ', exact: true }).click();
  await page.locator('#character-dialog').waitFor({ state: 'hidden' });
  await page.locator('#add-scene').click();
  await page.locator('#scene-title').fill('Gué de recette');
  await page.locator('#scene-private-notes').fill('CANARI_SCENE_MJ');
  await page.locator('#scene-participants input').first().check();
  await page.locator('#scene-form button[type=submit]').click();
  await page.locator('#scene-dialog').waitFor({ state: 'hidden' });
  return source;
}
async function packet(page, source) {
  return page.evaluate(async source => {
    const { makeExchange, EXCHANGE_KEY } = await import('./echanges-pj.mjs');
    const initial = await makeExchange(source, 'joueur');
    return makeExchange({ ...source, name: 'Néria nouvelle', pv: 18, protection: { ...source.protection, physique: 5 },
      [EXCHANGE_KEY]: { version: 1, revision: initial.payload.revision } }, 'joueur');
  }, source);
}
async function inspectUpdate(page, incoming) {
  await page.locator('#import-pj').click();
  await page.locator('#pj-import-file').setInputFiles(file(incoming));
  await page.locator('#pj-compare-preview .notice').waitFor();
  assert.equal(await page.locator('#pj-exchange-mode').inputValue(), 'copy');
  await page.locator('#pj-exchange-mode').selectOption('update');
  await page.locator('#pj-import-submit').getByText('Actualiser le PJ existant', { exact: true }).waitFor();
  assert.equal(await page.locator('#pj-import-submit').isDisabled(), true);
}
async function commitUpdate(page) {
  await page.locator('#pj-exchange-accept').check();
  await page.locator('#pj-import-submit').click();
  await page.locator('#pj-import-dialog').waitFor({ state: 'hidden' });
}
async function damage(page, name, before, after) {
  await page.locator('#nav-play').click();
  await page.locator('#participant-list').getByRole('button', { name: `Ouvrir la fiche de ${name}`, exact: true }).click();
  await page.getByRole('button', { name: 'Cibler en opposition', exact: true }).click();
  await page.locator('#play-intent').fill('Repousser la garde');
  await page.locator('#play-stakes').fill('Le passage est dégagé.');
  await page.locator('#play-raw-stat').fill('5');
  await page.locator('#play-attacker-level').fill('5');
  await page.locator('#play-lock').click();
  await page.locator('#play-dice-source').selectOption('table');
  for (const die of await page.locator('#play-manual-dice input').all()) await die.fill('6');
  await page.locator('#play-resolve').click();
  try { await page.locator('#play-impact-change').getByText(new RegExp(`${before} → ${after} PV`)).waitFor(); }
  catch (error) { throw new Error(`Impact inattendu : ${await page.locator('#play-impact-change').textContent()} · ${await page.locator('#play-resolution').textContent()}`, { cause: error }); }
  await page.locator('#play-apply-damage').check();
  await page.locator('#play-consequence').fill('Conséquence fictive conservée.');
  await page.locator('#play-record').click();
  await page.locator('#play-action-dialog').waitFor({ state: 'hidden' });
}
async function backup(page) {
  await page.locator('#nav-backups').click();
  const [download] = await Promise.all([page.waitForEvent('download'), page.locator('#export-backup').click()]);
  return JSON.parse(await readFile(await download.path(), 'utf8'));
}

test('Actualiser et rétablir un PJ garde ses scènes et les profils historiques de chaque combat', { timeout: 65000 }, async t => {
  const f = await browserFixture(t);
  const { page } = await f.open('versions-seance', { reducedMotion: 'reduce' });
  const source = await seed(page, f.url);
  await damage(page, 'Néria', 32, 23);
  await page.locator('#nav-prepare').click();
  await inspectUpdate(page, await packet(page, source));
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    assert.equal(await page.locator('#pj-import-dialog').evaluate(el => el.scrollWidth <= el.clientWidth), true, `actualisation ${width}px`);
  }
  await commitUpdate(page);
  assert.equal(await page.locator('#character-list > li').count(), 1);
  await page.getByRole('button', { name: 'Historique des versions de Néria nouvelle', exact: true }).waitFor();
  await damage(page, 'Néria nouvelle', 18, 13);
  await page.locator('#nav-prepare').click();
  await page.getByRole('button', { name: 'Historique des versions de Néria nouvelle', exact: true }).click();
  await page.locator('#pj-versions-choice').selectOption({ index: 1 });
  await page.locator('#pj-versions-preview').getByText('23 / 36 PV', { exact: true }).waitFor();
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    assert.equal(await page.locator('#pj-versions-dialog').evaluate(el => el.scrollWidth <= el.clientWidth), true, `versions ${width}px`);
  }
  assert.equal(await page.locator('#pj-versions-restore').isDisabled(), true);
  await page.locator('#pj-versions-accept').check();
  await page.locator('#pj-versions-restore').press('Enter');
  await page.locator('#pj-versions-dialog').waitFor({ state: 'hidden' });
  await damage(page, 'Néria', 23, 14);
  const archive = await backup(page);
  const { campaign } = archive.payload, [character] = campaign.characters;
  assert.equal(archive.version, 17);
  assert.equal(character.notes, 'CANARI_NOTES_MJ');
  assert.equal(character[PJ_SOURCE_KEY].gmNotes, 'CANARI_SOURCE_MJ');
  assert.equal(character[PJ_UPDATES_KEY].length, 2);
  assert.equal(character[PJ_UPDATES_KEY][0].before.source.pv, 32);
  assert.equal(character[PJ_UPDATES_KEY][0].before.pv, 23);
  assert.equal(character[PJ_UPDATES_KEY][1].before.pv, 13);
  assert.equal(campaign.scenes[0].participantIds[0], character.id);
  assert.deepEqual(campaign[PLAY_ACTIONS_KEY].map(action => [action.combat.hpBefore, action.combat.hpAfter, action.combat.damage]), [[32, 23, 9], [18, 13, 5], [23, 14, 9]]);

  const { page: restored } = await f.open('versions-restaure');
  await restored.goto(f.url);
  await restored.locator('#save-status').getByText('Stockage local prêt', { exact: true }).waitFor();
  await restored.locator('#nav-backups').click();
  await restored.locator('#backup-file').setInputFiles(file(archive));
  await restored.locator('#backup-summary').getByText(/1 fiche\(s\) PJ M02/).waitFor();
  await restored.locator('#restore-backup').click();
  await restored.getByRole('button', { name: 'Historique des versions de Néria', exact: true }).waitFor();
  await restored.locator('#nav-play').click();
  await restored.locator('#participant-list').getByText(/14 \/ 36 PV/).waitFor();
  await restored.locator('#participant-list').getByRole('button', { name: 'Ouvrir la fiche de Néria', exact: true }).click();
  await restored.getByRole('button', { name: 'Préparer un échange pour le joueur', exact: true }).click();
  await restored.locator('#pj-export-status').getByText(/Copie prête/).waitFor();
  const [download] = await Promise.all([restored.waitForEvent('download'), restored.locator('#pj-export-download').click()]);
  const shared = await readFile(await download.path(), 'utf8');
  assert.equal(JSON.parse(shared).payload.sheet.pv, 14);
  assert.doesNotMatch(shared, /CANARI_|entreRivesPJUpdatesV17|before|restoredFrom/);
  const damagedRefused = await page.evaluate(async archive => {
    const { openStudioStore, sha256, PJ_UPDATES_KEY } = await import('./store.mjs');
    archive.payload.campaign.characters[0][PJ_UPDATES_KEY][1].before.source.protection.physique = 0;
    archive.sha256 = await sha256(JSON.stringify(archive.payload));
    const store = await openStudioStore();
    try { await store.previewBackup(JSON.stringify(archive)); return false; } catch (e) { return /impact enregistré/.test(e.message); }
    finally { store.close(); }
  }, archive);
  assert.equal(damagedRefused, true);
});

test('Une actualisation interrompue ou périmée laisse la fiche et le brouillon intacts', { timeout: 45000 }, async t => {
  const f = await browserFixture(t);
  const { page, context } = await f.open('versions-conflit');
  const source = await seed(page, f.url), incoming = await packet(page, source);
  await inspectUpdate(page, incoming);
  await page.locator('#pj-exchange-accept').check();
  await page.evaluate(() => {
    const original = IDBObjectStore.prototype.put;
    IDBObjectStore.prototype.put = function () { IDBObjectStore.prototype.put = original; this.transaction.abort(); };
  });
  await page.locator('#pj-import-submit').click();
  await page.locator('#pj-import-form .form-error').waitFor();
  assert.match(await page.locator('#pj-import-form .form-error').textContent(), /interrompu/i);
  assert.equal(await page.locator('#pj-exchange-mode').inputValue(), 'update');
  assert.equal(await page.locator('#pj-exchange-accept').isChecked(), true);
  const before = await page.evaluate(async () => { const {openStudioStore}=await import('./store.mjs'); const s=await openStudioStore(); try{return(await s.list())[0];}finally{s.close();} });
  assert.equal(before.characters[0][PJ_UPDATES_KEY], undefined);
  const second = await context.newPage();
  await second.goto(f.url);
  await second.getByRole('button', { name: 'Ouvrir Table des versions', exact: true }).click();
  await inspectUpdate(second, incoming);
  await second.locator('#pj-exchange-accept').check();
  await page.locator('#pj-import-submit').click();
  await page.locator('#pj-import-dialog').waitFor({ state: 'hidden' });
  await second.locator('#pj-import-submit').click();
  await second.locator('#pj-import-form .form-error').getByText(/La campagne a changé/).waitFor();
  const archive = await backup(page);
  assert.equal(archive.payload.campaign.characters.length, 1);
  assert.equal(archive.payload.campaign.characters[0][PJ_UPDATES_KEY].length, 1);
  assert.equal(archive.payload.campaign.characters[0][PJ_SOURCE_KEY].pv, 18);
});

test('Le stockage contrôle l’identité, les budgets, les répétitions et les sauvegardes de versions', { timeout: 45000 }, async t => {
  const f = await browserFixture(t);
  const { page } = await f.open('versions-contrat');
  await seed(page, f.url);
  const result = await page.evaluate(async () => {
    const { openStudioStore, PJ_SOURCE_KEY, PJ_UPDATES_KEY, sha256 } = await import('./store.mjs');
    const { createFreePJ, buildFreePJ } = await import('./pj-m02.mjs');
    const { makeExchange, receivedSheet } = await import('./echanges-pj.mjs');
    const store = await openStudioStore();
    try {
      let [campaign] = await store.list(); const actorId = campaign.characters[0].id;
      const next = async level => {
        const original = campaign.characters[0][PJ_SOURCE_KEY], base = original.development.startingStats;
        const {source} = createFreePJ(buildFreePJ({level,startingStats:base,stats:original.stats,masteries:original.masteries}),
          {id:original.id,name:'Néria '+level,profession:'Éclaireuse',backstory:'',connections:'',goal:''});
        return receivedSheet((await makeExchange(source,'joueur')).payload,original);
      };
      const command = (type,data) => ({id:campaign.id,operationId:crypto.randomUUID(),expectedRevision:campaign.revision,type,data});
      const rejected=[];
      for(const kind of ['identity','budget','future']) {
        const source=await next(10);
        if(kind==='identity')source.id='autre-pj';
        if(kind==='budget')source.stats.physique=100;
        if(kind==='future')source.entreRivesExchangeV1.version=99;
        try{await store.execute(command('update-pj-source',{id:actorId,source,at:new Date().toISOString()}));rejected.push(false);}catch{rejected.push(true);}
      }
      const first=command('update-pj-source',{id:actorId,source:await next(10),at:new Date().toISOString()});
      campaign=await store.execute(first);
      const second=command('update-pj-source',{id:actorId,source:await next(20),at:new Date().toISOString()});
      campaign=await store.execute(second);
      campaign=await store.execute(command('restore-pj-source',{id:actorId,updateId:campaign.characters[0][PJ_UPDATES_KEY][0].id,at:new Date().toISOString()}));
      const replay=await store.execute(second);
      const archive=JSON.parse(await store.exportBackup(campaign.id));
      const rejectedBackups=[];
      for(const kind of ['downgrade','hp','budget','journal']) {
        const altered=structuredClone(archive), history=altered.payload.campaign.characters[0][PJ_UPDATES_KEY];
        if(kind==='downgrade')altered.version=16;
        if(kind==='hp')history[0].before.pv=31;
        if(kind==='budget')history[0].before.source.stats.physique=100;
        if(kind==='journal')history[0].id='operation-inconnue';
        altered.sha256=await sha256(JSON.stringify(altered.payload));
        try{await store.previewBackup(JSON.stringify(altered));rejectedBackups.push(false);}catch{rejectedBackups.push(true);}
      }
      return{rejected,rejectedBackups,version:archive.version,level:replay.characters[0].level,count:replay.characters.length,
        updates:replay.characters[0][PJ_UPDATES_KEY].length,offsets:replay.characters[0][PJ_UPDATES_KEY].map(update=>update.actionCount)};
    } finally {store.close();}
  });
  assert.deepEqual(result,{rejected:[true,true,true],rejectedBackups:[true,true,true,true],version:17,level:5,count:1,updates:3,offsets:[0,0,0]});
});

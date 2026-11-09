import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { BESTIARY_PROFILE_KEY, PLAY_ACTIONS_KEY } from '../store.mjs';
import { browserFixture } from './browser.mjs';

const targetName = 'Colosse de la digue';
const faces = ['6', '5', '4', '4', '3'];

async function startScene(page) {
  await page.locator('#campaign-name').fill('Veilleurs · recette M03');
  await page.locator('#create-campaign-submit').click();
  await page.locator('#prepare-title').waitFor();
  await page.locator('#nav-workshop').click();
  await page.locator('#workshop-name').fill(targetName);
  await page.locator('#workshop-level').fill('15');
  await page.locator('#workshop-archetype').selectOption('colosse');
  await page.locator('#workshop-generate').click();
  await page.locator('#workshop-save').click();
  await page.locator('#save-status').getByText(/profil sauvegardé/).waitFor();
  await page.locator('#nav-prepare').click();
  await page.locator('#add-scene').click();
  await page.locator('#scene-title').fill('La herse du gué');
  await page.locator('#scene-participants').getByRole('checkbox', { name: /Colosse de la digue/ }).check();
  await page.locator('#scene-form button[type=submit]').click();
  await page.locator('#scene-dialog').waitFor({ state: 'hidden' });
  await page.locator('#nav-play').click();
}

async function resolveTableRoll(page, intent, mode = 'melee') {
  await page.locator('#play-intent').fill(intent);
  await page.locator('#play-actor').fill('Orian');
  await page.locator('#play-stakes').fill('Le passage devient accessible si le colosse cède.');
  await page.locator('#play-impact-mode').selectOption(mode);
  await page.locator('#play-attacker-level').fill('15');
  await page.locator('#play-raw-stat').fill('15');
  if (mode !== 'mental') await page.locator('#play-penetration').fill('1');
  await page.locator('#play-lock').click();
  await page.locator('#play-locked-target').getByText(/Colosse de la digue.*Résistance/).waitFor();
  await page.locator('#play-dice-source').selectOption('table');
  for (const [index, face] of faces.entries()) await page.locator(`[name=die${index + 1}]`).fill(face);
  await page.locator('#play-resolve').click();
  assert.deepEqual(await page.locator('#play-resolution .rolled-dice li').allTextContents(), faces);
}

async function recordConsequence(page, text) {
  await page.locator('#play-consequence').fill(text);
  await page.locator('#play-record').click();
  await page.locator('#play-action-dialog').waitFor({ state: 'hidden' });
}

test('Opposition en séance, confirmation des PV, projection privée et restauration v8', { timeout: 65000 }, async t => {
  const fixture = await browserFixture(t);
  const { page } = await fixture.open('opposition-regie', { viewport: { width: 1280, height: 920 } });
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  await page.goto(fixture.url);
  await startScene(page);
  const participants = page.locator('#participant-list');
  const dialog = page.locator('#play-action-dialog');
  await participants.getByText(/194 \/ 194 PV/).waitFor();
  await page.locator('#open-play-opposition').click();
  const select = page.locator('#play-target');
  assert.equal(await select.inputValue(), '');
  assert.deepEqual(await select.locator('option').allTextContents(), ['Choisir une cible', `${targetName} · 194 / 194 PV`]);
  await select.selectOption({ label: `${targetName} · 194 / 194 PV` });
  await resolveTableRoll(page, 'Mesurer la force du colosse');
  const outcome = page.locator('#play-resolution');
  await outcome.getByText('Résistance franchie', { exact: true }).waitFor();
  await outcome.getByText(/naturel 22 · total 29 \/ seuil 27/).waitFor();
  await outcome.getByText(/Impact brut 16 · protection 2 · pénétration effective 1 · absorbés 1/).waitFor();
  await outcome.getByText('15 PV de dégâts proposés', { exact: true }).waitFor();
  await page.locator('#play-impact-change').getByText(`${targetName} · 194 → 179 PV`, { exact: true }).waitFor();
  assert.equal(await page.locator('#play-apply-damage').isChecked(), false);
  for (const width of [1280, 960, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `régie ${width}px`);
    assert.equal(await dialog.evaluate(el => el.scrollWidth <= el.clientWidth), true, `opposition ${width}px`);
  }
  await recordConsequence(page, 'Le colosse se retire pour négocier.');
  await participants.getByText(/194 \/ 194 PV/).waitFor();

  await participants.getByRole('button', { name: `Ouvrir la fiche de ${targetName}` }).click();
  await page.getByRole('button', { name: 'Cibler en opposition', exact: true }).click();
  assert.notEqual(await select.inputValue(), '');
  await resolveTableRoll(page, 'Ouvrir le passage');
  const approval = page.locator('#play-apply-damage');
  await approval.focus();
  await page.keyboard.press('Space');
  assert.equal(await approval.isChecked(), true);
  assert.match(await participants.textContent(), /194 \/ 194 PV/);
  await page.locator('#play-record').getByText('Consigner et appliquer les PV', { exact: true }).waitFor();
  await recordConsequence(page, 'CANARI_OPPOSITION_MJ Le colosse lâche la herse.');
  await participants.getByText(/179 \/ 194 PV/).waitFor();

  await participants.getByRole('button', { name: `Ouvrir la fiche de ${targetName}` }).click();
  await page.getByRole('button', { name: 'Cibler en opposition', exact: true }).click();
  await resolveTableRoll(page, 'Convaincre le veilleur', 'mental');
  await outcome.getByText('Influence mentale réussie', { exact: true }).waitFor();
  assert.equal(await approval.isVisible(), false);
  await recordConsequence(page, 'Le veilleur écoute la proposition.');
  await participants.getByText(/179 \/ 194 PV/).waitFor();

  const journal = page.locator('#play-actions-list');
  await journal.locator('summary').filter({ hasText: 'Ouvrir le passage' }).click();
  await journal.getByText('15 PV retirés · 194 → 179 PV', { exact: true }).waitFor();
  await page.locator('#share-title').check();
  await page.locator('#show-projection').click();
  const projected = await page.locator('#projection iframe').getAttribute('srcdoc');
  assert.match(projected, /La herse du gué/);
  assert.doesNotMatch(projected, /CANARI_OPPOSITION_MJ|Colosse de la digue|179 \/ 194 PV|Ouvrir le passage/);
  await page.locator('#stop-projection').click();

  await page.locator('#nav-backups').click();
  const [file] = await Promise.all([page.waitForEvent('download'), page.locator('#export-backup').click()]);
  const saved = await readFile(await file.path());
  const archive = JSON.parse(saved);
  assert.equal(archive.version, 8);
  const { campaign } = archive.payload;
  const [observed, applied, mental] = campaign[PLAY_ACTIONS_KEY];
  assert.deepEqual(observed.combat, { targetName, damage: 15, hpBefore: 194, hpAfter: 194 });
  assert.deepEqual(applied.combat, { targetName, damage: 15, hpBefore: 194, hpAfter: 179 });
  assert.deepEqual(mental.combat, { targetName, damage: 0, hpBefore: 179, hpAfter: 179 });
  assert.equal(applied.roll.targetId, campaign.creatures[0].id);
  assert.equal(campaign.creatures[0][BESTIARY_PROFILE_KEY].card.pvMax, 194);
  assert.deepEqual(pageErrors, []);

  const { page: restored } = await fixture.open('opposition-restauree', { viewport: { width: 390, height: 844 } });
  await restored.goto(fixture.url);
  await restored.locator('#save-status').getByText('Stockage local prêt', { exact: true }).waitFor();
  await restored.locator('#nav-backups').click();
  await restored.locator('#backup-file').setInputFiles({ name: 'opposition-fictive.json', mimeType: 'application/json', buffer: saved });
  await restored.locator('#backup-summary').getByText(/3 opposition\(s\) M03/).waitFor();
  await restored.locator('#restore-backup').click();
  await restored.locator('#prepare-title').waitFor();
  await restored.locator('#nav-play').click();
  await restored.locator('#participant-list').getByText(/179 \/ 194 PV/).waitFor();
  const restoredJournal = restored.locator('#play-actions-list');
  await restoredJournal.locator('summary').filter({ hasText: 'Ouvrir le passage' }).click();
  await restoredJournal.getByRole('button', { name: 'Ouvrir la fiche cible' }).click();
  await restored.locator('#resource-profile').getByText('179 / 194 PV', { exact: true }).waitFor();
});

test('Parité native M03 pour mêlée, tir, magie et influence mentale', { timeout: 35000 }, async t => {
  const fixture = await browserFixture(t);
  const { page } = await fixture.open('opposition-parite');
  await page.goto(fixture.url);
  const comparisons = await page.evaluate(async () => {
    const { resolveOpposition } = await import('/opposition.mjs');
    const { resolveCombatM03 } = await import('/moteur/atelier5d6-combat-m03.js');
    const { createBestiaryCard, toDefense } = await import('/moteur/atelier5d6-bestiary-workshop.js');
    const card = createBestiaryCard(15, 'colosse');
    const resistant = { ...card, stats: { ...card.stats, physique: 9999 }, masteries: { ...card.masteries, esquive: 9999 } };
    const attacks = [
      ['melee', 'physique', card, [6, 5, 4, 4, 3], 15],
      ['tir', 'physique', resistant, [6, 6, 5, 5, 5], 1],
      ['magie', 'magie', card, [1, 1, 1, 2, 2], 15],
      ['mental', 'mental', card, [6, 6, 5, 5, 4], 15],
    ];
    return attacks.map(([mode, kind, target, dice, rawStat]) => {
      const shared = { rawStat, masteryRank: 0, situation: 0, level: 15, baseDamage: 6, penetration: 1 };
      return { actual: resolveOpposition({ ...shared, threshold: 21, impactMode: mode, dice }, target),
        expected: resolveCombatM03({ ...shared, natural: dice.reduce((a, b) => a + b, 0), difficulty: 21, feasible: true,
          mode, kind, defender: toDefense(target) }) };
    });
  });
  for (const { actual, expected } of comparisons) assert.deepEqual(actual, expected);
  assert.equal(comparisons[0].actual.damage, 15);
  assert.equal(comparisons[1].actual.glancing, true);
  assert.equal(comparisons[1].actual.damage, 0);
  assert.equal(comparisons[2].actual.criticalFailure, true);
  assert.equal(comparisons[3].actual.effectProposed, true);
  assert.equal(comparisons[3].actual.damage, 0);
});

test('Écriture M03 atomique, réessai sûr et rejet d’une sauvegarde incohérente', { timeout: 40000 }, async t => {
  const fixture = await browserFixture(t);
  const { page } = await fixture.open('opposition-stockage');
  await page.goto(fixture.url);
  const result = await page.evaluate(async () => {
    const { BESTIARY_SCHEMA, PLAY_ACTIONS_KEY, currentHitPoints, openStudioStore } = await import('/store.mjs');
    const { createProfile } = await import('/atelier-bestiaire.mjs');
    const name = 'm03-recette';
    const id = 'campagne-fictive';
    const store = await openStudioStore({ name, injectFailure(stage, command) {
      if (stage === 'before-commit' && command.operationId === 'ecriture-annulee') throw Error('annulation simulée');
      if (stage === 'after-commit' && command.operationId === 'impact-confirme') throw Error('acquittement perdu');
    } });
    const reader = await openStudioStore({ name });
    const send = (type, expectedRevision, data, operationId = crypto.randomUUID()) => store.execute({ id, type, expectedRevision, data, operationId });
    async function failure(run) {
      try { await run(); return null; } catch (error) { return error.code ?? error.message; }
    }
    try {
      await send('create', 0, { name: 'Recette privée', description: '', style: 'campaign', startingLevel: 1 });
      const profile = createProfile({ name: 'Veilleur fictif', description: '', level: 1, archetype: 'faune', kind: 'creature', role: 'offensif' });
      const profileData = { name: 'Veilleur fictif', description: '', source: { id: profile.card.id, version: BESTIARY_SCHEMA }, profile };
      await send('save-bestiary-profile', 1, { id: 'cible', ...profileData });
      await send('save-bestiary-profile', 2, { id: 'hors-scene', ...profileData });
      const scene = { id: 'scene', title: 'Gué fictif', description: '', privateNotes: '', participantIds: ['cible'] };
      const start = await send('save-scene', 3, scene);
      const roll = { ruleset: 'm03', source: 'table', stat: 'physique', rawStat: 25, masteryRank: 0, situation: 0, threshold: 21,
        dice: [6, 6, 6, 6, 6], targetId: 'cible', impactMode: 'melee', level: 25, baseDamage: 12, penetration: 0 };
      const data = { id: 'opposition-fictive', mode: 'opposition', sceneId: 'scene', actor: '', intent: 'Franchir le gué',
        stakes: 'Il faut écarter le veilleur.', consequence: 'Le passage est libre.', recordedAt: '2026-11-07T15:00:00.000Z', roll, applyDamage: true };
      const offScene = await failure(() => send('record-opposition', 4, { ...data, roll: { ...roll, targetId: 'hors-scene' } }));
      const mental = await failure(() => send('record-opposition', 4, { ...data, roll: { ...roll, impactMode: 'mental' } }));
      const aborted = await failure(() => send('record-opposition', 4, data, 'ecriture-annulee'));
      const afterAbort = await reader.get(id);
      const lost = await failure(() => send('record-opposition', 4, data, 'impact-confirme'));
      const reordered = Object.fromEntries(Object.entries(roll).reverse());
      const retry = await reader.execute({ id, type: 'record-opposition', expectedRevision: 4,
        data: { ...data, roll: reordered }, operationId: 'impact-confirme' });
      const stale = await failure(() => send('record-opposition', 4, { ...data, id: 'jet-perime' }));
      const after = await send('save-scene', 5, { ...scene, participantIds: [] });
      const text = await reader.exportBackup(id);
      const archive = JSON.parse(text);
      const preview = await reader.previewBackup(text);
      const downgrade = await failure(() => reader.previewBackup(JSON.stringify({ ...archive, version: 7 })));
      archive.payload.campaign[PLAY_ACTIONS_KEY][0].combat.damage += 1;
      const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(archive.payload)));
      archive.sha256 = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
      const forged = await failure(() => reader.previewBackup(JSON.stringify(archive)));
      return { offScene, mental, aborted, lost, stale, downgrade, forged, initial: currentHitPoints(start, start.creatures[0]),
        revisionAfterAbort: afterAbort.revision, revisionAfterRetry: retry.revision, count: preview.oppositions,
        hpAfter: currentHitPoints(after, after.creatures[0]), record: retry[PLAY_ACTIONS_KEY][0].combat };
    } finally { store.close(); reader.close(); }
  });
  assert.deepEqual(result, { offScene: 'foreign-key', mental: 'invalid-command', aborted: 'annulation simulée', lost: 'acquittement perdu',
    stale: 'conflict', downgrade: 'backup-version', forged: 'invalid-data', initial: 8, revisionAfterAbort: 4, revisionAfterRetry: 5,
    count: 1, hpAfter: 0, record: { targetName: 'Veilleur fictif', damage: 29, hpBefore: 8, hpAfter: 0 } });
});

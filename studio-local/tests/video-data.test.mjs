import assert from 'node:assert/strict';
import { test } from 'node:test';
import { VIDEO_KEY, validSceneVideo, validVideoUrl, validateSceneVideos, videoForScene } from '../video.mjs';
import { browserFixture } from './browser.mjs';

const video = (sceneId = 'scene') => ({ sceneId, url: 'https://video.invalid/brume.webm',
  imageId: 'image-heron-des-lanternes', loop: true, dim: 45, credit: 'Crédit privé de la table' });

test('Le contrat vidéo borne les liens et impose un fond avec image par scène', () => {
  assert.equal(validVideoUrl('https://video.invalid/brume.mp4?version=fictive#extrait'), true);
  for (const url of ['http://video.invalid/a.mp4', '//video.invalid/a.webm', 'https://a:b@video.invalid/a.mp4',
    'https://video.invalid/a\n.mp4', 'https:\\video.invalid\\a.mp4', 'data:video/mp4;base64,AA==',
    'blob:https://video.invalid/id', 'javascript:alert(1)', 'file:///a.mp4', 'https://video.invalid/' + 'x'.repeat(2048)]) {
    assert.equal(validVideoUrl(url), false);
  }
  const value = video();
  assert.equal(validSceneVideo(value), true);
  assert.equal(validateSceneVideos([value], new Set(['scene'])), true);
  assert.equal(validateSceneVideos([], new Set()), true);
  assert.equal(videoForScene(undefined, 'scene'), undefined);
  assert.deepEqual(videoForScene({ [VIDEO_KEY]: [value] }, 'scene'), value);
  for (const patch of [{ imageId: '' }, { sceneId: '' }, { imageId: 'x'.repeat(129) }, { dim: -1 }, { dim: 81 },
    { dim: 2.5 }, { dim: NaN }, { loop: 1 }, { credit: null }, { credit: 'x'.repeat(601) }, { html: '<video>' }]) {
    assert.equal(validSceneVideo({ ...value, ...patch }), false);
  }
  for (const values of [[value, value], [video('ailleurs')], [{ ...value, notes: 'Secret' }], {}, null]) {
    assert.throws(() => validateSceneVideos(values, new Set(['scene'])));
  }
  const missing = { ...value }; delete missing.imageId;
  assert.equal(validSceneVideo(missing), false);
});

async function setup(t, profile) {
  const fixture = await browserFixture(t), { page } = await fixture.open(profile);
  await page.goto(fixture.url);
  await page.evaluate(async () => {
    const { openStudioStore } = await import('./store.mjs');
    const store = await openStudioStore({ name: 'video-data-' + crypto.randomUUID(), injectFailure(stage, command) {
      const failure = window.videoFailure;
      if (failure?.stage === stage && failure.operationId === command.operationId) {
        window.videoFailure = undefined; throw new Error('INTERRUPTION_VIDEO_FICTIVE');
      }
    } });
    let campaign;
    const send = async (type, data) => campaign = await store.execute({ id: 'table-video', operationId: crypto.randomUUID(),
      expectedRevision: campaign?.revision ?? 0, type, data });
    await send('create', { name: 'Table vidéo fictive', description: 'CANARI_CAMPAGNE_VIDEO', style: 'campaign', startingLevel: 5 });
    await send('save-character', { id: 'pj', name: 'Néria', level: 5, notes: 'CANARI_NOTES_PJ' });
    for (const id of ['scene', 'autre']) await send('save-scene', { id, title: 'Scène ' + id,
      description: 'Une rive', privateNotes: 'CANARI_SCENE_VIDEO', participantIds: ['pj'] });
    window.videoDataFixture = { store, campaign };
  });
  return page;
}

test('Les fonds vidéo se restaurent en v19 avec l’audio, les scènes et les champs privés intacts', { timeout: 40000 }, async t => {
  const page = await setup(t, 'video-backup');
  const result = await page.evaluate(async () => {
    const { store, campaign: original } = window.videoDataFixture;
    const { VIDEO_KEY } = await import('./video.mjs');
    const { openStudioStore, sha256 } = await import('./store.mjs');
    const { AUDIO_KEY } = await import('./audio.mjs');
    const restoredStore = await openStudioStore({ name: 'video-restauree-' + crypto.randomUUID() });
    let campaign = original;
    const send = async (type, data) => campaign = await store.execute({ id: campaign.id, operationId: crypto.randomUUID(),
      expectedRevision: campaign.revision, type, data });
    try {
      await send('save-audio-track', { id: 'pluie', name: 'Pluie privée', url: 'https://audio.invalid/pluie.wav', credit: 'Crédit audio' });
      const source = { sceneId: 'scene', url: 'https://video.invalid/brume.webm', imageId: 'image-heron-des-lanternes', loop: true, dim: 45, credit: 'CANARI_CREDIT_VIDEO' };
      await send('save-scene-video', source); source.url = 'https://video.invalid/mutation-externe.mp4';
      await send('save-scene-video', { sceneId: 'autre', url: 'https://video.invalid/feu.mp4', imageId: 'image-future-conservee', loop: false, dim: 80, credit: '' });
      const archive = JSON.parse(await store.exportBackup(campaign.id));
      archive.payload.campaign.extensionFictive = { conservation: 'CHAMP_OPAQUE_PRIVE' };
      archive.sha256 = await sha256(JSON.stringify(archive.payload));
      const preview = await restoredStore.previewBackup(JSON.stringify(archive));
      const restored = await restoredStore.restoreBackup(preview);
      return { version: archive.version, count: preview.videos, audio: restored[AUDIO_KEY], videos: campaign[VIDEO_KEY],
        restored: restored[VIDEO_KEY], opaque: restored.extensionFictive, privateJSON: JSON.stringify(restored[VIDEO_KEY]),
        charactersUnchanged: JSON.stringify(restored.characters) === JSON.stringify(original.characters),
        scenesUnchanged: JSON.stringify(restored.scenes) === JSON.stringify(original.scenes) };
    } finally { store.close(); restoredStore.close(); }
  });
  assert.equal(result.version, 19); assert.equal(result.count, 2);
  assert.deepEqual(result.restored, result.videos);
  assert.equal(result.videos[0].url, 'https://video.invalid/brume.webm');
  assert.equal(result.videos[1].imageId, 'image-future-conservee');
  assert.equal(result.audio.tracks[0].name, 'Pluie privée');
  assert.deepEqual(result.opaque, { conservation: 'CHAMP_OPAQUE_PRIVE' });
  assert.equal(result.charactersUnchanged, true); assert.equal(result.scenesUnchanged, true);
  assert.match(result.privateJSON, /CANARI_CREDIT_VIDEO/);
  assert.doesNotMatch(result.privateJSON, /data:video|blob:|base64|currentTime|playing|volume|CANARI_NOTES/);
});

test('Modifier ou retirer un fond ne touche ni les autres scènes ni leur ambiance', { timeout: 40000 }, async t => {
  const page = await setup(t, 'video-modifications');
  const result = await page.evaluate(async () => {
    const { store, campaign: original } = window.videoDataFixture;
    const { VIDEO_KEY } = await import('./video.mjs');
    let campaign = original;
    const send = async (type, data) => campaign = await store.execute({ id: campaign.id, operationId: crypto.randomUUID(),
      expectedRevision: campaign.revision, type, data });
    const source = sceneId => ({ sceneId, url: 'https://video.invalid/brume.webm', imageId: 'image-heron-des-lanternes', loop: true, dim: 45, credit: '' });
    try {
      await send('save-scene-ambiance', { sceneId: 'scene', id: 'ambiance', name: 'Nom privé', title: 'Titre approuvé', description: '', imageId: null });
      const before = structuredClone(campaign.scenes);
      await send('save-scene-video', source('scene'));
      await send('save-scene-video', source('autre'));
      await send('save-scene-video', { ...source('scene'), url: 'https://video.invalid/autre.mp4', dim: 0, loop: false });
      const changed = structuredClone(campaign[VIDEO_KEY]);
      await send('remove-scene-video', { sceneId: 'scene' });
      const remaining = structuredClone(campaign[VIDEO_KEY]);
      await send('remove-scene-video', { sceneId: 'autre' });
      return { changed, remaining, final: campaign[VIDEO_KEY], version: JSON.parse(await store.exportBackup(campaign.id)).version,
        scenesUnchanged: JSON.stringify(campaign.scenes) === JSON.stringify(before) };
    } finally { store.close(); }
  });
  assert.equal(result.changed.length, 2); assert.equal(result.changed[0].dim, 0); assert.equal(result.changed[0].loop, false);
  assert.deepEqual(result.remaining.map(item => item.sceneId), ['autre']); assert.deepEqual(result.final, []);
  assert.equal(result.version, 19); assert.equal(result.scenesUnchanged, true);
});

test('L’écriture vidéo est atomique, rejouable et refuse les commandes périmées ou invalides', { timeout: 40000 }, async t => {
  const page = await setup(t, 'video-transactions');
  const result = await page.evaluate(async () => {
    const { store, campaign } = window.videoDataFixture;
    const { VIDEO_KEY } = await import('./video.mjs');
    const failure = async command => { try { await store.execute(command); return null; } catch (error) { return error.code ?? error.message; } };
    const source = { sceneId: 'scene', url: 'https://video.invalid/brume.webm', imageId: 'image-heron-des-lanternes', loop: true, dim: 45, credit: '' };
    const command = { id: campaign.id, operationId: 'video-idempotente', expectedRevision: campaign.revision, type: 'save-scene-video', data: source };
    try {
      window.videoFailure = { stage: 'before-commit', operationId: command.operationId };
      const aborted = await failure(command), unchanged = JSON.stringify(await store.get(campaign.id)) === JSON.stringify(campaign);
      window.videoFailure = { stage: 'after-commit', operationId: command.operationId };
      const lost = await failure(command), replay = await store.execute(command), again = await store.execute(command);
      const stale = await failure({ ...command, operationId: 'video-perimee', data: { ...source, dim: 0 } });
      const reused = await failure({ ...command, data: { ...source, dim: 0 } });
      const invalid = [];
      for (const [type, data] of [
        ['save-scene-video', { ...source, url: 'https://a:b@video.invalid/prive.mp4' }],
        ['save-scene-video', { ...source, imageId: '' }], ['save-scene-video', { ...source, dim: 81 }],
        ['save-scene-video', { ...source, html: '<video autoplay>' }],
        ['save-scene-video', { ...source, sceneId: 'ailleurs' }],
        ['remove-scene-video', { sceneId: 'ailleurs' }], ['remove-scene-video', { sceneId: 'autre' }],
      ]) invalid.push(await failure({ id: campaign.id, operationId: crypto.randomUUID(), expectedRevision: replay.revision, type, data }));
      return { aborted, unchanged, lost, stale, reused, invalid, revisions: [replay.revision, again.revision, (await store.get(campaign.id)).revision], count: replay[VIDEO_KEY].length };
    } finally { store.close(); }
  });
  assert.equal(result.aborted, 'INTERRUPTION_VIDEO_FICTIVE'); assert.equal(result.unchanged, true); assert.equal(result.lost, 'INTERRUPTION_VIDEO_FICTIVE');
  assert.equal(result.stale, 'conflict'); assert.equal(result.reused, 'conflict'); assert.equal(result.invalid.every(Boolean), true);
  assert.equal(new Set(result.revisions).size, 1); assert.equal(result.count, 1);
});

test('La v18 audio reste lisible et les vidéos imposent la v19 sans accepter les formats futurs', { timeout: 40000 }, async t => {
  const page = await setup(t, 'video-versions');
  const result = await page.evaluate(async () => {
    const { store, campaign: original } = window.videoDataFixture;
    const { VIDEO_KEY } = await import('./video.mjs'), { sha256 } = await import('./store.mjs');
    const failure = async archive => { try { await store.previewBackup(JSON.stringify(archive)); return null; } catch (error) { return error.code; } };
    let campaign = original;
    const send = async (type, data) => campaign = await store.execute({ id: campaign.id, operationId: crypto.randomUUID(), expectedRevision: campaign.revision, type, data });
    try {
      const legacy = JSON.parse(await store.exportBackup(campaign.id)), versions = [];
      for (let version = 1; version <= 18; version++) versions.push((await store.previewBackup(JSON.stringify({ ...legacy, version }))).videos);
      await send('save-audio-track', { id: 'pluie', name: 'Pluie', url: 'https://audio.invalid/pluie.wav', credit: '' });
      const audio = JSON.parse(await store.exportBackup(campaign.id));
      const audioPreview = await store.previewBackup(JSON.stringify(audio));
      await send('save-scene-video', { sceneId: 'scene', url: 'https://video.invalid/brume.webm', imageId: 'image-heron-des-lanternes', loop: true, dim: 45, credit: '' });
      const archive = JSON.parse(await store.exportBackup(campaign.id));
      const future = await failure({ ...archive, version: 999 }), downgrade = await failure({ ...archive, version: 18 });
      archive.payload.campaign[VIDEO_KEY][0].sceneId = 'fantome';
      archive.sha256 = await sha256(JSON.stringify(archive.payload));
      const foreign = await failure(archive);
      delete archive.payload.campaign[VIDEO_KEY]; archive.version = 18;
      archive.sha256 = await sha256(JSON.stringify(archive.payload));
      const journalDowngrade = await failure(archive);
      return { versions, audioVersion: audio.version, audioCount: audioPreview.audioTracks, future, downgrade, foreign, journalDowngrade,
        unchanged: JSON.stringify(await store.get(campaign.id)) === JSON.stringify(campaign) };
    } finally { store.close(); }
  });
  assert.deepEqual(result.versions, Array(18).fill(0)); assert.equal(result.audioVersion, 18); assert.equal(result.audioCount, 1);
  assert.equal(result.future, 'backup-version'); assert.equal(result.downgrade, 'backup-version');
  assert.equal(result.foreign, 'invalid-data'); assert.equal(result.journalDowngrade, 'backup-version'); assert.equal(result.unchanged, true);
});

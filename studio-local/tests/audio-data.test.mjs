import assert from 'node:assert/strict';
import { test } from 'node:test';
import { AUDIO_KEY, AUDIO_LIMITS, audioLibrary, validAudioUrl, validateAudioLibrary } from '../audio.mjs';
import { browserFixture } from './browser.mjs';

const track = (id = 'pluie') => ({ id, name: 'Pluie fictive', url: 'https://audio.invalid/pluie.wav', credit: 'Source fictive de test' });
const playlist = (trackIds = ['pluie']) => ({ id: 'soir', name: 'Soir de pluie', trackIds, loop: false });

test('Les sources audio restent des liens HTTPS bornés et les références privées sont cohérentes', () => {
  assert.equal(validAudioUrl('https://audio.invalid/piste.mp3?jeton=fictif#extrait'), true);
  for (const url of ['http://audio.invalid/pluie.wav', '//audio.invalid/a.mp3', 'https://user:secret@audio.invalid/a.mp3',
    'https://audio.invalid/a\n.mp3', 'https:\\audio.invalid\\a.wav', 'javascript:alert(1)', 'blob:https://audio.invalid/id',
    'data:audio/wav;base64,AA==', 'file:///a.wav', 'https://audio.invalid/' + 'x'.repeat(2048)]) assert.equal(validAudioUrl(url), false);
  assert.deepEqual(audioLibrary({}), { tracks: [], playlists: [], scenePlaylists: [] });
  const valid = { tracks: [track()], playlists: [playlist(['pluie', 'pluie'])], scenePlaylists: [{ sceneId: 'scene', playlistId: 'soir' }] };
  assert.equal(validateAudioLibrary(valid, new Set(['scene'])), true);
  const changed = patch => ({ ...structuredClone(valid), ...patch });
  for (const library of [changed({ tracks: [track(), track()] }), changed({ playlists: [playlist(['absente'])] }),
    changed({ scenePlaylists: [{ sceneId: 'ailleurs', playlistId: 'soir' }] }),
    changed({ scenePlaylists: [{ sceneId: 'scene', playlistId: 'absente' }] }),
    changed({ scenePlaylists: [valid.scenePlaylists[0], valid.scenePlaylists[0]] }),
    changed({ tracks: [{ ...track(), sourceHTML: '<iframe>' }] }), { ...valid, future: true },
    changed({ tracks: Array.from({ length: AUDIO_LIMITS.tracks + 1 }, (_, i) => track('p' + i)) }),
    changed({ playlists: [{ ...playlist(), trackIds: Array(AUDIO_LIMITS.tracksPerPlaylist + 1).fill('pluie') }] }),
    changed({ playlists: Array.from({ length: AUDIO_LIMITS.playlists + 1 }, (_, i) => ({ ...playlist(), id: 'l' + i })) }),
    changed({ tracks: [{ ...track(), credit: 'x'.repeat(601) }] }), changed({ tracks: [{ ...track(), name: 'x'.repeat(161) }] })]) {
    assert.throws(() => validateAudioLibrary(library, new Set(['scene'])));
  }
  assert.equal(validateAudioLibrary({ tracks: [], playlists: [playlist([])], scenePlaylists: [] }, new Set()), true);
});

async function setup(t, profile) {
  const f = await browserFixture(t), { page } = await f.open(profile);
  await page.goto(f.url);
  await page.evaluate(async () => {
    const { openStudioStore } = await import('./store.mjs');
    const store = await openStudioStore({ name: 'regie-data-' + crypto.randomUUID(), injectFailure(stage, command) {
      const failure = window.audioFailure;
      if (failure?.stage === stage && failure.operationId === command.operationId) { window.audioFailure = undefined; throw new Error('INTERRUPTION_FICTIVE'); }
    } });
    let campaign;
    const send = async (type, data) => campaign = await store.execute({ id: 'table-sonore', operationId: crypto.randomUUID(), expectedRevision: campaign?.revision ?? 0, type, data });
    await send('create', { name: 'Table sonore fictive', description: 'CANARI_MJ_SONORE', style: 'campaign', startingLevel: 5 });
    await send('save-character', { id: 'pj', name: 'Néria', level: 5, notes: 'CANARI_NOTES_PJ' });
    await send('save-scene', { id: 'scene', title: 'Le gué', description: 'Un passage attend.', privateNotes: 'CANARI_SCENE_SONORE', participantIds: ['pj'] });
    window.audioDataFixture = { store, campaign };
  });
  return page;
}

test('Playlists ordonnées, copies indépendantes et sauvegarde v18 se restaurent avec leurs seules métadonnées', { timeout: 40000 }, async t => {
  const page = await setup(t, 'audio-backup');
  const result = await page.evaluate(async () => {
    const { store, campaign: original } = window.audioDataFixture;
    const { AUDIO_KEY } = await import('./audio.mjs'), { openStudioStore, sha256 } = await import('./store.mjs');
    let campaign = original;
    const send = async (type, data) => campaign = await store.execute({ id: campaign.id, operationId: crypto.randomUUID(), expectedRevision: campaign.revision, type, data });
    const restoredStore = await openStudioStore({ name: 'audio-restauration-' + crypto.randomUUID() });
    try {
      await send('save-audio-track', { id: 'pluie', name: 'Pluie fictive', url: 'https://audio.invalid/pluie.wav', credit: 'Source fictive' });
      await send('save-audio-track', { id: 'vent', name: 'Vent fictif', url: 'https://audio.invalid/vent.ogg', credit: '' });
      const data = { id: 'soir', name: 'Au gué', trackIds: ['vent', 'pluie', 'vent'], loop: true };
      await send('save-audio-playlist', data); data.trackIds.push('pluie');
      await send('set-scene-playlist', { sceneId: 'scene', playlistId: 'soir' });
      const archive = JSON.parse(await store.exportBackup(campaign.id));
      archive.payload.campaign.extensionFictive = { conservation: 'CHAMP_OPAQUE_PRIVE' };
      archive.sha256 = await sha256(JSON.stringify(archive.payload));
      const preview = await restoredStore.previewBackup(JSON.stringify(archive));
      const restored = await restoredStore.restoreBackup(preview);
      const after = await restoredStore.execute({ id: restored.id, operationId: 'modifier-piste', expectedRevision: restored.revision,
        type: 'save-audio-track', data: { id: 'pluie', name: 'Pluie renommée', url: 'https://audio.invalid/autre.wav', credit: 'Crédit modifié' } });
      return { version: archive.version, library: campaign[AUDIO_KEY], restored: restored[AUDIO_KEY], summary: [preview.audioTracks, preview.audioPlaylists],
        opaque: after.extensionFictive, charactersUnchanged: JSON.stringify(after.characters) === JSON.stringify(original.characters),
        scenesUnchanged: JSON.stringify(after.scenes) === JSON.stringify(original.scenes), name: after[AUDIO_KEY].tracks[0].name,
        json: JSON.stringify(archive.payload.campaign[AUDIO_KEY]) };
    } finally { store.close(); restoredStore.close(); }
  });
  assert.equal(result.version, 18); assert.deepEqual(result.summary, [2, 1]);
  assert.deepEqual(result.library.playlists[0].trackIds, ['vent', 'pluie', 'vent']); assert.deepEqual(result.restored, result.library);
  assert.equal(result.charactersUnchanged, true); assert.equal(result.scenesUnchanged, true); assert.equal(result.name, 'Pluie renommée');
  assert.deepEqual(result.opaque, { conservation: 'CHAMP_OPAQUE_PRIVE' });
  assert.doesNotMatch(result.json, /data:audio|blob:|base64|currentTime|playing|volume|CANARI_/);
});

test('Retirer une piste nettoie ses occurrences et retirer une playlist libère ses scènes', { timeout: 40000 }, async t => {
  const page = await setup(t, 'audio-suppressions');
  const result = await page.evaluate(async () => {
    const { store, campaign: original } = window.audioDataFixture;
    const { AUDIO_KEY } = await import('./audio.mjs');
    let campaign = original;
    const send = async (type, data) => campaign = await store.execute({ id: campaign.id, operationId: crypto.randomUUID(), expectedRevision: campaign.revision, type, data });
    try {
      await send('save-audio-track', { id: 'pluie', name: 'Pluie', url: 'https://audio.invalid/pluie.wav', credit: '' });
      await send('save-audio-track', { id: 'vent', name: 'Vent', url: 'https://audio.invalid/vent.wav', credit: '' });
      await send('save-audio-playlist', { id: 'soir', name: 'Soir', trackIds: ['pluie', 'vent', 'pluie'], loop: false });
      await send('set-scene-playlist', { sceneId: 'scene', playlistId: 'soir' });
      await send('remove-audio-track', { id: 'pluie' });
      const remaining = structuredClone(campaign[AUDIO_KEY]);
      await send('remove-audio-track', { id: 'vent' });
      const empty = structuredClone(campaign[AUDIO_KEY]);
      await send('set-scene-playlist', { sceneId: 'scene', playlistId: null });
      const detached = campaign[AUDIO_KEY].scenePlaylists.length;
      await send('set-scene-playlist', { sceneId: 'scene', playlistId: 'soir' });
      await send('remove-audio-playlist', { id: 'soir' });
      const version = JSON.parse(await store.exportBackup(campaign.id)).version;
      return { remaining, empty, detached, final: campaign[AUDIO_KEY], version };
    } finally { store.close(); }
  });
  assert.deepEqual(result.remaining.playlists[0].trackIds, ['vent']); assert.deepEqual(result.empty.playlists[0].trackIds, []);
  assert.equal(result.empty.scenePlaylists.length, 1); assert.equal(result.detached, 0);
  assert.deepEqual(result.final, { tracks: [], playlists: [], scenePlaylists: [] }); assert.equal(result.version, 18);
});

test('La régie audio est atomique, rejouable et refuse les révisions et références périmées', { timeout: 40000 }, async t => {
  const page = await setup(t, 'audio-transactions');
  const result = await page.evaluate(async () => {
    const { store, campaign } = window.audioDataFixture;
    const { AUDIO_KEY } = await import('./audio.mjs');
    const failure = async command => { try { await store.execute(command); return null; } catch (e) { return e.code ?? e.message; } };
    const command = { id: campaign.id, operationId: 'piste-idempotente', expectedRevision: campaign.revision, type: 'save-audio-track',
      data: { id: 'pluie', name: 'Pluie', url: 'https://audio.invalid/pluie.wav', credit: '' } };
    try {
      window.audioFailure = { stage: 'before-commit', operationId: command.operationId };
      const aborted = await failure(command), unchanged = JSON.stringify(await store.get(campaign.id)) === JSON.stringify(campaign);
      window.audioFailure = { stage: 'after-commit', operationId: command.operationId };
      const lost = await failure(command), replay = await store.execute(command), again = await store.execute(command);
      const stale = await failure({ ...command, operationId: 'piste-perimee', data: { ...command.data, id: 'vent' } });
      const invalid = [];
      for (const [type, data] of [
        ['save-audio-track', { ...command.data, url: 'https://a:b@audio.invalid/prive.wav' }],
        ['save-audio-track', { ...command.data, html: '<script>' }],
        ['save-audio-playlist', { id: 'soir', name: 'Soir', trackIds: ['absente'], loop: false }],
        ['save-audio-playlist', { id: 'pluie', name: 'Collision', trackIds: ['pluie'], loop: true }],
        ['set-scene-playlist', { sceneId: 'ailleurs', playlistId: null }],
        ['set-scene-playlist', { sceneId: 'scene', playlistId: 'absente' }],
        ['remove-audio-track', { id: 'absente' }], ['remove-audio-playlist', { id: 'absente' }],
      ]) invalid.push(await failure({ id: campaign.id, operationId: crypto.randomUUID(), expectedRevision: replay.revision, type, data }));
      return { aborted, unchanged, lost, stale, revisions: [replay.revision, again.revision, (await store.get(campaign.id)).revision],
        tracks: replay[AUDIO_KEY].tracks.length, invalid };
    } finally { store.close(); }
  });
  assert.equal(result.aborted, 'INTERRUPTION_FICTIVE'); assert.equal(result.unchanged, true); assert.equal(result.lost, 'INTERRUPTION_FICTIVE');
  assert.equal(result.stale, 'conflict'); assert.equal(new Set(result.revisions).size, 1); assert.equal(result.tracks, 1);
  assert.equal(result.invalid.every(Boolean), true);
});

test('Les versions antérieures restent lisibles et les sauvegardes incohérentes ou futures sont refusées', { timeout: 40000 }, async t => {
  const page = await setup(t, 'audio-versions');
  const result = await page.evaluate(async () => {
    const { store, campaign } = window.audioDataFixture;
    const { AUDIO_KEY } = await import('./audio.mjs'), { sha256 } = await import('./store.mjs');
    const failure = async archive => { try { await store.previewBackup(JSON.stringify(archive)); return null; } catch (e) { return e.code; } };
    try {
      const legacy = JSON.parse(await store.exportBackup(campaign.id));
      const versions = [];
      for (let version = 1; version <= 17; version++) {
        const preview = await store.previewBackup(JSON.stringify({ ...legacy, version }));
        versions.push([preview.audioTracks, preview.audioPlaylists]);
      }
      const current = await store.execute({ id: campaign.id, operationId: 'piste-v18', expectedRevision: campaign.revision, type: 'save-audio-track',
        data: { id: 'pluie', name: 'Pluie', url: 'https://audio.invalid/pluie.wav', credit: '' } });
      const archive = JSON.parse(await store.exportBackup(current.id));
      const future = await failure({ ...archive, version: 999 }), downgrade = await failure({ ...archive, version: 17 });
      archive.payload.campaign[AUDIO_KEY].scenePlaylists.push({ sceneId: 'scene', playlistId: 'fantome' });
      archive.sha256 = await sha256(JSON.stringify(archive.payload));
      const invalidReference = await failure(archive);
      delete archive.payload.campaign[AUDIO_KEY];
      archive.version = 17; archive.sha256 = await sha256(JSON.stringify(archive.payload));
      const journalDowngrade = await failure(archive);
      return { versions, future, downgrade, invalidReference, journalDowngrade, unchanged: JSON.stringify(await store.get(current.id)) === JSON.stringify(current) };
    } finally { store.close(); }
  });
  assert.deepEqual(result.versions, Array.from({ length: 17 }, () => [0, 0]));
  assert.equal(result.future, 'backup-version'); assert.equal(result.downgrade, 'backup-version');
  assert.equal(result.invalidReference, 'invalid-data'); assert.equal(result.journalDowngrade, 'backup-version'); assert.equal(result.unchanged, true);
});

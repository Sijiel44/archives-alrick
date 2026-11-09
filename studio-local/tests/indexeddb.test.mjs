import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { test } from "node:test";
import { browserFixture } from "./browser.mjs";

const database = "studio-test-fictif";
const id = "campagne-fictive";
const campaignInfo = {
  name: "Le bivouac fictif",
  description: "Amorce de test",
  style: "one-shot",
  startingLevel: 10,
};
const character = { id: "pj-ada", name: "Ada fictive", level: 10, notes: "Note MJ fictive" };
const creature = {
  id: "instance-loutre",
  name: "Loutre témoin",
  description: "Fiche descriptive de test",
  source: { id: "demo-loutre", version: "1" },
};
const scene = {
  id: "scene-bivouac",
  title: "Le bivouac",
  description: "Une lanterne",
  privateNotes: "CANARI_IDB_860C6D",
  participantIds: [character.id, creature.id],
};

function command(operationId, expectedRevision, type, data, campaignId = id) {
  return { id: campaignId, operationId, expectedRevision, type, data };
}

async function startConnection(page, url) {
  await page.goto(url);
  await page.evaluate(async name => {
    const { openStudioStore } = await import("/store.mjs");
    window.testStore = await openStudioStore({
      name,
      injectFailure(stage) {
        if (window.testFailpoint === stage) throw new Error(stage);
      },
    });
  }, database);
}

function call(page, method, ...args) {
  return page.evaluate(({ method, args }) => window.testStore[method](...args), { method, args });
}

function outcome(page, method, ...args) {
  return page.evaluate(async ({ method, args }) => {
    try {
      return { ok: true, value: await window.testStore[method](...args) };
    } catch (error) {
      return { ok: false, error: error.code ?? error.message };
    }
  }, { method, args });
}

function makeArchive(archive, update) {
  const copy = structuredClone(archive);
  update(copy);
  copy.sha256 = createHash("sha256").update(JSON.stringify(copy.payload)).digest("hex");
  return JSON.stringify(copy);
}

test("IndexedDB réel avec deux onglets, concurrence et reprise après acquittement perdu", { timeout: 40000 }, async t => {
  const fixture = await browserFixture(t);
  const { page: first, context } = await fixture.open("transactions");
  const second = await context.newPage();
  await Promise.all([startConnection(first, fixture.url), startConnection(second, fixture.url)]);
  assert.equal(await call(first, "get", id), null);
  const create = command("create", 0, "create", campaignInfo);
  assert.equal((await call(first, "execute", create)).revision, 1);
  assert.deepEqual(await outcome(first, "execute", { ...create, operationId: "missing-revision", expectedRevision: undefined }), {
    ok: false, error: "invalid-data",
  });
  await call(first, "execute", command("save-ada", 1, "save-character", character));

  const copy = command("copy-1", 2, "copy-creature", creature);
  await first.evaluate(() => { window.testFailpoint = "before-commit"; });
  assert.deepEqual(await outcome(first, "execute", copy), { ok: false, error: "before-commit" });
  const before = JSON.parse(await call(second, "exportBackup", id)).payload;
  assert.equal(before.campaign.revision, 2);
  assert.deepEqual(before.campaign.creatures, []);
  assert.equal(before.journal.length, 2);

  await first.evaluate(() => { window.testFailpoint = "after-commit"; });
  assert.deepEqual(await outcome(first, "execute", copy), { ok: false, error: "after-commit" });
  const replayed = await call(second, "execute", copy);
  assert.equal(replayed.revision, 3);
  assert.deepEqual(replayed.creatures, [creature]);
  const divergentCopy = { ...copy, data: { ...creature, name: "Contenu divergent" } };
  assert.deepEqual(await outcome(second, "execute", divergentCopy), { ok: false, error: "conflict" });
  assert.equal(JSON.parse(await call(second, "exportBackup", id)).payload.journal.length, 3);
  await first.evaluate(() => { window.testFailpoint = null; });

  const foreignCampaign = "campagne-etrangere";
  const foreignCharacter = { ...character, id: "pj-etranger" };
  await call(second, "execute", command("create", 0, "create", campaignInfo, foreignCampaign));
  await call(second, "execute", command("add-foreign-pj", 1, "save-character", foreignCharacter, foreignCampaign));
  const invalidScene = { ...scene, participantIds: [foreignCharacter.id] };
  assert.deepEqual(await outcome(second, "execute", command("foreign", 3, "save-scene", invalidScene)), {
    ok: false, error: "foreign-key",
  });
  assert.equal((await call(first, "get", id)).revision, 3);

  const commands = [
    command("scene-a", 3, "save-scene", scene),
    command("scene-b", 3, "save-scene", { ...scene, id: "scene-b", title: "Scène concurrente" }),
  ];
  const results = await Promise.all([outcome(first, "execute", commands[0]), outcome(second, "execute", commands[1])]);
  assert.equal(results.filter(result => result.ok).length, 1);
  const lostIndex = results.findIndex(result => !result.ok);
  assert.deepEqual(results[lostIndex], { ok: false, error: "conflict" });
  const stored = await call(first, "get", id);
  assert.equal(stored.revision, 4);
  assert.deepEqual(stored.scenes, [commands[1 - lostIndex].data]);
  const rebased = await call(second, "execute", {
    ...commands[lostIndex], operationId: "confirmed-second-scene", expectedRevision: stored.revision,
  });
  assert.equal(rebased.revision, 5);
  assert.deepEqual(rebased.scenes.map(({ id }) => id).sort(), [scene.id, "scene-b"].sort());
});

test("IndexedDB réel, fichiers corrompus, extensions inconnues, version et emplacement étranger", { timeout: 40000 }, async t => {
  const fixture = await browserFixture(t);
  const { page } = await fixture.open("validation");
  await startConnection(page, fixture.url);
  await call(page, "execute", command("create", 0, "create", campaignInfo));
  await call(page, "execute", command("add-pj", 1, "save-character", character));
  const archive = JSON.parse(await call(page, "exportBackup", id));
  const wrongVersion = JSON.stringify({ ...archive, version: 0 });
  const corrupt = JSON.stringify({ ...archive, sha256: "0".repeat(64) });
  const unknownEnvelope = JSON.stringify({ ...archive, external: true });
  const invalidPayload = makeArchive(archive, data => {
    data.payload.campaign.scenes = [{ ...scene, participantIds: ["missing"] }];
    data.payload.campaign.activeSceneId = scene.id;
  });
  for (const [input, error] of [
    [wrongVersion, "backup-version"], [corrupt, "invalid-backup"], ["{", "invalid-backup"],
    [unknownEnvelope, "invalid-backup"], [invalidPayload, "foreign-key"],
  ]) {
    assert.deepEqual(await outcome(page, "previewBackup", input), { ok: false, error });
  }
  assert.equal(await call(page, "exportBackup", id), JSON.stringify(archive));

  const preserved = makeArchive(archive, data => {
    data.payload.campaign.id = "campagne-restauree";
    data.payload.campaign.extensionInconnue = { données: ["fictif", 12, null] };
    data.payload.campaign.characters[0].futureCharacterField = "à conserver";
  });
  const imported = await page.evaluate(async text => {
    const store = window.testStore;
    const preview = await store.previewBackup(text);
    const restore = await store.restoreBackup(preview);
    return { preview, restore };
  }, preserved);
  assert.equal(imported.preview.conflict, false);
  assert.deepEqual(imported.restore.extensionInconnue, { données: ["fictif", 12, null] });
  await call(page, "execute", command("edit-ada", 2, "save-character", { ...character, name: "Ada renommée" }, imported.restore.id));
  const updated = JSON.parse(await call(page, "exportBackup", imported.restore.id)).payload.campaign;
  assert.deepEqual(updated.extensionInconnue, imported.restore.extensionInconnue);
  assert.equal(updated.characters[0].futureCharacterField, "à conserver");

  const refused = await page.evaluate(async ({ database, id }) => {
    const badRow = { id, schema: "autre-application", payload: { legacy: "copie à préserver" } };
    const db = await new Promise((resolve, reject) => {
      const request = indexedDB.open(database, 1);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
    await new Promise((resolve, reject) => {
      const transaction = db.transaction("campaigns", "readwrite");
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error);
      transaction.objectStore("campaigns").put(badRow);
    });
    const request = db.transaction("campaigns").objectStore("campaigns").get(id);
    const original = await new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    db.close();
    return original;
  }, { database, id: "cle-etrangere" });
  assert.deepEqual(await outcome(page, "get", "cle-etrangere"), { ok: false, error: "foreign-key" });
  assert.deepEqual(await outcome(page, "execute", command("try-create", 0, "create", campaignInfo, "cle-etrangere")), {
    ok: false, error: "foreign-key",
  });
  const storedForeignRow = await page.evaluate(async ({ database, id }) => {
    const db = await new Promise((resolve, reject) => {
      const request = indexedDB.open(database, 1);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
    const row = await new Promise((resolve, reject) => {
      const request = db.transaction("campaigns").objectStore("campaigns").get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    db.close();
    return row;
  }, { database, id: "cle-etrangere" });
  assert.deepEqual(storedForeignRow, refused);

  const upgraded = await page.evaluate(async name => {
    const { openStudioStore } = await import("/store.mjs");
    await new Promise((resolve, reject) => {
      const request = indexedDB.open(name, 2);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => { request.result.close(); resolve(); };
    });
    try { await openStudioStore({ name }); }
    catch (error) { return error.code; }
  }, database);
  assert.equal(upgraded, "storage-version");
  assert.deepEqual(await outcome(page, "get", id), { ok: false, error: "storage" });
});

import assert from 'node:assert/strict';

// Attend la ressource courante sans retirer la vérification native de décodage.
export async function assertDecodedPortrait(locator, { maxWidth = 320 } = {}) {
  let image, phase = 'élément';
  try {
    image = await locator.elementHandle();
    assert.ok(image, 'Le portrait doit être présent.');
    phase = 'visibilité';
    await image.waitForElementState('visible', { timeout: 7500 });
    phase = 'chargement courant';
    const loaded = await locator.page().waitForFunction(image => image.isConnected && image.complete && image.naturalWidth > 0 &&
      image.currentSrc === image.getAttribute('src') && !image.hidden, image, { timeout: 7500 });
    await loaded.dispose();
    phase = 'décodage natif';
    const dimensions = await image.evaluate(async element => {
      await element.decode();
      return { width: element.naturalWidth, height: element.naturalHeight };
    });
    phase = 'dimensions';
    assert.ok(dimensions.width > 0 && dimensions.width <= maxWidth, 'Largeur de portrait hors limites.');
    assert.ok(dimensions.height > 0 && dimensions.height <= maxWidth, 'Hauteur de portrait hors limites.');
    return dimensions;
  } catch (error) {
    let diagnostic = { unavailable: true };
    if (image) {
      try {
        diagnostic = await image.evaluate(async element => {
          const source = element.getAttribute('src') || '';
          const dataPrefix = /^data:image\/[a-z0-9.+-]+;base64,/i.exec(source)?.[0];
          let protocol = 'inconnu';
          try { protocol = new URL(source, location.href).protocol; } catch { /* Pas d’URL complète dans le diagnostic. */ }
          const snapshot = { srcPrefix: dataPrefix || protocol, srcLength: source.length,
            currentSrcMatches: element.currentSrc === source, complete: element.complete,
            width: element.naturalWidth, height: element.naturalHeight,
            hidden: element.hidden, isConnected: element.isConnected };
          const clone = new Image();
          clone.src = source;
          let timer;
          snapshot.clone = await Promise.race([
            clone.decode().then(() => ({ decoded: true, width: clone.naturalWidth, height: clone.naturalHeight }),
              error => ({ decoded: false, errorName: error.name })),
            new Promise(resolve => { timer = setTimeout(() => resolve({ decoded: false, timeout: true }), 1000); }),
          ]);
          clearTimeout(timer);
          clone.removeAttribute('src');
          return snapshot;
        });
      } catch { /* Une page retirée peut empêcher la lecture des seules métadonnées. */ }
    }
    throw new Error(`Portrait invalide à l’étape ${phase} (${error.name}) : ${JSON.stringify(diagnostic)}`);
  } finally {
    await image?.dispose().catch(() => {});
  }
}

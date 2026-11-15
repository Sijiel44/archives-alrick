(() => {
  const owner = window.opener || (window.parent !== window && window.parent.opener);
  const ticket = location.hash.slice(1);
  if (!owner || !/^[a-f0-9-]{36}$/.test(ticket)) return;
  const container = document.getElementById('player-sheet');
  const message = container.firstElementChild;
  message.textContent = 'La présentation se prépare…';
  const { port1, port2 } = new MessageChannel();
  let label, staged, committed;
  const acknowledge = (requestId, ok) => {
    if (requestId) port1.postMessage({ type: 'presented', requestId, ok });
  };
  function discard(entry) {
    if (!entry) return;
    clearTimeout(entry.timer); entry.controller?.dispose(); entry.root.remove();
  }
  function cancel() {
    const previous = staged; staged = undefined;
    discard(previous);
    if (previous) acknowledge(previous.requestId, false);
  }
  function clear() {
    cancel(); discard(committed); committed = undefined;
    message.textContent = label === 'Fiche joueur' ? 'La fiche a été retirée par le MJ.' : 'La présentation a été retirée par le MJ.';
    container.replaceChildren(message);
  }
  function commit(entry) {
    if (staged !== entry || !entry.frameReady || !entry.mediaReady) return;
    staged = undefined; clearTimeout(entry.timer);
    const previous = committed; committed = entry;
    label = entry.label; document.title = `${label} · Chroniques d’Entre-Rives`;
    for (const child of [...container.children]) if (child !== entry.root) child.remove();
    previous?.controller?.dispose();
    entry.frame.hidden = false; entry.root.hidden = false;
    acknowledge(entry.requestId, true);
  }
  function attemptCommit(entry) {
    if (staged !== entry || !entry.frameReady || !entry.mediaReady || entry.prepared) return;
    entry.prepared = true;
    if (entry.requestId) port1.postMessage({ type: 'prepared', requestId: entry.requestId });
    else commit(entry);
  }
  function present(data) {
    const receivedLabel = data.type === 'sheet' ? 'Fiche joueur' : data.label;
    const requestId = typeof data.requestId === 'string' && /^[A-Za-z0-9:_-]{1,128}$/.test(data.requestId) ? data.requestId : undefined;
    if (typeof data.html !== 'string' || data.html.length > 12 * 1024 * 1024 ||
        !['Fiche joueur', 'Scène de jeu', 'Image de jeu'].includes(receivedLabel) ||
        (data.video !== undefined && (receivedLabel !== 'Scène de jeu' || !globalThis.EntreRivesVideo?.valid(data.video)))) {
      acknowledge(requestId, false); return;
    }
    cancel();
    const frame = document.createElement('iframe');
    frame.title = receivedLabel; frame.hidden = true; frame.setAttribute('sandbox', '');
    const entry = { requestId, frame, root: frame, label: receivedLabel, frameReady: false, mediaReady: !data.video };
    staged = entry;
    if (data.video) {
      try {
        const holder = document.createElement('div');
        entry.controller = globalThis.EntreRivesVideo.create(holder, data.video);
        entry.root = entry.controller.element;
        entry.root.hidden = true; frame.className = 'video-content-frame';
        entry.controller.content.append(frame);
        entry.controller.ready.then(ok => {
          if (staged !== entry) return;
          if (!ok) { cancel(); return; }
          entry.mediaReady = true; attemptCommit(entry);
        });
      } catch { cancel(); return; }
    }
    entry.timer = setTimeout(() => { if (staged === entry) cancel(); }, 12000);
    frame.addEventListener('load', () => {
      if (staged !== entry) return;
      entry.frameReady = true; attemptCommit(entry);
    }, { once: true });
    frame.srcdoc = data.html;
    container.append(entry.root);
  }
  port1.onmessage = ({ data }) => {
    if (data?.type === 'retire') {
      clear(); port1.close();
      if (window.parent === window) window.close();
    } else if (data?.type === 'cancel-presentation') {
      if (staged?.requestId === data.requestId) cancel();
    } else if (data?.type === 'commit-presentation') {
      if (staged?.requestId === data.requestId && staged.prepared) commit(staged);
    } else if (data?.type === 'presentation' || data?.type === 'sheet') present(data);
  };
  window.addEventListener('pagehide', () => {
    clear(); port1.postMessage({ type: 'retired' }); port1.close();
  }, { once: true });
  owner.postMessage({ type: 'studio-player-ready', ticket }, location.origin, [port2]);
  window.opener = null;
})();

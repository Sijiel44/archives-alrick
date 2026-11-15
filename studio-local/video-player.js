/* Shared by the MJ preview and the opaque player receiver. No campaign access. */
(() => {
  const record = value => value !== null && typeof value === 'object' &&
    [Object.prototype, null].includes(Object.getPrototypeOf(value));
  const exact = (value, fields) => record(value) && Object.keys(value).length === fields.length && fields.every(key => Object.hasOwn(value, key));
  function valid(value) {
    if (!exact(value, ['url', 'loop', 'dim', 'poster']) || typeof value.url !== 'string' || value.url.length > 2048 ||
        !value.url.startsWith('https://') || /[\s\u0000-\u001f\u007f\\]/u.test(value.url) ||
        typeof value.loop !== 'boolean' || !Number.isInteger(value.dim) || value.dim < 0 || value.dim > 80 ||
        !exact(value.poster, ['src', 'alt']) || typeof value.poster.src !== 'string' || value.poster.src.length > 8 * 1024 * 1024 ||
        !/^data:image\/png;base64,[A-Za-z0-9+/]+={0,2}$/.test(value.poster.src) ||
        typeof value.poster.alt !== 'string' || value.poster.alt.length > 2000) return false;
    try { const url = new URL(value.url); return Boolean(url.hostname) && url.protocol === 'https:' && !url.username && !url.password; }
    catch { return false; }
  }
  function create(container, value) {
    if (!valid(value)) throw new Error('Le fond vidéo contient des champs invalides.');
    const doc = container.ownerDocument;
    const make = (tag, className, text) => {
      const element = doc.createElement(tag);
      element.className = className;
      if (text !== undefined) element.textContent = text;
      return element;
    };
    const element = make('div', 'video-scene');
    const poster = make('img', 'video-poster');
    poster.alt = value.poster.alt;
    poster.src = value.poster.src;
    const media = make('video', 'video-background');
    media.muted = media.defaultMuted = true; media.volume = 0;
    media.playsInline = true; media.loop = value.loop; media.preload = 'auto';
    media.setAttribute('muted', ''); media.setAttribute('playsinline', '');
    media.setAttribute('aria-hidden', 'true'); media.tabIndex = -1; media.hidden = true;
    const dimmer = make('div', 'video-dimmer'); dimmer.style.opacity = String(value.dim / 100);
    const content = make('div', 'video-content');
    const controls = make('div', 'video-controls'); controls.setAttribute('role', 'group'); controls.setAttribute('aria-label', 'Fond vidéo');
    const toggle = make('button', 'video-toggle', 'Activer le mouvement'); toggle.type = 'button';
    const withdraw = make('button', 'video-withdraw', 'Retirer le fond'); withdraw.type = 'button';
    const status = make('p', 'video-status'); status.setAttribute('role', 'status'); status.setAttribute('aria-live', 'polite');
    controls.append(toggle, withdraw, status);
    element.append(poster, media, dimmer, content, controls);
    container.append(element);
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    let disposed = false, generation = 0, loading, committedReady = false, posterReady = false;
    let initialTimer, activationTimer;
    let settleReady;
    const ready = new Promise(resolve => { settleReady = resolve; });
    const finishReady = result => {
      if (!settleReady) return;
      clearTimeout(initialTimer); committedReady = result; settleReady(result); settleReady = undefined;
    };
    const message = text => { status.textContent = text; };
    function release() {
      ++generation;
      clearTimeout(activationTimer);
      loading?.(false); loading = undefined;
      media.pause(); media.removeAttribute('src'); media.load(); media.hidden = true;
      poster.hidden = false; poster.removeAttribute('aria-hidden');
      toggle.disabled = false; toggle.textContent = 'Activer le mouvement';
      element.dataset.videoState = 'poster';
    }
    function failed() {
      release(); message('Vidéo indisponible. L’image de remplacement reste affichée.');
      finishReady(false);
    }
    async function activate() {
      if (disposed || loading) return false;
      const token = ++generation;
      clearTimeout(activationTimer);
      activationTimer = setTimeout(() => { if (!disposed && token === generation) failed(); }, 12000);
      toggle.disabled = true; element.dataset.videoState = 'loading'; message('Chargement de la vidéo…');
      if (media.getAttribute('src') !== value.url) {
        const canPlay = new Promise(resolve => {
          let timer;
          const finish = success => {
            clearTimeout(timer); media.removeEventListener('loadeddata', loaded); media.removeEventListener('error', error);
            if (loading === finish) loading = undefined;
            resolve(success);
          };
          const loaded = () => finish(true), error = () => finish(false);
          loading = finish;
          media.addEventListener('loadeddata', loaded, { once: true }); media.addEventListener('error', error, { once: true });
          timer = setTimeout(() => finish(false), 10000);
          media.src = value.url; media.load();
        });
        if (!await canPlay) { if (!disposed && token === generation) failed(); return false; }
      }
      if (disposed || token !== generation) return false;
      media.muted = media.defaultMuted = true; media.volume = 0;
      if (media.ended) media.currentTime = 0;
      try {
        await media.play();
        if (disposed || token !== generation) return false;
        clearTimeout(activationTimer);
        media.hidden = false; poster.hidden = true; poster.setAttribute('aria-hidden', 'true');
        toggle.disabled = false; toggle.textContent = media.paused ? 'Reprendre le mouvement' : 'Pause du mouvement';
        element.dataset.videoState = media.paused ? 'paused' : 'playing';
        message(media.paused ? 'Mouvement en pause.' : 'Fond vidéo muet en lecture.');
        finishReady(true); return true;
      } catch (error) {
        if (disposed || token !== generation) return false;
        if (error?.name === 'NotAllowedError') {
          clearTimeout(activationTimer);
          media.pause(); media.hidden = true; poster.hidden = false;
          toggle.disabled = false; toggle.textContent = 'Activer le mouvement';
          element.dataset.videoState = 'poster'; message('Le navigateur attend une activation. L’image de remplacement reste affichée.');
          finishReady(true); return true;
        }
        failed(); return false;
      }
    }
    toggle.addEventListener('click', () => {
      if (!media.paused && media.hasAttribute('src')) {
        ++generation; clearTimeout(activationTimer); media.pause(); toggle.textContent = 'Reprendre le mouvement';
        element.dataset.videoState = 'paused'; message('Mouvement en pause.');
      } else void activate();
    });
    withdraw.addEventListener('click', () => { release(); finishReady(false); message('Fond vidéo retiré. L’image de remplacement reste affichée.'); });
    const reduce = event => {
      if (!event.matches || disposed) return;
      release(); message('Mouvement réduit : image de remplacement. Activez le mouvement si vous le souhaitez.');
      if (posterReady) finishReady(true);
    };
    motion.addEventListener('change', reduce);
    media.addEventListener('volumechange', () => { if (!disposed && (!media.muted || media.volume !== 0)) { media.muted = true; media.volume = 0; } });
    media.addEventListener('playing', () => {
      if (disposed || !media.hasAttribute('src') || media.paused || media.readyState < 2) return;
      media.hidden = false; poster.hidden = true; poster.setAttribute('aria-hidden', 'true');
      toggle.disabled = false; toggle.textContent = 'Pause du mouvement';
      element.dataset.videoState = 'playing'; message('Fond vidéo muet en lecture.');
    });
    media.addEventListener('pause', () => {
      if (disposed || !media.hasAttribute('src') || media.hidden || !media.paused || media.ended) return;
      toggle.disabled = false; toggle.textContent = 'Reprendre le mouvement';
      element.dataset.videoState = 'paused'; message('Mouvement en pause.');
    });
    for (const event of ['waiting', 'stalled']) media.addEventListener(event, () => {
      if (disposed || !media.hasAttribute('src') || media.hidden || media.paused || media.readyState >= 3) return;
      toggle.disabled = false; toggle.textContent = 'Pause du mouvement';
      element.dataset.videoState = 'buffering'; message('Mise en mémoire tampon… Pause et retrait restent disponibles.');
    });
    media.addEventListener('ended', () => {
      if (!disposed && media.hasAttribute('src') && !media.hidden && media.ended && !value.loop) {
        toggle.textContent = 'Reprendre le mouvement'; element.dataset.videoState = 'paused'; message('Fin de la vidéo.');
      }
    });
    media.addEventListener('error', () => { if (!disposed && !loading && media.hasAttribute('src') && committedReady) failed(); });
    const dispose = () => {
      if (disposed) return;
      disposed = true; release(); finishReady(false); motion.removeEventListener('change', reduce);
      window.removeEventListener('pagehide', dispose); element.remove();
    };
    window.addEventListener('pagehide', dispose);
    initialTimer = setTimeout(() => { if (!disposed && settleReady) failed(); }, 12000);
    poster.decode().then(() => {
      if (disposed || (!settleReady && !committedReady)) return;
      posterReady = true;
      if (motion.matches) { message('Mouvement réduit : image de remplacement. Activez le mouvement si vous le souhaitez.'); finishReady(true); }
      else void activate();
    }).catch(() => { if (!disposed && (settleReady || committedReady)) failed(); });
    return { ready, activate, dispose, element, content };
  }
  globalThis.EntreRivesVideo = Object.freeze({ create, valid });
})();

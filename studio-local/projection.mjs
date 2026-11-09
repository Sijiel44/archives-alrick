import { PLAY_STATS } from "./store.mjs";

export function createProjection(scene, fields) {
  const projection = {};
  if (fields.title === true) projection.title = scene.title;
  if (fields.description === true) projection.description = scene.description;
  return projection;
}

export function createPlayerProjection(character, source, hp, fields) {
  const sections = [];
  const identity = [];
  if (fields.has("identity")) {
    identity.push(["Niveau", source.level]);
    if (typeof source.profession === "string" && source.profession.trim()) identity.push(["Métier", source.profession]);
  }
  if (identity.length) sections.push({ title: "Identité", rows: identity });
  const resources = [];
  if (fields.has("hp")) resources.push(["Points de vie", `${hp} / ${source.pvMax}`]);
  if (fields.has("mana")) resources.push(["Mana", `${source.mana} / ${source.manaMax}`]);
  if (fields.has("xp")) resources.push(["Expérience", `${source.xp} XP`]);
  if (resources.length) sections.push({ title: "Ressources", rows: resources });
  if (fields.has("stats")) sections.push({ title: "Caractéristiques",
    rows: Object.entries(PLAY_STATS).map(([key, label]) => [label, source.stats[key]]) });
  if (fields.has("masteries")) {
    const rows = Object.entries(source.masteries).filter(([, rank]) => rank > 0);
    sections.push({ title: "Maîtrises", rows, empty: "Aucune maîtrise de rang positif." });
  }
  if (fields.has("inventory")) {
    const items = Array.isArray(source.inventory) ? source.inventory : [];
    const rows = items.filter(item => typeof item?.name === "string" && item.name.trim())
      .map(item => [item.name, Number.isSafeInteger(item.quantity) && item.quantity > 0 ? `× ${item.quantity}` : ""]);
    sections.push({ title: "Inventaire", rows, empty: "Aucun objet dans la fiche." });
  }
  return { title: fields.has("name") ? character.name : "Fiche joueur", sections };
}

function escapeText(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function projectionDocument(contents, css = "", withImage = false) {
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none';${withImage ? " img-src data:;" : ""} style-src 'unsafe-inline'; form-action 'none'; base-uri 'none'">
    <title>Projection des joueurs</title><style>
      :root { color-scheme: dark; background: #171d24; color: #f3ede1; }
      body { margin: 0; padding: 1.5rem; font: 1rem/1.65 system-ui, sans-serif; }
      h1 { font: 1.65rem/1.25 Georgia, serif; margin: 0 0 0.75rem; color: #d8b56c; }
      p { margin: 0; white-space: pre-wrap; overflow-wrap: anywhere; }
      ${css}
    </style></head><body><main>${contents}</main></body></html>`;
}

export function showPresentation(container, { label, html }) {
  const frame = container.ownerDocument.createElement("iframe");
  frame.title = label;
  frame.setAttribute("sandbox", "");
  frame.srcdoc = html;
  container.replaceChildren(frame);
}

export async function loadPresentationImage(art) {
  const url = new URL(art.src, location.href);
  const mediaPath = new URL('./media/', import.meta.url).pathname;
  if (url.origin !== location.origin || url.search || url.hash ||
      !url.pathname.startsWith(mediaPath) ||
      !/^(?:[a-z0-9-]+\.webp|atlas\/[a-z0-9-]+\.svg)$/.test(url.pathname.slice(mediaPath.length))) {
    throw new Error("Cette image ne fait pas partie des médias locaux.");
  }
  const image = new Image();
  image.src = url.href;
  await image.decode();
  const scale = Math.min(1, 2048 / Math.max(image.naturalWidth, image.naturalHeight));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
  canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
  const src = canvas.toDataURL("image/png");
  if (src.length > 8 * 1024 * 1024) throw new Error("L’image est trop volumineuse pour la projection.");
  return { src, alt: art.alt, map: Boolean(art.map) };
}

export function scenePresentation(projection, image, label = "Scène de jeu") {
  const title = typeof projection.title === "string" ? `<h1>${escapeText(projection.title)}</h1>` : "";
  const description = typeof projection.description === "string" ? `<p>${escapeText(projection.description)}</p>` : "";
  const illustration = image && /^data:image\/png;base64,[A-Za-z0-9+/]+={0,2}$/.test(image.src)
    ? `<figure${image.map ? ' class="map"' : ''}><img src="${image.src}" alt="${escapeText(image.alt).replaceAll('"', '&quot;')}"></figure>` : "";
  return { label, html: projectionDocument(title + description + illustration, `
    body { min-height: 100vh; box-sizing: border-box; padding: clamp(1rem, 5vw, 4rem);
      background: radial-gradient(ellipse at top, #27343b, #171d24 45rem) no-repeat; }
    main { max-width: 50rem; margin-inline: auto; overflow-wrap: anywhere; }
    h1 { font-size: clamp(1.6rem, 5vw, 3rem); }
    p { font-size: clamp(1rem, 2.5vw, 1.25rem); }
    figure { margin: 1.25rem 0 0; }
    figure:first-child { margin-top: 0; }
    figure img { display: block; width: auto; max-width: 100%; max-height: 78vh; margin-inline: auto; border-radius: .45rem; }
    figure.map img { border-radius: 0; }
    main:has(figure.map) { max-width: 78rem; }
  `, Boolean(illustration)) };
}

function playerSheetDocument(projection) {
  const sections = projection.sections.map(section => {
    const rows = section.rows.map(([label, value]) =>
      `<div><dt>${escapeText(label)}</dt><dd>${escapeText(value)}</dd></div>`).join("");
    return `<section><h2>${escapeText(section.title)}</h2>${rows ? `<dl>${rows}</dl>` : `<p>${escapeText(section.empty)}</p>`}</section>`;
  }).join("");
  return projectionDocument(`<header><p>Chroniques d’Entre-Rives · Fiche joueur</p><h1>${escapeText(projection.title)}</h1></header>${sections}`, `
    body { padding: clamp(1rem, 4vw, 2.5rem); background: radial-gradient(ellipse at top, #27343b, #171d24 45rem); }
    main { max-width: 50rem; margin-inline: auto; overflow-wrap: anywhere; }
    header { padding: 1rem 1.15rem; border-left: .2rem solid #e4a778; background: #243039; border-radius: .6rem; }
    header p { color: #d8b56c; font-size: .75rem; font-weight: 750; text-transform: uppercase; letter-spacing: .09em; }
    h1 { margin: .45rem 0 0; font-size: clamp(1.65rem, 5vw, 3rem); }
    h2 { margin: 0 0 .45rem; font: 1.25rem/1.2 Georgia, serif; }
    section { margin-top: .9rem; padding: .85rem; border: 1px solid #495762; border-radius: .6rem; background: #222c35; }
    dl { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 8rem), 1fr)); gap: .5rem; margin: 0; }
    dl div { min-width: 0; padding: .45rem .65rem; border-radius: .35rem; background: #171d24; }
    dt { color: #c5cdd3; font-size: .85rem; }
    dd { margin: .1rem 0 0; font-weight: 700; font-variant-numeric: tabular-nums; }
    dd:empty { display: none; }
  `);
}

export function playerSheetPresentation(projection) {
  return { label: "Fiche joueur", html: playerSheetDocument(projection) };
}

export function openPlayerWindow() {
  const ticket = crypto.randomUUID();
  const hosted = document.documentElement.hasAttribute('data-pages-studio');
  const popup = window.open(hosted ? 'about:blank' : `/joueur#${ticket}`, "_blank", "popup,width=900,height=760");
  if (!popup) return null;
  let receiver = popup;
  if (hosted) {
    // Pages sert des fichiers statiques. Le cadre sandbox donne au récepteur une origine opaque.
    const frame = popup.document.createElement('iframe');
    popup.document.title = 'Fenêtre joueur · Chroniques d’Entre-Rives';
    popup.document.body.style.cssText = 'margin:0;background:#171d24';
    frame.title = 'Présentation joueur';
    frame.style.cssText = 'display:block;width:100%;height:100dvh;border:0';
    frame.setAttribute('sandbox', 'allow-scripts');
    frame.src = new URL(`./joueur.html#${ticket}`, import.meta.url).href;
    popup.document.body.append(frame);
    receiver = frame.contentWindow;
  }
  let port;
  let retired = false;
  let finish;
  const ready = new Promise(resolve => { finish = resolve; });
  const active = () => !retired && !popup.closed;
  const receive = event => {
    if (event.source !== receiver || event.origin !== "null" || event.data?.type !== "studio-player-ready" ||
        event.data.ticket !== ticket || event.ports.length !== 1) return;
    if (hosted) popup.opener = null;
    port = event.ports[0];
    port.onmessage = ({ data }) => {
      if (data?.type === "retired") retired = true;
    };
    settle(true);
  };
  const timeout = setTimeout(() => settle(false), 5000);
  function settle(connected) {
    clearTimeout(timeout);
    window.removeEventListener("message", receive);
    finish(connected);
  }
  window.addEventListener("message", receive);
  return {
    active, ready,
    show({ label, html }) {
      if (!port || !active()) return false;
      port.postMessage({ type: "presentation", label, html });
      return true;
    },
    close() {
      settle(false);
      port?.postMessage({ type: "retire" });
      port?.close();
      if (active()) popup.close();
      retired = true;
    },
  };
}

export function clearProjection(container) {
  container.replaceChildren();
}

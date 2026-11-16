import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { stripTypeScriptTypes } from "node:module";
import { pathToFileURL } from "node:url";
import catalogue from "./catalogue-archives.json" with { type: "json" };
import organisations from "./catalogue-organisations.json" with { type: "json" };
import antagonistes from "./catalogue-antagonistes.json" with { type: "json" };

export const studioAssets = new Map([
  ["/", ["index.html", "text/html"]],
  ["/index.html", ["index.html", "text/html"]],
  ["/accueil", ["accueil.html", "text/html"]],
  ["/accueil/", ["accueil.html", "text/html"]],
  ["/accueil.css", ["accueil.css", "text/css"]],
  ["/accueil.mjs", ["accueil.mjs", "text/javascript"]],
  ["/joueur", ["joueur.html", "text/html"]],
  ["/joueur.js", ["joueur.js", "text/javascript"]],
  ["/espace-joueur.html", ["espace-joueur.html", "text/html"]],
  ["/espace-joueur.css", ["espace-joueur.css", "text/css"]],
  ["/espace-joueur.mjs", ["espace-joueur.mjs", "text/javascript"]],
  ["/espace-joueur-store.mjs", ["espace-joueur-store.mjs", "text/javascript"]],
  ["/grimoire-joueur.mjs", ["grimoire-joueur.mjs", "text/javascript"]],
  ["/grimoire-joueur.css", ["grimoire-joueur.css", "text/css"]],
  ["/brouillons-pj.mjs", ["brouillons-pj.mjs", "text/javascript"]],
  ["/creation-brouillon.mjs", ["creation-brouillon.mjs", "text/javascript"]],
  ["/creation-brouillon.css", ["creation-brouillon.css", "text/css"]],
  ["/rangement-joueur.mjs", ["rangement-joueur.mjs", "text/javascript"]],
  ["/rangement-joueur.css", ["rangement-joueur.css", "text/css"]],
  ["/carnet-joueur.mjs", ["carnet-joueur.mjs", "text/javascript"]],
  ["/carnet-joueur-ui.mjs", ["carnet-joueur-ui.mjs", "text/javascript"]],
  ["/carnet-joueur.css", ["carnet-joueur.css", "text/css"]],
  ["/objets-joueur.mjs", ["objets-joueur.mjs", "text/javascript"]],
  ["/objets-joueur-ui.mjs", ["objets-joueur-ui.mjs", "text/javascript"]],
  ["/objets-joueur.css", ["objets-joueur.css", "text/css"]],
  ["/objets-mj.mjs", ["objets-mj.mjs", "text/javascript"]],
  ["/objets-mj-ui.mjs", ["objets-mj-ui.mjs", "text/javascript"]],
  ["/audio.mjs", ["audio.mjs", "text/javascript"]],
  ["/audio-ui.mjs", ["audio-ui.mjs", "text/javascript"]],
  ["/audio.css", ["audio.css", "text/css"]],
  ["/service-media.mjs", ["service-media.mjs", "text/javascript"]],
  ["/service-media-ui.mjs", ["service-media-ui.mjs", "text/javascript"]],
  ["/service-media.css", ["service-media.css", "text/css"]],
  ["/scene-images.mjs", ["scene-images.mjs", "text/javascript"]],
  ["/scene-images-ui.mjs", ["scene-images-ui.mjs", "text/javascript"]],
  ["/video.mjs", ["video.mjs", "text/javascript"]],
  ["/video-ui.mjs", ["video-ui.mjs", "text/javascript"]],
  ["/video-player.js", ["video-player.js", "text/javascript"]],
  ["/video-player.css", ["video-player.css", "text/css"]],
  ["/medias-catalogue.mjs", ["medias-catalogue.mjs", "text/javascript"]],
  ["/medias-ui.mjs", ["medias-ui.mjs", "text/javascript"]],
  ["/medias.css", ["medias.css", "text/css"]],
  ["/catalogue-sons.json", ["catalogue-sons.json", "application/json"]],
  ["/catalogue-videos.json", ["catalogue-videos.json", "application/json"]],
  ["/suivi-sauvegardes.mjs", ["suivi-sauvegardes.mjs", "text/javascript"]],
  ["/echanges-pj.mjs", ["echanges-pj.mjs", "text/javascript"]],
  ["/echanges-pj.css", ["echanges-pj.css", "text/css"]],
  ["/regie-participants.css", ["regie-participants.css", "text/css"]],
  ["/portraits.mjs", ["portraits.mjs", "text/javascript"]],
  ["/studio.css", ["studio.css", "text/css"]],
  ["/app.mjs", ["app.mjs", "text/javascript"]],
  ["/bibliotheque.mjs", ["bibliotheque.mjs", "text/javascript"]],
  ["/creations.mjs", ["creations.mjs", "text/javascript"]],
  ["/catalogue-archives.json", ["catalogue-archives.json", "application/json"]],
  ["/catalogue-organisations.json", ["catalogue-organisations.json", "application/json"]],
  ["/catalogue-bestiaire.json", ["catalogue-bestiaire.json", "application/json"]],
  ["/catalogue-antagonistes.json", ["catalogue-antagonistes.json", "application/json"]],
  ["/store.mjs", ["store.mjs", "text/javascript"]],
  ["/projection.mjs", ["projection.mjs", "text/javascript"]],
  ["/protocole.mjs", ["protocole.mjs", "text/javascript"]],
  ["/opposition.mjs", ["opposition.mjs", "text/javascript"]],
  ["/pj-m02.mjs", ["pj-m02.mjs", "text/javascript"]],
  ["/atelier-bestiaire.mjs", ["atelier-bestiaire.mjs", "text/javascript"]],
  ["/moteur/atelier5d6-progression.js", ["../quartz/components/scripts/atelier5d6-progression.ts", "text/javascript"]],
  ["/moteur/atelier5d6-probabilities.js", ["../quartz/components/scripts/atelier5d6-probabilities.ts", "text/javascript"]],
  ["/media/entre-rives-accueil.webp", ["media/entre-rives-accueil.webp", "image/webp"]],
  ["/media/gardien-des-salines.webp", ["media/gardien-des-salines.webp", "image/webp"]],
  ["/media/renarde-de-brume.webp", ["media/renarde-de-brume.webp", "image/webp"]],
  ["/media/heron-des-lanternes.webp", ["media/heron-des-lanternes.webp", "image/webp"]],
  ["/media/lamproie-de-nacre.webp", ["media/lamproie-de-nacre.webp", "image/webp"]],
  ["/media/loutre-anneaux-cuivre.webp", ["media/loutre-anneaux-cuivre.webp", "image/webp"]],
  ["/media/sonneur-des-saules.webp", ["media/sonneur-des-saules.webp", "image/webp"]],
  ["/media/phalene-des-celliers.webp", ["media/phalene-des-celliers.webp", "image/webp"]],
]);
for (const module of ["atelier5d6-bestiary", "atelier5d6-bestiary-workshop", "atelier5d6-combat-m03", "atelier5d6-m05-sheet-view", "atelier5d6-m02", "atelier5d6-origins"]) {
  studioAssets.set(`/moteur/${module}.js`, [`../quartz/components/scripts/${module}.ts`, "text/javascript"]);
}
for (const entry of catalogue.entries) {
  if (entry.asset) studioAssets.set(entry.asset, [`../${entry.path}`, "image/svg+xml", entry.version]);
}
for (const entry of organisations.entries) {
  studioAssets.set(`/images/organisations/${entry.image}`, [`../quartz/static/images/organisations/${entry.image}`, "image/svg+xml"]);
}
for (const entry of antagonistes.entries) {
  studioAssets.set(`/images/personnages-dechus/${entry.image}`, [`../quartz/static/images/personnages-dechus/${entry.image}`, "image/svg+xml"]);
}

export async function readStudioAsset([filename, , version]) {
  const contents = await readFile(new URL(filename, import.meta.url));
  if (version && createHash("sha1").update(`blob ${contents.length}\0`).update(contents).digest("hex") !== version) return null;
  if (!filename.endsWith(".ts")) return contents;
  // GitHub Pages sert les modules statiques sans la redirection du serveur local.
  return stripTypeScriptTypes(contents.toString("utf8")).replace(/(from\s+["'])(\.\/atelier5d6-[a-z0-9-]+)(["'])/g, "$1$2.js$3");
}

export function startStudioServer(port = 4380) {
  const server = createServer(async (request, response) => {
    const path = request.url.split("?")[0];
    const discovery = path === "/accueil" || path === "/accueil/";
    const player = path === "/joueur";
    const personal = path === "/espace-joueur.html";
    const localPort = server.address().port;
    response.setHeader("Cache-Control", "no-store");
    response.setHeader("X-Content-Type-Options", "nosniff");
    response.setHeader("Referrer-Policy", "no-referrer");
    response.setHeader("Content-Security-Policy", [
      "default-src 'none'",
      ...(player ? ["sandbox allow-scripts", `script-src http://127.0.0.1:${localPort}/joueur.js http://127.0.0.1:${localPort}/video-player.js`] :
        [discovery ? `script-src http://127.0.0.1:${localPort}/accueil.mjs` : "script-src 'self'"]),
      discovery || player ? "connect-src 'none'" : `connect-src http://127.0.0.1:${localPort}/catalogue-archives.json${personal ? '' : ` http://127.0.0.1:${localPort}/catalogue-organisations.json http://127.0.0.1:${localPort}/catalogue-antagonistes.json http://127.0.0.1:${localPort}/catalogue-bestiaire.json http://127.0.0.1:${localPort}/catalogue-sons.json http://127.0.0.1:${localPort}/catalogue-videos.json`}`,
      discovery || personal ? "style-src 'self'" : "style-src 'self' 'unsafe-inline'",
      player ? "img-src data:" : discovery ? "img-src 'self'" : personal ? "img-src 'self' data: blob: https:" : "img-src 'self' data: https:",
      discovery || personal ? "media-src 'none'" : player ? "media-src https:" : "media-src https: blob:",
      player ? "frame-src about:" : discovery || personal ? "frame-src 'none'" : "frame-src 'self' https://www.youtube-nocookie.com",
      "frame-ancestors 'none'",
      discovery || player || personal ? "form-action 'none'" : "form-action 'self'",
      "base-uri 'none'",
    ].join("; "));

    if (request.headers.host !== `127.0.0.1:${localPort}`) {
      response.writeHead(403).end();
      return;
    }
    if (request.method !== "GET" && request.method !== "HEAD") {
      response.writeHead(405, { Allow: "GET, HEAD" }).end();
      return;
    }

    const asset = studioAssets.get(path);
    if (!asset) {
      if (path.startsWith("/moteur/") && studioAssets.has(`${path}.js`)) {
        response.writeHead(308, { Location: `${path}.js` }).end();
        return;
      }
      response.writeHead(404).end();
      return;
    }

    try {
      const [, contentType] = asset;
      const body = await readStudioAsset(asset);
      if (body === null) {
        response.writeHead(409).end();
        return;
      }
      if (contentType === "image/svg+xml") response.setHeader("Content-Security-Policy", "default-src 'none'; style-src 'unsafe-inline'; sandbox");
      const charset = contentType.startsWith("text/") ? "; charset=utf-8" : "";
      response.writeHead(200, { "Content-Type": `${contentType}${charset}` });
      response.end(request.method === "HEAD" ? undefined : body);
    } catch {
      response.writeHead(500).end();
    }
  });

  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, "127.0.0.1", () => {
      server.removeListener("error", reject);
      resolve(server);
    });
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const server = await startStudioServer();
    console.log(`Studio MJ disponible sur http://127.0.0.1:${server.address().port}/`);
  } catch (error) {
    console.error(`Démarrage impossible sur le port 4380 (${error.code ?? error.message}).`);
    process.exitCode = 1;
  }
}

(() => {
  const owner = window.opener || (window.parent !== window && window.parent.opener);
  const ticket = location.hash.slice(1);
  if (!owner || !/^[a-f0-9-]{36}$/.test(ticket)) return;
  const container = document.getElementById("player-sheet");
  const message = container.firstElementChild;
  message.textContent = "La présentation se prépare…";
  const { port1, port2 } = new MessageChannel();
  let label;
  let staged;
  const clear = () => {
    staged = undefined;
    message.textContent = label === "Fiche joueur" ? "La fiche a été retirée par le MJ." : "La présentation a été retirée par le MJ.";
    container.replaceChildren(message);
  };
  port1.onmessage = ({ data }) => {
    if (data?.type === "retire") {
      clear();
      port1.close();
      if (window.parent === window) window.close();
    } else if (data?.type === "presentation" || data?.type === "sheet") {
      const receivedLabel = data.type === "sheet" ? "Fiche joueur" : data.label;
      if (typeof data.html !== "string" || !["Fiche joueur", "Scène de jeu", "Image de jeu"].includes(receivedLabel)) return;
      staged?.remove();
      const frame = document.createElement("iframe");
      staged = frame;
      frame.title = receivedLabel;
      frame.hidden = true;
      frame.setAttribute("sandbox", "");
      frame.addEventListener("load", () => {
        if (staged !== frame) return;
        staged = undefined;
        label = receivedLabel;
        document.title = `${label} · Chroniques d’Entre-Rives`;
        for (const previous of [...container.children]) {
          if (previous !== frame) previous.remove();
        }
        frame.hidden = false;
      }, { once: true });
      frame.srcdoc = data.html;
      container.append(frame);
    }
  };
  window.addEventListener("pagehide", () => {
    clear();
    port1.postMessage({ type: "retired" });
    port1.close();
  }, { once: true });
  owner.postMessage({ type: "studio-player-ready", ticket }, location.origin, [port2]);
  window.opener = null;
})();

import { DefaultFrame } from "./DefaultFrame"
import type { PageFrame } from "./types"

export const AlrickFrame: PageFrame = {
  name: "alrick",
  render(props) {
    if (props.componentData.fileData.slug === "404") {
      const { cfg, ctx } = props.componentData
      const base = (ctx.argv.serve ? `/${ctx.argv.baseDir ?? ""}` : new URL(`https://${cfg.baseUrl}`).pathname).replace(/\/$/, "")
      return DefaultFrame.render({ ...props, pageBody: () => <article id="archive-content" class="not-found" tabIndex={-1}><span class="eyebrow">FEUILLET ÉGARÉ · 404</span><h1>Cette page n’est pas dans les archives.</h1><p>Le lien a peut-être changé. Retrouvez les lieux, les personnages et les chroniques depuis la bibliothèque.</p><a class="archive-button" href={`${base}/`}>Retour à la bibliothèque →</a></article> })
    }
    const fileData = props.componentData.fileData
    const hasSpoilers = fileData.slug?.startsWith("mj/") || fileData.frontmatter?.spoilers === true
    if (!hasSpoilers) return DefaultFrame.render(props)
    const Content = props.pageBody
    return DefaultFrame.render({ ...props, pageBody: (componentProps) => <section class="mj-gate" aria-label="Avertissement de spoilers">
      <div class="spoiler-notice"><span class="eyebrow">AVERTISSEMENT · SPOILERS</span><h2>Certains secrets gagnent à être découverts en jeu.</h2><p>Cette fiche peut révéler des événements de campagne, des informations de continuité ou des pistes encore non jouées.</p><p>Si vous jouez cette campagne, vous pouvez revenir à la bibliothèque. Ouvrez la fiche seulement si vous acceptez ces révélations.</p></div>
      <details class="spoiler-disclosure"><summary>Je comprends le risque de spoilers · ouvrir les archives <span aria-hidden="true">↓</span></summary><Content {...componentProps} /></details>
      <p class="gate-note">L’avertissement protège le plaisir de découverte. Il ne rend pas le contenu confidentiel.</p>
    </section> })
  },
}

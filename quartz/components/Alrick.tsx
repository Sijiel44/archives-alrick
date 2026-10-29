import type { QuartzComponent, QuartzComponentProps } from "./types"
import { pathToRoot } from "../util/path"
// @ts-ignore — Quartz bundles .inline.ts imports as browser script strings.
import script from "./scripts/alrick.inline"

export const sections = [
  ["monde", "Le Monde", "Cosmologie", "◇"],
  ["lieux", "Atlas des territoires", "Atlas", "⌂"],
  ["personnages", "Personnages", "Personnages", "♙"],
  ["groupes", "Groupes et alliances", "Groupes", "⚑"],
  ["economie", "Économie et finances", "Économie", "↗"],
  ["magie", "Codex de la magie", "Magie", "✧"],
  ["maison", "Maison divine", "Divin", "✦"],
  ["chroniques", "Chroniques", "Chroniques", "☼"],
]

function root(props: QuartzComponentProps) {
  // A 404 can be served at any nesting level by GitHub Pages.
  return props.fileData.slug === "404"
    ? (props.ctx.argv.serve ? `/${props.ctx.argv.baseDir ?? ""}` : new URL(`https://${props.cfg.baseUrl}`).pathname).replace(/\/$/, "")
    : pathToRoot(props.fileData.slug!)
}

export const Brand: QuartzComponent = (props) => (
  <>
    <a class="skip-link" href="#archive-content">Aller au contenu</a>
    <a class="alrick-brand internal" href={`${root(props)}/`} aria-label="Archives d’Alrick, accueil">
      <span class="brand-sigil" aria-hidden="true">A</span>
      <span><strong>ALRICK</strong><small>LES ARCHIVES</small></span>
    </a>
  </>
)

export const Navigation: QuartzComponent = (props) => {
  const base = root(props)
  const current = props.fileData.slug?.split("/")[0]
  return (
    <nav class="archive-nav" aria-label="Rubriques des archives">
      <span class="nav-caption">LA BIBLIOTHÈQUE</span>
      <a class={`internal ${current === "index" ? "active" : ""}`} href={`${base}/`} aria-current={current === "index" ? "page" : undefined}>
        <span aria-hidden="true">☷</span> Toutes les archives
      </a>
      {sections.map(([slug, title, , icon]) => (
        <a class={`internal ${current === slug ? "active" : ""}`} href={`${base}/${slug}/`} aria-current={current === slug ? "page" : undefined}>
          <span aria-hidden="true">{icon}</span>{title}
        </a>
      ))}
      <div class="nav-divider" />
      <span class="nav-caption">DERRIÈRE LE RÉCIT</span>
      <a class={`internal mj-link ${current === "mj" ? "active" : ""}`} href={`${base}/mj/`} aria-current={current === "mj" ? "page" : undefined}>
        <span aria-hidden="true">⚿</span> Archives du MJ <span class="spoiler-dot" aria-label="Spoilers">!</span>
      </a>
      <div class="nav-colophon"><span class="small-star">✧</span><p>Un monde se raconte.<br />Sa mémoire se conserve.</p><small>L’ODYSSÉE D’ORIN · CB43</small></div>
    </nav>
  )
}

export const Topbar: QuartzComponent = (props) => (
  <div class="archive-topbar">
    <span>LES ARCHIVES D’ALRICK <i>/</i> <span>{props.fileData.slug === "index" ? "ACCUEIL" : props.fileData.slug?.startsWith("mj/") ? "ARCHIVES DU MJ" : "ENCYCLOPÉDIE"}</span></span>
    <span class="edition"><span aria-hidden="true">◇</span> Édition pilote · CB43</span>
  </div>
)

export const PageIntro: QuartzComponent = (props) => {
  const { fileData } = props
  const fm = fileData.frontmatter
  const hasSpoilers = fileData.slug?.startsWith("mj/") || fm?.spoilers === true
  if (fileData.slug === "index" || fileData.slug === "404") return null
  return <div class="archive-intro" id="archive-content" tabIndex={-1}>
    <a class="internal back-link" href={`${root(props)}/`}>← Retour à la bibliothèque</a>
    <span class="eyebrow">{hasSpoilers ? "AVERTISSEMENT · SPOILERS" : "LES FEUILLETS DE L’ODYSSÉE"}</span>
    <h1>{fm?.title}</h1>
    {fm?.code && <div class="document-meta"><span>{String(fm.code)}</span><span>État documentaire : {String(fm.ancre_documentaire ?? "à préciser")}</span><span>Fiche pilote · à relire</span></div>}
  </div>
}

export const Library: QuartzComponent = (props) => {
  if (props.fileData.slug !== "index") return null
  const files = props.allFiles.filter((f) => f.frontmatter?.code && f.frontmatter?.publish === true && !f.slug?.startsWith("mj/") && !f.unlisted)
    .sort((a, b) => String(a.frontmatter?.title).localeCompare(String(b.frontmatter?.title), "fr"))
  const base = root(props)
  return <div id="archive-content" tabIndex={-1}>
    <section class="archive-hero" aria-labelledby="odyssee-title">
      <div class="hero-engraving" aria-hidden="true" />
      <div class="hero-copy">
        <span class="eyebrow"><span aria-hidden="true">✧</span> LE MONDE SE SOUVIENT</span>
        <h1 id="odyssee-title">L’Odyssée<br /><em>d’Orin</em></h1>
        <p>Entre montagne, magie et mémoire.<br />Les êtres, les lieux et les mystères d’un monde façonné par ses histoires.</p>
        <div class="hero-actions"><a class="archive-button" href="#bibliotheque">Ouvrir les archives <span aria-hidden="true">↗</span></a><a class="internal text-button" href={`${base}/chroniques/`}>Lire les chroniques <span aria-hidden="true">→</span></a></div>
      </div>
      <span class="hero-caption">MONTAGNES DE L’AUBE<br /><small>Évocation graphique · hors canon</small></span>
    </section>
    <div class="collection-meta"><span><b>{files.length}</b> fiches pilotes</span><span><b>{sections.length}</b> domaines de connaissance</span><span>Un univers en cours de transmission</span></div>
    <section class="archive-library" id="bibliotheque" aria-labelledby="library-title">
      <div class="library-heading"><div><span class="eyebrow">LA BIBLIOTHÈQUE</span><h2 id="library-title">Explorer les connaissances</h2></div><span class="library-ornament" aria-hidden="true">— ◇ —</span></div>
      <div class="library-controls"><div class="archive-filters" role="group" aria-label="Filtrer les fiches par domaine"><button type="button" data-filter="all" aria-pressed="true">Tout</button>{sections.map(([slug, , label]) => <button type="button" data-filter={slug} aria-pressed="false">{label}</button>)}</div><label class="library-search"><span aria-hidden="true">⌕</span><span class="sr-only">Rechercher dans les fiches</span><input id="library-search" type="search" placeholder="Un nom, un lieu, un code…" autoComplete="off" /></label></div>
      <p class="sr-only" id="library-count" role="status" aria-live="polite">{files.length} fiches</p>
      <div class="archive-grid">{files.map((file) => {
        const section = sections.find(([slug]) => file.slug?.startsWith(slug + "/"))!
        const fm = file.frontmatter!
        return <a class="archive-card internal" href={`${base}/${file.slug}`} data-category={section[0]} data-search={`${fm.title} ${fm.code} ${fm.description}`}>
          <div class="card-top"><span class="card-icon" aria-hidden="true">{section[3]}</span><span class="card-category">{section[2]}</span></div>
          <span class="card-code">{String(fm.code)}</span><h3>{String(fm.title)}</h3><p>{String(fm.description)}</p><span class="card-bottom">Consulter la fiche <span aria-hidden="true">↗</span></span>
        </a>
      })}</div>
      <div class="empty-library" hidden><span aria-hidden="true">◇</span><h3>Aucun feuillet ne correspond.</h3><p>Essayez un autre nom ou explorez tous les domaines.</p><button type="button" id="reset-library">Réinitialiser la recherche</button></div>
    </section>
    <aside class="mj-invitation"><span class="seal" aria-hidden="true">⚿</span><div><span class="eyebrow">POUR LES MAÎTRES DU JEU</span><h2>De l’autre côté de l’histoire</h2><p>Repères de continuité et préparations. Ces feuillets peuvent révéler les secrets de l’aventure.</p></div><a class="internal" href={`${base}/mj/`}>Archives du MJ <span aria-hidden="true">→</span></a></aside>
  </div>
}
Library.afterDOMLoaded = script

export const Colophon: QuartzComponent = (props) => <footer class="archive-footer"><span>LES ARCHIVES D’ALRICK <i>✧</i> L’Odyssée d’Orin</span><span>Édition pilote · <a class="internal" href={`${root(props)}/a-propos`}>Sources & méthode</a></span></footer>

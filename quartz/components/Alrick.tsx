import type { QuartzComponent, QuartzComponentProps } from "./types"
import { pathToRoot } from "../util/path"
// @ts-ignore — Quartz bundles .inline.ts imports as browser script strings.
import script from "./scripts/alrick.inline"

export const sections = [
  ["monde", "Le Monde", "Cosmologie", "◇"],
  ["univers", "Explorer l’univers", "Univers", "✦"],
  ["jouer", "Jouer dans ce monde", "Jouer", "⚔"],
  ["lieux", "Atlas des territoires", "Atlas", "⌂"],
  ["personnages", "Personnages", "Personnages", "♙"],
  ["groupes", "Groupes et alliances", "Groupes", "⚑"],
  ["institutions", "Institutions", "Institutions", "⚖"],
  ["cultures", "Cultures et traditions", "Cultures", "♫"],
  ["objets", "Objets et œuvres", "Objets", "⌑"],
  ["creatures", "Créatures magiques", "Créatures", "✤"],
  ["projets", "Projets et recherches", "Projets", "⚙"],
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
  const mainLinks = [
    ["index", "/", "Accueil", "⌂"],
    ["univers", "/univers/", "Découvrir le monde", "✦"],
    ["odyssee", "/odyssee/", "Lire l’Odyssée", "☼"],
    ["jouer", "/jouer/", "Jouer dans cet univers", "⚔"],
    ["mj-ia", "/mj-ia/", "MJ assisté par IA", "✧"],
    ["bibliotheque", "/bibliotheque", "Bibliothèque des fiches", "☷"],
  ]
  return <nav class="archive-nav" aria-label="Parcours et bibliothèque des Archives">
    <span class="nav-caption">COMMENCER</span>
    {mainLinks.map(([slug, url, title, icon]) =>
      <a class={`internal ${current === slug ? "active" : ""}`} href={`${base}${url}`}
        aria-current={current === slug ? "page" : undefined} key={slug}>
        <span aria-hidden="true">{icon}</span>{title}
      </a>
    )}
    <a class="internal nav-atelier" href={`${base}/jouer/atelier-5d6`}>
      <span aria-hidden="true">⚄</span> Atelier de jeu 5d6
    </a>
    <details class="nav-domains">
      <summary>Explorer les 13 domaines <span aria-hidden="true">⌄</span></summary>
      <div class="nav-domains-links">
        {sections.filter(([slug]) => slug !== "univers" && slug !== "jouer").map(([slug, title, , icon]) =>
          <a class={`internal ${current === slug ? "active" : ""}`} href={`${base}/${slug}/`}
            aria-current={current === slug ? "page" : undefined} key={slug}>
            <span aria-hidden="true">{icon}</span>{title}
          </a>
        )}
      </div>
    </details>
    <details class="nav-domains nav-secrets">
      <summary>Dossiers de campagne <span class="spoiler-dot" aria-label="Contient des révélations">!</span></summary>
      <div class="nav-domains-links">
        <a class="internal story-link" href={`${base}/jdr-alrick/`}>Continuité d’Alrick · spoilers</a>
        <a class="internal mj-link" href={`${base}/mj/`}>Archives du MJ · spoilers</a>
        <a class="internal editorial-link" href={`${base}/suivi-editorial`}>Suivi éditorial · spoilers</a>
      </div>
    </details>
    <div class="nav-colophon"><span class="small-star">✧</span><p>Un monde à découvrir.<br />D’autres histoires à vivre.</p><a class="internal" href={`${base}/a-propos`}>Sources et méthode</a></div>
  </nav>
}

export const Topbar: QuartzComponent = (props) => (
  <div class="archive-topbar">
    <span>LES ARCHIVES D’ALRICK <i>/</i> <span>{props.fileData.slug === "index" ? "ACCUEIL" : props.fileData.slug?.startsWith("mj/") ? "ARCHIVES DU MJ" : props.fileData.slug?.startsWith("jdr-alrick") ? "JDR D’ALRICK" : "ENCYCLOPÉDIE"}</span></span>
    <span class="edition"><span aria-hidden="true">◇</span> Archives vivantes · CB43</span>
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
    {fm?.code && (() => {
      const state = String(fm.etat_editorial ?? "en_chantier")
      const labels: Record<string, string> = { valide: "Validé", en_cours: "En cours", en_chantier: "À reprendre" }
      const label = labels[state] ?? "À reprendre"
      return <div class="document-meta"><span>{String(fm.code)}</span><span>État documentaire : {String(fm.ancre_documentaire ?? "à préciser")}</span><span class={`editorial-status editorial-status--${state}`}><span aria-hidden="true">●</span> {label}</span></div>
    })()}
  </div>
}

export const Library: QuartzComponent = (props) => {
  const isHome = props.fileData.slug === "index"
  const isCatalog = props.fileData.slug === "bibliotheque"
  if (!isHome && !isCatalog) return null
  const base = root(props)
  if (isHome) return <div id="archive-content" tabIndex={-1}>
    <section class="archive-hero home-hero" aria-labelledby="alrick-home-title">
      <div class="hero-engraving" aria-hidden="true" />
      <div class="hero-copy">
        <span class="eyebrow"><span aria-hidden="true">✧</span> UN UNIVERS À EXPLORER ET À JOUER</span>
        <h1 id="alrick-home-title">Les Archives<br /><em>d’Alrick</em></h1>
        <p>Un monde de royaumes, de magie et de légendes. Découvrez sa mémoire, suivez le voyage d’Orin ou vivez votre propre aventure.</p>
        <div class="hero-actions">
          <a class="archive-button internal" href={`${base}/jouer/`}>Commencer une aventure <span aria-hidden="true">→</span></a>
          <a class="internal text-button" href={`${base}/univers/`}>Explorer l’univers <span aria-hidden="true">→</span></a>
        </div>
      </div>
      <span class="hero-caption">MONTAGNES DE L’AUBE<br /><small>Évocation graphique · hors canon</small></span>
    </section>
    <section class="home-paths" aria-labelledby="home-paths-title">
      <span class="eyebrow">QUELLE HISTOIRE SOUHAITEZ-VOUS VIVRE ?</span>
      <h2 id="home-paths-title">Choisissez votre point de départ</h2>
      <div class="home-path-grid">
        <a class="home-path internal" href={`${base}/univers/`}><span class="home-path-icon" aria-hidden="true">✦</span><h3>Découvrir l’univers</h3><p>Peuples, royaumes, dieux, créatures, traditions et mystères.</p><span class="home-path-link">Explorer le monde →</span></a>
        <a class="home-path internal" href={`${base}/jouer/`}><span class="home-path-icon" aria-hidden="true">⚔</span><h3>Jouer une aventure</h3><p>Créer un héros, essayer les règles 5d6 et partir avec son groupe.</p><span class="home-path-link">Commencer à jouer →</span></a>
        <a class="home-path internal" href={`${base}/odyssee/`}><span class="home-path-icon" aria-hidden="true">☼</span><h3>Lire l’Odyssée d’Orin</h3><p>Suivre la campagne fondatrice, ses rencontres et ses conséquences.</p><span class="home-path-link">Découvrir le récit →</span></a>
        <a class="home-path internal" href={`${base}/mj-ia/`}><span class="home-path-icon" aria-hidden="true">✧</span><h3>Préparer un MJ avec IA</h3><p>Choisir les bonnes sources et garder la continuité de sa partie.</p><span class="home-path-link">Préparer sa séance →</span></a>
      </div>
    </section>
    <section class="home-quickstart" aria-labelledby="home-start-title">
      <div><span class="eyebrow">PRÊT À JOUER ?</span><h2 id="home-start-title">Créer un personnage en quelques étapes</h2>
        <p>Choisissez quatre caractéristiques, lancez cinq dés à six faces, puis faites évoluer votre personnage à travers ses rencontres. L’Atelier 5d6 et la progression libre restent des outils en test.</p></div>
      <a class="archive-button internal" href={`${base}/jouer/atelier-5d6`}>Ouvrir l’Atelier 5d6 <span aria-hidden="true">→</span></a>
    </section>
    <section class="home-library-link" aria-labelledby="home-library-title">
      <div><span class="eyebrow">POUR APPROFONDIR</span><h2 id="home-library-title">Une encyclopédie à consulter à votre rythme</h2>
        <p>La bibliothèque rassemble les fiches publiques de l’univers. Recherchez un personnage, un lieu, une institution ou une tradition sans parcourir tout le site.</p></div>
      <a class="internal home-catalog-link" href={`${base}/bibliotheque`}>Ouvrir la bibliothèque complète →</a>
    </section>
  </div>
  const files = props.allFiles.filter(f =>
    f.frontmatter?.code && f.frontmatter?.publish === true && !f.slug?.startsWith("mj/") && !f.unlisted && f.frontmatter?.spoilers !== true
  ).sort((a,b)=>String(a.frontmatter?.title).localeCompare(String(b.frontmatter?.title),"fr"))
  return <div class="archive-library-page">
    <section class="archive-library" id="bibliotheque" aria-labelledby="library-title">
      <div class="library-heading"><div><span class="eyebrow">RECHERCHE ET CONSULTATION</span><h2 id="library-title">Explorer toutes les fiches accessibles</h2></div><span class="library-ornament" aria-hidden="true">— ◇ —</span></div>
      <p>Les fiches contenant des révélations sont volontairement absentes de ce catalogue. Elles restent accessibles depuis leur parcours narratif, après avertissement.</p>
      <div class="library-controls">
        <label class="library-category-select">Domaine
          <select id="library-category">
            <option value="all">Tous les domaines</option>
            {sections.map(([slug, , label])=><option value={slug} key={slug}>{label}</option>)}
          </select>
        </label>
        <label class="library-search"><span aria-hidden="true">⌕</span><span class="sr-only">Rechercher dans les fiches</span><input id="library-search" type="search" placeholder="Un nom, un lieu, un code…" autoComplete="off"/></label>
      </div>
      <p id="library-count" role="status" aria-live="polite">{files.length} fiches consultables</p>
      <div class="archive-grid">{files.map(file=>{
        const section=sections.find(([slug])=>file.slug?.startsWith(slug+"/"))??["univers","Autres fiches","Univers","◇"]
        const fm=file.frontmatter!
        return <a class="archive-card internal" key={file.slug} href={`${base}/${file.slug}`}
          data-category={section[0]} data-search={`${fm.title} ${fm.code} ${fm.description}`}>
          <div class="card-top"><span class="card-icon" aria-hidden="true">{section[3]}</span><span class="card-category">{section[2]}</span></div>
          <span class="card-code">{String(fm.code)}</span><h3>{String(fm.title)}</h3><p>{String(fm.description)}</p>
          <span class="card-bottom">Consulter la fiche <span aria-hidden="true">↗</span></span>
        </a>
      })}</div>
      <div class="empty-library" hidden><span aria-hidden="true">◇</span><h3>Aucun feuillet ne correspond.</h3><p>Essayez un autre mot ou revenez à tous les domaines.</p><button type="button" id="reset-library">Réinitialiser les filtres</button></div>
    </section>
  </div>
}
Library.afterDOMLoaded = script

export const Colophon: QuartzComponent = (props) => <footer class="archive-footer"><span>LES ARCHIVES D’ALRICK <i>✧</i> L’Odyssée d’Orin</span><span>Archives vivantes · <a class="internal" href={`${root(props)}/a-propos`}>Sources & méthode</a></span></footer>

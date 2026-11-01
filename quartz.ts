import { loadQuartzConfig, loadQuartzLayout } from "./quartz/plugins/loader/config-loader"
import { Search } from "@quartz-community/search"
import { Brand, Navigation, Topbar, PageIntro, Library, Colophon } from "./quartz/components/Alrick"
import { AlrickFrame } from "./quartz/components/frames/AlrickFrame"
import { Atelier5d6 } from "./quartz/components/Atelier5d6"
import { BestiaryWorkshop } from "./quartz/components/BestiaryWorkshop"
import { frameRegistry } from "./quartz/components/frames/registry"
import { PageTypeDispatcher } from "./quartz/plugins/pageTypes/dispatcher"

const config = await loadQuartzConfig()
frameRegistry.register("alrick", AlrickFrame, "alrick")
export default config
const shared = { frame: "alrick", left: [Brand, Search(), Navigation], header: [Topbar], footer: [Colophon] }
export const layout = await loadQuartzLayout({
  defaults: { ...shared, beforeBody: [PageIntro, Library, Atelier5d6, BestiaryWorkshop] },
  byPageType: {
    content: { ...shared, beforeBody: [PageIntro, Library, Atelier5d6, BestiaryWorkshop] },
    folder: { ...shared, beforeBody: [PageIntro] },
    tag: { ...shared, beforeBody: [PageIntro] },
    "404": { ...shared, left: [Brand, Navigation], beforeBody: [] },
  },
})
// The YAML loader creates its dispatcher before TypeScript layout overrides.
// Replace that emitter with the same Quartz dispatcher and our final layout.
config.plugins.emitters = config.plugins.emitters.filter((emitter) => emitter.name !== "PageTypeDispatcher")
config.plugins.emitters.push(PageTypeDispatcher(layout))

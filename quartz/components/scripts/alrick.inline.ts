function setupLibrary() {
  const input = document.querySelector<HTMLInputElement>("#library-search")
  if (!input) return
  const cards = Array.from(document.querySelectorAll<HTMLAnchorElement>(".archive-card"))
  const filters = Array.from(document.querySelectorAll<HTMLButtonElement>("[data-filter]"))
  const empty = document.querySelector<HTMLElement>(".empty-library")!
  const count = document.querySelector<HTMLElement>("#library-count")!
  const reset = document.querySelector<HTMLButtonElement>("#reset-library")!
  let category = "all"
  const normalize = (value: string) => value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLocaleLowerCase("fr")
  const update = () => {
    const query = normalize(input.value.trim())
    let visible = 0
    for (const card of cards) {
      card.hidden = !(category === "all" || card.dataset.category === category) || !normalize(card.dataset.search ?? "").includes(query)
      if (!card.hidden) visible++
    }
    count.textContent = `${visible} fiche${visible > 1 ? "s" : ""}`
    empty.hidden = visible !== 0
    filters.forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.filter === category)))
  }
  const controller = new AbortController()
  const options = { signal: controller.signal }
  input.addEventListener("input", update, options)
  filters.forEach((button) => button.addEventListener("click", () => { category = button.dataset.filter!; update() }, options))
  reset.addEventListener("click", () => { category = "all"; input.value = ""; update(); input.focus() }, options)
  window.addCleanup(() => controller.abort())
}
document.addEventListener("nav", setupLibrary)

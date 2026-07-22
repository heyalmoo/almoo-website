// almoo custom script — fixes the search preview's scroll-to-match position.
// Registered in quartz/plugins/emitters/componentResources.ts.
function setupSearchPreviewScrollFix() {
  const space = document.querySelector(".search-space")
  if (!space || space.hasAttribute("data-preview-scroll-fix")) return
  space.setAttribute("data-preview-scroll-fix", "true")

  // The search plugin's own scroll-to-match logic (in its requestAnimationFrame
  // callback) has two separate bugs. First, no guard against rapid typing:
  // each keystroke's preview update schedules its own uncoordinated scroll
  // adjustment, and a stale one from an earlier keystroke can fire after the
  // final content has settled, landing the scroll in the wrong place. Second,
  // its offset math walks the `offsetParent` chain assuming that walk will
  // land exactly on .preview-container — but that container is
  // `position: static`, so it's never anyone's offsetParent, and the walk
  // sails past it up to the page root, wildly overshooting the real distance.
  //
  // Fix both: (a) tag every content update with a generation number and only
  // let the *last* one actually move the scroll position, waiting two
  // animation frames — one more than the plugin's own single rAF — so ours
  // always applies after theirs for the same update and wins; (b) compute the
  // target's position with getBoundingClientRect() relative to the preview's
  // own current scroll position, which works regardless of positioning
  // context instead of assuming a specific offsetParent chain.
  let generation = 0

  const positionPreview = (myGeneration: number) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (myGeneration !== generation) return // superseded by a newer update
        const preview = space.querySelector(".preview-container") as HTMLElement | null
        if (!preview) return
        const highlights = Array.from(preview.getElementsByClassName("highlight")) as HTMLElement[]
        if (highlights.length === 0) {
          preview.scrollTop = 0
          return
        }
        highlights.sort((a, b) => b.innerHTML.length - a.innerHTML.length)
        const target = highlights[0]
        const targetOffset =
          target.getBoundingClientRect().top - preview.getBoundingClientRect().top + preview.scrollTop
        preview.scrollTop = Math.max(0, targetOffset - 16)
      })
    })
  }

  const onPreviewChanged = () => {
    generation++
    // No immediate scrollTop reset here: forcing it to 0 synchronously and
    // then correcting it two frames later is itself two visible jumps on
    // every keystroke. Just schedule the one correct final position instead.
    positionPreview(generation)
  }

  // Watch .preview-container directly, once it exists, rather than the whole
  // .search-space — that also contains the results list, whose own re-renders
  // (on every keystroke) would otherwise bump the generation counter for
  // reasons unrelated to the preview and stall the positioning below.
  let previewObserver: MutationObserver | null = null
  const watchPreview = () => {
    const preview = space.querySelector(".preview-container")
    if (!preview || previewObserver) return
    previewObserver = new MutationObserver(onPreviewChanged)
    previewObserver.observe(preview, { childList: true, subtree: true })
  }

  watchPreview()
  // Deliberately never disconnected: both observers live for the page's
  // lifetime (the data-attribute guard above prevents duplicates across SPA
  // navigations); the preview container persists once created.
  const spaceObserver = new MutationObserver(watchPreview)
  spaceObserver.observe(space, { childList: true })
}

document.addEventListener("nav", setupSearchPreviewScrollFix)
document.addEventListener("render", setupSearchPreviewScrollFix)

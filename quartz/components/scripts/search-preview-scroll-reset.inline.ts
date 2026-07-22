function setupSearchPreviewScrollReset() {
  const space = document.querySelector(".search-space")
  if (!space || space.hasAttribute("data-preview-scroll-reset")) return
  space.setAttribute("data-preview-scroll-reset", "true")

  // The search plugin only scrolls the preview panel *to* a match when it
  // finds one, but never resets scroll position back to the top otherwise —
  // so a preview can inherit the scroll offset left over from a previous
  // hover (e.g. when the new result's match is in its title, not its body,
  // and the preview pane holds only body content). Reset to the top first;
  // if the plugin's own requestAnimationFrame callback then scrolls to an
  // actual highlight, that still runs after this and wins.
  const observer = new MutationObserver(() => {
    const preview = space.querySelector(".preview-container")
    if (preview) preview.scrollTop = 0
  })
  observer.observe(space, { childList: true, subtree: true })
}

document.addEventListener("nav", setupSearchPreviewScrollReset)
document.addEventListener("render", setupSearchPreviewScrollReset)

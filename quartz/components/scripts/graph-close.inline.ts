function setupGraphCloseButton() {
  for (const outer of document.querySelectorAll(".global-graph-outer")) {
    const container = outer.querySelector(".global-graph-container")
    if (!container || container.hasAttribute("data-close-btn-observed")) continue
    container.setAttribute("data-close-btn-observed", "true")

    // The graph plugin clears and rebuilds this container's canvas every time
    // the fullscreen graph is opened, which would wipe out a one-time-appended
    // button. Watch for that and re-add the button each time it happens.
    const ensureButton = () => {
      if (container.querySelector(".graph-close-button")) return
      const btn = document.createElement("button")
      btn.type = "button"
      btn.className = "graph-close-button"
      btn.setAttribute("aria-label", "Close graph view")
      btn.textContent = "×"
      btn.addEventListener("click", () => {
        // Reuse the graph plugin's own Escape-key close handler instead of
        // reaching into its (ephemeral, refetched-on-every-deploy) internals.
        document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }))
      })
      container.appendChild(btn)
    }

    ensureButton()
    new MutationObserver(ensureButton).observe(container, { childList: true })
  }
}

document.addEventListener("nav", setupGraphCloseButton)
document.addEventListener("render", setupGraphCloseButton)

// almoo custom script — makes the explorer title plain, non-interactive text.
// Registered in quartz/plugins/emitters/componentResources.ts; the matching
// cursor/margin rules live in the Explorer section of quartz/styles/custom.scss.
function makeExplorerTitleInert() {
  // The "What to read" title is forced permanently expanded via CSS (see
  // custom.scss), but the plugin still renders it as a real <button>. Native
  // buttons suppress text-selection drags starting on their own descendants
  // regardless of `user-select`/`pointer-events` CSS — that's a built-in
  // browser behavior tied to the element being a button, not something CSS
  // can override. Since it has nothing left to do, replace it with a plain
  // <div> so the text behaves exactly like ordinary body text.
  for (const btn of document.querySelectorAll("button.desktop-explorer")) {
    const h2 = btn.querySelector("h2")
    if (!h2) continue
    const replacement = document.createElement("div")
    replacement.className = btn.className
    // Not a toggle anymore — drop the class the plugin's click handlers target.
    replacement.classList.remove("explorer-toggle")
    replacement.appendChild(h2)
    btn.replaceWith(replacement)
  }
}

document.addEventListener("nav", makeExplorerTitleInert)
document.addEventListener("render", makeExplorerTitleInert)

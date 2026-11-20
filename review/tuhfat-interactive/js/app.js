/** Bootstraps the app: loads data, wires navigation, renders the current page. */
const App = (() => {
  const pageInput = document.getElementById("page-input");
  const pageMax = document.getElementById("page-max");
  const prevBtn = document.getElementById("prev-page");
  const nextBtn = document.getElementById("next-page");
  const scanToggle = document.getElementById("toggle-scan");

  function currentPageFromUrl() {
    const n = Number(new URLSearchParams(location.search).get("page"));
    return Number.isInteger(n) && n >= 1 && n <= MAX_PAGE ? n : 1;
  }

  // Book-pane-only navigation: updates the page number, URL and the left (scan/text) pane,
  // but leaves the panel's own state alone. Used when a caller (e.g. selecting a rule tab)
  // already knows exactly which chapter/tab the panel should show and would be fought by
  // PanelView.render()'s own "which chapter owns this page" auto-detection on pages shared
  // by two chapters' bayts.
  async function goToBookPage(n, direction) {
    n = Math.min(MAX_PAGE, Math.max(1, n));
    pageInput.value = n;
    history.replaceState(null, "", `?page=${n}`);
    prevBtn.disabled = n <= 1;
    nextBtn.disabled = n >= MAX_PAGE;
    await BookView.render(n, { animateDirection: direction });
  }

  async function goToPage(n, direction) {
    await goToBookPage(n, direction);
    PanelView.render(Number(pageInput.value));
  }

  prevBtn.addEventListener("click", () => goToPage(Number(pageInput.value) - 1, "next"));
  nextBtn.addEventListener("click", () => goToPage(Number(pageInput.value) + 1, "prev"));
  pageInput.addEventListener("change", () => goToPage(Number(pageInput.value)));
  scanToggle.addEventListener("click", () => {
    const on = BookView.toggleScanMode();
    scanToggle.classList.toggle("active", on);
    goToPage(Number(pageInput.value));
  });

  document.addEventListener("keydown", (e) => {
    if (document.activeElement === pageInput) return;
    if (e.key === "ArrowLeft") goToPage(Number(pageInput.value) + 1, "prev"); // RTL book: left arrow = next page
    if (e.key === "ArrowRight") goToPage(Number(pageInput.value) - 1, "next");
  });

  (async () => {
    pageInput.max = MAX_PAGE;
    pageMax.textContent = MAX_PAGE;
    await Data.load();
    goToPage(currentPageFromUrl());
  })();

  return { goToPage, goToBookPage, currentPage: () => Number(pageInput.value) };
})();

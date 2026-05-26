(function () {
  const storageKey = "graphql-gene-theme";
  const root = document.body;
  const toggle = document.getElementById("themeToggle");

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    if (toggle) {
      toggle.setAttribute("aria-pressed", String(theme === "light"));
      toggle.setAttribute(
        "title",
        theme === "light" ? "Switch to dark mode" : "Switch to light mode"
      );
    }
  }

  const saved = localStorage.getItem(storageKey);
  applyTheme(saved || "dark");

  if (toggle) {
    toggle.addEventListener("click", function () {
      const next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
      localStorage.setItem(storageKey, next);
      applyTheme(next);
    });
  }
})();

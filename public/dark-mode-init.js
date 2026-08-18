(function initializeTheme() {
  try {
    let mode = window.localStorage.getItem("theme") ?? "system";

    if (mode !== "system" && mode !== "light" && mode !== "dark") {
      mode = "system";
    }

    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    const isDark = mode === "dark" || (mode === "system" && prefersDark);
    const root = document.documentElement;

    root.dataset.theme = mode;
    root.classList.toggle("dark", isDark);
  } catch {
    // Keep the server-rendered light theme when browser APIs are unavailable.
  }
})();

import { THEME_STORAGE_KEY } from "@/lib/constants";

/**
 * Zet vóór de eerste render al de juiste `dark`-class op `<html>`, zodat er
 * geen flash van het verkeerde thema is terwijl React nog hydrateert. Enkel
 * relevant voor `/admin` (de publieke site heeft geen dark-mode-CSS), maar
 * onschadelijk als het overal in de root layout staat.
 */
export const themeAntiFlashScript = `
(function () {
  try {
    var theme = localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)}) || "system";
    var isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    if (isDark) document.documentElement.classList.add("dark");
  } catch (e) {}
})();
`;

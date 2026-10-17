// Theme choice for PadiUp: "system" (default), "light" or "dark", saved on the device.

export const THEME_KEY = "quest-theme";
export type ThemeChoice = "system" | "light" | "dark";

/** Inline script run before first paint, so the page never flashes the wrong theme. */
export const themeScript = `(function(){try{var el=document.currentScript&&document.currentScript.parentElement;if(!el)return;var t=localStorage.getItem("${THEME_KEY}")||"system";var light=t==="light"||(t==="system"&&window.matchMedia("(prefers-color-scheme: light)").matches);el.setAttribute("data-quest-theme",light?"light":"dark");}catch(e){}})();`;

export function applyTheme(choice: ThemeChoice) {
  const el = document.querySelector<HTMLElement>(".quest-night");
  if (!el) return;
  const light = choice === "light" || (choice === "system" && window.matchMedia("(prefers-color-scheme: light)").matches);
  el.setAttribute("data-quest-theme", light ? "light" : "dark");
}

export function savedTheme(): ThemeChoice {
  try {
    const t = localStorage.getItem(THEME_KEY);
    return t === "light" || t === "dark" ? t : "system";
  } catch {
    return "system";
  }
}

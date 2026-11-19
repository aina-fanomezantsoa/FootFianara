"use client";

const icone = (d: string, cls: string) => (
  <svg
    viewBox="0 0 24 24"
    width="20"
    height="20"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
    className={cls}
  >
    <path d={d} />
  </svg>
);

/** Bascule clair/sombre : data-theme sur <html> (lu avant l'affichage par le script du layout) + localStorage. */
export function ThemeToggle() {
  const basculer = () => {
    const clair = document.documentElement.dataset.theme !== "light";
    document.documentElement.dataset.theme = clair ? "light" : "dark";
    try {
      localStorage.setItem("theme", clair ? "light" : "dark");
    } catch {} // stockage indisponible : le choix vaut pour la page seulement
  };
  return (
    <button
      type="button"
      onClick={basculer}
      aria-label="Basculer entre le mode clair et le mode sombre"
      className="flex h-11 w-11 items-center justify-center rounded-full text-foreground transition-colors hover:bg-border"
    >
      {/* Soleil affiché en mode sombre (passer au clair), lune en mode clair. */}
      {icone(
        "M12 4V2m0 20v-2m8-8h2M2 12h2m13.66-5.66 1.41-1.41M4.93 19.07l1.41-1.41m0-11.32L4.93 4.93m14.14 14.14-1.41-1.41M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z",
        "block [[data-theme=light]_&]:hidden",
      )}
      {icone(
        "M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z",
        "hidden [[data-theme=light]_&]:block",
      )}
    </button>
  );
}

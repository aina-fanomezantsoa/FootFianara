"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, type ReactNode } from "react";

const svg = (d: ReactNode) => (
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
  >
    {d}
  </svg>
);

const liens = [
  {
    label: "Accueil",
    href: "/",
    icone: svg(<path d="M3 11 12 4l9 7M5 10v10h14V10" />),
    actif: (p: string) => p === "/",
  },
  {
    label: "Classement",
    href: "/classement",
    icone: svg(<path d="M4 6h2M4 12h2M4 18h2M9 6h11M9 12h11M9 18h11" />),
  },
  {
    label: "Matchs",
    href: "/matchs",
    icone: svg(
      <>
        <rect x="3" y="5" width="18" height="16" rx="1" />
        <path d="M3 10h18M8 3v4M16 3v4" />
      </>,
    ),
  },
  {
    label: "Clubs",
    href: "/clubs",
    icone: svg(<path d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6Z" />),
  },
  {
    label: "Joueurs",
    href: "/joueurs",
    icone: svg(
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c0-4 3.5-7 8-7s8 3 8 7" />
      </>,
    ),
    autres: ["/statistiques"],
  },
  { label: "Statistiques", href: "/statistiques", bureau: true },
];

const estActif = (l: (typeof liens)[number], p: string) =>
  l.actif?.(p) ??
  [l.href, ...(l.autres ?? [])].some((h) => p === h || p.startsWith(h + "/"));

/** Barre basse (mobile) ou liens d'en-tête (bureau), sous <Suspense> : usePathname est une donnée de requête. */
export function Nav({ bureau = false }: { bureau?: boolean }) {
  return (
    <Suspense fallback={<NavLinks bureau={bureau} p="" />}>
      <NavActive bureau={bureau} />
    </Suspense>
  );
}

function NavActive({ bureau }: { bureau: boolean }) {
  return <NavLinks bureau={bureau} p={usePathname()} />;
}

/** Statistiques n'est que sur bureau. */
function NavLinks({ bureau, p }: { bureau: boolean; p: string }) {
  if (bureau)
    return (
      <ul className="hidden gap-5 md:flex">
        {liens.map((l) => {
          // Sur bureau, Statistiques a son lien : Joueurs n'est plus actif sur /statistiques.
          const actif =
            l.href === "/joueurs" ? p.startsWith("/joueurs") : estActif(l, p);
          return (
            <li key={l.href}>
              <Link
                href={l.href}
                aria-current={actif ? "page" : undefined}
                className={`flex min-h-11 items-center border-b-2 text-sm font-semibold uppercase transition-colors ${actif ? "border-foreground text-foreground" : "border-transparent text-muted hover:text-foreground"}`}
              >
                {l.label}
              </Link>
            </li>
          );
        })}
      </ul>
    );
  return (
    <ul className="flex items-center justify-between">
      {liens
        .filter((l) => !l.bureau)
        .map((l) => {
          const actif = estActif(l, p);
          return (
            <li key={l.href}>
              <Link
                href={l.href}
                aria-label={l.label}
                aria-current={actif ? "page" : undefined}
                className={`flex h-11 items-center justify-center gap-2 rounded-full text-sm font-medium transition-colors ${actif ? "bg-border px-4 text-foreground" : "w-11 text-foreground"}`}
              >
                {l.icone}
                {actif && l.label}
              </Link>
            </li>
          );
        })}
    </ul>
  );
}

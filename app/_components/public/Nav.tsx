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

const liens: {
  label: string;
  href: string;
  icone: ReactNode;
  autres?: string[];
}[] = [
  {
    label: "Accueil",
    href: "/",
    icone: svg(<path d="M3 11 12 4l9 7M5 10v10h14V10" />),
  },
  {
    label: "Actualités",
    href: "/actualites",
    icone: svg(
      <>
        <rect x="3" y="4" width="18" height="16" rx="1" />
        <path d="M7 8h10M7 12h10M7 16h6" />
      </>,
    ),
  },
  {
    label: "Ligue",
    href: "/ligue",
    icone: svg(
      <path d="M8 4h8v5a4 4 0 0 1-8 0V4ZM8 6H5v1a3 3 0 0 0 3 3M16 6h3v1a3 3 0 0 1-3 3M12 13v7M8 20h8" />,
    ),
    // Pages de la D1 atteintes depuis /ligue.
    autres: ["/classement", "/matchs", "/clubs"],
  },
  {
    label: "Section",
    href: "/section",
    icone: svg(
      <>
        <rect x="4" y="4" width="7" height="7" rx="1" />
        <rect x="13" y="4" width="7" height="7" rx="1" />
        <rect x="4" y="13" width="7" height="7" rx="1" />
        <rect x="13" y="13" width="7" height="7" rx="1" />
      </>,
    ),
  },
];

const estActif = (l: (typeof liens)[number], p: string) =>
  l.href === "/"
    ? p === "/"
    : [l.href, ...(l.autres ?? [])].some(
        (h) => p === h || p.startsWith(h + "/"),
      );

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

function NavLinks({ bureau, p }: { bureau: boolean; p: string }) {
  if (bureau)
    return (
      <ul className="hidden gap-5 md:flex">
        {liens.map((l) => {
          const actif = estActif(l, p);
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
      {liens.map((l) => {
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

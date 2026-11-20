"use client";

import { usePathname } from "next/navigation";
import { ButtonLink } from "@/app/_components/ui/Button";

// Pages admin ayant un équivalent public ; le reste renvoie à l'accueil.
const PUBLIQUES: Record<string, string> = {
  clubs: "clubs",
  joueurs: "joueurs",
  matchs: "matchs",
  actualites: "actualites",
  divisions: "classement",
};

/** Lien vers la page visiteur correspondant à la page admin courante. */
export function VoirSite() {
  const [, , page, id] = usePathname().split("/");
  const base = PUBLIQUES[page];
  // Seules les fiches clubs/joueurs/matchs ont une page publique par id.
  const fiche =
    /^\d+$/.test(id ?? "") && page !== "actualites" && base === page;
  const href = base ? `/${base}${fiche ? `/${id}` : ""}` : "/";
  return (
    <div className="mx-auto flex max-w-5xl justify-end px-4 pt-3 sm:px-6">
      <ButtonLink
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        variant="secondary"
      >
        Voir côté visiteur ↗
      </ButtonLink>
    </div>
  );
}

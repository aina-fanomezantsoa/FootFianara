import type { Metadata } from "next";
import Link from "next/link";
import {
  CalendrierVide,
  DivisionTabs,
  EmptyState,
} from "@/app/_components/public/Blocs";
import { ClubCrest } from "@/app/_components/public/ClubCrest";
import { clubsDivision, contexte } from "@/lib/public";

export const metadata: Metadata = {
  title: "Clubs",
  description: "Les clubs du championnat de Fianarantsoa par division.",
};

export default async function Clubs({ searchParams }: PageProps<"/clubs">) {
  const { division: param } = await searchParams;
  const { saison, divisions, division } = await contexte(String(param ?? ""));
  const titre = <h1 className="title-sport text-3xl sm:text-4xl">Clubs</h1>;
  if (!saison || !division)
    return (
      <>
        {titre}
        <CalendrierVide />
      </>
    );
  const clubs = await clubsDivision(saison.id, division.id);
  return (
    <>
      {titre}
      <DivisionTabs
        divisions={divisions}
        active={division.name}
        path="/clubs"
      />
      {clubs.length === 0 ? (
        <EmptyState title="Aucun club inscrit dans cette division" />
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {clubs.map((c) => (
            <li key={c.id}>
              <Link
                href={`/clubs/${c.id}`}
                className="flex h-full flex-col items-center gap-2 rounded-md border border-border bg-surface p-4 text-center transition-colors hover:border-foreground"
              >
                <ClubCrest
                  shortName={c.shortName}
                  logoUrl={c.logoUrl}
                  size={48}
                />
                <span className="line-clamp-2 text-sm font-semibold">
                  {c.name}
                </span>
                {c.district && (
                  <span className="text-xs text-muted">{c.district}</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

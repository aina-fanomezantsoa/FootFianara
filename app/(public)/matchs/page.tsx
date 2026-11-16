import type { Metadata } from "next";
import Link from "next/link";
import { CalendrierVide, DivisionTabs } from "@/app/_components/public/Blocs";
import { MatchList } from "@/app/_components/public/MatchCard";
import {
  contexte,
  dateLongue,
  journeeParDefaut,
  matchsDivision,
  type MatchPublic,
} from "@/lib/public";

export const metadata: Metadata = {
  title: "Matchs",
  description:
    "Calendrier et résultats du championnat de Fianarantsoa, journée par journée.",
};

export default async function Matchs({ searchParams }: PageProps<"/matchs">) {
  const { division: param, journee: j } = await searchParams;
  const { saison, divisions, division } = await contexte(String(param ?? ""));
  const titre = <h1 className="title-sport text-3xl sm:text-4xl">Matchs</h1>;
  const matchs =
    saison && division ? await matchsDivision(saison.id, division.id) : [];
  if (!division || matchs.length === 0)
    return (
      <>
        {titre}
        {division && (
          <DivisionTabs
            divisions={divisions}
            active={division.name}
            path="/matchs"
          />
        )}
        <CalendrierVide />
      </>
    );
  const journees = [...new Set(matchs.map((m) => m.matchday))];
  const demandee = Number(j);
  const journee = journees.includes(demandee)
    ? demandee
    : journeeParDefaut(matchs)!;
  const href = (n: number) => `/matchs?division=${division.name}&journee=${n}`;
  const parDate = new Map<string, MatchPublic[]>();
  for (const m of matchs.filter((m) => m.matchday === journee)) {
    const cle = m.kickoffAt ? dateLongue(m.kickoffAt) : "Date à fixer";
    parDate.set(cle, [...(parDate.get(cle) ?? []), m]);
  }
  const i = journees.indexOf(journee);
  return (
    <>
      {titre}
      <DivisionTabs
        divisions={divisions}
        active={division.name}
        path="/matchs"
      />
      <nav aria-label="Journées">
        {/* Seul défilement horizontal du site : une rangée de boutons, pas un tableau. */}
        <ul className="flex snap-x gap-1 overflow-x-auto pb-1">
          {journees.map((n) => (
            <li key={n} className="snap-start">
              <Link
                href={href(n)}
                aria-current={n === journee ? "page" : undefined}
                aria-label={`Journée ${n}`}
                className={`num flex min-h-11 min-w-11 items-center justify-center rounded-sm border font-display transition-colors ${n === journee ? "border-foreground bg-foreground text-background" : "border-border text-muted hover:text-foreground"}`}
              >
                J{n}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <h2 className="title-sport text-xl">Journée {journee}</h2>
      {[...parDate].map(([date, liste]) => (
        <section key={date} className="space-y-2">
          <h3 className="text-xs uppercase text-muted">{date}</h3>
          <MatchList matchs={liste} />
        </section>
      ))}
      <div className="flex justify-between text-sm">
        {i > 0 ? (
          <Link
            href={href(journees[i - 1])}
            className="flex min-h-11 items-center text-muted hover:text-foreground"
          >
            ‹ Journée précédente
          </Link>
        ) : (
          <span />
        )}
        {i < journees.length - 1 && (
          <Link
            href={href(journees[i + 1])}
            className="flex min-h-11 items-center text-muted hover:text-foreground"
          >
            Journée suivante ›
          </Link>
        )}
      </div>
    </>
  );
}

import type { Metadata } from "next";
import { CalendrierVide, DivisionTabs, EmptyState } from "@/app/_components/public/Blocs";
import { StandingsTable, zones } from "@/app/_components/public/StandingsTable";
import { contexte, derniereJournee } from "@/lib/public";
import { getStandings } from "@/lib/standings-db";

export const metadata: Metadata = {
  title: "Classement",
  description: "Classement du championnat de Fianarantsoa par division.",
};

export default async function Classement({ searchParams }: PageProps<"/classement">) {
  const { division: param } = await searchParams;
  const { saison, divisions, division } = await contexte(String(param ?? ""));
  const titre = <h1 className="title-sport text-3xl sm:text-4xl">Classement</h1>;
  if (!saison || !division)
    return (
      <>
        {titre}
        <CalendrierVide />
      </>
    );
  const [rows, journee] = await Promise.all([
    getStandings(saison.id, division.id),
    derniereJournee(saison.id, division.id),
  ]);
  const [promotion, relegation] = zones(division.name);
  return (
    <>
      <div>
        {titre}
        <p className="text-sm text-muted">
          {saison.name}
          {journee && ` · Journée ${journee}`}
        </p>
      </div>
      <DivisionTabs divisions={divisions} active={division.name} path="/classement" />
      {rows.length === 0 ? (
        <EmptyState title="Aucun club inscrit dans cette division" />
      ) : (
        <div className="space-y-2">
          {!journee && <p className="text-sm text-muted">Aucun match joué</p>}
          <StandingsTable rows={rows} promotion={promotion} relegation={relegation} />
          <p className="text-xs text-muted">
            Égalité : différence de buts, buts marqués, confrontation directe
          </p>
        </div>
      )}
    </>
  );
}

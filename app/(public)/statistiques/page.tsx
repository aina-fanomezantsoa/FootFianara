import type { Metadata } from "next";
import { CalendrierVide, DivisionTabs, JoueursTabs } from "@/app/_components/public/Blocs";
import { StatList } from "@/app/_components/public/Joueurs";
import { contexte } from "@/lib/public";
import { getCards, getTopAssists, getTopScorers } from "@/lib/stats";

export const metadata: Metadata = {
  title: "Statistiques",
  description: "Meilleurs buteurs, passeurs et cartons du championnat de Fianarantsoa.",
};

export default async function Statistiques({ searchParams }: PageProps<"/statistiques">) {
  const { division: param } = await searchParams;
  const { saison, divisions, division } = await contexte(String(param ?? ""));
  const entete = (
    <>
      <h1 className="title-sport text-3xl sm:text-4xl">Statistiques</h1>
      <JoueursTabs active="Statistiques" />
    </>
  );
  if (!saison || !division)
    return (
      <>
        {entete}
        <CalendrierVide />
      </>
    );
  const q = { seasonId: saison.id, divisionId: division.id, limit: 20 };
  const [buteurs, passeurs, cartons] = await Promise.all([getTopScorers(q), getTopAssists(q), getCards(q)]);
  return (
    <>
      {entete}
      <DivisionTabs divisions={divisions} active={division.name} path="/statistiques" />
      <div className="grid gap-3 lg:grid-cols-3">
        <StatList title="Buteurs" unit="buts" rows={buteurs.map((r) => ({ ...r, value: r.goals }))} />
        <StatList title="Passeurs" unit="passes" rows={passeurs.map((r) => ({ ...r, value: r.assists }))} />
        <StatList
          title="Cartons"
          unit="cartons jaunes"
          rows={cartons.map((r) => ({ ...r, value: r.yellow, extra: `${r.red} rouge${r.red > 1 ? "s" : ""}` }))}
        />
      </div>
    </>
  );
}

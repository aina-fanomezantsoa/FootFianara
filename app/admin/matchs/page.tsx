import Link from "next/link";
import { Alerte, Choix } from "@/app/_components/Champ";
import { dateHeure, STATUTS } from "@/app/_components/admin/format";
import { Badge } from "@/app/_components/ui/Badge";
import { Button } from "@/app/_components/ui/Button";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { hasRole } from "@/lib/roles";
import { genererCalendrier } from "./actions";

export default async function Matchs({
  searchParams,
}: {
  searchParams: Promise<{
    saison?: string;
    division?: string;
    erreur?: string;
  }>;
}) {
  const user = await requireRole("ASSISTANT");
  const admin = hasRole(user.role, "ADMIN");
  const q = await searchParams;
  const [saisons, divisions] = await Promise.all([
    db.season.findMany({ orderBy: { startDate: "desc" } }),
    db.division.findMany({ orderBy: { level: "asc" } }),
  ]);
  // Par défaut : saison la plus récente, division de plus haut niveau.
  const seasonId = Number(q.saison) || saisons[0]?.id || 0;
  const divisionId = Number(q.division) || divisions[0]?.id || 0;
  const club = { select: { club: { select: { shortName: true } } } };
  const [matchs, nbClubs] = await Promise.all([
    db.match.findMany({
      where: { seasonId, divisionId },
      orderBy: [{ matchday: "asc" }, { kickoffAt: "asc" }, { id: "asc" }],
      include: {
        homeClubSeason: club,
        awayClubSeason: club,
        stadium: { select: { name: true } },
      },
    }),
    db.clubSeason.count({ where: { seasonId, divisionId } }),
  ]);
  const journees = Map.groupBy(matchs, (m) => m.matchday);

  return (
    <main className="mx-auto max-w-2xl p-4 sm:p-6">
      <Link
        href="/admin"
        className="inline-flex min-h-11 items-center underline"
      >
        Administration
      </Link>
      <h1 className="title-sport mb-4 text-xl">Matchs</h1>
      <Alerte>{q.erreur}</Alerte>

      <form className="mb-6 grid gap-3 sm:grid-cols-3 sm:items-end">
        <Choix
          label="Saison"
          name="saison"
          defaultValue={seasonId || ""}
          options={saisons.map((s) => ({ value: s.id, label: s.name }))}
        />
        <Choix
          label="Division"
          name="division"
          defaultValue={divisionId || ""}
          options={divisions.map((d) => ({ value: d.id, label: d.name }))}
        />
        <Button type="submit" variant="secondary">
          Afficher
        </Button>
      </form>

      {matchs.length === 0 && (
        <div className="mb-6 grid gap-3">
          <p className="text-muted">
            Aucun match pour cette division ({nbClubs} clubs affectés).
          </p>
          {admin && seasonId > 0 && divisionId > 0 && (
            <form action={genererCalendrier}>
              <input type="hidden" name="seasonId" value={seasonId} />
              <input type="hidden" name="divisionId" value={divisionId} />
              <Button type="submit" className="w-full">
                Générer le calendrier
              </Button>
            </form>
          )}
        </div>
      )}

      {[...journees].map(([j, liste]) => (
        <section key={j} id={`j${j}`} className="mb-6">
          <h2 className="title-sport mb-2 text-lg">Journée {j}</h2>
          <ul className="divide-y divide-border border-y border-border">
            {liste.map((m) => (
              <li key={m.id}>
                <Link
                  href={`/admin/matchs/${m.id}`}
                  className="grid min-h-11 gap-1 py-2 hover:underline"
                >
                  <span className="flex items-center gap-2 font-semibold">
                    <span className="min-w-0 flex-1 truncate text-right">
                      {m.homeClubSeason.club.shortName}
                    </span>
                    <span className="num w-14 text-center">
                      {m.homeGoals ?? "–"} - {m.awayGoals ?? "–"}
                    </span>
                    <span className="min-w-0 flex-1 truncate">
                      {m.awayClubSeason.club.shortName}
                    </span>
                  </span>
                  <span className="flex flex-wrap items-center gap-2 text-xs text-muted">
                    <Badge inverted={m.status === "PLAYED"}>
                      {STATUTS[m.status]}
                    </Badge>
                    <span className="num">{dateHeure(m.kickoffAt)}</span>
                    {m.stadium && <span>{m.stadium.name}</span>}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </main>
  );
}

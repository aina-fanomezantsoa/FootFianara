import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { Badge } from "@/app/_components/ui/Badge";
import { Card } from "@/app/_components/ui/Card";
import { ClubCrest } from "@/app/_components/public/ClubCrest";
import { Score } from "@/app/_components/public/MatchCard";
import { dateComplete, heure, matchDetail } from "@/lib/public";

// Une seule requête pour les métadonnées et la page.
const parId = cache((id: string) =>
  /^\d+$/.test(id) ? matchDetail(Number(id)) : null,
);
const charger = async (params: PageProps<"/matchs/[id]">["params"]) =>
  parId((await params).id);

export async function generateMetadata({
  params,
}: PageProps<"/matchs/[id]">): Promise<Metadata> {
  const m = await charger(params);
  if (!m) return { title: "Match introuvable" };
  const [h, a] = [m.homeClubSeason.club.name, m.awayClubSeason.club.name];
  const joue = m.status === "PLAYED" || m.status === "FORFEIT";
  return {
    title: joue ? `${h} ${m.homeGoals}-${m.awayGoals} ${a}` : `${h} - ${a}`,
    description: `${m.division.name}, journée ${m.matchday} : ${h} contre ${a}.`,
  };
}

const nom = (p: { firstName: string; lastName: string }) =>
  `${p.lastName.toUpperCase()} ${p.firstName[0] ?? ""}.`;

const Carton = ({ rouge }: { rouge: boolean }) => (
  <>
    <span
      aria-hidden
      className={`inline-block h-3.5 w-2.5 rounded-[1px] border border-foreground ${rouge ? "bg-foreground" : ""}`}
    />
    <span className="sr-only">{rouge ? "Carton rouge" : "Carton jaune"}</span>
  </>
);

export default async function MatchPage({ params }: PageProps<"/matchs/[id]">) {
  const m = await charger(params);
  if (!m) notFound();
  const home = m.homeClubSeason.club;
  const away = m.awayClubSeason.club;
  const statut = {
    SCHEDULED: "Programmé",
    POSTPONED: "Reporté",
    FORFEIT: "Forfait",
    PLAYED: null,
  }[m.status];
  const camp = (c: typeof home) => (
    <Link
      href={`/clubs/${c.id}`}
      className="flex min-w-0 flex-col items-center gap-2 text-center hover:underline"
    >
      <span className="sm:hidden">
        <ClubCrest shortName={c.shortName} logoUrl={c.logoUrl} size={48} />
      </span>
      <span className="hidden sm:block">
        <ClubCrest shortName={c.shortName} logoUrl={c.logoUrl} size={96} />
      </span>
      <span className="w-full font-display text-lg uppercase leading-tight break-words">
        {c.name}
      </span>
    </Link>
  );
  const fautif = (m.homeGoals ?? 0) < (m.awayGoals ?? 0) ? home : away;
  return (
    <>
      <Link
        href={`/matchs?division=${m.division.name}&journee=${m.matchday}`}
        className="flex min-h-11 items-center text-sm text-muted hover:text-foreground"
      >
        ‹ Journée {m.matchday}
      </Link>
      <h1 className="sr-only">
        {home.name} contre {away.name}
      </h1>
      <Card className="space-y-4 py-6">
        <p className="flex items-center justify-center gap-2 text-xs text-muted">
          <Badge>{m.division.name}</Badge> Journée {m.matchday}
        </p>
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          {camp(home)}
          <p
            aria-label={
              m.status === "PLAYED" || m.status === "FORFEIT"
                ? `Score : ${m.homeGoals} à ${m.awayGoals}`
                : undefined
            }
          >
            <Score m={m} className="font-display text-5xl sm:text-6xl" />
          </p>
          {camp(away)}
        </div>
        {statut && (
          <p className="text-center">
            <Badge inverted={m.status !== "SCHEDULED"}>{statut}</Badge>
          </p>
        )}
      </Card>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-xs text-muted">Date</dt>
          <dd>{m.kickoffAt ? dateComplete(m.kickoffAt) : "À fixer"}</dd>
        </div>
        {m.kickoffAt && (
          <div>
            <dt className="text-xs text-muted">Coup d&apos;envoi</dt>
            <dd className="num">{heure(m.kickoffAt)}</dd>
          </div>
        )}
        <div>
          <dt className="text-xs text-muted">Stade</dt>
          <dd>{m.stadium?.name ?? "À fixer"}</dd>
        </div>
      </dl>
      <Card className="space-y-3">
        <h2 className="title-sport text-xl">Événements</h2>
        {m.status === "FORFEIT" ? (
          <p className="text-sm">
            Victoire 3-0 sur tapis vert : forfait de {fautif.name}.
          </p>
        ) : m.status === "SCHEDULED" ? (
          <p className="text-sm text-muted">
            Le résultat sera publié après le match.
          </p>
        ) : m.status === "POSTPONED" ? (
          <p className="text-sm text-muted">
            Match reporté, nouvelle date à venir.
          </p>
        ) : m.events.length === 0 ? (
          <p className="text-sm text-muted">Aucun événement enregistré.</p>
        ) : (
          <>
            <ol>
              {m.events.map((e) => {
                const domicile = e.player.squads.some(
                  (s) => s.clubSeasonId === m.homeClubSeasonId,
                );
                const club = domicile ? home : away;
                return (
                  <li
                    key={e.id}
                    className={`flex min-h-11 items-center gap-3 border-b border-border py-2 last:border-0 ${domicile ? "" : "sm:flex-row-reverse sm:text-right"}`}
                  >
                    <span className="num w-10 shrink-0 text-muted">
                      {e.minute}&apos;
                    </span>
                    <span className="flex w-10 shrink-0 justify-center">
                      {e.type === "GOAL" && <Badge inverted>But</Badge>}
                      {e.type === "OWN_GOAL" && <Badge>CSC</Badge>}
                      {(e.type === "YELLOW" || e.type === "RED") && (
                        <Carton rouge={e.type === "RED"} />
                      )}
                    </span>
                    <span className="min-w-0">
                      <span className="block">
                        {nom(e.player)}
                        {e.type === "OWN_GOAL" && " (c.s.c.)"}
                      </span>
                      {e.assistPlayer && (
                        <span className="block text-xs text-muted">
                          passe : {nom(e.assistPlayer)}
                        </span>
                      )}
                      <span className="block text-xs text-muted sm:hidden">
                        {club.shortName}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ol>
            <p className="flex flex-wrap items-center gap-2 text-xs text-muted">
              <span
                aria-hidden
                className="inline-block h-3.5 w-2.5 rounded-[1px] border border-foreground"
              />{" "}
              jaune
              <span
                aria-hidden
                className="inline-block h-3.5 w-2.5 rounded-[1px] border border-foreground bg-foreground"
              />{" "}
              rouge
            </p>
          </>
        )}
      </Card>
    </>
  );
}

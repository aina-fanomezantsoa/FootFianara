import Link from "next/link";
import { Badge } from "@/app/_components/ui/Badge";
import { dateCourte, dateLongue, heure, type MatchPublic } from "@/lib/public";
import { ClubCrest } from "./ClubCrest";

export function Score({ m, className }: { m: MatchPublic; className: string }) {
  if (m.status === "POSTPONED") return <Badge>Reporté</Badge>;
  if (m.status === "SCHEDULED")
    return <span className={className}>{m.kickoffAt ? heure(m.kickoffAt) : "–"}</span>;
  return (
    <span className={`num flex items-center ${className}`}>
      <span className="min-w-[1.2em] text-center">{m.homeGoals}</span>
      <span className="text-muted">–</span>
      <span className="min-w-[1.2em] text-center">{m.awayGoals}</span>
    </span>
  );
}

const joue = (m: MatchPublic) => m.status === "PLAYED" || m.status === "FORFEIT";

export function MatchCard({ m, division = false }: { m: MatchPublic; division?: boolean }) {
  const home = m.homeClubSeason.club;
  const away = m.awayClubSeason.club;
  const perdu = (g: number | null, autre: number | null) =>
    joue(m) && (g ?? 0) < (autre ?? 0) ? "text-muted" : "";
  const quand = m.kickoffAt ? dateLongue(m.kickoffAt) : "date à fixer";
  const label = joue(m)
    ? `${home.name} ${m.homeGoals}, ${away.name} ${m.awayGoals}, ${quand}`
    : `${home.name} contre ${away.name}, ${quand}${m.kickoffAt && m.status === "SCHEDULED" ? ` à ${heure(m.kickoffAt)}` : ""}${m.status === "POSTPONED" ? ", reporté" : ""}`;
  const camp = (c: typeof home, cls: string) => (
    <span className={`flex min-w-0 flex-col items-center gap-1 ${cls}`}>
      <ClubCrest shortName={c.shortName} logoUrl={c.logoUrl} />
      <span className="w-full truncate text-center text-sm font-semibold">{c.shortName}</span>
    </span>
  );
  return (
    <Link
      href={`/matchs/${m.id}`}
      aria-label={label}
      className="block rounded-md border border-border bg-surface p-4 transition-colors hover:border-foreground"
    >
      <span className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        {camp(home, perdu(m.homeGoals, m.awayGoals))}
        <Score m={m} className="font-display text-2xl" />
        {camp(away, perdu(m.awayGoals, m.homeGoals))}
      </span>
      <span className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs text-muted">
        {division && <Badge>{m.division.name}</Badge>}
        <span>
          {m.kickoffAt ? dateCourte(m.kickoffAt) : "Date à fixer"}
          {m.stadium && ` · ${m.stadium.name}`}
        </span>
        {m.status === "FORFEIT" && <Badge>Forfait</Badge>}
      </span>
    </Link>
  );
}

/** Liste de cartes : pile sur mobile, 2 colonnes à partir de md. */
export function MatchList({ matchs, division }: { matchs: MatchPublic[]; division?: boolean }) {
  return (
    <ul className="grid gap-3 md:grid-cols-2">
      {matchs.map((m) => (
        <li key={m.id}>
          <MatchCard m={m} division={division} />
        </li>
      ))}
    </ul>
  );
}

import Link from "next/link";
import { Table, Td, Th } from "@/app/_components/ui/Table";
import { diffSignee } from "@/lib/public";
import type { StandingRowWithClub } from "@/lib/standings-db";
import { ClubCrest } from "./ClubCrest";

// Td/Th ont déjà px-2 et text-left : surcharges en important (pas de tailwind-merge).
const pad = "px-1! sm:px-2!";
const cellule = `${pad} text-right!`;

/** Montée / descente par division (D1 : 0/4, D2 : 4/4, D3 : 4/0). shortcut: lié aux noms D1-D3, à passer en réglage si les divisions changent. */
export const zones = (division: string) =>
  ({ D1: [0, 4], D2: [4, 4], D3: [4, 0] })[division] ?? [0, 0];

export function StandingsTable({
  rows,
  compact = false,
  limit,
  promotion = 0,
  relegation = 0,
}: {
  rows: StandingRowWithClub[];
  compact?: boolean;
  limit?: number;
  promotion?: number;
  relegation?: number;
}) {
  // Avant le premier match, tous à 0 : ordre alphabétique.
  const tri = rows.some((r) => r.played > 0)
    ? rows
    : [...rows].sort((a, b) => a.name.localeCompare(b.name, "fr"));
  const n = tri.length;
  const col = (abbr: string, titre: string, cls = "w-7") => (
    <Th className={`${cls.includes("text-left") ? pad : cellule} ${cls}`}>
      <abbr title={titre} className="no-underline">
        {abbr}
      </abbr>
    </Th>
  );
  return (
    <>
      <Table className="table-fixed">
        <thead>
          <tr>
            {col("Pos", "Position", "w-8 text-left")}
            <Th className={pad}>Club</Th>
            {col("J", "Joués")}
            {!compact && (
              <>
                {col("G", "Gagnés")}
                {col("N", "Nuls")}
                {col("P", "Perdus")}
              </>
            )}
            {col("Diff", "Différence de buts", "w-10")}
            {col("Pts", "Points", "w-9")}
          </tr>
        </thead>
        <tbody>
          {tri.slice(0, limit).map((r, i) => {
            const zone =
              i < promotion
                ? "border-l-2 border-l-foreground"
                : i >= n - relegation
                  ? "border-l-2 border-l-muted [border-left-style:dashed]"
                  : "border-l-2 border-l-transparent";
            return (
              <tr key={r.clubSeasonId}>
                <Td className={`${pad} text-muted ${zone}`}>{r.played ? r.rank : i + 1}</Td>
                <Td className={pad}>
                  <Link href={`/clubs/${r.clubId}`} className="flex min-h-6 items-center gap-2 hover:underline">
                    <ClubCrest shortName={r.shortName} logoUrl={r.logoUrl} size={20} />
                    <span className="truncate sm:hidden">{r.shortName}</span>
                    <span className="hidden truncate sm:inline">{r.name}</span>
                  </Link>
                </Td>
                <Td className={`${cellule} text-muted`}>{r.played}</Td>
                {!compact && (
                  <>
                    <Td className={`${cellule} text-muted`}>{r.won}</Td>
                    <Td className={`${cellule} text-muted`}>{r.drawn}</Td>
                    <Td className={`${cellule} text-muted`}>{r.lost}</Td>
                  </>
                )}
                <Td className={`${cellule} text-muted`}>{diffSignee(r.goalDiff)}</Td>
                <Td className={`${cellule} font-bold`}>{r.points}</Td>
              </tr>
            );
          })}
        </tbody>
      </Table>
      {(promotion > 0 || relegation > 0) && (
        <p className="text-xs text-muted">
          {[promotion > 0 && "Trait plein : montée", relegation > 0 && "Pointillé : descente"]
            .filter(Boolean)
            .join(" · ")}
        </p>
      )}
    </>
  );
}

import { db } from "./db";
import { computeStandings, type StandingRow } from "./standings";

export type StandingRowWithClub = Omit<StandingRow, "clubId"> & {
  clubSeasonId: number;
  clubId: number;
  name: string;
  shortName: string;
  logoUrl: string | null;
};

/** Classement calculé à la lecture (décision 70). */
export async function getStandings(
  seasonId: number,
  divisionId: number,
): Promise<StandingRowWithClub[]> {
  const [clubs, matches] = await Promise.all([
    db.clubSeason.findMany({
      where: { seasonId, divisionId },
      select: {
        id: true,
        club: {
          select: { id: true, name: true, shortName: true, logoUrl: true },
        },
      },
    }),
    db.match.findMany({
      where: { seasonId, divisionId, status: { in: ["PLAYED", "FORFEIT"] } },
      select: {
        homeClubSeasonId: true,
        awayClubSeasonId: true,
        homeGoals: true,
        awayGoals: true,
        status: true,
      },
    }),
  ]);
  const rows = computeStandings(
    clubs.map((c) => String(c.id)),
    matches.map((m) => ({
      homeId: String(m.homeClubSeasonId),
      awayId: String(m.awayClubSeasonId),
      homeGoals: m.homeGoals ?? 0,
      awayGoals: m.awayGoals ?? 0,
      status: m.status,
      // declareForfeit enregistre 0-3 : le fautif est le camp à 0.
      forfeitBy:
        (m.homeGoals ?? 0) < (m.awayGoals ?? 0)
          ? ("home" as const)
          : ("away" as const),
    })),
  );
  const byId = new Map(clubs.map((c) => [String(c.id), c.club]));
  return rows.map(({ clubId, ...r }) => {
    const c = byId.get(clubId)!;
    return {
      ...r,
      clubSeasonId: Number(clubId),
      clubId: c.id,
      name: c.name,
      shortName: c.shortName,
      logoUrl: c.logoUrl,
    };
  });
}

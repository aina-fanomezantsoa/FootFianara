import { db } from "./db";
import { generateCalendar } from "./calendar";

/** Génère et enregistre le calendrier d'une division pour une saison. Refuse si des matchs existent déjà. */
export async function saveCalendar(seasonId: number, divisionId: number) {
  const clubSeasons = await db.clubSeason.findMany({
    where: { seasonId, divisionId },
    orderBy: { id: "asc" },
    select: { id: true },
  });
  const fixtures = generateCalendar(clubSeasons.map((c) => c.id));
  return db.$transaction(async (tx) => {
    if ((await tx.match.count({ where: { seasonId, divisionId } })) > 0)
      throw new Error("Calendrier déjà généré pour cette division");
    const { count } = await tx.match.createMany({
      data: fixtures.map((f) => ({
        seasonId,
        divisionId,
        matchday: f.matchday,
        homeClubSeasonId: f.home,
        awayClubSeasonId: f.away,
      })),
    });
    return count;
  });
}

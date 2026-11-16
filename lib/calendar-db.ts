import { revalidatePath } from "next/cache";
import { requireRole } from "./auth";
import { db } from "./db";
import { generateCalendar } from "./calendar";

/** Génère et enregistre le calendrier d'une division pour une saison. ADMIN. Refuse si des matchs existent déjà. */
export async function saveCalendar(
  seasonId: number,
  divisionId: number,
): Promise<{ erreur: string } | { ok: true; count: number }> {
  await requireRole("ADMIN");
  const clubSeasons = await db.clubSeason.findMany({
    where: { seasonId, divisionId },
    orderBy: { id: "asc" },
    select: { id: true },
  });
  const n = clubSeasons.length;
  if (n < 2)
    return { erreur: "Il faut au moins 2 clubs inscrits dans la division." };
  // shortcut: pas de club exempt pour un nombre impair ; à ajouter si la ligue le demande.
  if (n % 2 !== 0)
    return {
      erreur: `${n} clubs inscrits : un nombre pair est requis pour générer le calendrier.`,
    };
  const fixtures = generateCalendar(clubSeasons.map((c) => c.id));
  const count = await db.$transaction(async (tx) => {
    if ((await tx.match.count({ where: { seasonId, divisionId } })) > 0)
      return null;
    const r = await tx.match.createMany({
      data: fixtures.map((f) => ({
        seasonId,
        divisionId,
        matchday: f.matchday,
        homeClubSeasonId: f.home,
        awayClubSeasonId: f.away,
      })),
    });
    return r.count;
  });
  if (count == null)
    return { erreur: "Calendrier déjà généré pour cette division." };
  revalidatePath("/", "layout");
  return { ok: true, count };
}

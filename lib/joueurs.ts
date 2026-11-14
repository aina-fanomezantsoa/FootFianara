import { db } from "./db";

// BR-03 : plafond d'effectif modifiable (Setting "maxSquad"), 24 par défaut.
export async function maxSquad() {
  const s = await db.setting.findUnique({ where: { key: "maxSquad" } });
  return Number(s?.value) || 24;
}

// BR-40 : 3 derniers clubs distincts, du plus récent au plus ancien, d'après les effectifs.
export async function derniersClubs(playerId: number) {
  const squads = await db.squad.findMany({
    where: { playerId },
    orderBy: { clubSeason: { season: { startDate: "desc" } } },
    select: {
      shirtNumber: true,
      clubSeason: { select: { club: true, season: true } },
    },
  });
  const parClub = new Map<number, (typeof squads)[number]>();
  for (const s of squads)
    if (!parClub.has(s.clubSeason.club.id))
      parClub.set(s.clubSeason.club.id, s);
  return [...parClub.values()].slice(0, 3).map((s) => ({
    club: s.clubSeason.club,
    season: s.clubSeason.season,
    shirtNumber: s.shirtNumber,
  }));
}

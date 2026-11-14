// Supprime tout ce que e2e.ts crée (repéré par le préfixe « QA TEMP »). Usage : npx tsx scripts/qa/cleanup.ts
import { pathToFileURL } from "node:url";

export const MARQUE = "QA TEMP";

export async function cleanup() {
  if (!process.env.DATABASE_URL) process.loadEnvFile();
  const { db } = await import("../../lib/db");
  const seasons = { name: { startsWith: MARQUE } };
  const clubSeasons = { season: seasons };
  const matches = { season: seasons };
  const joueurs = { lastName: { startsWith: MARQUE } };
  await db.suspension.deleteMany({ where: { OR: [{ season: seasons }, { player: joueurs }] } });
  await db.matchEvent.deleteMany({ where: { match: matches } });
  await db.lineup.deleteMany({ where: { match: matches } });
  await db.match.deleteMany({ where: matches });
  await db.squad.deleteMany({ where: { clubSeason: clubSeasons } });
  await db.clubSeason.deleteMany({ where: clubSeasons });
  await db.player.deleteMany({ where: joueurs });
  await db.club.deleteMany({ where: { name: { startsWith: MARQUE } } });
  await db.season.deleteMany({ where: seasons });
  return {
    saisons: await db.season.count({ where: seasons }),
    clubs: await db.club.count({ where: { name: { startsWith: MARQUE } } }),
    joueurs: await db.player.count({ where: joueurs }),
    matchs: await db.match.count({ where: matches }),
    inscriptions: await db.clubSeason.count({ where: clubSeasons }),
  };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href)
  cleanup().then((r) => {
    console.log("Reste après nettoyage :", r);
    process.exit(Object.values(r).some(Boolean) ? 1 : 0);
  });

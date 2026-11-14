import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const POSITIONS = ["Gardien", "Défenseur", "Milieu", "Attaquant"];

async function main() {
  const settings = {
    maxSquad: "24",
    ptsWin: "3",
    ptsDraw: "1",
    yellowLimit: "5",
    suspensionMatches: "2",
  };
  for (const [key, value] of Object.entries(settings)) {
    await db.setting.upsert({
      where: { key },
      update: {},
      create: { key, value },
    });
  }

  const season = await db.season.create({
    data: {
      name: "Saison test",
      startDate: new Date("2027-01-10"),
      endDate: new Date("2027-06-30"),
    },
  });
  await db.stadium.upsert({
    where: { name: "Stade Ampasambazaha" },
    update: {},
    create: { name: "Stade Ampasambazaha", city: "Fianarantsoa" },
  });

  // Données fictives pour développer ; à supprimer avant la vraie saison.
  for (const level of [1, 2, 3]) {
    const division = await db.division.upsert({
      where: { name: `D${level}` },
      update: {},
      create: { name: `D${level}`, level },
    });
    for (let i = 1; i <= 12; i++) {
      const club = await db.club.create({
        data: {
          name: `Club D${level}-${i}`,
          shortName: `D${level}${String(i).padStart(2, "0")}`,
        },
      });
      const cs = await db.clubSeason.create({
        data: { seasonId: season.id, divisionId: division.id, clubId: club.id },
      });
      for (let n = 1; n <= 16; n++) {
        const player = await db.player.create({
          data: {
            firstName: `Joueur${n}`,
            lastName: `D${level}-${i}`,
            position: POSITIONS[n % 4],
          },
        });
        await db.squad.create({
          data: { clubSeasonId: cs.id, playerId: player.id, shirtNumber: n },
        });
      }
    }
  }

  const pwd = process.env.SEED_ADMIN_PASSWORD;
  if (pwd) {
    await db.user.upsert({
      where: { email: "admin@footfianara.local" },
      update: {},
      create: {
        email: "admin@footfianara.local",
        name: "Super admin",
        role: "SUPER_ADMIN",
        passwordHash: await bcrypt.hash(pwd, 10),
      },
    });
  }
}

main().finally(() => db.$disconnect());

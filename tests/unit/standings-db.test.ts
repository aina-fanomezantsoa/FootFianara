import { describe, expect, it, vi } from "vitest";

// Forfait enregistré par declareForfeit : 0-3 pour le fautif (domicile ici), sans événements.
vi.mock("../../lib/db", () => ({
  db: {
    clubSeason: {
      findMany: async () => [
        {
          id: 1,
          club: { id: 11, name: "Club A", shortName: "A", logoUrl: null },
        },
        {
          id: 2,
          club: { id: 12, name: "Club B", shortName: "B", logoUrl: "b.png" },
        },
      ],
    },
    match: {
      findMany: async () => [
        {
          homeClubSeasonId: 1,
          awayClubSeasonId: 2,
          homeGoals: 0,
          awayGoals: 3,
          status: "FORFEIT",
        },
        {
          homeClubSeasonId: 2,
          awayClubSeasonId: 1,
          homeGoals: 1,
          awayGoals: 1,
          status: "PLAYED",
        },
      ],
    },
  },
}));

const { getStandings } = await import("../../lib/standings-db");

describe("getStandings", () => {
  it("forfait : 3 points à l'adversaire, infos club jointes", async () => {
    const r = await getStandings(1, 1);
    expect(r[0]).toMatchObject({
      clubSeasonId: 2,
      clubId: 12,
      name: "Club B",
      logoUrl: "b.png",
      points: 4,
      goalsFor: 4,
    });
    expect(r[1]).toMatchObject({
      clubSeasonId: 1,
      clubId: 11,
      shortName: "A",
      points: 1,
      goalDiff: -3,
    });
  });
});

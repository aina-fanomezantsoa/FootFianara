import { describe, expect, it, vi } from "vitest";

vi.mock("../../lib/db", () => ({ db: {} }));

const { tallyEvents, rankBy } = await import("../../lib/stats");

const ev = (
  type: "GOAL" | "OWN_GOAL" | "YELLOW" | "RED" | "SUB",
  playerId: number,
  assistPlayerId: number | null = null,
) => ({
  type,
  playerId,
  assistPlayerId,
});

describe("statistiques (T17)", () => {
  const t = tallyEvents([
    ev("GOAL", 1, 2),
    ev("GOAL", 1),
    ev("GOAL", 3, 2),
    ev("OWN_GOAL", 4),
    ev("YELLOW", 4),
    ev("YELLOW", 5),
    ev("RED", 5),
    ev("SUB", 6),
  ]);
  const get = (id: number) => t.find((x) => x.playerId === id);

  it("buts et passes, csc exclu", () => {
    expect(get(1)).toMatchObject({ goals: 2, assists: 0 });
    expect(get(2)).toMatchObject({ goals: 0, assists: 2 });
    expect(get(4)).toMatchObject({ goals: 0, yellow: 1 });
  });
  it("classement des buteurs sans les joueurs à 0", () => {
    expect(rankBy(t, ["goals"], 10).map((r) => r.playerId)).toEqual([1, 3]);
    expect(rankBy(t, ["goals"], 1).map((r) => r.playerId)).toEqual([1]);
  });
  it("cartons : rouges puis jaunes", () => {
    expect(rankBy(t, ["red", "yellow"], 10).map((r) => r.playerId)).toEqual([
      5, 4,
    ]);
  });
});

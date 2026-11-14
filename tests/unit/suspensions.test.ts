import { describe, expect, it, vi } from "vitest";

vi.mock("../../lib/db", () => ({ db: {} }));

const { detectSuspensions } = await import("../../lib/suspensions");
type M = import("../../lib/suspensions").DisciplineMatch;

// Joueur 7 du club 1 ; adversaire club 2.
const m = (id: number, cards: M["cards"] = []): M => ({
  id,
  clubIds: [1, 2],
  cards,
});
const y = { playerId: 7, clubId: 1, type: "YELLOW" as const };
const r = { playerId: 7, clubId: 1, type: "RED" as const };

describe("detectSuspensions (BR-32)", () => {
  it("4 jaunes : pas de suspension ; le 5e déclenche 2 matchs", () => {
    const four = [1, 2, 3, 4].map((i) => m(i, [y]));
    expect(detectSuspensions(four)).toEqual([]);
    const s = detectSuspensions([...four, m(5, [y])]);
    expect(s).toEqual([
      {
        playerId: 7,
        matchId: 5,
        reason: "5 cartons jaunes",
        matchesTotal: 2,
        matchesServed: 0,
      },
    ]);
  });
  it("le compteur repart à zéro après la suspension", () => {
    const nine = Array.from({ length: 9 }, (_, i) => m(i + 1, [y]));
    expect(detectSuspensions(nine)).toHaveLength(1);
    expect(
      detectSuspensions([...nine, m(10, [y])]).map((s) => s.matchId),
    ).toEqual([5, 10]);
  });
  it("rouge direct : 2 matchs ; jaunes du même match ignorés", () => {
    const s = detectSuspensions([m(1, [y, r])]);
    expect(s).toEqual([
      {
        playerId: 7,
        matchId: 1,
        reason: "Carton rouge",
        matchesTotal: 2,
        matchesServed: 0,
      },
    ]);
    // 4 jaunes + un match à double jaune/rouge : pas de 5e jaune.
    const four = [1, 2, 3, 4].map((i) => m(i, [y]));
    expect(
      detectSuspensions([...four, m(5, [y, y, r])]).map((x) => x.reason),
    ).toEqual(["Carton rouge"]);
  });
  it("matchs purgés : seulement ceux du club du joueur, plafonnés", () => {
    const other: M = { id: 2, clubIds: [3, 4], cards: [] };
    expect(detectSuspensions([m(1, [r]), other, m(3)])[0].matchesServed).toBe(
      1,
    );
    expect(
      detectSuspensions([m(1, [r]), m(2), m(3), m(4)])[0].matchesServed,
    ).toBe(2);
  });
  it("seuil et durée paramétrables", () => {
    const s = detectSuspensions([m(1, [y]), m(2, [y])], {
      yellowLimit: 2,
      length: 1,
    });
    expect(s[0]).toMatchObject({ matchId: 2, matchesTotal: 1 });
  });
});

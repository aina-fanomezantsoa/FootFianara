import { describe, expect, it } from "vitest";
import { computeStandings, type StandingMatch } from "../../lib/standings";

const p = (
  homeId: string,
  awayId: string,
  homeGoals: number,
  awayGoals: number,
): StandingMatch => ({ homeId, awayId, homeGoals, awayGoals, status: "PLAYED" });
const order = (r: { clubId: string }[]) => r.map((x) => x.clubId).join("");

describe("computeStandings", () => {
  it("3/1/0 points et statistiques", () => {
    const r = computeStandings(["A", "B"], [p("A", "B", 2, 1), p("B", "A", 1, 1)]);
    expect(r[0]).toMatchObject({ clubId: "A", points: 4, won: 1, drawn: 1, goalDiff: 1, played: 2 });
    expect(r[1]).toMatchObject({ clubId: "B", points: 1, lost: 1 });
  });
  it("ignore les matchs programmés ou reportés", () => {
    const r = computeStandings(["A", "B"], [{ ...p("A", "B", 5, 0), status: "SCHEDULED" }]);
    expect(r.every((x) => x.played === 0)).toBe(true);
  });
  it("forfait : 0-3 pour le fautif, 3 points à l'adversaire", () => {
    const r = computeStandings(
      ["A", "B"],
      [{ ...p("A", "B", 9, 9), status: "FORFEIT", forfeitBy: "home" }],
    );
    expect(r[0]).toMatchObject({ clubId: "B", points: 3, goalsFor: 3 });
    expect(r[1]).toMatchObject({ clubId: "A", points: 0, goalDiff: -3 });
  });
  it("égalité de points : différence de buts", () => {
    const r = computeStandings(["A", "B", "C"], [p("A", "C", 1, 0), p("B", "C", 4, 0)]);
    expect(order(r)).toBe("BAC");
  });
  it("égalité points et diff : buts marqués", () => {
    const r = computeStandings(["A", "B", "C", "D"], [p("A", "C", 3, 2), p("B", "D", 1, 0)]);
    expect(order(r.slice(0, 2))).toBe("AB");
  });
  it("égalité complète : confrontation directe", () => {
    // A et B : 3 pts, diff 0, 1 but marqué ; B a battu A en direct
    const r = computeStandings(
      ["A", "B", "C", "D"],
      [p("B", "A", 1, 0), p("A", "D", 1, 0), p("C", "B", 1, 0)],
    );
    expect(order(r)).toBe("CBAD");
    expect(r.every((x) => !x.needsAdminDecision)).toBe(true);
  });
  it("égalité parfaite : signalée pour décision de l'admin", () => {
    const r = computeStandings(["A", "B"], [p("A", "B", 1, 1), p("B", "A", 1, 1)]);
    expect(r.map((x) => x.needsAdminDecision)).toEqual([true, true]);
    expect(r.map((x) => x.rank)).toEqual([1, 2]);
  });
});

// Compléments au TEST_PLAN : propriétés globales sur le calendrier complet et le classement.
import { describe, expect, it } from "vitest";
import { generateCalendar } from "../../lib/calendar";
import { computeStandings } from "../../lib/standings";

const ids = Array.from({ length: 12 }, (_, i) => String(i + 1));
const cal = generateCalendar(ids.map(Number));

describe("calendrier complet", () => {
  it("chaque paire non ordonnée se rencontre exactement deux fois, domicile/extérieur inversés", () => {
    for (const a of ids.map(Number))
      for (const b of ids.map(Number).filter((x) => x > a)) {
        const m = cal.filter((f) => [f.home, f.away].sort((x, y) => x - y).join() === [a, b].join());
        expect(m).toHaveLength(2);
        expect(m[0].home).toBe(m[1].away);
      }
  });
  it("chaque club joue 22 matchs, 11 à domicile", () => {
    for (const c of ids.map(Number)) {
      expect(cal.filter((f) => f.home === c)).toHaveLength(11);
      expect(cal.filter((f) => f.away === c)).toHaveLength(11);
    }
  });
});

describe("classement sur saison complète", () => {
  it("tous les matchs nuls : 22 points et rang partagé signalé", () => {
    const rows = computeStandings(
      ids,
      cal.map((f) => ({
        homeId: String(f.home),
        awayId: String(f.away),
        homeGoals: 0,
        awayGoals: 0,
        status: "PLAYED" as const,
      })),
    );
    expect(rows.every((r) => r.points === 22 && r.drawn === 22 && r.played === 22)).toBe(true);
    expect(rows.every((r) => r.needsAdminDecision)).toBe(true);
  });
  it("une défaite incrémente lost sans point", () => {
    const rows = computeStandings(
      ["A", "B"],
      [{ homeId: "A", awayId: "B", homeGoals: 0, awayGoals: 1, status: "PLAYED" }],
    );
    const [b, a] = [rows[0], rows[1]];
    expect(b).toMatchObject({ clubId: "B", won: 1, points: 3 });
    expect(a).toMatchObject({ clubId: "A", lost: 1, points: 0, goalDiff: -1 });
  });
});

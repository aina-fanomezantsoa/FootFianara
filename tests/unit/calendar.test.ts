import { describe, expect, it } from "vitest";
import { generateCalendar } from "../../lib/calendar";

const clubs = Array.from({ length: 12 }, (_, i) => i + 1);
const cal = generateCalendar(clubs);

describe("generateCalendar", () => {
  it("12 clubs : 132 matchs sur 22 journées", () => {
    expect(cal).toHaveLength(132);
    expect(Math.max(...cal.map((f) => f.matchday))).toBe(22);
  });
  it("chaque paire ordonnée apparaît une fois (aller et retour)", () => {
    const keys = new Set(cal.map((f) => `${f.home}-${f.away}`));
    expect(keys.size).toBe(132);
    for (const f of cal) expect(f.home).not.toBe(f.away);
  });
  it("le retour inverse l'aller, 11 journées plus tard", () => {
    for (const f of cal.filter((x) => x.matchday <= 11))
      expect(cal).toContainEqual({
        matchday: f.matchday + 11,
        home: f.away,
        away: f.home,
      });
  });
  it("aucun club ne joue deux fois dans une journée", () => {
    for (let d = 1; d <= 22; d++) {
      const ids = cal
        .filter((f) => f.matchday === d)
        .flatMap((f) => [f.home, f.away]);
      expect(ids).toHaveLength(12);
      expect(new Set(ids).size).toBe(12);
    }
  });
  it("rejette un nombre impair ou des doublons", () => {
    expect(() => generateCalendar([1, 2, 3])).toThrow();
    expect(() => generateCalendar([1, 1])).toThrow();
  });
});

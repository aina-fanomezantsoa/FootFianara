import { describe, expect, it, vi } from "vitest";

vi.mock("../../lib/db", () => ({ db: {} }));
vi.mock("../../lib/auth", () => ({ requireRole: vi.fn() }));

const { validateLineup, parseLineup } = await import("../../lib/lineups");

// Domicile : 1 à 14 ; extérieur : 101 à 103.
const home = Array.from({ length: 14 }, (_, i) => i + 1);
const ctx = { homePlayerIds: home, awayPlayerIds: [101, 102, 103] };
const titulaires = (ids: number[]) =>
  ids.map((playerId) => ({ playerId, isStarter: true }));

describe("validateLineup (T13)", () => {
  it("accepte 11 titulaires et des remplaçants par club", () => {
    const r = validateLineup(
      [
        ...titulaires(home.slice(0, 11)),
        { playerId: 12, isStarter: false },
        ...titulaires([101, 102]),
      ],
      ctx,
    );
    expect(r).toHaveProperty("data");
  });
  it("refuse un 12e titulaire dans un club", () => {
    const r = validateLineup(titulaires(home.slice(0, 12)), ctx);
    expect(r).toEqual({ erreur: expect.stringContaining("11 titulaires") });
  });
  it("compte les titulaires club par club", () => {
    const r = validateLineup(
      titulaires([...home.slice(0, 11), 101, 102, 103]),
      ctx,
    );
    expect(r).toHaveProperty("data");
  });
  it("refuse un joueur hors des deux effectifs", () => {
    expect(validateLineup(titulaires([999]), ctx)).toHaveProperty("erreur");
  });
  it("refuse un joueur en double", () => {
    expect(
      validateLineup(
        [
          { playerId: 1, isStarter: true },
          { playerId: 1, isStarter: false },
        ],
        ctx,
      ),
    ).toHaveProperty("erreur");
  });
});

describe("parseLineup", () => {
  it("lit T, R et ignore les absents", () => {
    const f = new FormData();
    f.set("matchId", "4");
    f.set("lineup_1", "T");
    f.set("lineup_2", "R");
    f.set("lineup_3", "");
    expect(parseLineup(f)).toEqual({
      data: [
        { playerId: 1, isStarter: true },
        { playerId: 2, isStarter: false },
      ],
    });
  });
  it("refuse une valeur inconnue", () => {
    const f = new FormData();
    f.set("lineup_1", "X");
    expect(parseLineup(f)).toHaveProperty("erreur");
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";

const clubs = vi.fn();
const match = { findUnique: vi.fn(), update: vi.fn() };
vi.mock("../../lib/db", () => ({
  db: { clubSeason: { findMany: () => clubs() }, match },
}));
vi.mock("../../lib/auth", () => ({ requireRole: async () => ({ id: "1" }) }));
vi.mock("../../lib/suspensions", () => ({ syncSuspensions: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const { saveCalendar } = await import("../../lib/calendar-db");
const { cancelForfeit } = await import("../../lib/match-result");

const ids = (n: number) => Array.from({ length: n }, (_, i) => ({ id: i + 1 }));

describe("saveCalendar", () => {
  it("refuse moins de 2 clubs", async () => {
    clubs.mockResolvedValue(ids(1));
    expect(await saveCalendar(1, 1)).toHaveProperty("erreur");
  });
  it("refuse un nombre impair de clubs avec un message", async () => {
    clubs.mockResolvedValue(ids(3));
    expect(await saveCalendar(1, 1)).toEqual({
      erreur: expect.stringContaining("pair"),
    });
  });
});

describe("cancelForfeit", () => {
  beforeEach(() => match.update.mockReset());
  it("refuse un match qui n'est pas forfait", async () => {
    match.findUnique.mockResolvedValue({ seasonId: 1, status: "PLAYED" });
    expect(await cancelForfeit(5)).toHaveProperty("erreur");
    expect(match.update).not.toHaveBeenCalled();
  });
  it("repasse le match en SCHEDULED sans score", async () => {
    match.findUnique.mockResolvedValue({ seasonId: 1, status: "FORFEIT" });
    expect(await cancelForfeit(5)).toEqual({ ok: true });
    expect(match.update.mock.calls[0][0].data).toMatchObject({
      status: "SCHEDULED",
      homeGoals: null,
      awayGoals: null,
    });
  });
});

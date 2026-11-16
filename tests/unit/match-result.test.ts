import { describe, expect, it, vi } from "vitest";

vi.mock("../../lib/db", () => ({ db: {} }));
vi.mock("../../lib/auth", () => ({ requireRole: vi.fn() }));

const { validateResult, parseResultat } =
  await import("../../lib/match-result");

// Domicile : joueurs 1, 2, 3 ; extérieur : 10, 11.
const ctx = { homePlayerIds: [1, 2, 3], awayPlayerIds: [10, 11] };
const goal = (playerId: number, assistPlayerId: number | null = null) => ({
  type: "GOAL" as const,
  minute: 10,
  playerId,
  assistPlayerId,
});

describe("validateResult (BR-27)", () => {
  it("accepte un résultat cohérent", () => {
    const r = validateResult(
      {
        homeGoals: 2,
        awayGoals: 1,
        events: [goal(1, 2), goal(3), goal(10, 11)],
      },
      ctx,
    );
    expect(r).toHaveProperty("data");
  });
  it("refuse si la somme des buts diffère du score", () => {
    const r = validateResult(
      { homeGoals: 2, awayGoals: 0, events: [goal(1)] },
      ctx,
    );
    expect(r).toMatchObject({
      erreur: expect.stringContaining("différents du score"),
    });
  });
  it("refuse un joueur d'un autre club", () => {
    const r = validateResult(
      { homeGoals: 1, awayGoals: 0, events: [goal(99)] },
      ctx,
    );
    expect(r).toMatchObject({ erreur: expect.stringContaining("effectifs") });
  });
  it("refuse un passeur de l'équipe adverse ou hors effectif", () => {
    expect(
      validateResult(
        { homeGoals: 1, awayGoals: 0, events: [goal(1, 10)] },
        ctx,
      ),
    ).toHaveProperty("erreur");
    expect(
      validateResult(
        { homeGoals: 1, awayGoals: 0, events: [goal(1, 99)] },
        ctx,
      ),
    ).toHaveProperty("erreur");
  });
  it("un csc compte pour l'adversaire", () => {
    const csc = { type: "OWN_GOAL" as const, minute: 30, playerId: 1 };
    expect(
      validateResult({ homeGoals: 0, awayGoals: 1, events: [csc] }, ctx),
    ).toHaveProperty("data");
    expect(
      validateResult({ homeGoals: 1, awayGoals: 0, events: [csc] }, ctx),
    ).toHaveProperty("erreur");
  });
  it("minute entre 0 et 130", () => {
    const e = (minute: number) => ({
      type: "YELLOW" as const,
      minute,
      playerId: 1,
    });
    expect(
      validateResult(
        { homeGoals: 0, awayGoals: 0, events: [e(0), e(130)] },
        ctx,
      ),
    ).toHaveProperty("data");
    expect(
      validateResult({ homeGoals: 0, awayGoals: 0, events: [e(131)] }, ctx),
    ).toHaveProperty("erreur");
    expect(
      validateResult({ homeGoals: 0, awayGoals: 0, events: [e(-1)] }, ctx),
    ).toHaveProperty("erreur");
  });
  it("remplacement : entrant du même club", () => {
    const sub = (playerInId: number) => ({
      type: "SUB" as const,
      minute: 60,
      playerId: 1,
      playerInId,
    });
    expect(
      validateResult({ homeGoals: 0, awayGoals: 0, events: [sub(2)] }, ctx),
    ).toHaveProperty("data");
    expect(
      validateResult({ homeGoals: 0, awayGoals: 0, events: [sub(10)] }, ctx),
    ).toHaveProperty("erreur");
  });
});

describe("parseResultat", () => {
  it("lit les champs répétés et ignore les lignes vides", () => {
    const f = new FormData();
    f.set("homeGoals", "1");
    f.set("awayGoals", "0");
    for (const [t, m, p, a, i] of [
      ["GOAL", "12", "1", "2", ""],
      ["", "", "", "", ""],
      ["SUB", "60", "3", "", "2"],
    ]) {
      f.append("event_type", t);
      f.append("event_minute", m);
      f.append("event_player", p);
      f.append("event_assist", a);
      f.append("event_player_in", i);
    }
    expect(parseResultat(f)).toEqual({
      data: {
        homeGoals: 1,
        awayGoals: 0,
        events: [
          {
            type: "GOAL",
            minute: 12,
            playerId: 1,
            assistPlayerId: 2,
            playerInId: null,
          },
          {
            type: "SUB",
            minute: 60,
            playerId: 3,
            assistPlayerId: null,
            playerInId: 2,
          },
        ],
      },
    });
  });
  it("score requis", () => {
    expect(parseResultat(new FormData())).toHaveProperty("erreur");
  });
});

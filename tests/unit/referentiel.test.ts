import { describe, expect, it } from "vitest";
import { parseDivision, parseSaison, parseStade } from "../../lib/referentiel";

const form = (o: Record<string, string>) => {
  const f = new FormData();
  for (const [k, v] of Object.entries(o)) f.set(k, v);
  return f;
};

describe("referentiel", () => {
  it("saison : fin après début", () => {
    expect(
      parseSaison(
        form({ name: "S1", startDate: "2026-09-01", endDate: "2026-09-01" }),
      ),
    ).toHaveProperty("erreur");
    expect(
      parseSaison(
        form({ name: "S1", startDate: "2026-09-01", endDate: "2027-02-01" }),
      ),
    ).toHaveProperty("data");
  });
  it("division : niveau 1 à 3", () => {
    expect(parseDivision(form({ name: "D4", level: "4" }))).toHaveProperty(
      "erreur",
    );
    expect(parseDivision(form({ name: "D1", level: "1" }))).toHaveProperty(
      "data",
    );
  });
  it("stade : ville optionnelle", () => {
    expect(parseStade(form({ name: "Stade A", city: " " }))).toEqual({
      data: { name: "Stade A", city: null },
    });
  });
});

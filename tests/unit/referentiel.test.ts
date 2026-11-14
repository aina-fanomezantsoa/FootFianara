import { describe, expect, it } from "vitest";
import {
  parseClub,
  parseDivision,
  parseIds,
  parseJoueur,
  parseSaison,
  parseStade,
  verifierInscription,
} from "../../lib/referentiel";

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
  it("club : contacts facultatifs, https exigé, année bornée", () => {
    const ok = parseClub(form({ name: "AS Fianara", shortName: "ASF" }));
    expect(ok).toHaveProperty("data.phone", null);
    expect(ok).toHaveProperty("data.foundedYear", null);
    expect(
      parseClub(
        form({ name: "A", shortName: "A", facebookUrl: "javascript:alert(1)" }),
      ),
    ).toHaveProperty("erreur");
    expect(
      parseClub(form({ name: "A", shortName: "A", foundedYear: "3000" })),
    ).toHaveProperty("erreur");
    expect(parseClub(form({ name: "A", shortName: "" }))).toHaveProperty(
      "erreur",
    );
  });
  it("joueur : poste et taille validés", () => {
    expect(
      parseJoueur(form({ firstName: "R", lastName: "N", position: "Libéro" })),
    ).toHaveProperty("erreur");
    expect(
      parseJoueur(form({ firstName: "R", lastName: "N", heightCm: "90" })),
    ).toHaveProperty("erreur");
    expect(
      parseJoueur(
        form({
          firstName: "R",
          lastName: "N",
          position: "Milieu",
          heightCm: "175",
        }),
      ),
    ).toHaveProperty("data.heightCm", 175);
  });
  it("ids : entiers requis", () => {
    expect(parseIds(form({ a: "3", b: "" }), "a", "b")).toHaveProperty(
      "erreur",
    );
    expect(parseIds(form({ a: "3", b: "4" }), "a", "b")).toEqual({
      data: { a: 3, b: 4 },
    });
  });
  it("inscription : 25e refusé, numéro unique", () => {
    const eff = Array.from({ length: 24 }, (_, i) => ({
      playerId: i + 1,
      shirtNumber: i + 1,
    }));
    expect(verifierInscription(eff, 99, 50, 24)).toMatch(/complet/);
    expect(verifierInscription(eff.slice(0, 23), 99, 50, 24)).toBeNull();
    expect(verifierInscription(eff.slice(0, 5), 99, 3, 24)).toMatch(/Numéro 3/);
    expect(verifierInscription(eff.slice(0, 5), 2, 50, 24)).toMatch(/déjà/);
    expect(verifierInscription([], 1, 0, 24)).toMatch(/1 à 99/);
  });
  it("stade : ville optionnelle", () => {
    expect(parseStade(form({ name: "Stade A", city: " " }))).toEqual({
      data: { name: "Stade A", city: null },
    });
  });
});

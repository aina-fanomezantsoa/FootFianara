import { describe, expect, it } from "vitest";
import {
  age,
  choisirDivision,
  choisirSaison,
  correspond,
  diffSignee,
  heure,
  imageReduite,
  journeeParDefaut,
} from "../../lib/public";

const s = (name: string, debut: string, fin: string) => ({
  name,
  startDate: new Date(debut),
  endDate: new Date(fin),
});

describe("site public", () => {
  it("saison en cours : celle qui contient la date, sinon la plus récente", () => {
    const saisons = [
      s("2025", "2025-01-01", "2025-12-31"),
      s("2027", "2027-01-01", "2027-12-31"),
      s("2026", "2026-01-01", "2026-12-31"),
    ];
    expect(choisirSaison(saisons, new Date("2026-06-01"))?.name).toBe("2026");
    expect(choisirSaison(saisons, new Date("2030-01-01"))?.name).toBe("2027");
    expect(choisirSaison([], new Date())).toBeNull();
  });

  it("division par nom, D1 par défaut", () => {
    const d = [{ name: "D1" }, { name: "D2" }];
    expect(choisirDivision(d, "d2")?.name).toBe("D2");
    expect(choisirDivision(d, "X")?.name).toBe("D1");
    expect(choisirDivision([], "D1")).toBeNull();
  });

  it("journée par défaut : première à jouer, sinon la dernière", () => {
    expect(journeeParDefaut([])).toBeNull();
    expect(
      journeeParDefaut([
        { matchday: 1, status: "PLAYED" },
        { matchday: 3, status: "SCHEDULED" },
        { matchday: 2, status: "SCHEDULED" },
      ]),
    ).toBe(2);
    expect(
      journeeParDefaut([
        { matchday: 1, status: "PLAYED" },
        { matchday: 2, status: "FORFEIT" },
      ]),
    ).toBe(2);
  });

  it("recherche insensible à la casse et aux accents", () => {
    const p = { firstName: "Héry", lastName: "RAKOTOARISOA" };
    expect(correspond(p, "hery")).toBe(true);
    expect(correspond(p, "rakoto  HÉRY")).toBe(true);
    expect(correspond(p, "rabe")).toBe(false);
  });

  it("image Cloudinary réduite, autres URL intactes", () => {
    expect(
      imageReduite("https://res.cloudinary.com/x/image/upload/v1/a.png", 96),
    ).toBe(
      "https://res.cloudinary.com/x/image/upload/f_auto,q_auto,w_96/v1/a.png",
    );
    expect(imageReduite("/logo-club.svg", 96)).toBe("/logo-club.svg");
  });

  it("formats : heure de Madagascar, diff signée, âge", () => {
    expect(heure(new Date("2026-01-17T12:00:00Z"))).toBe("15:00");
    expect(diffSignee(5)).toBe("+5");
    expect(diffSignee(-2)).toBe("−2");
    expect(diffSignee(0)).toBe("0");
    expect(age(new Date("2000-06-15"), new Date("2026-06-14"))).toBe(25);
    expect(age(new Date("2000-06-15"), new Date("2026-06-15"))).toBe(26);
  });
});

import { describe, expect, it } from "vitest";
import { hasRole, MAX_STAFF } from "../../lib/roles";

describe("hasRole", () => {
  it("un assistant n'accède pas aux pages admin", () => {
    expect(hasRole("ASSISTANT", "ADMIN")).toBe(false);
  });
  it("un rôle supérieur ou égal passe", () => {
    expect(hasRole("SUPER_ADMIN", "ADMIN")).toBe(true);
    expect(hasRole("ADMIN", "ADMIN")).toBe(true);
  });
  it("limite de comptes", () => expect(MAX_STAFF).toBe(3));
});

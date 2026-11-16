import { beforeEach, describe, expect, it, vi } from "vitest";

const session = vi.hoisted(() => ({ value: null as unknown }));
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`REDIRECT:${url}`);
  },
}));
vi.mock("next-auth", () => ({
  default: () => ({
    handlers: {},
    auth: async () => session.value,
    signIn: vi.fn(),
    signOut: vi.fn(),
  }),
}));
vi.mock("next-auth/providers/credentials", () => ({ default: () => ({}) }));
vi.mock("../../lib/db", () => ({ db: {} }));

import { requireRole } from "../../lib/auth";

const as = (role: string) => (session.value = { user: { role } });

describe("requireRole", () => {
  beforeEach(() => (session.value = null));
  it("sans session : /login", async () => {
    await expect(requireRole("ASSISTANT")).rejects.toThrow("REDIRECT:/login");
  });
  it("assistant refusé sur une page ADMIN et SUPER_ADMIN", async () => {
    as("ASSISTANT");
    await expect(requireRole("ADMIN")).rejects.toThrow(
      "REDIRECT:/admin?refuse=1",
    );
    await expect(requireRole("SUPER_ADMIN")).rejects.toThrow(
      "REDIRECT:/admin?refuse=1",
    );
  });
  it("admin refusé sur comptes (SUPER_ADMIN), accepté sur ADMIN", async () => {
    as("ADMIN");
    await expect(requireRole("SUPER_ADMIN")).rejects.toThrow(
      "REDIRECT:/admin?refuse=1",
    );
    await expect(requireRole("ADMIN")).resolves.toMatchObject({
      role: "ADMIN",
    });
  });
});

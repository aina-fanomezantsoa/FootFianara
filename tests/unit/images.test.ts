import { describe, expect, it, vi } from "vitest";
import {
  imagesDuFormulaire,
  logoClub,
  LOGO_DEFAUT,
  typeImage,
} from "../../lib/images";

const octets = (...x: (number | string)[]) =>
  new Uint8Array(
    x.flatMap((v) =>
      typeof v === "number" ? [v] : [...v].map((c) => c.charCodeAt(0)),
    ),
  );

describe("images", () => {
  it("reconnaît jpeg, png, webp par les octets", () => {
    expect(typeImage(octets(0xff, 0xd8, 0xff, 0xe0))).toBe("image/jpeg");
    expect(typeImage(octets(0x89, "PNG", 0x0d, 0x0a))).toBe("image/png");
    expect(typeImage(octets("RIFF", 0, 0, 0, 0, "WEBP"))).toBe("image/webp");
    expect(typeImage(octets("<svg"))).toBeNull();
  });
  it("logo par défaut si absent", () => {
    expect(logoClub({ logoUrl: null })).toBe(LOGO_DEFAUT);
    expect(logoClub({ logoUrl: "https://x/l.png" })).toBe("https://x/l.png");
  });
  it("upload désactivé sans Cloudinary, champ vide ignoré", async () => {
    vi.stubEnv("CLOUDINARY_CLOUD_NAME", "");
    const f = new FormData();
    f.set("logoUrl", new File([], "vide.png"));
    expect(await imagesDuFormulaire(f, "logoUrl")).toEqual({ data: {} });
    f.set("logoUrl", new File([octets(0xff, 0xd8, 0xff)], "l.jpg"));
    expect(await imagesDuFormulaire(f, "logoUrl")).toHaveProperty("erreur");
  });
});

// Images des clubs et joueurs : validation, envoi signé vers Cloudinary (API REST, sans SDK).
// Pas d'import Node : les constantes sont aussi utilisées par le composant client de dépôt.
import type { Valid } from "./referentiel";

export const IMAGE_MAX = 2 * 1024 * 1024;
export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const LOGO_DEFAUT = "/logo-club.svg";

// BR-41 : logo par défaut tant que l'admin n'en a pas fourni.
export const logoClub = (club: { logoUrl?: string | null }) =>
  club.logoUrl || LOGO_DEFAUT;

export const uploadActif = () =>
  Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET,
  );

// Type réel d'après les premiers octets : le type MIME envoyé par le navigateur n'est pas fiable.
export function typeImage(b: Uint8Array): string | null {
  const ascii = (d: number, f: number) =>
    String.fromCharCode(...b.subarray(d, f));
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if (b[0] === 0x89 && ascii(1, 4) === "PNG") return "image/png";
  if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return "image/webp";
  return null;
}

async function televerser(file: File): Promise<string> {
  const env = process.env;
  const folder = "foot-fianara";
  const timestamp = String(Math.floor(Date.now() / 1000));
  // Signature Cloudinary : SHA-1 des paramètres triés suivis du secret.
  const hash = await crypto.subtle.digest(
    "SHA-1",
    new TextEncoder().encode(
      `folder=${folder}&timestamp=${timestamp}${env.CLOUDINARY_API_SECRET}`,
    ),
  );
  const body = new FormData();
  body.set("file", file);
  body.set("folder", folder);
  body.set("timestamp", timestamp);
  body.set("api_key", env.CLOUDINARY_API_KEY!);
  body.set(
    "signature",
    Array.from(new Uint8Array(hash), (x) =>
      x.toString(16).padStart(2, "0"),
    ).join(""),
  );
  const r = await fetch(
    `https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: "POST", body, signal: AbortSignal.timeout(20_000) },
  );
  if (!r.ok) throw new Error(`Cloudinary ${r.status}`);
  return ((await r.json()) as { secure_url: string }).secure_url;
}

// Téléverse les fichiers non vides des champs donnés et renvoie { champ: url }.
// À appeler uniquement après requireRole("ADMIN").
export async function imagesDuFormulaire<K extends string>(
  f: FormData,
  ...champs: K[]
): Promise<Valid<Partial<Record<K, string>>>> {
  const data: Partial<Record<K, string>> = {};
  for (const c of champs) {
    const file = f.get(c);
    if (!(file instanceof File) || file.size === 0) continue;
    if (!uploadActif())
      return {
        erreur:
          "Téléversement d'images désactivé : Cloudinary n'est pas configuré.",
      };
    if (file.size > IMAGE_MAX)
      return { erreur: "Image trop lourde (2 Mo maximum)." };
    const debut = new Uint8Array(await file.slice(0, 12).arrayBuffer());
    if (!typeImage(debut))
      return { erreur: "Format d'image accepté : JPEG, PNG ou WebP." };
    try {
      data[c] = await televerser(file);
    } catch {
      return { erreur: "Échec du téléversement de l'image, réessayez." };
    }
  }
  return { data };
}

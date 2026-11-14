import { imageReduite } from "@/lib/public";

/** Écusson du club ; sans logo (BR-41) : cercle aux initiales du nom court. Décoratif : le nom est toujours affiché à côté. */
export function ClubCrest({
  shortName,
  logoUrl,
  size = 32,
}: {
  shortName: string;
  logoUrl: string | null;
  size?: 20 | 32 | 48 | 96;
}) {
  if (logoUrl)
    return (
      // eslint-disable-next-line @next/next/no-img-element -- Cloudinary redimensionne déjà (f_auto,q_auto,w_)
      <img
        src={imageReduite(logoUrl, size * 2)}
        alt=""
        width={size}
        height={size}
        loading="lazy"
        className="shrink-0 object-contain"
        style={{ width: size, height: size }}
      />
    );
  return (
    <span
      aria-hidden
      className="inline-flex shrink-0 items-center justify-center rounded-full border border-border bg-surface font-display uppercase text-muted"
      style={{ width: size, height: size, fontSize: Math.max(8, size * 0.4) }}
    >
      {shortName.slice(0, size === 20 ? 2 : 3)}
    </span>
  );
}

/** Photo de joueur réduite, ou carré aux initiales. */
export function PhotoJoueur({
  photoUrl,
  firstName,
  lastName,
  size,
}: {
  photoUrl: string | null;
  firstName: string;
  lastName: string;
  size: 40 | 96;
}) {
  if (photoUrl)
    return (
      // eslint-disable-next-line @next/next/no-img-element -- Cloudinary redimensionne déjà
      <img
        src={imageReduite(photoUrl, size * 2)}
        alt=""
        width={size}
        height={size}
        loading="lazy"
        className={`shrink-0 object-cover ${size === 96 ? "rounded-md" : "rounded-sm"}`}
        style={{ width: size, height: size }}
      />
    );
  return (
    <span
      aria-hidden
      className={`inline-flex shrink-0 items-center justify-center bg-surface font-display uppercase text-muted border border-border ${size === 96 ? "rounded-md text-3xl" : "rounded-sm text-sm"}`}
      style={{ width: size, height: size }}
    >
      {firstName[0]}
      {lastName[0]}
    </span>
  );
}

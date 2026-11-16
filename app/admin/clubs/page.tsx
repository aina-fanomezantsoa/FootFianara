import Link from "next/link";
import { Alerte } from "@/app/_components/Champ";
import { Button } from "@/app/_components/ui/Button";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { logoClub } from "@/lib/images";
import { creerClub } from "./actions";
import { ChampsClub } from "./ChampsClub";

export default async function Clubs({
  searchParams,
}: {
  searchParams: Promise<{ erreur?: string }>;
}) {
  await requireRole("ADMIN");
  const { erreur } = await searchParams;
  const clubs = await db.club.findMany({ orderBy: { name: "asc" } });
  return (
    <main className="mx-auto max-w-2xl p-4 sm:p-6">
      <h1 className="title-sport mb-4 text-xl">Clubs</h1>
      <Alerte>{erreur}</Alerte>
      <ul className="mb-8 divide-y divide-border">
        {clubs.map((c) => (
          <li key={c.id}>
            <Link
              href={`/admin/clubs/${c.id}`}
              className="flex min-h-11 items-center gap-3 py-2 hover:underline"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- logos Cloudinary ou SVG local */}
              <img src={logoClub(c)} alt="" className="size-8 object-contain" />
              <span className="font-semibold">{c.name}</span>
              <span className="text-muted">{c.shortName}</span>
            </Link>
          </li>
        ))}
        {clubs.length === 0 && <li className="py-2 text-muted">Aucun club.</li>}
      </ul>
      <h2 className="title-sport mb-3 text-lg">Nouveau club</h2>
      <form action={creerClub} className="grid gap-4">
        <ChampsClub />
        <Button type="submit">Ajouter</Button>
      </form>
    </main>
  );
}

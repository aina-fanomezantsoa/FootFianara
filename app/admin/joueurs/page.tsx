import Link from "next/link";
import { Alerte, Champ } from "@/app/_components/Champ";
import { Button } from "@/app/_components/ui/Button";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { creerJoueur } from "./actions";
import { ChampsJoueur } from "./ChampsJoueur";

export default async function Joueurs({
  searchParams,
}: {
  searchParams: Promise<{ erreur?: string; q?: string }>;
}) {
  await requireRole("ADMIN");
  const { erreur, q = "" } = await searchParams;
  const mot = q.trim();
  const joueurs = await db.player.findMany({
    where: mot
      ? {
          OR: [
            { lastName: { contains: mot, mode: "insensitive" } },
            { firstName: { contains: mot, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    take: 50,
  });
  return (
    <main className="mx-auto max-w-2xl p-4 sm:p-6">
      <h1 className="title-sport mb-4 text-xl">Joueurs</h1>
      <Alerte>{erreur}</Alerte>
      <form role="search" className="mb-4 flex items-end gap-2">
        <div className="flex-1">
          <Champ
            label="Rechercher un joueur"
            name="q"
            type="search"
            defaultValue={mot}
          />
        </div>
        <Button type="submit" variant="secondary">
          Chercher
        </Button>
      </form>
      <ul className="mb-8 divide-y divide-border">
        {joueurs.map((j) => (
          <li key={j.id}>
            <Link
              href={`/admin/joueurs/${j.id}`}
              className="flex min-h-11 items-center gap-3 py-2 hover:underline"
            >
              <span className="font-semibold">
                {j.lastName.toUpperCase()} {j.firstName}
              </span>
              <span className="text-muted">{j.position}</span>
            </Link>
          </li>
        ))}
        {joueurs.length === 0 && (
          <li className="py-2 text-muted">Aucun joueur.</li>
        )}
      </ul>
      <h2 className="title-sport mb-3 text-lg">Nouveau joueur</h2>
      <form action={creerJoueur} className="grid gap-4">
        <ChampsJoueur />
        <Button type="submit">Ajouter</Button>
      </form>
    </main>
  );
}

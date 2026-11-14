import Link from "next/link";
import { notFound } from "next/navigation";
import { Alerte, Choix } from "@/app/_components/Champ";
import { Button } from "@/app/_components/ui/Button";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { maxSquad } from "@/lib/joueurs";
import {
  affecterClub,
  modifierClub,
  retirerAffectation,
  supprimerClub,
} from "../actions";
import { ChampsClub } from "../ChampsClub";

export default async function Club({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ erreur?: string }>;
}) {
  await requireRole("ADMIN");
  const [{ id }, { erreur }] = await Promise.all([params, searchParams]);
  const [club, saisons, divisions, max] = await Promise.all([
    db.club.findUnique({
      where: { id: Number(id) || 0 },
      include: {
        seasons: {
          include: {
            season: true,
            division: true,
            _count: { select: { squad: true } },
          },
          orderBy: { season: { startDate: "desc" } },
        },
      },
    }),
    db.season.findMany({ orderBy: { startDate: "desc" } }),
    db.division.findMany({ orderBy: { level: "asc" } }),
    maxSquad(),
  ]);
  if (!club) notFound();
  return (
    <main className="mx-auto max-w-2xl p-4 sm:p-6">
      <Link
        href="/admin/clubs"
        className="inline-flex min-h-11 items-center underline"
      >
        Tous les clubs
      </Link>
      <h1 className="title-sport mb-4 text-xl">{club.name}</h1>
      <Alerte>{erreur}</Alerte>

      <form action={modifierClub} className="mb-4 grid gap-4">
        <input type="hidden" name="id" value={club.id} />
        <ChampsClub club={club} />
        <Button type="submit">Enregistrer</Button>
      </form>
      <form action={supprimerClub} className="mb-8">
        <input type="hidden" name="id" value={club.id} />
        <Button type="submit" variant="secondary">
          Supprimer le club
        </Button>
      </form>

      <h2 className="title-sport mb-3 text-lg">Division par saison</h2>
      <ul className="mb-4 divide-y divide-border">
        {club.seasons.map((cs) => (
          <li key={cs.id} className="flex flex-wrap items-center gap-3 py-2">
            <span className="font-semibold">{cs.season.name}</span>
            <span>{cs.division.name}</span>
            <span className="num text-muted">
              {cs._count.squad}/{max} joueurs
            </span>
            <form action={retirerAffectation} className="ml-auto">
              <input type="hidden" name="id" value={cs.id} />
              <input type="hidden" name="clubId" value={club.id} />
              <Button type="submit" variant="secondary">
                Retirer
              </Button>
            </form>
          </li>
        ))}
        {club.seasons.length === 0 && (
          <li className="py-2 text-muted">Aucune affectation.</li>
        )}
      </ul>
      <form
        action={affecterClub}
        className="grid gap-3 sm:grid-cols-3 sm:items-end"
      >
        <input type="hidden" name="clubId" value={club.id} />
        <Choix
          label="Saison"
          name="seasonId"
          required
          options={saisons.map((s) => ({ value: s.id, label: s.name }))}
        />
        <Choix
          label="Division"
          name="divisionId"
          required
          options={divisions.map((d) => ({ value: d.id, label: d.name }))}
        />
        <Button type="submit">Affecter</Button>
      </form>
    </main>
  );
}

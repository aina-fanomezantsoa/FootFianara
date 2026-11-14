import Link from "next/link";
import { Alerte, Champ, Choix } from "@/app/_components/Champ";
import { ListeSuspensions } from "@/app/_components/admin/ListeSuspensions";
import { nomJoueur } from "@/app/_components/admin/format";
import { Button } from "@/app/_components/ui/Button";
import { requireRole } from "@/lib/auth";
import { ecrire } from "@/lib/crud-admin";
import { db } from "@/lib/db";
import type { Valid } from "@/lib/referentiel";
import { getActiveSuspensions } from "@/lib/suspensions";

const CH = "/admin/suspensions";

type Manuelle = { playerId: number; matchesTotal: number; reason: string };

function parseManuelle(f: FormData): Valid<Manuelle> {
  const playerId = Number(f.get("playerId"));
  const matchesTotal = Number(f.get("matchesTotal"));
  const reason = String(f.get("reason") ?? "").trim();
  if (!Number.isInteger(playerId) || playerId <= 0)
    return { erreur: "Joueur requis." };
  if (!Number.isInteger(matchesTotal) || matchesTotal < 1 || matchesTotal > 99)
    return { erreur: "Nombre de matchs entre 1 et 99." };
  if (!reason || reason.length > 200)
    return { erreur: "Motif requis (200 caractères au plus)." };
  return { data: { playerId, matchesTotal, reason } };
}

// BR-31 : suspension décidée par la fédération, rattachée à la saison la plus récente, sans match
// (matchId null : conservée par syncSuspensions).
async function enregistrer(f: FormData) {
  "use server";
  const v = parseManuelle(f);
  await ecrire(CH, v, async () => {
    const saison = await db.season.findFirst({
      orderBy: { startDate: "desc" },
      select: { id: true },
    });
    await db.suspension.create({
      data: { ...(v as { data: Manuelle }).data, seasonId: saison?.id },
    });
  });
}

async function purger(f: FormData) {
  "use server";
  const id = Number(f.get("id"));
  await ecrire(CH, { data: 0 }, async () => {
    const s = await db.suspension.findUnique({ where: { id } });
    // Les automatiques sont recalculées à chaque résultat : seules les manuelles se purgent ici.
    if (!s || s.matchId != null) throw new Error("Suspension non modifiable");
    await db.suspension.update({
      where: { id },
      data: { matchesServed: s.matchesTotal },
    });
  });
}

export default async function Suspensions({
  searchParams,
}: {
  searchParams: Promise<{ erreur?: string }>;
}) {
  await requireRole("ADMIN");
  const { erreur } = await searchParams;
  const [saison, joueurs] = await Promise.all([
    db.season.findFirst({ orderBy: { startDate: "desc" } }),
    db.player.findMany({
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
      select: { id: true, firstName: true, lastName: true },
    }),
  ]);
  const actives = await getActiveSuspensions(saison?.id ?? 0);
  return (
    <main className="mx-auto max-w-2xl p-4 sm:p-6">
      <Link
        href="/admin"
        className="inline-flex min-h-11 items-center underline"
      >
        Administration
      </Link>
      <h1 className="title-sport mb-4 text-xl">Suspensions</h1>
      <Alerte>{erreur}</Alerte>
      <h2 className="title-sport mb-2 text-lg">
        En cours{saison && ` · ${saison.name}`}
      </h2>
      <div className="mb-8">
        <ListeSuspensions suspensions={actives} purger={purger} />
      </div>

      <h2 className="title-sport mb-3 text-lg">Suspension de la fédération</h2>
      <form action={enregistrer} className="grid gap-4">
        <Choix
          label="Joueur"
          name="playerId"
          required
          options={joueurs.map((j) => ({ value: j.id, label: nomJoueur(j) }))}
        />
        <Champ
          label="Nombre de matchs"
          name="matchesTotal"
          type="number"
          inputMode="numeric"
          min={1}
          max={99}
          required
        />
        <Champ label="Motif" name="reason" maxLength={200} required />
        <Button type="submit">Enregistrer la suspension</Button>
      </form>
    </main>
  );
}

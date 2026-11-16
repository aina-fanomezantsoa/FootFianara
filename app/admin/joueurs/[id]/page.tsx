import Link from "next/link";
import { notFound } from "next/navigation";
import { Alerte, Champ, Choix } from "@/app/_components/Champ";
import { Button } from "@/app/_components/ui/Button";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { derniersClubs } from "@/lib/joueurs";
import {
  desinscrire,
  inscrire,
  modifierJoueur,
  supprimerJoueur,
} from "../actions";
import { ChampsJoueur } from "../ChampsJoueur";

export default async function Joueur({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ erreur?: string }>;
}) {
  await requireRole("ADMIN");
  const [{ id }, { erreur }] = await Promise.all([params, searchParams]);
  const playerId = Number(id) || 0;
  const [joueur, historique, clubSaisons] = await Promise.all([
    db.player.findUnique({
      where: { id: playerId },
      include: {
        squads: {
          include: { clubSeason: { include: { club: true, season: true } } },
          orderBy: { clubSeason: { season: { startDate: "desc" } } },
        },
      },
    }),
    derniersClubs(playerId),
    db.clubSeason.findMany({
      include: { club: true, season: true, division: true },
      orderBy: [{ season: { startDate: "desc" } }, { club: { name: "asc" } }],
    }),
  ]);
  if (!joueur) notFound();
  return (
    <main className="mx-auto max-w-2xl p-4 sm:p-6">
      <Link
        href="/admin/joueurs"
        className="inline-flex min-h-11 items-center underline"
      >
        Tous les joueurs
      </Link>
      <h1 className="title-sport mb-4 text-xl">
        {joueur.firstName} {joueur.lastName}
      </h1>
      <Alerte>{erreur}</Alerte>

      <form action={modifierJoueur} className="mb-4 grid gap-4">
        <input type="hidden" name="id" value={joueur.id} />
        <ChampsJoueur joueur={joueur} />
        <Button type="submit">Enregistrer</Button>
      </form>
      <form action={supprimerJoueur} className="mb-8">
        <input type="hidden" name="id" value={joueur.id} />
        <Button type="submit" variant="secondary">
          Supprimer le joueur
        </Button>
      </form>

      <h2 className="title-sport mb-3 text-lg">3 derniers clubs</h2>
      <ol className="mb-8 list-decimal pl-5">
        {historique.map((h) => (
          <li key={h.club.id}>
            {h.club.name} <span className="text-muted">({h.season.name})</span>
          </li>
        ))}
        {historique.length === 0 && <li className="text-muted">Aucun club.</li>}
      </ol>

      <h2 className="title-sport mb-3 text-lg">Effectifs</h2>
      <ul className="mb-4 divide-y divide-border">
        {joueur.squads.map((s) => (
          <li key={s.id} className="flex flex-wrap items-center gap-3 py-2">
            <span className="num font-semibold">#{s.shirtNumber}</span>
            <span>{s.clubSeason.club.name}</span>
            <span className="text-muted">{s.clubSeason.season.name}</span>
            <form action={desinscrire} className="ml-auto">
              <input type="hidden" name="id" value={s.id} />
              <input type="hidden" name="playerId" value={joueur.id} />
              <Button type="submit" variant="secondary">
                Retirer
              </Button>
            </form>
          </li>
        ))}
      </ul>
      {clubSaisons.length === 0 ? (
        <p className="text-muted">
          Affectez d’abord un club à une division pour une saison (page Clubs).
        </p>
      ) : (
        <form
          action={inscrire}
          className="grid gap-3 sm:grid-cols-3 sm:items-end"
        >
          <input type="hidden" name="playerId" value={joueur.id} />
          <Choix
            label="Club et saison"
            name="clubSeasonId"
            required
            options={clubSaisons.map((cs) => ({
              value: cs.id,
              label: `${cs.club.name} — ${cs.season.name} (${cs.division.name})`,
            }))}
          />
          <Champ
            label="Numéro"
            name="shirtNumber"
            type="number"
            inputMode="numeric"
            min={1}
            max={99}
            required
          />
          <Button type="submit">Inscrire</Button>
        </form>
      )}
    </main>
  );
}

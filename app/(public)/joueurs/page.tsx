import type { Metadata } from "next";
import Link from "next/link";
import { Button, ButtonLink } from "@/app/_components/ui/Button";
import { EmptyState, JoueursTabs } from "@/app/_components/public/Blocs";
import { PlayerCard } from "@/app/_components/public/Joueurs";
import { clubsDivision, joueurs, saisonEnCours } from "@/lib/public";
import { getActiveSuspensions } from "@/lib/suspensions";

export const metadata: Metadata = {
  title: "Joueurs",
  description:
    "Les joueurs du championnat de Fianarantsoa : recherche par nom et par club.",
};

const PAR_PAGE = 50;
const champ =
  "min-h-11 w-full rounded-sm border border-border bg-surface px-3 text-foreground";

export default async function Joueurs({ searchParams }: PageProps<"/joueurs">) {
  const sp = await searchParams;
  const q = String(sp.q ?? "").trim();
  const clubId = Number(sp.club) || undefined;
  const page = Math.max(1, Number(sp.page) || 1);
  const saison = await saisonEnCours();
  const [liste, clubs, suspensions] = await Promise.all([
    joueurs(saison?.id, q, clubId),
    saison ? clubsDivision(saison.id) : [],
    saison ? getActiveSuspensions(saison.id) : [],
  ]);
  const suspendus = new Set(suspensions.map((s) => s.player.id));
  const visibles = liste.slice(0, page * PAR_PAGE);
  const suite = new URLSearchParams({
    q,
    club: String(clubId ?? ""),
    page: String(page + 1),
  });
  return (
    <>
      <h1 className="title-sport text-3xl sm:text-4xl">Joueurs</h1>
      <JoueursTabs active="Joueurs" />
      <form role="search" className="grid gap-2 sm:grid-cols-[1fr_14rem_auto]">
        <label>
          <span className="sr-only">Rechercher un joueur</span>
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Nom ou prénom"
            className={champ}
          />
        </label>
        <label>
          <span className="sr-only">Club</span>
          <select name="club" defaultValue={clubId ?? ""} className={champ}>
            <option value="">Tous les clubs</option>
            {clubs.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <Button type="submit" variant="secondary">
          Chercher
        </Button>
      </form>
      {visibles.length === 0 ? (
        q || clubId ? (
          <EmptyState
            title={
              q
                ? `Aucun joueur ne correspond à « ${q} »`
                : "Aucun joueur dans ce club"
            }
            action={{ label: "Effacer la recherche", href: "/joueurs" }}
          />
        ) : (
          <EmptyState title="Aucun joueur enregistré" />
        )
      ) : (
        <>
          <p className="text-sm text-muted">
            {liste.length} joueur{liste.length > 1 ? "s" : ""}
          </p>
          <ul>
            {visibles.map((p) => (
              <li key={p.id}>
                <PlayerCard
                  {...p}
                  shirtNumber={p.squads[0]?.shirtNumber ?? null}
                  club={p.squads[0]?.clubSeason.club}
                  suspended={suspendus.has(p.id)}
                />
              </li>
            ))}
          </ul>
          {liste.length > visibles.length && (
            <ButtonLink
              variant="secondary"
              className="w-full"
              href={`/joueurs?${suite}`}
              scroll={false}
            >
              Plus de joueurs
            </ButtonLink>
          )}
        </>
      )}
      {q && visibles.length > 0 && (
        <Link
          href="/joueurs"
          className="flex min-h-11 items-center text-sm text-muted underline"
        >
          Effacer la recherche
        </Link>
      )}
    </>
  );
}

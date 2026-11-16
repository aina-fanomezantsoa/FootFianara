import Link from "next/link";
import { notFound } from "next/navigation";
import { Alerte, Champ, Choix } from "@/app/_components/Champ";
import { ForfaitDialog } from "@/app/_components/admin/ForfaitDialog";
import {
  MatchResultForm,
  type Camp,
} from "@/app/_components/admin/MatchResultForm";
import {
  dateHeure,
  nomJoueur,
  STATUTS,
  versChamp,
} from "@/app/_components/admin/format";
import { Badge } from "@/app/_components/ui/Badge";
import { Button } from "@/app/_components/ui/Button";
import { Card } from "@/app/_components/ui/Card";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { MAX_STARTERS } from "@/lib/lineups";
import { hasRole } from "@/lib/roles";
import { annulerForfait, composer, programmer, type CodeOk } from "../actions";

const SUCCES: Record<CodeOk, string> = {
  programme: "Programmation enregistrée.",
  forfait: "Forfait enregistré.",
  "forfait-annule": "Forfait annulé : le match est de nouveau programmé.",
  compo: "Compositions enregistrées.",
};

const effectif = {
  select: {
    club: { select: { name: true, shortName: true } },
    squad: {
      orderBy: { shirtNumber: "asc" as const },
      select: {
        shirtNumber: true,
        player: { select: { id: true, firstName: true, lastName: true } },
      },
    },
  },
};

export default async function Match({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ erreur?: string; ok?: string }>;
}) {
  const user = await requireRole("ASSISTANT");
  const admin = hasRole(user.role, "ADMIN");
  const [{ id }, { erreur, ok }] = await Promise.all([params, searchParams]);
  const [m, stades] = await Promise.all([
    db.match.findUnique({
      where: { id: Number(id) || 0 },
      include: {
        homeClubSeason: effectif,
        awayClubSeason: effectif,
        division: { select: { name: true } },
        stadium: { select: { name: true } },
        updatedBy: { select: { name: true } },
        events: { orderBy: [{ minute: "asc" }, { id: "asc" }] },
        lineup: { select: { playerId: true, isStarter: true } },
      },
    }),
    admin ? db.stadium.findMany({ orderBy: { name: "asc" } }) : [],
  ]);
  if (!m) notFound();

  const camp = (cs: typeof m.homeClubSeason): Camp => ({
    nom: cs.club.name,
    court: cs.club.shortName,
    joueurs: cs.squad.map((s) => ({
      id: s.player.id,
      numero: s.shirtNumber,
      nom: nomJoueur(s.player),
    })),
  });
  const home = camp(m.homeClubSeason);
  const away = camp(m.awayClubSeason);
  const domicile = new Set(home.joueurs.map((j) => j.id));
  const str = (n: number | null) => (n == null ? "" : String(n));
  const joue = m.status === "PLAYED" || m.status === "FORFEIT";
  const compo = new Map(m.lineup.map((l) => [l.playerId, l.isStarter]));
  const retour = `/admin/matchs?saison=${m.seasonId}&division=${m.divisionId}#j${m.matchday}`;

  return (
    <main className="mx-auto grid max-w-2xl gap-4 p-4 sm:p-6">
      <header className="grid gap-1">
        <Link
          href={retour}
          className="inline-flex min-h-11 items-center underline"
        >
          ‹ Journée {m.matchday}
        </Link>
        <p className="flex flex-wrap items-center gap-2 text-sm text-muted">
          <Badge inverted={m.status === "PLAYED"}>{STATUTS[m.status]}</Badge>
          {m.division.name} · Journée {m.matchday}
        </p>
        <h1 className="title-sport text-xl">
          {home.nom}{" "}
          <span className="num">
            {m.homeGoals ?? "–"} - {m.awayGoals ?? "–"}
          </span>{" "}
          {away.nom}
        </h1>
        <p className="num text-sm text-muted">
          {dateHeure(m.kickoffAt)}
          {m.stadium && ` · ${m.stadium.name}`}
        </p>
        {m.updatedBy && (
          <p className="num text-xs text-muted">
            Dernière modification : {dateHeure(m.updatedAt)} par{" "}
            {m.updatedBy.name}
          </p>
        )}
      </header>
      <Alerte>{erreur}</Alerte>
      {ok && ok in SUCCES && (
        <p role="status" className="font-semibold">
          {SUCCES[ok as CodeOk]}
        </p>
      )}

      <Card>
        <h2 className="title-sport mb-3 text-lg">Résultat</h2>
        {joue && !admin ? (
          <p className="text-muted">
            Résultat publié : seul l&apos;admin peut le corriger.
          </p>
        ) : (
          <MatchResultForm
            matchId={m.id}
            home={home}
            away={away}
            initial={{
              homeGoals: m.homeGoals ?? 0,
              awayGoals: m.awayGoals ?? 0,
              lignes: m.events.map((e) => ({
                type: e.type,
                camp: domicile.has(e.playerId) ? "home" : "away",
                minute: String(e.minute),
                joueur: String(e.playerId),
                passeur: str(e.assistPlayerId),
                entrant: str(e.playerInId),
              })),
            }}
          />
        )}
      </Card>

      <Card>
        <h2 className="title-sport mb-1 text-lg">Compositions</h2>
        <p className="mb-3 text-sm text-muted">
          {MAX_STARTERS} titulaires au plus par club.
        </p>
        <form action={composer} className="grid gap-4">
          <input type="hidden" name="matchId" value={m.id} />
          {[home, away].map((c) => (
            <fieldset key={c.nom} className="grid">
              <legend className="mb-1 font-semibold">
                {c.nom} ·{" "}
                <span className="num">
                  {c.joueurs.filter((j) => compo.get(j.id)).length} titulaires
                </span>
              </legend>
              {c.joueurs.length === 0 && (
                <p className="text-sm text-muted">
                  Aucun joueur dans l&apos;effectif.{" "}
                  {admin && (
                    <Link href="/admin/joueurs" className="underline">
                      Gérer les joueurs
                    </Link>
                  )}
                </p>
              )}
              {c.joueurs.map((j) => {
                const v = compo.get(j.id);
                return (
                  <label
                    key={j.id}
                    className="flex items-center gap-2 border-b border-border py-1 text-sm"
                  >
                    <span className="num min-w-0 flex-1 truncate">
                      {j.numero} · {j.nom}
                    </span>
                    <select
                      name={`lineup_${j.id}`}
                      defaultValue={v == null ? "" : v ? "T" : "R"}
                      className="min-h-11 w-32 rounded-sm border border-border bg-background p-2"
                    >
                      <option value="">Absent</option>
                      <option value="T">Titulaire</option>
                      <option value="R">Remplaçant</option>
                    </select>
                  </label>
                );
              })}
            </fieldset>
          ))}
          <Button type="submit" className="w-full">
            Enregistrer les compositions
          </Button>
        </form>
      </Card>

      {admin && (
        <Card>
          <h2 className="title-sport mb-3 text-lg">Forfait</h2>
          <ForfaitDialog matchId={m.id} home={home.nom} away={away.nom} />
          {m.status === "FORFEIT" && (
            <form action={annulerForfait} className="mt-3">
              <input type="hidden" name="matchId" value={m.id} />
              <Button type="submit" variant="secondary" className="w-full">
                Annuler le forfait
              </Button>
              <p className="mt-1 text-sm text-muted">
                Le match redevient programmé, sans score.
              </p>
            </form>
          )}
        </Card>
      )}

      {admin && (
        <Card>
          <h2 className="title-sport mb-3 text-lg">Programmation</h2>
          <form action={programmer} className="grid gap-3">
            <input type="hidden" name="matchId" value={m.id} />
            <Champ
              label="Date et heure (heure de Madagascar)"
              name="kickoffAt"
              type="datetime-local"
              defaultValue={versChamp(m.kickoffAt)}
            />
            <Choix
              label="Stade"
              name="stadiumId"
              vide="Aucun"
              defaultValue={m.stadiumId ?? ""}
              options={stades.map((s) => ({ value: s.id, label: s.name }))}
            />
            <Link
              href="/admin/stades"
              className="inline-flex min-h-11 items-center text-sm underline"
            >
              Gérer les stades
            </Link>
            {!joue && (
              <label className="flex min-h-11 items-center gap-2">
                <input type="hidden" name="programmable" value="1" />
                <input
                  type="checkbox"
                  name="reporte"
                  defaultChecked={m.status === "POSTPONED"}
                  className="size-5"
                />
                Match reporté
              </label>
            )}
            <Button type="submit" className="w-full">
              Enregistrer la programmation
            </Button>
          </form>
        </Card>
      )}
    </main>
  );
}

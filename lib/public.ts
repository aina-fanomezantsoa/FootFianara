// Lectures du site public (T20-T22). Appelées au rendu de requête : jamais au build.
import { db } from "./db";
import type { Prisma } from "../generated/prisma/client";

// ---------- Fonctions pures (testées) ----------

/** Saison en cours : la plus récente qui contient `now`, sinon la plus récente. */
export function choisirSaison<T extends { startDate: Date; endDate: Date }>(
  saisons: T[],
  now: Date,
): T | null {
  const tri = [...saisons].sort(
    (a, b) => b.startDate.getTime() - a.startDate.getTime(),
  );
  return (
    tri.find((s) => s.startDate <= now && now <= s.endDate) ?? tri[0] ?? null
  );
}

/** Division demandée par son nom (insensible à la casse), sinon la première (D1). */
export const choisirDivision = <T extends { name: string }>(
  divisions: T[],
  nom?: string,
) =>
  divisions.find((d) => d.name.toLowerCase() === nom?.toLowerCase()) ??
  divisions[0] ??
  null;

/** Journée par défaut : la première avec un match programmé, sinon la dernière. */
export function journeeParDefaut(
  matchs: { matchday: number; status: string }[],
): number | null {
  if (matchs.length === 0) return null;
  const aJouer = matchs.filter((m) => m.status === "SCHEDULED");
  const jours = (aJouer.length ? aJouer : matchs).map((m) => m.matchday);
  return aJouer.length ? Math.min(...jours) : Math.max(...jours);
}

/** Minuscules sans accents, pour la recherche de joueurs. */
export const sansAccents = (s: string) =>
  s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().trim();

export const correspond = (
  p: { firstName: string; lastName: string },
  q: string,
) => {
  const nom = sansAccents(`${p.firstName} ${p.lastName}`);
  return sansAccents(q)
    .split(/\s+/)
    .every((mot) => nom.includes(mot));
};

/** Image Cloudinary réduite pour la 4G (T24) ; les autres URL sont rendues telles quelles. */
export function imageReduite(url: string, largeur: number) {
  const m = url.match(
    /^(https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(.*)$/,
  );
  return m ? `${m[1]}f_auto,q_auto,w_${largeur}/${m[2]}` : url;
}

const fuseau = { timeZone: "Indian/Antananarivo" } as const;
const fmt = (o: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("fr-FR", { ...fuseau, ...o });
/** « sam. 17 janv. » */
export const dateCourte = (d: Date) =>
  fmt({ weekday: "short", day: "numeric", month: "short" }).format(d);
/** « samedi 17 janvier » */
export const dateLongue = (d: Date) =>
  fmt({ weekday: "long", day: "numeric", month: "long" }).format(d);
/** « samedi 17 janvier 2026 » */
export const dateComplete = (d: Date) =>
  fmt({
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
/** « 15:00 » */
export const heure = (d: Date) =>
  fmt({ hour: "2-digit", minute: "2-digit" }).format(d);

/** Différence de buts signée, vrai signe moins (U+2212). */
export const diffSignee = (n: number) =>
  n > 0 ? `+${n}` : n < 0 ? `−${-n}` : "0";

/** Actualité publiée depuis moins de 7 jours : étiquette « Nouvelle ». */
export const estNouvelle = (publiee: Date, now: Date) =>
  now.getTime() - publiee.getTime() < 7 * 24 * 3600 * 1000;

/** Âge révolu à la date `now`. */
export function age(naissance: Date, now: Date) {
  let a = now.getUTCFullYear() - naissance.getUTCFullYear();
  const m = now.getUTCMonth() - naissance.getUTCMonth();
  if (m < 0 || (m === 0 && now.getUTCDate() < naissance.getUTCDate())) a--;
  return a;
}

// ---------- Requêtes ----------

export async function saisonEnCours() {
  return choisirSaison(
    await db.season.findMany({ orderBy: { startDate: "desc" } }),
    new Date(),
  );
}

export const divisions = () =>
  db.division.findMany({ orderBy: { level: "asc" } });

/** Saison, divisions et division choisie : base commune des pages filtrées par division. */
export async function contexte(divisionParam?: string) {
  const [saison, divs] = await Promise.all([saisonEnCours(), divisions()]);
  return {
    saison,
    divisions: divs,
    division: choisirDivision(divs, divisionParam),
  };
}

const club = {
  select: {
    club: { select: { id: true, name: true, shortName: true, logoUrl: true } },
  },
};
const matchSelect = {
  id: true,
  matchday: true,
  kickoffAt: true,
  status: true,
  homeGoals: true,
  awayGoals: true,
  homeClubSeasonId: true,
  awayClubSeasonId: true,
  stadium: { select: { name: true } },
  division: { select: { name: true } },
  homeClubSeason: club,
  awayClubSeason: club,
} satisfies Prisma.MatchSelect;
export type MatchPublic = Prisma.MatchGetPayload<{
  select: typeof matchSelect;
}>;

export const prochainsMatchs = (where: Prisma.MatchWhereInput, take: number) =>
  db.match.findMany({
    where: { ...where, status: "SCHEDULED", kickoffAt: { gte: new Date() } },
    orderBy: { kickoffAt: "asc" },
    take,
    select: matchSelect,
  });

export const derniersResultats = (
  where: Prisma.MatchWhereInput,
  take: number,
) =>
  db.match.findMany({
    where: { ...where, status: { in: ["PLAYED", "FORFEIT"] } },
    orderBy: [
      { kickoffAt: { sort: "desc", nulls: "last" } },
      { matchday: "desc" },
    ],
    take,
    select: matchSelect,
  });

export const matchsDivision = (seasonId: number, divisionId: number) =>
  db.match.findMany({
    where: { seasonId, divisionId },
    orderBy: [
      { matchday: "asc" },
      { kickoffAt: { sort: "asc", nulls: "last" } },
      { id: "asc" },
    ],
    select: matchSelect,
  });

export const actualites = (take?: number) =>
  db.news.findMany({ orderBy: { publishedAt: "desc" }, take });

export const actualite = (id: number) => db.news.findUnique({ where: { id } });

/** Dernière journée ayant un match joué ou forfait, null si aucune. */
export const derniereJournee = async (seasonId: number, divisionId: number) =>
  (
    await db.match.aggregate({
      where: { seasonId, divisionId, status: { in: ["PLAYED", "FORFEIT"] } },
      _max: { matchday: true },
    })
  )._max.matchday;

const nomJoueur = { select: { id: true, firstName: true, lastName: true } };

export const matchDetail = (id: number) =>
  db.match.findUnique({
    where: { id },
    select: {
      ...matchSelect,
      events: {
        where: { type: { not: "SUB" } },
        orderBy: [{ minute: "asc" }, { id: "asc" }],
        select: {
          id: true,
          type: true,
          minute: true,
          player: {
            select: {
              ...nomJoueur.select,
              squads: { select: { clubSeasonId: true } },
            },
          },
          assistPlayer: nomJoueur,
        },
      },
    },
  });

export const clubDetail = (id: number, seasonId?: number) =>
  db.club.findUnique({
    where: { id },
    include: {
      seasons: {
        where: { seasonId: seasonId ?? -1 },
        select: {
          id: true,
          division: true,
          squad: {
            orderBy: { shirtNumber: "asc" },
            select: {
              shirtNumber: true,
              player: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  photoUrl: true,
                  position: true,
                },
              },
            },
          },
        },
      },
    },
  });

/** Clubs de la saison (d'une division si donnée), par ordre alphabétique. */
export const clubsDivision = (seasonId: number, divisionId?: number) =>
  db.club.findMany({
    where: { seasons: { some: { seasonId, divisionId } } },
    orderBy: { name: "asc" },
  });

/** Joueurs avec leur club de la saison (dernier effectif). shortcut: filtre en mémoire (accents), à passer en SQL (unaccent) au-delà de quelques milliers. */
export async function joueurs(
  seasonId: number | undefined,
  q: string,
  clubId?: number,
) {
  const tous = await db.player.findMany({
    where: clubId
      ? { squads: { some: { clubSeason: { seasonId, clubId } } } }
      : undefined,
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    select: {
      id: true,
      firstName: true,
      lastName: true,
      photoUrl: true,
      position: true,
      squads: {
        where: { clubSeason: { seasonId: seasonId ?? -1 } },
        orderBy: { id: "desc" },
        take: 1,
        select: { shirtNumber: true, clubSeason: club },
      },
    },
  });
  return q ? tous.filter((p) => correspond(p, q)) : tous;
}

export const joueurDetail = (id: number, seasonId?: number) =>
  db.player.findUnique({
    where: { id },
    include: {
      squads: {
        where: { clubSeason: { seasonId: seasonId ?? -1 } },
        orderBy: { id: "desc" },
        take: 1,
        select: { shirtNumber: true, clubSeason: club },
      },
    },
  });

/** Totaux de la saison d'un joueur. Matchs = feuilles de match (T13). */
export async function statsJoueur(playerId: number, seasonId: number) {
  const match = { seasonId, status: "PLAYED" as const };
  const [matchs, buts, passes, jaunes, rouges] = await Promise.all([
    db.lineup.count({ where: { playerId, match } }),
    db.matchEvent.count({ where: { playerId, type: "GOAL", match } }),
    db.matchEvent.count({
      where: { assistPlayerId: playerId, type: "GOAL", match },
    }),
    db.matchEvent.count({ where: { playerId, type: "YELLOW", match } }),
    db.matchEvent.count({ where: { playerId, type: "RED", match } }),
  ]);
  return { matchs, buts, passes, jaunes, rouges };
}

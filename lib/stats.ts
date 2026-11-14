import { db } from "./db";
import type { EventType } from "../generated/prisma/client";

export type PlayerTally = {
  playerId: number;
  goals: number;
  assists: number;
  yellow: number;
  red: number;
};
export type StatRow = PlayerTally & {
  player: {
    id: number;
    firstName: string;
    lastName: string;
    photoUrl: string | null;
  };
  club: {
    id: number;
    name: string;
    shortName: string;
    logoUrl: string | null;
  } | null;
};
export type StatsQuery = {
  seasonId: number;
  divisionId?: number;
  limit?: number;
};

/** Fonction pure : un csc ne compte ni pour le buteur ni pour un passeur. */
export function tallyEvents(
  events: {
    type: EventType;
    playerId: number;
    assistPlayerId: number | null;
  }[],
): PlayerTally[] {
  const t = new Map<number, PlayerTally>();
  const get = (id: number) => {
    if (!t.has(id))
      t.set(id, { playerId: id, goals: 0, assists: 0, yellow: 0, red: 0 });
    return t.get(id)!;
  };
  for (const e of events) {
    if (e.type === "GOAL") {
      get(e.playerId).goals++;
      if (e.assistPlayerId != null) get(e.assistPlayerId).assists++;
    } else if (e.type === "YELLOW") get(e.playerId).yellow++;
    else if (e.type === "RED") get(e.playerId).red++;
  }
  return [...t.values()];
}

/** Tri décroissant sur les clés données, joueurs à 0 exclus. */
export const rankBy = (
  rows: PlayerTally[],
  keys: (keyof PlayerTally)[],
  limit: number,
) =>
  rows
    .filter((r) => keys.some((k) => r[k] > 0))
    .sort(
      (a, b) =>
        keys.reduce((d, k) => d || b[k] - a[k], 0) || a.playerId - b.playerId,
    )
    .slice(0, limit);

async function load(
  q: StatsQuery,
  keys: (keyof PlayerTally)[],
): Promise<StatRow[]> {
  const events = await db.matchEvent.findMany({
    where: {
      match: {
        seasonId: q.seasonId,
        divisionId: q.divisionId,
        status: "PLAYED",
      },
    },
    select: { type: true, playerId: true, assistPlayerId: true },
  });
  const top = rankBy(tallyEvents(events), keys, q.limit ?? 10);
  const players = await db.player.findMany({
    where: { id: { in: top.map((r) => r.playerId) } },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      photoUrl: true,
      // Joueur transféré en cours de saison : dernier club (Squad le plus récent).
      squads: {
        where: { clubSeason: { seasonId: q.seasonId } },
        orderBy: { id: "desc" },
        take: 1,
        select: {
          clubSeason: {
            select: {
              club: {
                select: {
                  id: true,
                  name: true,
                  shortName: true,
                  logoUrl: true,
                },
              },
            },
          },
        },
      },
    },
  });
  const by = new Map(players.map((p) => [p.id, p]));
  return top.map((r) => {
    const { squads, ...player } = by.get(r.playerId)!;
    return { ...r, player, club: squads[0]?.clubSeason.club ?? null };
  });
}

export const getTopScorers = (q: StatsQuery) => load(q, ["goals"]);
export const getTopAssists = (q: StatsQuery) => load(q, ["assists"]);
/** Rouges d'abord, puis jaunes. */
export const getCards = (q: StatsQuery) => load(q, ["red", "yellow"]);

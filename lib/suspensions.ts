import { db } from "./db";

/** Match joué de la saison, dans l'ordre chronologique. clubIds = ClubSeason des deux camps. */
export type DisciplineMatch = {
  id: number;
  clubIds: number[];
  cards: { playerId: number; clubId: number; type: "YELLOW" | "RED" }[];
};
export type AutoSuspension = {
  playerId: number;
  matchId: number;
  reason: string;
  matchesTotal: number;
  matchesServed: number;
};

/**
 * BR-32, fonction pure (décisions 72 et 77) : compteur de jaunes par saison ; chaque tranche
 * de `yellowLimit` jaunes déclenche une suspension et remet le compteur à zéro. Un rouge déclenche
 * une suspension ; les jaunes du même match ne comptent alors pas (double jaune = rouge).
 * Un match du club joué ou perdu par forfait après le match déclencheur compte comme purgé.
 */
export function detectSuspensions(
  matches: DisciplineMatch[],
  { yellowLimit = 5, length = 2 } = {},
): AutoSuspension[] {
  const yellows = new Map<number, number>();
  const out: (AutoSuspension & { index: number; clubId: number })[] = [];
  matches.forEach((m, index) => {
    const players = new Map<
      number,
      { clubId: number; y: number; red: boolean }
    >();
    for (const c of m.cards) {
      const p = players.get(c.playerId) ?? {
        clubId: c.clubId,
        y: 0,
        red: false,
      };
      if (c.type === "RED") p.red = true;
      else p.y++;
      players.set(c.playerId, p);
    }
    for (const [playerId, p] of players) {
      const base = {
        playerId,
        matchId: m.id,
        matchesTotal: length,
        matchesServed: 0,
        index,
        clubId: p.clubId,
      };
      if (p.red) {
        out.push({ ...base, reason: "Carton rouge" });
        continue;
      }
      let y = (yellows.get(playerId) ?? 0) + p.y;
      for (; y >= yellowLimit; y -= yellowLimit)
        out.push({ ...base, reason: `${yellowLimit} cartons jaunes` });
      yellows.set(playerId, y);
    }
  });
  return out.map(({ index, clubId, ...s }) => ({
    ...s,
    matchesServed: Math.min(
      s.matchesTotal,
      matches.slice(index + 1).filter((m) => m.clubIds.includes(clubId)).length,
    ),
  }));
}

/** Recalcule toutes les suspensions automatiques de la saison (idempotent). Les manuelles (matchId null) sont conservées. */
export async function syncSuspensions(seasonId: number) {
  const [matches, squads, settings] = await Promise.all([
    db.match.findMany({
      where: { seasonId, status: { in: ["PLAYED", "FORFEIT"] } },
      // shortcut: match sans date classé en fin de liste (nulls last) ; l'admin doit dater les matchs.
      orderBy: [{ kickoffAt: "asc" }, { matchday: "asc" }, { id: "asc" }],
      select: {
        id: true,
        homeClubSeasonId: true,
        awayClubSeasonId: true,
        events: {
          where: { type: { in: ["YELLOW", "RED"] } },
          select: { playerId: true, type: true },
        },
      },
    }),
    db.squad.findMany({
      where: { clubSeason: { seasonId } },
      select: { clubSeasonId: true, playerId: true },
    }),
    db.setting.findMany({
      where: { key: { in: ["yellowLimit", "suspensionMatches"] } },
    }),
  ]);
  const inSquad = new Set(squads.map((s) => `${s.clubSeasonId}:${s.playerId}`));
  const setting = (k: string, d: number) =>
    Number(settings.find((s) => s.key === k)?.value) || d;
  const detected = detectSuspensions(
    matches.map((m) => ({
      id: m.id,
      clubIds: [m.homeClubSeasonId, m.awayClubSeasonId],
      cards: m.events.map((e) => ({
        playerId: e.playerId,
        type: e.type as "YELLOW" | "RED",
        clubId: inSquad.has(`${m.homeClubSeasonId}:${e.playerId}`)
          ? m.homeClubSeasonId
          : m.awayClubSeasonId,
      })),
    })),
    {
      yellowLimit: setting("yellowLimit", 5),
      length: setting("suspensionMatches", 2),
    },
  );
  await db.$transaction([
    db.suspension.deleteMany({ where: { seasonId, matchId: { not: null } } }),
    db.suspension.createMany({
      data: detected.map((s) => ({ ...s, seasonId })),
    }),
  ]);
}

/**
 * Suspensions non purgées : automatiques de la saison + manuelles (BR-31, sans saison).
 * playerId facultatif pour la fiche joueur.
 */
export function getActiveSuspensions(seasonId: number, playerId?: number) {
  return db.suspension.findMany({
    where: {
      playerId,
      matchesServed: { lt: db.suspension.fields.matchesTotal },
      OR: [{ seasonId }, { seasonId: null }],
    },
    orderBy: { id: "asc" },
    select: {
      id: true,
      reason: true,
      matchesTotal: true,
      matchesServed: true,
      matchId: true,
      player: {
        select: { id: true, firstName: true, lastName: true, photoUrl: true },
      },
    },
  });
}
export type ActiveSuspension = Awaited<
  ReturnType<typeof getActiveSuspensions>
>[number];

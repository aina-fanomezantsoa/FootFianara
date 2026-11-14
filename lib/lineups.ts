import { revalidatePath } from "next/cache";
import { requireRole } from "./auth";
import { db } from "./db";
import type { Valid } from "./referentiel";
import type { ActionResult, ResultContext } from "./match-result";

export type LineupEntry = { playerId: number; isStarter: boolean };

export const MAX_STARTERS = 11;

/** T13, fonction pure : joueurs des effectifs des deux clubs, sans doublon, 11 titulaires max par club. */
export function validateLineup(
  entries: LineupEntry[],
  ctx: ResultContext,
): Valid<LineupEntry[]> {
  const home = new Set(ctx.homePlayerIds);
  const away = new Set(ctx.awayPlayerIds);
  const seen = new Set<number>();
  const starters = { home: 0, away: 0 };
  for (const e of entries) {
    if (seen.has(e.playerId)) return { erreur: "Joueur inscrit deux fois." };
    seen.add(e.playerId);
    const s = home.has(e.playerId)
      ? "home"
      : away.has(e.playerId)
        ? "away"
        : null;
    if (!s) return { erreur: "Joueur absent des effectifs des deux clubs." };
    if (e.isStarter && ++starters[s] > MAX_STARTERS)
      return {
        erreur: `Plus de ${MAX_STARTERS} titulaires pour le club ${s === "home" ? "à domicile" : "à l'extérieur"}.`,
      };
  }
  return { data: entries };
}

/** Champs `lineup_<playerId>` valant T (titulaire), R (remplaçant) ou vide (absent). */
export function parseLineup(f: FormData): Valid<LineupEntry[]> {
  const out: LineupEntry[] = [];
  for (const [k, v] of f.entries()) {
    if (!k.startsWith("lineup_") || v === "") continue;
    const playerId = Number(k.slice(7));
    if (!Number.isInteger(playerId) || (v !== "T" && v !== "R"))
      return { erreur: "Composition invalide." };
    out.push({ playerId, isStarter: v === "T" });
  }
  return { data: out };
}

/** Remplace la composition du match. ASSISTANT (BR-24). */
export async function saveLineup(
  matchId: number,
  entries: LineupEntry[],
): Promise<ActionResult> {
  await requireRole("ASSISTANT");
  const squad = { select: { squad: { select: { playerId: true } } } };
  const m = await db.match.findUnique({
    where: { id: matchId },
    select: { homeClubSeason: squad, awayClubSeason: squad },
  });
  if (!m) return { erreur: "Match introuvable." };
  const v = validateLineup(entries, {
    homePlayerIds: m.homeClubSeason.squad.map((s) => s.playerId),
    awayPlayerIds: m.awayClubSeason.squad.map((s) => s.playerId),
  });
  if ("erreur" in v) return v;
  await db.$transaction([
    db.lineup.deleteMany({ where: { matchId } }),
    db.lineup.createMany({
      data: entries.map((e) => ({ matchId, ...e })),
    }),
  ]);
  revalidatePath("/", "layout");
  return { ok: true };
}

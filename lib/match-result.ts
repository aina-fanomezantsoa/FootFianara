import { revalidatePath } from "next/cache";
import { requireRole } from "./auth";
import { db } from "./db";
import { hasRole } from "./roles";
import { syncSuspensions } from "./suspensions";
import type { Valid } from "./referentiel";
import type { EventType } from "../generated/prisma/client";

export type ResultEvent = {
  type: EventType;
  minute: number;
  playerId: number;
  /** GOAL uniquement, coéquipier du buteur. */
  assistPlayerId?: number | null;
  /** SUB uniquement : joueur entrant (playerId = joueur sortant). */
  playerInId?: number | null;
};
export type ResultInput = {
  homeGoals: number;
  awayGoals: number;
  events: ResultEvent[];
};
/** Effectifs (Squad) de la saison des deux clubs du match. */
export type ResultContext = {
  homePlayerIds: number[];
  awayPlayerIds: number[];
};
export type ActionResult = { erreur: string } | { ok: true };

const TYPES: EventType[] = ["GOAL", "OWN_GOAL", "YELLOW", "RED", "SUB"];
const isCount = (n: number) => Number.isInteger(n) && n >= 0 && n <= 99;

/** BR-27, fonction pure. */
export function validateResult(
  input: ResultInput,
  ctx: ResultContext,
): Valid<ResultInput> {
  const { homeGoals, awayGoals, events } = input;
  if (!isCount(homeGoals) || !isCount(awayGoals))
    return { erreur: "Score invalide." };
  const home = new Set(ctx.homePlayerIds);
  const away = new Set(ctx.awayPlayerIds);
  const side = (id: number | null | undefined) =>
    id == null ? null : home.has(id) ? "home" : away.has(id) ? "away" : null;
  const goals = { home: 0, away: 0 };
  for (const [i, e] of events.entries()) {
    const n = `Événement ${i + 1} : `;
    if (!TYPES.includes(e.type)) return { erreur: n + "type inconnu." };
    if (!Number.isInteger(e.minute) || e.minute < 0 || e.minute > 130)
      return { erreur: n + "minute entre 0 et 130." };
    const s = side(e.playerId);
    if (!s)
      return { erreur: n + "joueur absent des effectifs des deux clubs." };
    if (e.assistPlayerId != null) {
      if (e.type !== "GOAL")
        return { erreur: n + "passeur seulement sur un but." };
      if (e.assistPlayerId === e.playerId)
        return { erreur: n + "passeur = buteur." };
      if (side(e.assistPlayerId) !== s)
        return { erreur: n + "le passeur doit être du club du buteur." };
    }
    if (e.type === "SUB") {
      if (side(e.playerInId) !== s || e.playerInId === e.playerId)
        return { erreur: n + "joueur entrant invalide (même club requis)." };
    } else if (e.playerInId != null)
      return { erreur: n + "joueur entrant seulement sur un remplacement." };
    // Un csc compte pour l'adversaire.
    if (e.type === "GOAL") goals[s]++;
    if (e.type === "OWN_GOAL") goals[s === "home" ? "away" : "home"]++;
  }
  if (goals.home !== homeGoals || goals.away !== awayGoals)
    return {
      erreur: `Buts saisis (${goals.home}-${goals.away}) différents du score (${homeGoals}-${awayGoals}).`,
    };
  return { data: input };
}

const num = (v: FormDataEntryValue | null | undefined) => {
  const s = String(v ?? "").trim();
  return s === "" ? null : Number(s);
};

/**
 * Champs attendus : homeGoals, awayGoals, puis une ligne par événement via des champs répétés
 * dans le même ordre : event_type, event_minute, event_player, event_assist (vide si aucun),
 * event_player_in (vide sauf SUB). Les lignes dont event_type est vide sont ignorées.
 */
export function parseResultat(f: FormData): Valid<ResultInput> {
  const homeGoals = num(f.get("homeGoals"));
  const awayGoals = num(f.get("awayGoals"));
  if (homeGoals == null || awayGoals == null)
    return { erreur: "Score requis." };
  const col = (k: string) => f.getAll(k);
  const [type, minute, player, assist, playerIn] = [
    "event_type",
    "event_minute",
    "event_player",
    "event_assist",
    "event_player_in",
  ].map(col);
  const events: ResultEvent[] = [];
  for (let i = 0; i < type.length; i++) {
    const t = String(type[i]).trim();
    if (!t) continue;
    const m = num(minute[i]);
    const p = num(player[i]);
    if (m == null || p == null || isNaN(m) || isNaN(p))
      return {
        erreur: `Événement ${events.length + 1} : minute et joueur requis.`,
      };
    events.push({
      type: t as EventType,
      minute: m,
      playerId: p,
      assistPlayerId: num(assist[i]),
      playerInId: num(playerIn[i]),
    });
  }
  return { data: { homeGoals, awayGoals, events } };
}

// Toutes les pages publiques (classement, calendrier, match, stats, joueurs) dépendent des résultats.
const revalidatePublic = () => revalidatePath("/", "layout");

/** Première saisie : ASSISTANT. Correction d'un match PLAYED/FORFEIT : ADMIN. */
export async function saveResult(
  matchId: number,
  input: ResultInput,
): Promise<ActionResult> {
  const user = await requireRole("ASSISTANT");
  const squad = { select: { squad: { select: { playerId: true } } } };
  const m = await db.match.findUnique({
    where: { id: matchId },
    select: {
      seasonId: true,
      status: true,
      homeClubSeason: squad,
      awayClubSeason: squad,
    },
  });
  if (!m) return { erreur: "Match introuvable." };
  if (
    (m.status === "PLAYED" || m.status === "FORFEIT") &&
    !hasRole(user.role, "ADMIN")
  )
    return { erreur: "Résultat déjà publié : seul l'admin peut le corriger." };
  const v = validateResult(input, {
    homePlayerIds: m.homeClubSeason.squad.map((s) => s.playerId),
    awayPlayerIds: m.awayClubSeason.squad.map((s) => s.playerId),
  });
  if ("erreur" in v) return v;
  await db.$transaction([
    db.matchEvent.deleteMany({ where: { matchId } }),
    db.matchEvent.createMany({
      data: input.events.map((e) => ({
        matchId,
        type: e.type,
        minute: e.minute,
        playerId: e.playerId,
        assistPlayerId: e.assistPlayerId ?? null,
        playerInId: e.playerInId ?? null,
      })),
    }),
    db.match.update({
      where: { id: matchId },
      data: {
        homeGoals: input.homeGoals,
        awayGoals: input.awayGoals,
        status: "PLAYED",
        updatedById: Number(user.id),
      },
    }),
  ]);
  await syncSuspensions(m.seasonId);
  revalidatePublic();
  return { ok: true };
}

/** BR-23 : 0-3 pour le fautif, sans événements. ADMIN. Le fautif se déduit ensuite du score. */
export async function declareForfeit(
  matchId: number,
  fautif: "HOME" | "AWAY",
): Promise<ActionResult> {
  const user = await requireRole("ADMIN");
  const m = await db.match.findUnique({
    where: { id: matchId },
    select: { seasonId: true },
  });
  if (!m) return { erreur: "Match introuvable." };
  await db.$transaction([
    db.matchEvent.deleteMany({ where: { matchId } }),
    db.match.update({
      where: { id: matchId },
      data: {
        homeGoals: fautif === "HOME" ? 0 : 3,
        awayGoals: fautif === "HOME" ? 3 : 0,
        status: "FORFEIT",
        updatedById: Number(user.id),
      },
    }),
  ]);
  await syncSuspensions(m.seasonId);
  revalidatePublic();
  return { ok: true };
}

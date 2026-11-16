import { revalidatePath } from "next/cache";
import { requireRole } from "./auth";
import { db } from "./db";
import type { Valid } from "./referentiel";
import type { ActionResult } from "./match-result";

export type ScheduleInput = {
  kickoffAt: Date | null;
  stadiumId: number | null;
  /** Absent = statut inchangé. */
  status?: "SCHEDULED" | "POSTPONED";
};

/**
 * Champs : kickoffAt (valeur d'un <input type="datetime-local">, heure de Madagascar),
 * stadiumId (vide = aucun), status (SCHEDULED | POSTPONED | vide).
 */
export function parseSchedule(f: FormData): Valid<ScheduleInput> {
  const k = String(f.get("kickoffAt") ?? "").trim();
  const s = String(f.get("stadiumId") ?? "").trim();
  const st = String(f.get("status") ?? "").trim();
  // Madagascar = UTC+3 toute l'année ; le serveur Vercel tourne en UTC.
  const kickoffAt = k ? new Date(`${k}+03:00`) : null;
  if (kickoffAt && isNaN(+kickoffAt)) return { erreur: "Date invalide." };
  if (s && !Number.isInteger(Number(s))) return { erreur: "Stade invalide." };
  if (st && st !== "SCHEDULED" && st !== "POSTPONED")
    return { erreur: "Statut invalide." };
  return {
    data: {
      kickoffAt,
      stadiumId: s ? Number(s) : null,
      status: (st || undefined) as ScheduleInput["status"],
    },
  };
}

/** T12, BR-21 : date, heure, stade, report. ADMIN. */
export async function updateSchedule(
  matchId: number,
  input: ScheduleInput,
): Promise<ActionResult> {
  const user = await requireRole("ADMIN");
  const m = await db.match.findUnique({
    where: { id: matchId },
    select: { status: true },
  });
  if (!m) return { erreur: "Match introuvable." };
  if (input.status && (m.status === "PLAYED" || m.status === "FORFEIT"))
    return {
      erreur: "Match déjà joué : corrigez le résultat plutôt que le statut.",
    };
  try {
    await db.match.update({
      where: { id: matchId },
      data: {
        kickoffAt: input.kickoffAt,
        stadiumId: input.stadiumId,
        status: input.status,
        updatedById: Number(user.id),
      },
    });
  } catch (e) {
    if ((e as { code?: string }).code === "P2003")
      return { erreur: "Stade inconnu." };
    throw e;
  }
  revalidatePath("/", "layout");
  return { ok: true };
}

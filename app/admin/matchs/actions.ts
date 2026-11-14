"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { saveCalendar } from "@/lib/calendar-db";
import { parseLineup, saveLineup } from "@/lib/lineups";
import { parseSchedule, updateSchedule } from "@/lib/match-admin";
import {
  declareForfeit,
  parseResultat,
  saveResult,
  type ActionResult,
} from "@/lib/match-result";

const fiche = (id: number) => `/admin/matchs/${id}`;

// Les fonctions de lib/ renvoient { erreur } | { ok } ; la page affiche le message via l'URL.
function retour(chemin: string, r: ActionResult, ok: string) {
  const q =
    "erreur" in r
      ? `erreur=${encodeURIComponent(r.erreur)}`
      : `ok=${encodeURIComponent(ok)}`;
  redirect(`${chemin}?${q}`);
}

export async function genererCalendrier(f: FormData) {
  await requireRole("ADMIN");
  const seasonId = Number(f.get("seasonId"));
  const divisionId = Number(f.get("divisionId"));
  const chemin = `/admin/matchs?saison=${seasonId}&division=${divisionId}`;
  let erreur = "";
  try {
    await saveCalendar(seasonId, divisionId);
  } catch (e) {
    erreur = e instanceof Error ? e.message : "Génération impossible.";
  }
  revalidatePath("/", "layout");
  redirect(erreur ? `${chemin}&erreur=${encodeURIComponent(erreur)}` : chemin);
}

/** Pour useActionState : l'erreur revient au formulaire client sans perdre la saisie. */
export async function enregistrerResultat(
  _prev: ActionResult | null,
  f: FormData,
): Promise<ActionResult> {
  await requireRole("ASSISTANT");
  const v = parseResultat(f);
  if ("erreur" in v) return v;
  return saveResult(Number(f.get("matchId")), v.data);
}

export async function programmer(f: FormData) {
  await requireRole("ADMIN");
  const id = Number(f.get("matchId"));
  const v = parseSchedule(f);
  // Case « reporté » rendue seulement pour un match non joué : décochée = reprogrammé.
  if ("data" in v && f.get("programmable"))
    v.data.status = f.get("reporte") ? "POSTPONED" : "SCHEDULED";
  retour(
    fiche(id),
    "erreur" in v ? v : await updateSchedule(id, v.data),
    "Programmation enregistrée.",
  );
}

export async function forfait(f: FormData) {
  await requireRole("ADMIN");
  const id = Number(f.get("matchId"));
  const fautif = f.get("fautif");
  retour(
    fiche(id),
    fautif === "HOME" || fautif === "AWAY"
      ? await declareForfeit(id, fautif)
      : { erreur: "Choisissez le club forfait." },
    "Forfait enregistré.",
  );
}

export async function composer(f: FormData) {
  await requireRole("ASSISTANT");
  const id = Number(f.get("matchId"));
  const v = parseLineup(f);
  retour(
    fiche(id),
    "erreur" in v ? v : await saveLineup(id, v.data),
    "Compositions enregistrées.",
  );
}

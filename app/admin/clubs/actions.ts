"use server";

import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { ecrire } from "@/lib/crud-admin";
import { db } from "@/lib/db";
import { imagesDuFormulaire } from "@/lib/images";
import {
  parseClub,
  parseIds,
  type ClubData,
  type Valid,
} from "@/lib/referentiel";

type Club = ClubData & { logoUrl?: string; teamPhotoUrl?: string };
const data = <T>(v: Valid<T>) => (v as { data: T }).data;
const fiche = (f: FormData) => `/admin/clubs/${Number(f.get("id"))}`;

// Validation puis téléversement (seulement si le reste est valide, et après contrôle du rôle).
async function valider(f: FormData): Promise<Valid<Club>> {
  await requireRole("ADMIN");
  const v = parseClub(f);
  if ("erreur" in v) return v;
  const img = await imagesDuFormulaire(f, "logoUrl", "teamPhotoUrl");
  return "erreur" in img ? img : { data: { ...v.data, ...img.data } };
}

export async function creerClub(f: FormData) {
  const v = await valider(f);
  await ecrire("/admin/clubs", v, () => db.club.create({ data: data(v) }));
}

export async function modifierClub(f: FormData) {
  const v = await valider(f);
  await ecrire(fiche(f), v, () =>
    db.club.update({ where: { id: Number(f.get("id")) }, data: data(v) }),
  );
}

export async function supprimerClub(f: FormData) {
  await ecrire(fiche(f), { data: 0 }, () =>
    db.club.delete({ where: { id: Number(f.get("id")) } }),
  );
  redirect("/admin/clubs");
}

// BR-02 : une seule division par saison (contrainte unique seasonId + clubId).
export async function affecterClub(f: FormData) {
  await requireRole("ADMIN");
  let v: Valid<Record<"clubId" | "seasonId" | "divisionId", number>> = parseIds(
    f,
    "clubId",
    "seasonId",
    "divisionId",
  );
  if ("data" in v) {
    const deja = await db.clubSeason.findUnique({
      where: {
        seasonId_clubId: { seasonId: v.data.seasonId, clubId: v.data.clubId },
      },
    });
    if (deja) v = { erreur: "Ce club a déjà une division pour cette saison." };
  }
  await ecrire(`/admin/clubs/${Number(f.get("clubId"))}`, v, () =>
    db.clubSeason.create({ data: data(v) }),
  );
}

export async function retirerAffectation(f: FormData) {
  await ecrire(`/admin/clubs/${Number(f.get("clubId"))}`, { data: 0 }, () =>
    db.clubSeason.delete({ where: { id: Number(f.get("id")) } }),
  );
}

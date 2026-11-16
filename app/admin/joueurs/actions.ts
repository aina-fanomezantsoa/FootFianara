"use server";

import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { ecrire } from "@/lib/crud-admin";
import { db } from "@/lib/db";
import { imagesDuFormulaire } from "@/lib/images";
import { maxSquad } from "@/lib/joueurs";
import {
  parseIds,
  parseJoueur,
  verifierInscription,
  type JoueurData,
  type Valid,
} from "@/lib/referentiel";

type Joueur = JoueurData & { photoUrl?: string };
const data = <T>(v: Valid<T>) => (v as { data: T }).data;
const fiche = (id: FormDataEntryValue | null) => `/admin/joueurs/${Number(id)}`;

// Validation puis téléversement (seulement si le reste est valide, et après contrôle du rôle).
async function valider(f: FormData): Promise<Valid<Joueur>> {
  await requireRole("ADMIN");
  const v = parseJoueur(f);
  if ("erreur" in v) return v;
  const img = await imagesDuFormulaire(f, "photoUrl");
  return "erreur" in img ? img : { data: { ...v.data, ...img.data } };
}

export async function creerJoueur(f: FormData) {
  const v = await valider(f);
  await ecrire("/admin/joueurs", v, () => db.player.create({ data: data(v) }));
}

export async function modifierJoueur(f: FormData) {
  const v = await valider(f);
  await ecrire(fiche(f.get("id")), v, () =>
    db.player.update({ where: { id: Number(f.get("id")) }, data: data(v) }),
  );
}

export async function supprimerJoueur(f: FormData) {
  await ecrire(fiche(f.get("id")), { data: 0 }, () =>
    db.player.delete({ where: { id: Number(f.get("id")) } }),
  );
  redirect("/admin/joueurs");
}

// BR-03, BR-42 : plafond d'effectif et numéro unique vérifiés avant l'écriture.
// shortcut: deux inscriptions simultanées peuvent dépasser le plafond (les contraintes uniques
// protègent le numéro), passer à une transaction sérialisable si plusieurs admins saisissent en même temps.
export async function inscrire(f: FormData) {
  await requireRole("ADMIN");
  const ids = parseIds(f, "playerId", "clubSeasonId");
  let v: Valid<{
    playerId: number;
    clubSeasonId: number;
    shirtNumber: number;
  }> = ids as Valid<never>;
  if ("data" in ids) {
    const shirtNumber = Number(f.get("shirtNumber"));
    const [effectif, max] = await Promise.all([
      db.squad.findMany({
        where: { clubSeasonId: ids.data.clubSeasonId },
        select: { playerId: true, shirtNumber: true },
      }),
      maxSquad(),
    ]);
    const erreur = verifierInscription(
      effectif,
      ids.data.playerId,
      shirtNumber,
      max,
    );
    v = erreur ? { erreur } : { data: { ...ids.data, shirtNumber } };
  }
  await ecrire(fiche(f.get("playerId")), v, () =>
    db.squad.create({ data: data(v) }),
  );
}

export async function desinscrire(f: FormData) {
  await ecrire(fiche(f.get("playerId")), { data: 0 }, () =>
    db.squad.delete({ where: { id: Number(f.get("id")) } }),
  );
}

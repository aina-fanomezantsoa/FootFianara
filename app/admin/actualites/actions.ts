"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { ecrire } from "@/lib/crud-admin";
import { db } from "@/lib/db";
import { imagesDuFormulaire } from "@/lib/images";
import { parseNews, type Valid } from "@/lib/referentiel";

type News = { title: string; body: string; imageUrl?: string };
const data = <T>(v: Valid<T>) => (v as { data: T }).data;
const fiche = (f: FormData) => `/admin/actualites/${Number(f.get("id"))}`;

async function valider(f: FormData): Promise<Valid<News>> {
  await requireRole("ADMIN");
  const v = parseNews(f);
  if ("erreur" in v) return v;
  const img = await imagesDuFormulaire(f, "imageUrl");
  return "erreur" in img ? img : { data: { ...v.data, ...img.data } };
}

// Les pages publiques lisent la base à chaque requête ; on invalide quand même l'accueil.
const publier = () => {
  revalidatePath("/");
  revalidatePath("/actualites");
  revalidatePath("/actualites/[id]", "page");
};

export async function creerNews(f: FormData) {
  const v = await valider(f);
  await ecrire("/admin/actualites", v, () => db.news.create({ data: data(v) }));
  publier();
}

export async function modifierNews(f: FormData) {
  const v = await valider(f);
  await ecrire(fiche(f), v, () =>
    db.news.update({ where: { id: Number(f.get("id")) }, data: data(v) }),
  );
  publier();
}

export async function supprimerNews(f: FormData) {
  await ecrire(fiche(f), { data: 0 }, () =>
    db.news.delete({ where: { id: Number(f.get("id")) } }),
  );
  publier();
  redirect("/admin/actualites");
}

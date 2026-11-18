import Link from "next/link";
import { notFound } from "next/navigation";
import { Alerte } from "@/app/_components/Champ";
import { Button } from "@/app/_components/ui/Button";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { modifierNews, supprimerNews } from "../actions";
import { ChampsNews } from "../ChampsNews";

export default async function Actualite({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ erreur?: string }>;
}) {
  await requireRole("ADMIN");
  const [{ id }, { erreur }] = await Promise.all([params, searchParams]);
  const news = await db.news.findUnique({ where: { id: Number(id) || 0 } });
  if (!news) notFound();
  return (
    <main className="mx-auto max-w-2xl p-4 sm:p-6">
      <Link
        href="/admin/actualites"
        className="inline-flex min-h-11 items-center underline"
      >
        Toutes les actualités
      </Link>
      <h1 className="title-sport mb-4 text-xl">{news.title}</h1>
      <Alerte>{erreur}</Alerte>
      <form action={modifierNews} className="mb-4 grid gap-4">
        <input type="hidden" name="id" value={news.id} />
        <ChampsNews news={news} />
        <Button type="submit">Enregistrer</Button>
      </form>
      <form action={supprimerNews}>
        <input type="hidden" name="id" value={news.id} />
        <Button type="submit" variant="secondary">
          Supprimer l&apos;actualité
        </Button>
      </form>
    </main>
  );
}

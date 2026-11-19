import Link from "next/link";
import { Alerte } from "@/app/_components/Champ";
import { Button } from "@/app/_components/ui/Button";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { dateCourte } from "@/lib/public";
import { creerNews } from "./actions";
import { ChampsNews } from "./ChampsNews";

export default async function Actualites({
  searchParams,
}: {
  searchParams: Promise<{ erreur?: string }>;
}) {
  await requireRole("ADMIN");
  const { erreur } = await searchParams;
  const news = await db.news.findMany({ orderBy: { publishedAt: "desc" } });
  return (
    <main className="mx-auto max-w-2xl p-4 sm:p-6">
      <h1 className="title-sport mb-4 text-xl">Actualités</h1>
      <Alerte>{erreur}</Alerte>
      <ul className="mb-8 divide-y divide-border">
        {news.map((n) => (
          <li key={n.id}>
            <Link
              href={`/admin/actualites/${n.id}`}
              className="flex min-h-11 items-center gap-3 py-2 hover:underline"
            >
              <span className="font-semibold">{n.title}</span>
              <span className="ml-auto text-muted">
                {dateCourte(n.publishedAt)}
              </span>
            </Link>
          </li>
        ))}
        {news.length === 0 && (
          <li className="py-2 text-muted">Aucune actualité.</li>
        )}
      </ul>
      <h2 className="title-sport mb-3 text-lg">Nouvelle actualité</h2>
      <form action={creerNews} className="grid gap-4">
        <ChampsNews />
        <Button type="submit">Publier</Button>
      </form>
    </main>
  );
}

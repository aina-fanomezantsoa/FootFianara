import type { Metadata } from "next";
import { EmptyState, NewsCard } from "@/app/_components/public/Blocs";
import { actualites } from "@/lib/public";

export const metadata: Metadata = {
  title: "Actualités",
  description: "Les actualités du championnat de Fianarantsoa.",
};

export default async function Actualites() {
  const news = await actualites();
  return (
    <>
      <h1 className="title-sport text-3xl sm:text-4xl">Actualités</h1>
      {news.length === 0 ? (
        <EmptyState title="Aucune actualité pour l'instant" />
      ) : (
        <div className="space-y-4">
          {news.map((n) => (
            <NewsCard key={n.id} news={n} />
          ))}
        </div>
      )}
    </>
  );
}

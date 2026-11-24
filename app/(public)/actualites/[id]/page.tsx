import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { actualite, dateComplete, imageReduite } from "@/lib/public";

// Une seule requête pour les métadonnées et la page.
const parId = cache((id: string) =>
  /^\d+$/.test(id) ? actualite(Number(id)) : null,
);
const charger = async (params: PageProps<"/actualites/[id]">["params"]) =>
  parId((await params).id);

export async function generateMetadata({
  params,
}: PageProps<"/actualites/[id]">): Promise<Metadata> {
  const n = await charger(params);
  return { title: n ? n.title : "Actualité introuvable" };
}

export default async function ActualitePage({
  params,
}: PageProps<"/actualites/[id]">) {
  const n = await charger(params);
  if (!n) notFound();
  return (
    <>
      <Link
        href="/actualites"
        className="flex min-h-11 items-center text-sm text-muted hover:text-foreground"
      >
        ‹ Actualités
      </Link>
      <article className="space-y-4">
        <h1 className="title-sport text-3xl sm:text-4xl">{n.title}</h1>
        <p className="text-sm text-muted">{dateComplete(n.publishedAt)}</p>
        {n.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element -- image Cloudinary réduite pour la 4G
          <img
            src={imageReduite(n.imageUrl, 800)}
            alt=""
            className="w-full rounded-md border border-border"
          />
        )}
        <p className="whitespace-pre-line">{n.body}</p>
      </article>
    </>
  );
}

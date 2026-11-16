import Link from "next/link";
import { ListeSuspensions } from "@/app/_components/admin/ListeSuspensions";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { getActiveSuspensions } from "@/lib/suspensions";

export default async function Admin({
  searchParams,
}: {
  searchParams: Promise<{ refuse?: string }>;
}) {
  const user = await requireRole("ASSISTANT");
  const { refuse } = await searchParams;
  const saison = await db.season.findFirst({ orderBy: { startDate: "desc" } });
  const suspensions = saison ? await getActiveSuspensions(saison.id) : [];
  return (
    <main className="mx-auto max-w-2xl p-4 sm:p-6">
      <h1 className="title-sport text-xl">Administration</h1>
      <p className="text-muted">
        {user.name} ({user.role})
      </p>
      {refuse && (
        <p role="alert" className="text-red-600">
          Accès refusé pour votre rôle.
        </p>
      )}
      <nav className="mb-6 flex flex-wrap gap-x-4 underline [&>a]:inline-flex [&>a]:min-h-11 [&>a]:items-center">
        <Link href="/admin/matchs">Matchs</Link>
        {user.role !== "ASSISTANT" && (
          <>
            <Link href="/admin/suspensions">Suspensions</Link>
            <Link href="/admin/saisons">Saisons</Link>
            <Link href="/admin/divisions">Divisions</Link>
            <Link href="/admin/stades">Stades</Link>
            <Link href="/admin/clubs">Clubs</Link>
            <Link href="/admin/joueurs">Joueurs</Link>
          </>
        )}
        {user.role === "SUPER_ADMIN" && (
          <Link href="/admin/comptes">Gérer les comptes</Link>
        )}
      </nav>
      <h2 className="title-sport mb-2 text-lg">
        Suspensions en cours{saison && ` · ${saison.name}`}
      </h2>
      <ListeSuspensions suspensions={suspensions} />
    </main>
  );
}

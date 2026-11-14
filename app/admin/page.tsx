import Link from "next/link";
import { requireRole } from "@/lib/auth";

export default async function Admin({
  searchParams,
}: {
  searchParams: Promise<{ refuse?: string }>;
}) {
  const user = await requireRole("ASSISTANT");
  const { refuse } = await searchParams;
  return (
    <main className="p-6">
      <h1 className="text-xl font-bold">Administration</h1>
      <p>
        {user.name} ({user.role})
      </p>
      {user.role === "SUPER_ADMIN" && (
        <a href="/admin/comptes" className="underline">
          Gérer les comptes
        </a>
      )}
      {user.role !== "ASSISTANT" && (
        <nav className="flex flex-wrap gap-x-4 underline [&>a]:inline-flex [&>a]:min-h-11 [&>a]:items-center">
          <Link href="/admin/saisons">Saisons</Link>
          <Link href="/admin/divisions">Divisions</Link>
          <Link href="/admin/stades">Stades</Link>
          <Link href="/admin/clubs">Clubs</Link>
          <Link href="/admin/joueurs">Joueurs</Link>
        </nav>
      )}
      {refuse && (
        <p role="alert" className="text-red-600">
          Accès refusé pour votre rôle.
        </p>
      )}
    </main>
  );
}

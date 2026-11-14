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
        <nav className="flex gap-4 underline">
          <a href="/admin/saisons">Saisons</a>
          <a href="/admin/divisions">Divisions</a>
          <a href="/admin/stades">Stades</a>
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

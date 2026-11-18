import Link from "next/link";
import { ClubCrest } from "@/app/_components/public/ClubCrest";
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
  const liens: [string, string, string][] = [
    ["/admin/matchs", "Matchs", "MAT"],
    ...(user.role === "ASSISTANT"
      ? []
      : ([
          ["/admin/suspensions", "Suspensions", "SUS"],
          ["/admin/saisons", "Saisons", "SAI"],
          ["/admin/divisions", "Divisions", "DIV"],
          ["/admin/stades", "Stades", "STA"],
          ["/admin/clubs", "Clubs", "CLU"],
          ["/admin/joueurs", "Joueurs", "JOU"],
        ] as [string, string, string][])),
    ...(user.role === "SUPER_ADMIN"
      ? ([["/admin/comptes", "Gérer les comptes", "CPT"]] as [
          string,
          string,
          string,
        ][])
      : []),
  ];
  return (
    <main className="mx-auto max-w-5xl p-4 sm:p-6">
      <h1 className="title-sport text-xl">Administration</h1>
      <p className="text-muted">
        {user.name} ({user.role})
      </p>
      {refuse && (
        <p role="alert" className="text-red-600">
          Accès refusé pour votre rôle.
        </p>
      )}
      <ul className="my-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {liens.map(([href, label, sigle]) => (
          <li key={href}>
            <Link
              href={href}
              className="flex h-full flex-col items-center gap-2 rounded-md border border-border bg-surface p-4 text-center font-semibold transition-colors hover:border-foreground"
            >
              <ClubCrest shortName={sigle} logoUrl={null} size={48} />
              {label}
            </Link>
          </li>
        ))}
      </ul>
      <h2 className="title-sport mb-2 text-lg">
        Suspensions en cours{saison && ` · ${saison.name}`}
      </h2>
      <ListeSuspensions suspensions={suspensions} />
    </main>
  );
}

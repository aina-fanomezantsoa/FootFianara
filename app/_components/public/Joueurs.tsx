import Link from "next/link";
import { Badge } from "@/app/_components/ui/Badge";
import { Card } from "@/app/_components/ui/Card";
import { ClubCrest, PhotoJoueur } from "./ClubCrest";

type Club = { name: string; shortName: string; logoUrl: string | null };

/** Ligne cliquable : la liste peut compter des centaines de joueurs. */
export function PlayerCard({
  id,
  firstName,
  lastName,
  photoUrl,
  position,
  shirtNumber,
  club,
  suspended,
}: {
  id: number;
  firstName: string;
  lastName: string;
  photoUrl: string | null;
  position: string | null;
  shirtNumber: number | null;
  club?: Club | null;
  suspended?: boolean;
}) {
  return (
    <Link
      href={`/joueurs/${id}`}
      className="flex min-h-14 items-center gap-3 border-b border-border py-2 transition-colors hover:bg-surface"
    >
      <span className="num w-8 shrink-0 text-center font-display text-xl">{shirtNumber ?? ""}</span>
      <PhotoJoueur photoUrl={photoUrl} firstName={firstName} lastName={lastName} size={40} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-xs text-muted">{firstName}</span>
        <span className="block truncate font-semibold uppercase">{lastName}</span>
      </span>
      {suspended && <Badge inverted>Suspendu</Badge>}
      <span className="flex shrink-0 items-center gap-2 text-xs text-muted">
        <span className="hidden sm:inline">{position}</span>
        {club && <ClubCrest shortName={club.shortName} logoUrl={club.logoUrl} size={20} />}
      </span>
    </Link>
  );
}

export type StatLigne = {
  player: { id: number; firstName: string; lastName: string };
  club: Club | null;
  value: number;
  extra?: string;
};

/** Classement de joueurs (buteurs, passeurs, cartons). Égalités : même rang. */
export function StatList({
  title,
  unit,
  rows,
  emptyText = "Aucune donnée pour l'instant",
}: {
  title: string;
  unit: string;
  rows: StatLigne[];
  emptyText?: string;
}) {
  return (
    <Card className="space-y-2">
      <h2 className="title-sport text-xl">{title}</h2>
      {rows.length === 0 ? (
        <p className="text-sm text-muted">{emptyText}</p>
      ) : (
        <ol>
          {rows.map((r) => {
            const rang =
              rows.findIndex((x) => x.value === r.value && x.extra === r.extra) + 1;
            return (
              <li key={r.player.id} className="flex min-h-11 items-center gap-2 border-b border-border last:border-0">
                <span className="num w-6 shrink-0 text-sm text-muted">{rang}</span>
                <span className="min-w-0 flex-1">
                  <Link href={`/joueurs/${r.player.id}`} className="block truncate text-sm font-semibold hover:underline">
                    {r.player.firstName} {r.player.lastName.toUpperCase()}
                  </Link>
                  {r.club && (
                    <span className="flex items-center gap-1 text-xs text-muted">
                      <ClubCrest shortName={r.club.shortName} logoUrl={r.club.logoUrl} size={20} />
                      {r.club.shortName}
                    </span>
                  )}
                </span>
                {r.extra && <span className="text-xs text-muted">{r.extra}</span>}
                <span className="num font-display text-xl">
                  {r.value}
                  <span className="sr-only"> {unit}</span>
                </span>
              </li>
            );
          })}
        </ol>
      )}
    </Card>
  );
}

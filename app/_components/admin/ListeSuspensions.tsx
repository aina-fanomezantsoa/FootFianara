import Link from "next/link";
import type { ActiveSuspension } from "@/lib/suspensions";
import { Button } from "@/app/_components/ui/Button";
import { nomJoueur } from "./format";

/** T18 : alerte des suspensions en cours ; `purger` seulement pour les suspensions manuelles (BR-31). */
export function ListeSuspensions({
  suspensions,
  purger,
}: {
  suspensions: ActiveSuspension[];
  purger?: (f: FormData) => Promise<void>;
}) {
  if (suspensions.length === 0)
    return <p className="text-muted">Aucune suspension en cours.</p>;
  return (
    <ul className="divide-y divide-border border-y border-border">
      {suspensions.map((s) => (
        <li key={s.id} className="flex flex-wrap items-center gap-x-3 py-2">
          <span className="min-w-0 flex-1">
            <span className="font-semibold">{nomJoueur(s.player)}</span>
            <span className="block text-sm text-muted">
              {s.reason}
              {s.matchId && (
                <>
                  {" · "}
                  <Link
                    href={`/admin/matchs/${s.matchId}`}
                    className="underline"
                  >
                    match
                  </Link>
                </>
              )}
            </span>
          </span>
          <span className="num text-sm">
            {s.matchesServed}/{s.matchesTotal} purgés
          </span>
          {purger && s.matchId == null && (
            <form action={purger}>
              <input type="hidden" name="id" value={s.id} />
              <Button type="submit" variant="secondary">
                Marquer purgée
              </Button>
            </form>
          )}
        </li>
      ))}
    </ul>
  );
}

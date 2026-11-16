"use client";

import { useRef, useState } from "react";
import { forfait } from "@/app/admin/matchs/actions";
import { Button } from "@/app/_components/ui/Button";

/** BR-23 : confirmation native avant de déclarer un forfait (ADMIN, revérifié côté serveur). */
export function ForfaitDialog({
  matchId,
  home,
  away,
}: {
  matchId: number;
  home: string;
  away: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [fautif, setFautif] = useState<"HOME" | "AWAY" | "">("");
  const nom = fautif === "HOME" ? home : away;
  return (
    <>
      <Button
        variant="secondary"
        className="w-full"
        onClick={() => ref.current?.showModal()}
      >
        Déclarer un forfait
      </Button>
      <dialog
        ref={ref}
        aria-labelledby="forfait-titre"
        className="m-auto w-[calc(100%-2rem)] max-w-md rounded-md border border-border bg-surface p-4 text-foreground backdrop:bg-background/80"
      >
        <form
          action={forfait}
          onSubmit={() => ref.current?.close()}
          className="grid gap-3"
        >
          <input type="hidden" name="matchId" value={matchId} />
          <h2 id="forfait-titre" className="title-sport text-lg">
            Quel club est forfait ?
          </h2>
          <div className="grid gap-2">
            {(
              [
                ["HOME", home],
                ["AWAY", away],
              ] as const
            ).map(([v, n]) => (
              <label
                key={v}
                className="flex min-h-11 cursor-pointer items-center gap-2 rounded-sm border border-border px-3 has-checked:border-foreground"
              >
                <input
                  type="radio"
                  name="fautif"
                  value={v}
                  required
                  checked={fautif === v}
                  onChange={() => setFautif(v)}
                />
                {n}
              </label>
            ))}
          </div>
          {fautif && (
            <p className="text-sm">
              {nom} perd 0-3. Les événements saisis seront supprimés.
            </p>
          )}
          <Button type="submit" disabled={!fautif}>
            Confirmer le forfait
          </Button>
          <Button variant="secondary" onClick={() => ref.current?.close()}>
            Annuler
          </Button>
        </form>
      </dialog>
    </>
  );
}

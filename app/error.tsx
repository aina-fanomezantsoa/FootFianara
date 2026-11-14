"use client";

import { useEffect } from "react";
import { Button } from "@/app/_components/ui/Button";

export default function Erreur({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => console.error(error), [error]);
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6">
      <div role="alert" className="space-y-3 rounded-md border border-dashed border-border bg-surface p-4 text-center">
        <p className="font-semibold">Impossible de charger la page</p>
        <p className="text-sm text-muted">Vérifiez la connexion puis réessayez.</p>
        <Button variant="secondary" onClick={() => retry()}>
          Réessayer
        </Button>
      </div>
    </main>
  );
}

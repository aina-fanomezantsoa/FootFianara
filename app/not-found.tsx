import type { Metadata } from "next";
import { EmptyState } from "@/app/_components/public/Blocs";

export const metadata: Metadata = { title: "Page introuvable" };

export default function Introuvable() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6">
      <EmptyState
        title="Page introuvable"
        text="Cette page n'existe pas ou a été supprimée."
        action={{ label: "Accueil", href: "/" }}
      />
    </main>
  );
}

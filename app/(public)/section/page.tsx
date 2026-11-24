import type { Metadata } from "next";
import { EmptyState } from "@/app/_components/public/Blocs";

export const metadata: Metadata = { title: "Section" };

export default function SectionPage() {
  return (
    <>
      <h1 className="title-sport text-3xl sm:text-4xl">
        Section
        <span className="block text-base text-muted">
          Les autres championnats : D2, D3, féminin, jeunes…
        </span>
      </h1>
      <EmptyState title="N'a pas encore commencé" />
    </>
  );
}

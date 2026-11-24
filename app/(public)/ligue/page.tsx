import type { Metadata } from "next";
import Link from "next/link";
import {
  CalendrierVide,
  EmptyState,
  Section,
} from "@/app/_components/public/Blocs";
import { ClubCrest } from "@/app/_components/public/ClubCrest";
import { MatchList } from "@/app/_components/public/MatchCard";
import { ButtonLink } from "@/app/_components/ui/Button";
import {
  clubsDivision,
  contexte,
  derniersResultats,
  prochainsMatchs,
} from "@/lib/public";

export const metadata: Metadata = {
  title: "Ligue",
  description:
    "Première division de Fianarantsoa : prochains matchs, résultats et équipes.",
};

export default async function Ligue() {
  // Sans paramètre, contexte() choisit la première division (D1).
  const { saison, division } = await contexte();
  const titre = <h1 className="title-sport text-3xl sm:text-4xl">Ligue</h1>;
  if (!saison || !division)
    return (
      <>
        {titre}
        <CalendrierVide />
      </>
    );
  const where = { seasonId: saison.id, divisionId: division.id };
  const [prochains, resultats, clubs] = await Promise.all([
    prochainsMatchs(where, 3),
    derniersResultats(where, 3),
    clubsDivision(saison.id, division.id),
  ]);
  return (
    <>
      <h1 className="title-sport text-3xl sm:text-4xl">
        Ligue
        <span className="block text-base text-muted">
          {division.name} · {saison.name}
        </span>
      </h1>
      <Section
        titre="Prochains matchs"
        lien={{
          label: "Calendrier",
          href: `/matchs?division=${division.name}`,
        }}
      >
        {prochains.length ? (
          <MatchList matchs={prochains} />
        ) : (
          <EmptyState title="Aucun match programmé" />
        )}
      </Section>
      <Section
        titre="Derniers résultats"
        lien={{
          label: "Classement",
          href: `/classement?division=${division.name}`,
        }}
      >
        {resultats.length ? (
          <MatchList matchs={resultats} />
        ) : (
          <EmptyState title="Aucun résultat pour l'instant" />
        )}
      </Section>
      <Section titre="Équipes">
        {clubs.length ? (
          <>
            <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {clubs.slice(0, 8).map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/clubs/${c.id}`}
                    className="flex h-full min-h-11 items-center gap-2 rounded-md border border-border bg-surface p-2 transition-colors hover:border-foreground"
                  >
                    <ClubCrest
                      shortName={c.shortName}
                      logoUrl={c.logoUrl}
                      size={32}
                    />
                    <span className="line-clamp-2 text-sm font-semibold">
                      {c.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <ButtonLink
              variant="secondary"
              className="w-full"
              href={`/clubs?division=${division.name}`}
            >
              Voir toutes les équipes
            </ButtonLink>
          </>
        ) : (
          <EmptyState title="Aucun club inscrit dans cette division" />
        )}
      </Section>
    </>
  );
}

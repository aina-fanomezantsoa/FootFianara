import { ButtonLink } from "@/app/_components/ui/Button";
import {
  CalendrierVide,
  DivisionTabs,
  EmptyState,
  NewsCard,
  Section,
} from "@/app/_components/public/Blocs";
import { MatchList } from "@/app/_components/public/MatchCard";
import { StandingsTable } from "@/app/_components/public/StandingsTable";
import {
  actualites,
  contexte,
  derniersResultats,
  prochainsMatchs,
} from "@/lib/public";
import { getStandings } from "@/lib/standings-db";

export default async function Accueil({ searchParams }: PageProps<"/">) {
  const { division: param } = await searchParams;
  const [{ saison, divisions, division }, news] = await Promise.all([
    contexte(String(param ?? "")),
    actualites(3),
  ]);
  const bloc = news.length > 0 && (
    <Section titre="Actualités" lien={{ label: "Toutes", href: "/actualites" }}>
      {news.map((n) => (
        <NewsCard key={n.id} news={n} court />
      ))}
    </Section>
  );
  if (!saison)
    return (
      <>
        <h1 className="title-sport text-3xl sm:text-4xl">
          Championnat de Fianarantsoa
        </h1>
        <CalendrierVide />
        {bloc}
      </>
    );
  const where = { seasonId: saison.id };
  const [prochains, resultats, classement] = await Promise.all([
    prochainsMatchs(where, 4),
    derniersResultats(where, 4),
    division ? getStandings(saison.id, division.id) : [],
  ]);
  return (
    <>
      <h1 className="title-sport text-3xl sm:text-4xl">
        Championnat de Fianarantsoa
        <span className="block text-base text-muted">{saison.name}</span>
      </h1>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Section
            titre="Prochains matchs"
            lien={{ label: "Calendrier", href: "/matchs" }}
          >
            {prochains.length ? (
              <MatchList matchs={prochains} division />
            ) : (
              <EmptyState title="Aucun match programmé" />
            )}
          </Section>
          <Section titre="Derniers résultats">
            {resultats.length ? (
              <MatchList matchs={resultats} division />
            ) : (
              <EmptyState title="Aucun résultat pour l'instant" />
            )}
          </Section>
          {bloc}
        </div>
        <Section titre="Classement">
          <DivisionTabs
            divisions={divisions}
            active={division?.name}
            path="/"
          />
          {classement.length ? (
            <>
              <StandingsTable rows={classement} compact limit={5} />
              <ButtonLink
                variant="secondary"
                className="w-full"
                href={`/classement?division=${division!.name}`}
              >
                Classement complet
              </ButtonLink>
            </>
          ) : (
            <EmptyState title="Aucun club inscrit dans cette division" />
          )}
        </Section>
      </div>
    </>
  );
}

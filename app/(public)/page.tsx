import {
  CalendrierVide,
  EmptyState,
  NewsCard,
  Section,
} from "@/app/_components/public/Blocs";
import { Carrousel } from "@/app/_components/public/Carrousel";
import { MatchList } from "@/app/_components/public/MatchCard";
import {
  actualites,
  derniersResultats,
  prochainsMatchs,
  saisonEnCours,
} from "@/lib/public";

export default async function Accueil() {
  const [saison, news] = await Promise.all([saisonEnCours(), actualites(3)]);
  const where = { seasonId: saison?.id };
  const [prochains, resultats] = saison
    ? await Promise.all([
        prochainsMatchs(where, 3),
        derniersResultats(where, 3),
      ])
    : [[], []];
  return (
    <>
      <section className="space-y-2 border-b border-border pb-6">
        <h1 className="title-sport text-3xl sm:text-4xl">
          Foot Fianara
          {saison && (
            <span className="block text-base text-muted">{saison.name}</span>
          )}
        </h1>
        <p className="max-w-prose text-muted">
          Le championnat de football de Fianarantsoa : résultats, calendrier,
          classements et actualités des clubs.
        </p>
      </section>
      {news.length > 0 && (
        <Section
          titre="Actualités"
          lien={{ label: "Toutes", href: "/actualites" }}
        >
          <Carrousel label="Dernières actualités">
            {news.map((n) => (
              <NewsCard key={n.id} news={n} />
            ))}
          </Carrousel>
        </Section>
      )}
      {!saison ? (
        <CalendrierVide />
      ) : (
        <>
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
        </>
      )}
    </>
  );
}

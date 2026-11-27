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
import Image from "next/image";

const ETIQUETTES = [
  "Football",
  "Fianarantsoa",
  "Matchs",
  "Classement",
  "Clubs",
  "Joueurs",
  "Statistiques",
];

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
      {/* Bord à bord sur mobile ; texte blanc fixe : il est posé sur la photo, quel que soit le thème. */}
      <section className="relative -mx-4 -mt-6 flex h-[32rem] flex-col justify-between overflow-hidden text-white md:mx-0 md:mt-0 md:h-[36rem] md:rounded-t-3xl">
        <Image
          src="/hero.webp"
          alt="Trois joueurs de Zanakala FC en maillot vert et jaune"
          fill
          preload
          sizes="(min-width: 64rem) 62rem, 100vw"
          className="object-cover object-top"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-linear-to-b from-black/70 via-transparent via-45% to-black/60"
        />
        <h1 className="title-sport relative px-4 pt-6 text-center [text-shadow:0_2px_12px_rgb(0_0_0/0.6)]">
          <span className="block text-lg">Championnat</span>
          <span className="block text-6xl md:text-8xl">Football</span>
          <span className="block text-lg">Fianarantsoa</span>
        </h1>
        {/* Décor seulement. Deux moitiés identiques : le décalage de -50 % boucle sans saut. */}
        <div
          aria-hidden
          className="relative overflow-hidden pb-12 [mask-image:linear-gradient(to_right,transparent,black_20%,black_80%,transparent)]"
        >
          <div className="defilement flex w-max">
            {/* 4 copies de la liste : chaque moitié reste plus large que le hero. */}
            {[0, 1, 2, 3].map((copie) => (
              <ul key={copie} className="flex gap-2 pr-2">
                {ETIQUETTES.map((label) => (
                  <li
                    key={label}
                    className="flex h-11 items-center whitespace-nowrap rounded-full bg-black/55 px-5 text-sm font-semibold"
                  >
                    {label}
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>
      </section>
      {/* Feuille arrondie qui chevauche la photo. */}
      <div className="relative !-mt-8 rounded-t-3xl bg-background px-1 pt-5 text-center">
        <p className="title-sport text-xl">{saison?.name ?? "Foot Fianara"}</p>
        <p className="mx-auto max-w-prose text-sm text-muted">
          Résultats, calendrier, classements et actualités des clubs.
        </p>
      </div>
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

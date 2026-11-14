import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { Badge } from "@/app/_components/ui/Badge";
import { Card } from "@/app/_components/ui/Card";
import { EmptyState, Section } from "@/app/_components/public/Blocs";
import { ClubCrest } from "@/app/_components/public/ClubCrest";
import { PlayerCard } from "@/app/_components/public/Joueurs";
import { MatchList } from "@/app/_components/public/MatchCard";
import { StandingsTable } from "@/app/_components/public/StandingsTable";
import { getActiveSuspensions } from "@/lib/suspensions";
import { POSTES } from "@/lib/referentiel";
import { clubDetail, derniersResultats, imageReduite, prochainsMatchs, saisonEnCours } from "@/lib/public";
import { getStandings } from "@/lib/standings-db";

const charger = cache(async (id: string) => {
  const saison = await saisonEnCours();
  const club = /^\d+$/.test(id) ? await clubDetail(Number(id), saison?.id) : null;
  return { saison, club };
});

export async function generateMetadata({ params }: PageProps<"/clubs/[id]">): Promise<Metadata> {
  const { club } = await charger((await params).id);
  return club
    ? { title: club.name, description: `${club.name} : infos, effectif et matchs.` }
    : { title: "Club introuvable" };
}

const PLURIELS: Record<string, string> = {
  Gardien: "Gardiens",
  Défenseur: "Défenseurs",
  Milieu: "Milieux",
  Attaquant: "Attaquants",
};

export default async function ClubPage({ params }: PageProps<"/clubs/[id]">) {
  const { saison, club } = await charger((await params).id);
  if (!club) notFound();
  const cs = club.seasons[0];
  const surMatch = cs && { OR: [{ homeClubSeasonId: cs.id }, { awayClubSeasonId: cs.id }] };
  const [classement, resultats, prochains, suspensions] = await Promise.all([
    cs && saison ? getStandings(saison.id, cs.division.id) : [],
    surMatch ? derniersResultats(surMatch, 3) : [],
    surMatch ? prochainsMatchs(surMatch, 3) : [],
    saison ? getActiveSuspensions(saison.id) : [],
  ]);
  const ligne = classement.filter((r) => r.clubId === club.id);
  const suspendus = new Set(suspensions.map((s) => s.player.id));
  const effectif = cs?.squad ?? [];
  const groupes = [...POSTES, null].map((p) => ({
    titre: p ? PLURIELS[p] : "Autres",
    joueurs: effectif.filter((s) => (p ? s.player.position === p : !POSTES.includes(s.player.position ?? ""))),
  }));
  const infos = [
    ["Président", club.president],
    ["Entraîneur", club.coach],
    ["Couleurs", club.colors],
  ] as const;
  const sousTitre = [club.foundedYear && `Fondé en ${club.foundedYear}`, club.district && `Quartier ${club.district}`]
    .filter(Boolean)
    .join(" · ");
  return (
    <>
      <div className="flex items-center gap-4">
        <ClubCrest shortName={club.shortName} logoUrl={club.logoUrl} size={96} />
        <div className="min-w-0 space-y-1">
          <h1 className="title-sport text-3xl break-words sm:text-4xl">{club.name}</h1>
          {cs && <Badge>{cs.division.name}</Badge>}
          {sousTitre && <p className="text-sm text-muted">{sousTitre}</p>}
        </div>
      </div>
      {club.teamPhotoUrl && (
        // eslint-disable-next-line @next/next/no-img-element -- Cloudinary redimensionne déjà
        <img
          src={imageReduite(club.teamPhotoUrl, 800)}
          alt={`Équipe de ${club.name}`}
          loading="lazy"
          className="aspect-[16/9] w-full rounded-md object-cover"
        />
      )}
      {(infos.some(([, v]) => v) || club.phone || club.facebookUrl) && (
        <Card>
          <h2 className="title-sport mb-3 text-xl">Infos</h2>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            {infos.map(
              ([k, v]) =>
                v && (
                  <div key={k}>
                    <dt className="text-xs text-muted">{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ),
            )}
            {club.phone && (
              <div>
                <dt className="text-xs text-muted">Téléphone</dt>
                <dd>
                  <a href={`tel:${club.phone.replace(/\s/g, "")}`} className="inline-flex min-h-11 items-center underline">
                    {club.phone}
                  </a>
                </dd>
              </div>
            )}
            {club.facebookUrl && (
              <div>
                <dt className="text-xs text-muted">Facebook</dt>
                <dd>
                  <a href={club.facebookUrl} rel="noopener" target="_blank" className="inline-flex min-h-11 items-center underline">
                    Page Facebook
                  </a>
                </dd>
              </div>
            )}
          </dl>
        </Card>
      )}
      {ligne.length > 0 && (
        <Section titre="Saison" lien={{ label: "Classement", href: `/classement?division=${cs!.division.name}` }}>
          <StandingsTable rows={ligne} />
        </Section>
      )}
      {cs && (
        <>
          <Section titre="Derniers résultats">
            {resultats.length ? <MatchList matchs={resultats} /> : <EmptyState title="Aucun résultat pour l'instant" />}
          </Section>
          <Section titre="Prochains matchs">
            {prochains.length ? <MatchList matchs={prochains} /> : <EmptyState title="Aucun match programmé" />}
          </Section>
        </>
      )}
      <Section titre="Effectif">
        {effectif.length === 0 ? (
          <EmptyState title="Effectif non renseigné" />
        ) : (
          <>
            <p className="text-sm text-muted">{effectif.length} joueur{effectif.length > 1 ? "s" : ""}</p>
            {groupes.map(
              (g) =>
                g.joueurs.length > 0 && (
                  <div key={g.titre}>
                    <h3 className="text-xs uppercase text-muted">{g.titre}</h3>
                    <ul>
                      {g.joueurs.map((s) => (
                        <li key={s.player.id}>
                          <PlayerCard {...s.player} shirtNumber={s.shirtNumber} suspended={suspendus.has(s.player.id)} />
                        </li>
                      ))}
                    </ul>
                  </div>
                ),
            )}
          </>
        )}
      </Section>
    </>
  );
}

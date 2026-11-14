import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { Card } from "@/app/_components/ui/Card";
import { Section } from "@/app/_components/public/Blocs";
import { ClubCrest, PhotoJoueur } from "@/app/_components/public/ClubCrest";
import { derniersClubs } from "@/lib/joueurs";
import { age, dateComplete, joueurDetail, saisonEnCours, statsJoueur } from "@/lib/public";
import { getActiveSuspensions } from "@/lib/suspensions";

const charger = cache(async (id: string) => {
  const saison = await saisonEnCours();
  const joueur = /^\d+$/.test(id) ? await joueurDetail(Number(id), saison?.id) : null;
  return { saison, joueur };
});

export async function generateMetadata({ params }: PageProps<"/joueurs/[id]">): Promise<Metadata> {
  const { joueur: j } = await charger((await params).id);
  return j
    ? { title: `${j.firstName} ${j.lastName}`, description: `Fiche de ${j.firstName} ${j.lastName} : statistiques et parcours.` }
    : { title: "Joueur introuvable" };
}

export default async function JoueurPage({ params }: PageProps<"/joueurs/[id]">) {
  const { saison, joueur: j } = await charger((await params).id);
  if (!j) notFound();
  const [stats, parcours, suspensions] = await Promise.all([
    saison ? statsJoueur(j.id, saison.id) : null,
    derniersClubs(j.id),
    saison ? getActiveSuspensions(saison.id, j.id) : [],
  ]);
  const actuel = j.squads[0];
  const club = actuel?.clubSeason.club;
  const profil = [
    j.birthDate && {
      k: "Âge",
      v: `${age(j.birthDate, new Date())} ans`,
      d: dateComplete(j.birthDate).replace(/^\S+ /, ""),
    },
    j.heightCm && { k: "Taille", v: `${(j.heightCm / 100).toFixed(2).replace(".", ",")} m` },
    j.strongFoot && { k: "Pied fort", v: j.strongFoot },
    j.nationality && { k: "Nationalité", v: j.nationality },
  ].filter((x) => !!x);
  return (
    <>
      <Card className="flex items-center gap-4">
        <span className="num hidden w-16 shrink-0 text-center font-display text-6xl text-muted sm:block">
          {actuel?.shirtNumber}
        </span>
        <PhotoJoueur photoUrl={j.photoUrl} firstName={j.firstName} lastName={j.lastName} size={96} />
        <div className="min-w-0 space-y-1">
          <p className="text-muted">
            {actuel && <span className="num font-display sm:hidden">{actuel.shirtNumber} · </span>}
            {j.firstName}
          </p>
          <h1 className="title-sport text-3xl break-words sm:text-4xl">{j.lastName}</h1>
          <p className="flex flex-wrap items-center gap-2 text-sm text-muted">
            {j.position}
            {club && (
              <Link href={`/clubs/${club.id}`} className="flex min-h-11 items-center gap-2 text-foreground hover:underline">
                <ClubCrest shortName={club.shortName} logoUrl={club.logoUrl} size={20} />
                {club.name}
              </Link>
            )}
          </p>
        </div>
      </Card>
      {suspensions.map((s) => {
        const reste = s.matchesTotal - s.matchesServed;
        return (
          <Card key={s.id} className="border-foreground">
            <p className="font-semibold">
              Suspendu · {reste} match{reste > 1 ? "s" : ""} restant{reste > 1 ? "s" : ""} sur {s.matchesTotal}
            </p>
            <p className="text-sm text-muted">{s.reason}</p>
          </Card>
        );
      })}
      {profil.length > 0 && (
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {profil.map((p) => (
            <div key={p.k}>
              <dt className="text-xs uppercase text-muted">{p.k}</dt>
              <dd className="font-semibold">{p.v}</dd>
              {"d" in p && <dd className="text-xs text-muted">{p.d}</dd>}
            </div>
          ))}
        </dl>
      )}
      {stats && (
        <Section titre="Saison">
          <dl className="grid grid-cols-4 gap-2 text-center">
            {[
              ["Matchs", stats.matchs],
              ["Buts", stats.buts],
              ["Passes", stats.passes],
              ["Cartons", `${stats.jaunes} / ${stats.rouges}`],
            ].map(([k, v]) => (
              // dt avant dd dans le HTML, valeur affichée au-dessus.
              <Card key={k} className="flex flex-col-reverse px-1">
                <dt className="text-xs uppercase text-muted">{k}</dt>
                <dd className="num font-display text-3xl">{v}</dd>
              </Card>
            ))}
          </dl>
          <p className="text-xs text-muted">Cartons : jaunes / rouges</p>
        </Section>
      )}
      {parcours.length > 0 && (
        <Section titre="Parcours">
          <ul>
            {parcours.map((p) => (
              <li key={p.club.id}>
                <Link href={`/clubs/${p.club.id}`} className="flex min-h-14 items-center gap-3 border-b border-border hover:bg-surface">
                  <ClubCrest shortName={p.club.shortName} logoUrl={p.club.logoUrl} />
                  <span>
                    <span className="block font-semibold">{p.club.name}</span>
                    <span className="block text-xs text-muted">
                      {p.season.name} · n° {p.shirtNumber}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      )}
    </>
  );
}

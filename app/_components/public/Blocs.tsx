import Link from "next/link";
import { ButtonLink } from "@/app/_components/ui/Button";
import { Card } from "@/app/_components/ui/Card";

/** Onglets en simples liens (page serveur partageable). Sert aux divisions et à « Joueurs | Statistiques ». */
export function Tabs({
  items,
  active,
  ariaLabel,
}: {
  items: { label: string; href: string }[];
  active?: string;
  ariaLabel: string;
}) {
  if (items.length < 2) return null;
  return (
    <nav aria-label={ariaLabel}>
      <ul className="grid auto-cols-fr grid-flow-col overflow-hidden rounded-sm border border-border">
        {items.map((t) => (
          <li key={t.href}>
            <Link
              href={t.href}
              aria-current={t.label === active ? "page" : undefined}
              className={`flex min-h-11 items-center justify-center font-display uppercase transition-colors ${t.label === active ? "bg-foreground text-background" : "text-muted hover:text-foreground"}`}
            >
              {t.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** Onglets de division : conserve le chemin, remplace ?division=. */
export const DivisionTabs = ({
  divisions,
  active,
  path,
}: {
  divisions: { name: string }[];
  active?: string;
  path: string;
}) => (
  <Tabs
    ariaLabel="Divisions"
    active={active}
    items={divisions.map((d) => ({
      label: d.name,
      href: `${path}?division=${d.name}`,
    }))}
  />
);

export const JoueursTabs = ({
  active,
}: {
  active: "Joueurs" | "Statistiques";
}) => (
  <Tabs
    ariaLabel="Joueurs et statistiques"
    active={active}
    items={[
      { label: "Joueurs", href: "/joueurs" },
      { label: "Statistiques", href: "/statistiques" },
    ]}
  />
);

export function EmptyState({
  title,
  text,
  action,
}: {
  title: string;
  text?: string;
  action?: { label: string; href: string };
}) {
  return (
    <Card className="space-y-2 border-dashed text-center">
      <p className="font-semibold">{title}</p>
      {text && <p className="text-sm text-muted">{text}</p>}
      {action && (
        <ButtonLink variant="secondary" href={action.href}>
          {action.label}
        </ButtonLink>
      )}
    </Card>
  );
}

export const CalendrierVide = () => (
  <EmptyState
    title="Le calendrier n'est pas encore publié"
    text="Les matchs apparaîtront ici dès que l'organisation les aura programmés."
  />
);

/** Titre de section avec lien optionnel à droite. */
export function Section({
  titre,
  lien,
  children,
}: {
  titre: string;
  lien?: { label: string; href: string };
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="title-sport text-xl">{titre}</h2>
        {lien && (
          <Link
            href={lien.href}
            className="flex min-h-11 items-center text-sm text-muted hover:text-foreground"
          >
            {lien.label}
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

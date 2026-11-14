import type { MatchStatus } from "@/generated/prisma/client";

export const STATUTS: Record<MatchStatus, string> = {
  SCHEDULED: "Programmé",
  PLAYED: "Joué",
  POSTPONED: "Reporté",
  FORFEIT: "Forfait",
};

// Heure de Madagascar quel que soit le fuseau du serveur (Vercel en UTC).
const fmt = new Intl.DateTimeFormat("fr-FR", {
  timeZone: "Indian/Antananarivo",
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});
export const dateHeure = (d: Date | null) =>
  d ? fmt.format(d) : "Date à fixer";

/** Valeur d'un input datetime-local en heure de Madagascar (UTC+3, sans heure d'été). */
export const versChamp = (d: Date | null) =>
  d ? new Date(+d + 3 * 3600_000).toISOString().slice(0, 16) : "";

export const nomJoueur = (p: { firstName: string; lastName: string }) =>
  `${p.lastName} ${p.firstName}`;

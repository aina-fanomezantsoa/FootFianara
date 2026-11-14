// Validation des formulaires saisons / divisions / stades. Renvoie { erreur } ou { data }.
export type Valid<T> = { erreur: string } | { data: T };

const txt = (v: FormDataEntryValue | null) => String(v ?? "").trim();

export function parseSaison(
  f: FormData,
): Valid<{ name: string; startDate: Date; endDate: Date }> {
  const name = txt(f.get("name"));
  const startDate = new Date(txt(f.get("startDate")));
  const endDate = new Date(txt(f.get("endDate")));
  if (!name) return { erreur: "Nom requis." };
  if (isNaN(+startDate) || isNaN(+endDate))
    return { erreur: "Dates invalides." };
  if (endDate <= startDate) return { erreur: "La fin doit suivre le début." };
  return { data: { name, startDate, endDate } };
}

// BR-01 : trois divisions (niveaux 1 à 3).
export function parseDivision(
  f: FormData,
): Valid<{ name: string; level: number }> {
  const name = txt(f.get("name"));
  const level = Number(txt(f.get("level")));
  if (!name) return { erreur: "Nom requis." };
  if (![1, 2, 3].includes(level)) return { erreur: "Niveau : 1, 2 ou 3." };
  return { data: { name, level } };
}

export function parseStade(
  f: FormData,
): Valid<{ name: string; city: string | null }> {
  const name = txt(f.get("name"));
  if (!name) return { erreur: "Nom requis." };
  return { data: { name, city: txt(f.get("city")) || null } };
}

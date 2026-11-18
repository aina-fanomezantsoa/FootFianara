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

export function parseNews(f: FormData): Valid<{ title: string; body: string }> {
  const title = txt(f.get("title"));
  const body = txt(f.get("body"));
  if (!title || !body) return { erreur: "Titre et texte requis." };
  if (title.length > 140) return { erreur: "Titre : 140 caractères maximum." };
  return { data: { title, body } };
}

// --- Clubs et joueurs (T09, T10) ---

const opt = (v: FormDataEntryValue | null) => txt(v) || null;

// Entier facultatif : null si vide, undefined si hors bornes.
function entier(v: FormDataEntryValue | null, min: number, max: number) {
  const s = txt(v);
  if (!s) return null;
  const n = Number(s);
  return Number.isInteger(n) && n >= min && n <= max ? n : undefined;
}

export type ClubData = {
  name: string;
  shortName: string;
  colors: string | null;
  foundedYear: number | null;
  district: string | null;
  president: string | null;
  coach: string | null;
  phone: string | null;
  facebookUrl: string | null;
};

// BR-43 : téléphone et Facebook facultatifs.
export function parseClub(f: FormData): Valid<ClubData> {
  const name = txt(f.get("name"));
  const shortName = txt(f.get("shortName"));
  if (!name || !shortName) return { erreur: "Nom et nom court requis." };
  const foundedYear = entier(
    f.get("foundedYear"),
    1850,
    new Date().getFullYear(),
  );
  if (foundedYear === undefined)
    return { erreur: "Année de fondation invalide." };
  const phone = opt(f.get("phone"));
  if (phone && !/^[+\d][\d\s().-]{5,19}$/.test(phone))
    return { erreur: "Téléphone invalide." };
  const facebookUrl = opt(f.get("facebookUrl"));
  // Lien affiché en href sur le site public : https uniquement.
  if (facebookUrl && !/^https:\/\/\S+$/.test(facebookUrl))
    return { erreur: "Lien Facebook : adresse https:// attendue." };
  return {
    data: {
      name,
      shortName,
      colors: opt(f.get("colors")),
      foundedYear,
      district: opt(f.get("district")),
      president: opt(f.get("president")),
      coach: opt(f.get("coach")),
      phone,
      facebookUrl,
    },
  };
}

export const POSTES = ["Gardien", "Défenseur", "Milieu", "Attaquant"];
export const PIEDS = ["Droit", "Gauche", "Les deux"];

export type JoueurData = {
  firstName: string;
  lastName: string;
  position: string | null;
  birthDate: Date | null;
  heightCm: number | null;
  strongFoot: string | null;
  nationality: string | null;
};

export function parseJoueur(f: FormData): Valid<JoueurData> {
  const firstName = txt(f.get("firstName"));
  const lastName = txt(f.get("lastName"));
  if (!firstName || !lastName) return { erreur: "Prénom et nom requis." };
  const position = opt(f.get("position"));
  if (position && !POSTES.includes(position))
    return { erreur: "Poste invalide." };
  const strongFoot = opt(f.get("strongFoot"));
  if (strongFoot && !PIEDS.includes(strongFoot))
    return { erreur: "Pied fort invalide." };
  const heightCm = entier(f.get("heightCm"), 120, 230);
  if (heightCm === undefined) return { erreur: "Taille : 120 à 230 cm." };
  const b = txt(f.get("birthDate"));
  const birthDate = b ? new Date(b) : null;
  if (birthDate && (isNaN(+birthDate) || birthDate > new Date()))
    return { erreur: "Date de naissance invalide." };
  return {
    data: {
      firstName,
      lastName,
      position,
      birthDate,
      heightCm,
      strongFoot,
      nationality: opt(f.get("nationality")),
    },
  };
}

// Identifiants entiers requis (listes déroulantes des formulaires).
export function parseIds<K extends string>(
  f: FormData,
  ...cles: K[]
): Valid<Record<K, number>> {
  const data = {} as Record<K, number>;
  for (const k of cles) {
    const n = entier(f.get(k), 1, 2 ** 31 - 1);
    if (!n) return { erreur: "Sélection incomplète." };
    data[k] = n;
  }
  return { data };
}

// BR-03 et BR-42 : effectif plafonné, numéro unique par club et saison.
export function verifierInscription(
  effectif: { playerId: number; shirtNumber: number }[],
  playerId: number,
  shirtNumber: number,
  max: number,
): string | null {
  if (!Number.isInteger(shirtNumber) || shirtNumber < 1 || shirtNumber > 99)
    return "Numéro : 1 à 99.";
  if (effectif.some((s) => s.playerId === playerId))
    return "Joueur déjà inscrit dans ce club pour cette saison.";
  if (effectif.some((s) => s.shirtNumber === shirtNumber))
    return `Numéro ${shirtNumber} déjà porté dans ce club cette saison.`;
  if (effectif.length >= max)
    return `Effectif complet (${max} joueurs maximum).`;
  return null;
}

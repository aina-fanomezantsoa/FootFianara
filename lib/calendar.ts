export type Fixture = { matchday: number; home: number; away: number };

/** Calendrier aller-retour (méthode du cercle). `clubs` = identifiants, nombre pair >= 2. */
export function generateCalendar(clubs: number[]): Fixture[] {
  const n = clubs.length;
  if (n < 2 || n % 2 !== 0)
    throw new Error("Nombre de clubs pair requis (>= 2)");
  if (new Set(clubs).size !== n) throw new Error("Clubs en double");

  const rest = clubs.slice(1);
  const first: Fixture[] = [];
  for (let r = 0; r < n - 1; r++) {
    const ring = [clubs[0], ...rest.slice(r), ...rest.slice(0, r)];
    for (let i = 0; i < n / 2; i++) {
      const a = ring[i];
      const b = ring[n - 1 - i];
      // alterner le domicile pour équilibrer
      const flip = i === 0 ? r % 2 === 1 : i % 2 === 1;
      first.push({ matchday: r + 1, home: flip ? b : a, away: flip ? a : b });
    }
  }
  const back = first.map((f) => ({
    matchday: f.matchday + n - 1,
    home: f.away,
    away: f.home,
  }));
  return [...first, ...back];
}

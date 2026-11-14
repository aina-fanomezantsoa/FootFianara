// Fonction pure (BR-11, BR-12, BR-23) : aucun accès base de données.
export type StandingMatch = {
  homeId: string;
  awayId: string;
  homeGoals: number;
  awayGoals: number;
  status: "PLAYED" | "FORFEIT" | "SCHEDULED" | "POSTPONED";
  /** Pour FORFEIT : côté fautif ; le score est forcé à 0-3 pour lui. */
  forfeitBy?: "home" | "away";
};

export type StandingRow = {
  clubId: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  points: number;
  rank: number;
  /** Égalité parfaite après confrontation directe : l'admin décide (BR-12). */
  needsAdminDecision: boolean;
};

type Stats = Omit<StandingRow, "rank" | "needsAdminDecision">;

const blank = (clubId: string): Stats => ({
  clubId,
  played: 0,
  won: 0,
  drawn: 0,
  lost: 0,
  goalsFor: 0,
  goalsAgainst: 0,
  goalDiff: 0,
  points: 0,
});

function effectiveScore(m: StandingMatch): [number, number] | null {
  if (m.status === "PLAYED") return [m.homeGoals, m.awayGoals];
  if (m.status === "FORFEIT")
    return m.forfeitBy === "away" ? [3, 0] : m.forfeitBy === "home" ? [0, 3] : null;
  return null;
}

function compute(clubIds: string[], matches: StandingMatch[]): Map<string, Stats> {
  const t = new Map(clubIds.map((id) => [id, blank(id)]));
  for (const m of matches) {
    const s = effectiveScore(m);
    const h = t.get(m.homeId);
    const a = t.get(m.awayId);
    if (!s || !h || !a) continue;
    for (const [x, gf, ga] of [
      [h, s[0], s[1]],
      [a, s[1], s[0]],
    ] as const) {
      x.played++;
      x.goalsFor += gf;
      x.goalsAgainst += ga;
      x.goalDiff += gf - ga;
      if (gf > ga) {
        x.won++;
        x.points += 3;
      } else if (gf === ga) {
        x.drawn++;
        x.points += 1;
      } else x.lost++;
    }
  }
  return t;
}

const byMain = (a: Stats, b: Stats) =>
  b.points - a.points || b.goalDiff - a.goalDiff || b.goalsFor - a.goalsFor;

export function computeStandings(clubIds: string[], matches: StandingMatch[]): StandingRow[] {
  const all = [...compute(clubIds, matches).values()].sort(
    (a, b) => byMain(a, b) || a.clubId.localeCompare(b.clubId),
  );
  const out: StandingRow[] = [];
  for (let i = 0; i < all.length; ) {
    let j = i + 1;
    while (j < all.length && byMain(all[i], all[j]) === 0) j++;
    const group = all.slice(i, j);
    let ordered = group;
    const ties = new Set<string>();
    if (group.length > 1) {
      // Confrontation directe : mini-classement entre les clubs à égalité seulement.
      const ids = group.map((g) => g.clubId);
      const h2h = compute(
        ids,
        matches.filter((m) => ids.includes(m.homeId) && ids.includes(m.awayId)),
      );
      const cmp = (a: Stats, b: Stats) => byMain(h2h.get(a.clubId)!, h2h.get(b.clubId)!);
      ordered = [...group].sort((a, b) => cmp(a, b) || a.clubId.localeCompare(b.clubId));
      ordered.forEach((g, k) => {
        if (
          (ordered[k + 1] && cmp(g, ordered[k + 1]) === 0) ||
          (ordered[k - 1] && cmp(ordered[k - 1], g) === 0)
        )
          ties.add(g.clubId);
      });
    }
    // shortcut: ex aequo départagés provisoirement par id, l'admin tranche via needsAdminDecision.
    ordered.forEach((g, k) =>
      out.push({ ...g, rank: i + k + 1, needsAdminDecision: ties.has(g.clubId) }),
    );
    i = j;
  }
  return out;
}

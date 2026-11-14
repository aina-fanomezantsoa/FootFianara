// E2E sur la base de dev, données préfixées « QA TEMP », nettoyées en fin de script (même en cas d'échec).
// Usage : E2E_URL=http://localhost:3000 npx tsx scripts/qa/e2e.ts   (sans E2E_URL : pas de vérification HTTP)
import { cleanup, MARQUE } from "./cleanup";

const echecs: string[] = [];
const ok = (cond: boolean, msg: string) => {
  console.log(`${cond ? "OK   " : "ECHEC"} ${msg}`);
  if (!cond) echecs.push(msg);
};

async function main() {
  const { db } = await import("../../lib/db");
  const { generateCalendar } = await import("../../lib/calendar");
  const { validateResult } = await import("../../lib/match-result");
  const { syncSuspensions, getActiveSuspensions } = await import("../../lib/suspensions");
  const { getStandings } = await import("../../lib/standings-db");
  const { getTopScorers } = await import("../../lib/stats");
  const { saisonEnCours } = await import("../../lib/public");

  const nom = `${MARQUE} ${new Date().toISOString().slice(0, 10)}`;
  const division = await db.division.findFirstOrThrow({ orderBy: { level: "asc" } });
  const now = Date.now();
  const season = await db.season.create({
    data: { name: nom, startDate: new Date(now - 60_000), endDate: new Date(now + 365 * 864e5) },
  });
  const actuelle = await saisonEnCours();
  ok(actuelle?.id === season.id, `saisonEnCours = saison QA (obtenue : ${actuelle?.name})`);

  // 4 clubs x 3 joueurs
  const L = ["A", "B", "C", "D"];
  const cs: number[] = [];
  const pl: Record<string, number[]> = {};
  for (const l of L) {
    const club = await db.club.create({ data: { name: `${MARQUE} Club ${l}`, shortName: `Q${l}` } });
    const c = await db.clubSeason.create({ data: { seasonId: season.id, divisionId: division.id, clubId: club.id } });
    cs.push(c.id);
    pl[l] = [];
    for (let i = 1; i <= 3; i++) {
      const p = await db.player.create({ data: { firstName: `Joueur${l}${i}`, lastName: `${MARQUE} ${l}${i}` } });
      await db.squad.create({ data: { clubSeasonId: c.id, playerId: p.id, shirtNumber: i } });
      pl[l].push(p.id);
    }
  }

  const fixtures = generateCalendar(cs);
  ok(fixtures.length === 12, "calendrier 4 clubs = 12 matchs");
  await db.match.createMany({
    data: fixtures.map((f) => ({
      seasonId: season.id, divisionId: division.id, matchday: f.matchday,
      homeClubSeasonId: f.home, awayClubSeasonId: f.away,
      kickoffAt: new Date(now + f.matchday * 864e5),
    })),
  });
  const matchs = await db.match.findMany({ where: { seasonId: season.id }, orderBy: { id: "asc" } });
  const lettre = (id: number) => L[cs.indexOf(id)];

  type Ev = { type: "GOAL" | "OWN_GOAL" | "YELLOW" | "RED"; minute: number; playerId: number; assistPlayerId?: number };
  const jouer = async (m: (typeof matchs)[number], hg: number, ag: number, events: Ev[]) => {
    const squad = async (id: number) => (await db.squad.findMany({ where: { clubSeasonId: id } })).map((s) => s.playerId);
    const v = validateResult(
      { homeGoals: hg, awayGoals: ag, events },
      { homePlayerIds: await squad(m.homeClubSeasonId), awayPlayerIds: await squad(m.awayClubSeasonId) },
    );
    if ("erreur" in v) throw new Error(v.erreur);
    await db.matchEvent.createMany({ data: events.map((e) => ({ matchId: m.id, ...e })) });
    await db.match.update({ where: { id: m.id }, data: { homeGoals: hg, awayGoals: ag, status: "PLAYED" } });
  };

  const [m1, m2] = matchs.filter((m) => m.matchday === 1);
  const h1 = lettre(m1.homeClubSeasonId), a1 = lettre(m1.awayClubSeasonId);
  const h2 = lettre(m2.homeClubSeasonId), a2 = lettre(m2.awayClubSeasonId);
  // Match 1 : domicile 2-1, rouge pour a1[1], jaune pour a1[2].
  await jouer(m1, 2, 1, [
    { type: "GOAL", minute: 10, playerId: pl[h1][0], assistPlayerId: pl[h1][1] },
    { type: "GOAL", minute: 55, playerId: pl[h1][0] },
    { type: "GOAL", minute: 70, playerId: pl[a1][0] },
    { type: "YELLOW", minute: 30, playerId: pl[a1][2] },
    { type: "RED", minute: 80, playerId: pl[a1][1] },
  ]);
  // Match 2 : 1-1 avec un csc du domicile.
  await jouer(m2, 1, 1, [
    { type: "OWN_GOAL", minute: 20, playerId: pl[h2][0] },
    { type: "GOAL", minute: 60, playerId: pl[h2][1] },
  ]);
  // Forfait en journée 2 : le club du joueur expulsé (a1) est fautif, comme declareForfeit (0-3).
  const csA1 = cs[L.indexOf(a1)];
  const f = matchs.find((m) => m.matchday === 2 && (m.homeClubSeasonId === csA1 || m.awayClubSeasonId === csA1))!;
  const fautifDom = f.homeClubSeasonId === csA1;
  await db.match.update({
    where: { id: f.id },
    data: { homeGoals: fautifDom ? 0 : 3, awayGoals: fautifDom ? 3 : 0, status: "FORFEIT" },
  });
  await syncSuspensions(season.id);

  const pts: Record<string, number> = { A: 0, B: 0, C: 0, D: 0 };
  pts[h1] += 3;
  pts[h2] += 1;
  pts[a2] += 1;
  pts[lettre(fautifDom ? f.awayClubSeasonId : f.homeClubSeasonId)] += 3;
  const st = await getStandings(season.id, division.id);
  ok(st.length === 4, "classement : 4 clubs");
  for (const r of st) {
    const l = r.name.slice(-1);
    ok(r.points === pts[l], `points ${r.name} = ${pts[l]} (obtenu ${r.points})`);
  }
  ok(st.every((r, i) => i === 0 || st[i - 1].points >= r.points), "classement trié par points");
  const rf = st.find((r) => r.name.endsWith(` ${a1}`))!;
  ok(rf.played === 2 && rf.lost === 2 && rf.goalsFor === 1 && rf.goalsAgainst === 5,
    `fautif ${a1} : J2 D2 BP1 BC5 (obtenu ${rf.played}/${rf.lost}/${rf.goalsFor}/${rf.goalsAgainst})`);

  const buteurs = await getTopScorers({ seasonId: season.id, divisionId: division.id, limit: 5 });
  ok(buteurs[0]?.playerId === pl[h1][0] && buteurs[0].goals === 2, "meilleur buteur = joueur à 2 buts");
  ok(!buteurs.some((b) => b.playerId === pl[h2][0]), "le csc ne compte pas pour son auteur");

  const susp = (await getActiveSuspensions(season.id)).filter((s) => s.player.lastName.startsWith(MARQUE));
  ok(susp.length === 1 && susp[0].player.id === pl[a1][1] && susp[0].matchesTotal === 2 && susp[0].matchesServed === 1,
    `suspension rouge : 2 matchs, 1 purgé via forfait (obtenu ${JSON.stringify(susp.map((s) => [s.player.id, s.matchesTotal, s.matchesServed]))})`);

  const base = process.env.E2E_URL;
  if (!base) return console.log("E2E_URL absent : vérifications HTTP ignorées");
  const get = async (path: string, attendu: string[]) => {
    const r = await fetch(base + path);
    const t = await r.text();
    ok(r.status === 200, `GET ${path} -> ${r.status}`);
    for (const a of attendu) ok(t.includes(a), `  ${path} contient « ${a} »`);
    return t;
  };
  const d = encodeURIComponent(division.name);
  const clubH1 = await db.club.findFirstOrThrow({ where: { name: `${MARQUE} Club ${h1}` } });
  const C = (l: string) => `${MARQUE} Club ${l}`;
  const home = await get(`/?division=${d}`, [nom, C("A")]);
  ok(/Q[A-D]/.test(home), "  accueil : noms courts du classement");
  await get(`/classement?division=${d}`, [C("A"), C("B"), C("C"), C("D")]);
  await get(`/matchs?division=${d}`, [C(h1), C(a1)]);
  // Le score est rendu dans des balises séparées : on vérifie les noms et les buteurs.
  await get(`/matchs/${m1.id}`, [C(h1), C(a1), `${MARQUE} ${h1}1`.toUpperCase()]);
  await get(`/clubs/${clubH1.id}`, [C(h1), `Joueur${h1}1`]);
  await get(`/joueurs/${pl[h1][0]}`, [`Joueur${h1}1`]);
  await get(`/statistiques?division=${d}`, [`Joueur${h1}1`]);
  const html = await (await fetch(`${base}/matchs/${m1.id}`)).text();
  const texte = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
  ok(/\b2 [-–:]? ?1\b/.test(texte) || /\b2\s+1\b/.test(texte), "  /matchs/<id> : score 2 et 1 présents côte à côte");
  console.log(`Taille HTML accueil (dev) : ${(await (await fetch(base + "/")).arrayBuffer()).byteLength} octets`);
}

(async () => {
  try {
    await cleanup(); // reste éventuel d'un run précédent
    await main();
  } catch (e) {
    console.error("ERREUR", e);
    echecs.push(String(e));
  } finally {
    const reste = await cleanup();
    console.log("Reste après nettoyage :", reste);
    if (Object.values(reste).some(Boolean)) echecs.push("nettoyage incomplet");
    console.log(echecs.length ? `\n${echecs.length} ÉCHEC(S)` : "\nTout est OK");
    process.exit(echecs.length ? 1 : 0);
  }
})();

"use client";

import { useActionState, useState } from "react";
import { enregistrerResultat } from "@/app/admin/matchs/actions";
import { Button } from "@/app/_components/ui/Button";
import type { ActionResult } from "@/lib/match-result";
import type { EventType } from "@/generated/prisma/client";

export type Joueur = { id: number; numero: number; nom: string };
export type Camp = { nom: string; court: string; joueurs: Joueur[] };
type Cote = "home" | "away";
export type Ligne = {
  type: EventType;
  camp: Cote;
  minute: string;
  joueur: string;
  passeur: string;
  entrant: string;
};

const TYPES: [EventType, string][] = [
  ["GOAL", "But"],
  ["OWN_GOAL", "CSC"],
  ["YELLOW", "Jaune"],
  ["RED", "Rouge"],
  ["SUB", "Rempl."],
];
const champ =
  "min-h-11 w-full rounded-sm border border-border bg-background p-2 text-foreground";
// Bouton radio façon onglet : le libellé porte la cible de 44 px, le radio reste accessible.
const onglet =
  "flex min-h-11 flex-1 cursor-pointer items-center justify-center rounded-sm border border-border px-1 text-sm font-semibold has-checked:border-foreground has-checked:bg-foreground has-checked:text-background has-focus-visible:outline-2 has-focus-visible:outline-foreground";
const autre = (c: Cote): Cote => (c === "home" ? "away" : "home");
const pluriel = (n: number) => `${n} but${n > 1 ? "s" : ""}`;

export function MatchResultForm({
  matchId,
  home,
  away,
  initial,
}: {
  matchId: number;
  home: Camp;
  away: Camp;
  initial: { homeGoals: number; awayGoals: number; lignes: Ligne[] };
}) {
  const camps = { home, away };
  const [score, setScore] = useState({
    home: initial.homeGoals,
    away: initial.awayGoals,
  });
  // Clé stable par ligne : l'ordre de saisie est conservé, aucune ligne ne saute sous le doigt.
  const [lignes, setLignes] = useState(() =>
    initial.lignes.map((l, cle) => ({ ...l, cle })),
  );
  const [prochaine, setProchaine] = useState(initial.lignes.length);
  const [etat, action, envoi] = useActionState(
    async (prev: ActionResult | null, f: FormData) => {
      try {
        return await enregistrerResultat(prev, f);
      } catch {
        return {
          erreur: "Envoi impossible, vérifiez la connexion puis réessayez.",
        };
      }
    },
    null,
  );

  const maj = (cle: number, p: Partial<Ligne>) =>
    setLignes((ls) => ls.map((l) => (l.cle === cle ? { ...l, ...p } : l)));
  const ajouter = () => {
    setLignes((ls) => [
      ...ls,
      {
        cle: prochaine,
        type: "GOAL",
        camp: "home",
        minute: "",
        joueur: "",
        passeur: "",
        entrant: "",
      },
    ]);
    setProchaine((n) => n + 1);
  };

  // BR-27 en direct : un csc compte pour l'adversaire.
  const saisis = { home: 0, away: 0 };
  for (const l of lignes) {
    if (l.type === "GOAL") saisis[l.camp]++;
    if (l.type === "OWN_GOAL") saisis[autre(l.camp)]++;
  }
  const ecarts = (["home", "away"] as Cote[])
    .map((c) => ({ c, d: score[c] - saisis[c] }))
    .filter((e) => e.d !== 0)
    .map(({ c, d }) =>
      d > 0
        ? `Il manque ${pluriel(d)} pour ${camps[c].nom}`
        : `${pluriel(-d)} en trop pour ${camps[c].nom}`,
    );

  const compteur = (c: Cote) => (
    <div className="grid justify-items-center gap-1">
      <span className="text-sm font-semibold">{camps[c].court}</span>
      <div className="flex items-center gap-1">
        <Button
          variant="secondary"
          className="size-12 px-0"
          aria-label={`Retirer un but à ${camps[c].nom}`}
          onClick={() =>
            setScore((s) => ({ ...s, [c]: Math.max(0, s[c] - 1) }))
          }
        >
          −
        </Button>
        <input
          type="number"
          name={`${c}Goals`}
          min={0}
          max={99}
          inputMode="numeric"
          required
          aria-label={`Buts de ${camps[c].nom}`}
          value={score[c]}
          onChange={(e) =>
            setScore((s) => ({
              ...s,
              [c]: Math.max(0, Number(e.target.value)),
            }))
          }
          className="num w-12 [appearance:textfield] bg-transparent text-center text-4xl font-extrabold"
        />
        <Button
          variant="secondary"
          className="size-12 px-0"
          aria-label={`Ajouter un but à ${camps[c].nom}`}
          onClick={() => setScore((s) => ({ ...s, [c]: s[c] + 1 }))}
        >
          +
        </Button>
      </div>
    </div>
  );

  const options = (c: Cote, sauf?: string) =>
    camps[c].joueurs
      .filter((j) => String(j.id) !== sauf)
      .map((j) => (
        <option key={j.id} value={j.id}>
          {j.numero} · {j.nom}
        </option>
      ));

  return (
    <form action={action} className="grid gap-4">
      <input type="hidden" name="matchId" value={matchId} />
      {etat && "ok" in etat && (
        <p role="status" className="font-semibold">
          Résultat publié. Classement mis à jour.
        </p>
      )}
      {etat && "erreur" in etat && (
        <p role="alert" className="font-semibold">
          {etat.erreur}
        </p>
      )}

      <div className="flex justify-center gap-3">
        {compteur("home")}
        {compteur("away")}
      </div>
      <p
        aria-live="polite"
        className={`text-sm ${ecarts.length ? "font-semibold text-foreground" : "text-muted"}`}
      >
        Buts saisis : {saisis.home + saisis.away} / {score.home + score.away}
        {ecarts.length > 0 && ` · ${ecarts.join(" · ")}`}
      </p>

      <h3 className="title-sport text-base">Événements</h3>
      <ol className="grid">
        {lignes.map((l, i) => {
          const n = i + 1;
          const vide = camps[l.camp].joueurs.length === 0;
          return (
            <li key={l.cle} className="space-y-2 border-b border-border py-3">
              <input type="hidden" name="event_type" value={l.type} />
              <input type="hidden" name="event_minute" value={l.minute} />
              <input type="hidden" name="event_player" value={l.joueur} />
              <input
                type="hidden"
                name="event_assist"
                value={l.type === "GOAL" ? l.passeur : ""}
              />
              <input
                type="hidden"
                name="event_player_in"
                value={l.type === "SUB" ? l.entrant : ""}
              />
              <fieldset className="flex gap-1">
                <legend className="sr-only">
                  Type de l&apos;événement {n}
                </legend>
                {TYPES.map(([t, label]) => (
                  <label key={t} className={onglet}>
                    <input
                      type="radio"
                      className="sr-only"
                      name={`type_${l.cle}`}
                      checked={l.type === t}
                      onChange={() => maj(l.cle, { type: t })}
                    />
                    {label}
                  </label>
                ))}
              </fieldset>
              <fieldset className="flex gap-1">
                <legend className="sr-only">
                  Club de l&apos;événement {n}
                </legend>
                {(["home", "away"] as Cote[]).map((c) => (
                  <label key={c} className={onglet}>
                    <input
                      type="radio"
                      className="sr-only"
                      name={`camp_${l.cle}`}
                      checked={l.camp === c}
                      onChange={() =>
                        maj(l.cle, {
                          camp: c,
                          joueur: "",
                          passeur: "",
                          entrant: "",
                        })
                      }
                    />
                    {camps[c].court}
                  </label>
                ))}
              </fieldset>
              {l.type === "OWN_GOAL" && (
                <p className="text-xs text-muted">
                  But compté pour {camps[autre(l.camp)].nom}
                </p>
              )}
              <div className="flex gap-2">
                <label className="grid gap-1 text-sm">
                  <span className="text-muted">Minute</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    max={130}
                    placeholder="67"
                    required
                    value={l.minute}
                    onChange={(e) => maj(l.cle, { minute: e.target.value })}
                    className={`${champ} w-20`}
                  />
                </label>
                <label className="grid min-w-0 flex-1 gap-1 text-sm">
                  <span className="text-muted">
                    {l.type === "SUB" ? "Joueur sortant" : "Joueur"}
                  </span>
                  <select
                    required
                    value={l.joueur}
                    onChange={(e) =>
                      maj(l.cle, {
                        joueur: e.target.value,
                        passeur: l.passeur === e.target.value ? "" : l.passeur,
                        entrant: l.entrant === e.target.value ? "" : l.entrant,
                      })
                    }
                    className={champ}
                  >
                    <option value="">
                      {vide ? "Aucun joueur dans l'effectif" : "Choisir"}
                    </option>
                    {options(l.camp)}
                  </select>
                </label>
              </div>
              {l.type === "GOAL" && (
                <label className="grid gap-1 text-sm">
                  <span className="text-muted">Passeur</span>
                  <select
                    value={l.passeur}
                    onChange={(e) => maj(l.cle, { passeur: e.target.value })}
                    className={champ}
                  >
                    <option value="">Sans passeur</option>
                    {options(l.camp, l.joueur)}
                  </select>
                </label>
              )}
              {l.type === "SUB" && (
                <label className="grid gap-1 text-sm">
                  <span className="text-muted">Joueur entrant</span>
                  <select
                    required
                    value={l.entrant}
                    onChange={(e) => maj(l.cle, { entrant: e.target.value })}
                    className={champ}
                  >
                    <option value="">Choisir</option>
                    {options(l.camp, l.joueur)}
                  </select>
                </label>
              )}
              <button
                type="button"
                onClick={() =>
                  setLignes((ls) => ls.filter((x) => x.cle !== l.cle))
                }
                aria-label={`Supprimer l'événement ${n}`}
                className="min-h-11 text-sm text-muted underline"
              >
                Supprimer
              </button>
            </li>
          );
        })}
      </ol>
      <Button variant="secondary" className="w-full" onClick={ajouter}>
        + Ajouter un événement
      </Button>

      <div className="sticky bottom-0 grid gap-1 border-t border-border bg-background py-3">
        <Button type="submit" className="w-full" disabled={envoi}>
          {envoi ? "Enregistrement…" : "Enregistrer et publier"}
        </Button>
        <p className="text-xs text-muted">
          Le résultat est publié immédiatement sur le site.
        </p>
      </div>
    </form>
  );
}

import { requireRole } from "@/lib/auth";
import { ecrire } from "@/lib/crud-admin";
import { db } from "@/lib/db";
import { parseSaison } from "@/lib/referentiel";

const CH = "/admin/saisons";

async function creer(f: FormData) {
  "use server";
  const v = parseSaison(f);
  await ecrire(CH, v, () =>
    db.season.create({ data: (v as { data: never }).data }),
  );
}
async function modifier(f: FormData) {
  "use server";
  const v = parseSaison(f);
  await ecrire(CH, v, () =>
    db.season.update({
      where: { id: Number(f.get("id")) },
      data: (v as { data: never }).data,
    }),
  );
}
async function supprimer(f: FormData) {
  "use server";
  await ecrire(CH, { data: 0 }, () =>
    db.season.delete({ where: { id: Number(f.get("id")) } }),
  );
}

const jour = (d: Date) => d.toISOString().slice(0, 10);

export default async function Saisons({
  searchParams,
}: {
  searchParams: Promise<{ erreur?: string }>;
}) {
  await requireRole("ADMIN");
  const { erreur } = await searchParams;
  const saisons = await db.season.findMany({ orderBy: { startDate: "desc" } });
  const input = "min-h-11 rounded border p-2";
  const btn = "min-h-11 rounded border px-4";
  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="mb-4 text-xl font-bold uppercase">Saisons</h1>
      {erreur && (
        <p role="alert" className="mb-3 text-red-600">
          {erreur}
        </p>
      )}
      <ul className="mb-6 divide-y">
        {saisons.map((s) => (
          <li key={s.id} className="flex flex-wrap gap-2 py-2">
            <form action={modifier} className="flex flex-wrap gap-2">
              <input type="hidden" name="id" value={s.id} />
              <input
                name="name"
                defaultValue={s.name}
                aria-label="Nom"
                required
                className={input}
              />
              <input
                name="startDate"
                type="date"
                defaultValue={jour(s.startDate)}
                aria-label="Début"
                required
                className={input}
              />
              <input
                name="endDate"
                type="date"
                defaultValue={jour(s.endDate)}
                aria-label="Fin"
                required
                className={input}
              />
              <button className={btn}>Enregistrer</button>
            </form>
            <form action={supprimer}>
              <input type="hidden" name="id" value={s.id} />
              <button className={btn}>Supprimer</button>
            </form>
          </li>
        ))}
      </ul>
      <form action={creer} className="flex flex-wrap gap-2">
        <input
          name="name"
          placeholder="Saison 2026-S2"
          aria-label="Nom"
          required
          className={input}
        />
        <input
          name="startDate"
          type="date"
          aria-label="Début"
          required
          className={input}
        />
        <input
          name="endDate"
          type="date"
          aria-label="Fin"
          required
          className={input}
        />
        <button className="min-h-11 rounded bg-black px-4 text-white">
          Ajouter
        </button>
      </form>
    </main>
  );
}

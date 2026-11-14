import { requireRole } from "@/lib/auth";
import { ecrire } from "@/lib/crud-admin";
import { db } from "@/lib/db";
import { parseDivision } from "@/lib/referentiel";

const CH = "/admin/divisions";

async function creer(f: FormData) {
  "use server";
  const v = parseDivision(f);
  await ecrire(CH, v, () =>
    db.division.create({ data: (v as { data: never }).data }),
  );
}
async function modifier(f: FormData) {
  "use server";
  const v = parseDivision(f);
  await ecrire(CH, v, () =>
    db.division.update({
      where: { id: Number(f.get("id")) },
      data: (v as { data: never }).data,
    }),
  );
}
async function supprimer(f: FormData) {
  "use server";
  await ecrire(CH, { data: 0 }, () =>
    db.division.delete({ where: { id: Number(f.get("id")) } }),
  );
}

export default async function Divisions({
  searchParams,
}: {
  searchParams: Promise<{ erreur?: string }>;
}) {
  await requireRole("ADMIN");
  const { erreur } = await searchParams;
  const divisions = await db.division.findMany({ orderBy: { level: "asc" } });
  const input = "min-h-11 rounded border p-2";
  const btn = "min-h-11 rounded border px-4";
  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="mb-4 text-xl font-bold uppercase">
        Divisions ({divisions.length}/3)
      </h1>
      {erreur && (
        <p role="alert" className="mb-3 text-red-600">
          {erreur}
        </p>
      )}
      <ul className="mb-6 divide-y">
        {divisions.map((d) => (
          <li key={d.id} className="flex flex-wrap gap-2 py-2">
            <form action={modifier} className="flex flex-wrap gap-2">
              <input type="hidden" name="id" value={d.id} />
              <input
                name="name"
                defaultValue={d.name}
                aria-label="Nom"
                required
                className={input}
              />
              <input
                name="level"
                type="number"
                min={1}
                max={3}
                defaultValue={d.level}
                aria-label="Niveau"
                required
                className={`${input} w-20`}
              />
              <button className={btn}>Enregistrer</button>
            </form>
            <form action={supprimer}>
              <input type="hidden" name="id" value={d.id} />
              <button className={btn}>Supprimer</button>
            </form>
          </li>
        ))}
      </ul>
      <form action={creer} className="flex flex-wrap gap-2">
        <input
          name="name"
          placeholder="Nom (D1)"
          aria-label="Nom"
          required
          className={input}
        />
        <input
          name="level"
          type="number"
          min={1}
          max={3}
          placeholder="Niveau"
          aria-label="Niveau"
          required
          className={`${input} w-24`}
        />
        <button className="min-h-11 rounded bg-black px-4 text-white">
          Ajouter
        </button>
      </form>
    </main>
  );
}

import { requireRole } from "@/lib/auth";
import { ecrire } from "@/lib/crud-admin";
import { db } from "@/lib/db";
import { parseStade } from "@/lib/referentiel";

const CH = "/admin/stades";

async function creer(f: FormData) {
  "use server";
  const v = parseStade(f);
  await ecrire(CH, v, () =>
    db.stadium.create({ data: (v as { data: never }).data }),
  );
}
async function modifier(f: FormData) {
  "use server";
  const v = parseStade(f);
  await ecrire(CH, v, () =>
    db.stadium.update({
      where: { id: Number(f.get("id")) },
      data: (v as { data: never }).data,
    }),
  );
}
async function supprimer(f: FormData) {
  "use server";
  await ecrire(CH, { data: 0 }, () =>
    db.stadium.delete({ where: { id: Number(f.get("id")) } }),
  );
}

export default async function Stades({
  searchParams,
}: {
  searchParams: Promise<{ erreur?: string }>;
}) {
  await requireRole("ADMIN");
  const { erreur } = await searchParams;
  const stades = await db.stadium.findMany({ orderBy: { name: "asc" } });
  const input = "min-h-11 rounded border p-2";
  const btn = "min-h-11 rounded border px-4";
  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="mb-4 text-xl font-bold uppercase">Stades</h1>
      {erreur && (
        <p role="alert" className="mb-3 text-red-600">
          {erreur}
        </p>
      )}
      <ul className="mb-6 divide-y">
        {stades.map((s) => (
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
                name="city"
                defaultValue={s.city ?? ""}
                aria-label="Ville"
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
          placeholder="Nom du stade"
          aria-label="Nom"
          required
          className={input}
        />
        <input
          name="city"
          placeholder="Ville"
          aria-label="Ville"
          className={input}
        />
        <button className="min-h-11 rounded bg-black px-4 text-white">
          Ajouter
        </button>
      </form>
    </main>
  );
}

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { assertStaffLimit, requireRole } from "@/lib/auth";
import { db } from "@/lib/db";

async function creer(formData: FormData) {
  "use server";
  await requireRole("SUPER_ADMIN");
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const name = String(formData.get("name") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const role = formData.get("role");
  let erreur = "";
  if (!/^\S+@\S+\.\S+$/.test(email) || !name) erreur = "Email ou nom invalide.";
  else if (password.length < 8) erreur = "Mot de passe : 8 caractères minimum.";
  else if (role !== "ADMIN" && role !== "ASSISTANT") erreur = "Rôle invalide.";
  else if (await db.user.findUnique({ where: { email } }))
    erreur = "Cet email existe déjà.";
  else {
    try {
      await assertStaffLimit();
    } catch (e) {
      erreur = (e as Error).message;
    }
  }
  if (!erreur)
    await db.user.create({
      data: {
        email,
        name,
        role: role as "ADMIN" | "ASSISTANT",
        passwordHash: await bcrypt.hash(password, 10),
      },
    });
  revalidatePath("/admin/comptes");
  if (erreur) redirect(`/admin/comptes?erreur=${encodeURIComponent(erreur)}`);
}

async function supprimer(formData: FormData) {
  "use server";
  const me = await requireRole("SUPER_ADMIN");
  const id = Number(formData.get("id"));
  if (String(id) === me.id)
    redirect(
      "/admin/comptes?erreur=" +
        encodeURIComponent("Vous ne pouvez pas supprimer votre propre compte."),
    );
  await db.user.delete({ where: { id } });
  revalidatePath("/admin/comptes");
}

export default async function Comptes({
  searchParams,
}: {
  searchParams: Promise<{ erreur?: string }>;
}) {
  await requireRole("SUPER_ADMIN");
  const { erreur } = await searchParams;
  const users = await db.user.findMany({ orderBy: { id: "asc" } });
  const input = "rounded border p-2";
  return (
    <main className="mx-auto max-w-xl p-6">
      <h1 className="mb-4 text-xl font-bold">
        Comptes staff ({users.length}/3)
      </h1>
      {erreur && (
        <p role="alert" className="mb-3 text-red-600">
          {erreur}
        </p>
      )}
      <ul className="mb-6 divide-y">
        {users.map((u) => (
          <li key={u.id} className="flex items-center justify-between py-2">
            <span>
              {u.name} — {u.email} <b>({u.role})</b>
            </span>
            <form action={supprimer}>
              <input type="hidden" name="id" value={u.id} />
              <button className="text-red-600">Supprimer</button>
            </form>
          </li>
        ))}
      </ul>
      <form action={creer} className="flex flex-col gap-2">
        <input name="name" placeholder="Nom" required className={input} />
        <input
          name="email"
          type="email"
          placeholder="Email"
          required
          className={input}
        />
        <input
          name="password"
          type="password"
          placeholder="Mot de passe (8+)"
          required
          minLength={8}
          className={input}
        />
        <select name="role" className={input}>
          <option value="ASSISTANT">Assistant admin</option>
          <option value="ADMIN">Admin</option>
        </select>
        <button className="rounded bg-black px-4 py-2 text-white">
          Créer le compte
        </button>
      </form>
    </main>
  );
}

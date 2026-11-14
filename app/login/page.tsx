import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { auth, signIn, signOut } from "@/lib/auth";

async function Formulaire({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await auth();
  const { error } = await searchParams;

  async function login(formData: FormData) {
    "use server";
    try {
      await signIn("credentials", {
        email: formData.get("email"),
        password: formData.get("password"),
        redirectTo: "/admin",
      });
    } catch (e) {
      if (e instanceof AuthError) redirect("/login?error=1");
      throw e; // la redirection de succès est aussi une exception
    }
  }

  if (session) {
    return (
      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/login" });
        }}
        className="mx-auto max-w-sm p-6"
      >
        <p className="mb-4">
          Connecté : {session.user.name} ({session.user.role})
        </p>
        <button className="rounded bg-black px-4 py-2 text-white">
          Se déconnecter
        </button>
      </form>
    );
  }

  return (
    <form action={login} className="mx-auto flex max-w-sm flex-col gap-3 p-6">
      <h1 className="text-xl font-bold">Connexion</h1>
      {error && (
        <p role="alert" className="text-red-600">
          Email ou mot de passe incorrect.
        </p>
      )}
      <input
        name="email"
        type="email"
        placeholder="Email"
        required
        className="rounded border p-2"
      />
      <input
        name="password"
        type="password"
        placeholder="Mot de passe"
        required
        className="rounded border p-2"
      />
      <button className="rounded bg-black px-4 py-2 text-white">
        Se connecter
      </button>
    </form>
  );
}

// Cache Components : session et searchParams sont lus sous <Suspense>.
export default function Login({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  return (
    <Suspense fallback={<p className="p-6">Chargement…</p>}>
      <Formulaire searchParams={searchParams} />
    </Suspense>
  );
}

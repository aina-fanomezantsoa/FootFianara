import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireRole } from "./auth";
import type { Valid } from "./referentiel";

// Exécute une écriture Prisma réservée à l'admin ; l'erreur revient à la page via ?erreur=.
export async function ecrire(
  chemin: string,
  validation: Valid<unknown>,
  op: () => Promise<unknown>,
) {
  await requireRole("ADMIN");
  let erreur = "erreur" in validation ? validation.erreur : "";
  if (!erreur) {
    try {
      await op();
    } catch (e) {
      const code = (e as { code?: string }).code;
      erreur =
        code === "P2002"
          ? "Valeur déjà utilisée (nom ou niveau)."
          : code === "P2003"
            ? "Suppression impossible : élément utilisé ailleurs."
            : "Erreur d'enregistrement.";
    }
  }
  revalidatePath(chemin);
  if (erreur) redirect(`${chemin}?erreur=${encodeURIComponent(erreur)}`);
}

import { Champ, Choix } from "@/app/_components/Champ";
import { DepotImage } from "@/app/_components/DepotImage";
import { uploadActif } from "@/lib/images";
import { PIEDS, POSTES } from "@/lib/referentiel";

type Joueur = {
  firstName: string;
  lastName: string;
  photoUrl: string | null;
  position: string | null;
  birthDate: Date | null;
  heightCm: number | null;
  strongFoot: string | null;
  nationality: string | null;
};

// Champs partagés par la création et la modification d'un joueur.
export function ChampsJoueur({ joueur }: { joueur?: Joueur }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Champ
        label="Prénom"
        name="firstName"
        defaultValue={joueur?.firstName}
        required
      />
      <Champ
        label="Nom"
        name="lastName"
        defaultValue={joueur?.lastName}
        required
      />
      <Choix
        label="Poste"
        name="position"
        options={POSTES}
        defaultValue={joueur?.position ?? ""}
      />
      <Champ
        label="Date de naissance"
        name="birthDate"
        type="date"
        defaultValue={joueur?.birthDate?.toISOString().slice(0, 10) ?? ""}
      />
      <Champ
        label="Taille (cm)"
        name="heightCm"
        type="number"
        inputMode="numeric"
        min={120}
        max={230}
        defaultValue={joueur?.heightCm ?? ""}
      />
      <Choix
        label="Pied fort"
        name="strongFoot"
        options={PIEDS}
        defaultValue={joueur?.strongFoot ?? ""}
      />
      <Champ
        label="Nationalité"
        name="nationality"
        defaultValue={joueur?.nationality ?? ""}
      />
      <DepotImage
        name="photoUrl"
        label="Photo"
        url={joueur?.photoUrl}
        desactive={!uploadActif()}
      />
    </div>
  );
}

import { Champ } from "@/app/_components/Champ";
import { DepotImage } from "@/app/_components/DepotImage";
import { logoClub, uploadActif } from "@/lib/images";

type Club = {
  name: string;
  shortName: string;
  logoUrl: string | null;
  teamPhotoUrl: string | null;
  colors: string | null;
  foundedYear: number | null;
  district: string | null;
  president: string | null;
  coach: string | null;
  phone: string | null;
  facebookUrl: string | null;
};

// Champs partagés par la création et la modification d'un club.
export function ChampsClub({ club }: { club?: Club }) {
  const off = !uploadActif();
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Champ label="Nom" name="name" defaultValue={club?.name} required />
      <Champ
        label="Nom court"
        name="shortName"
        defaultValue={club?.shortName}
        required
        maxLength={12}
      />
      <Champ label="Couleurs" name="colors" defaultValue={club?.colors ?? ""} />
      <Champ
        label="Année de fondation"
        name="foundedYear"
        type="number"
        inputMode="numeric"
        defaultValue={club?.foundedYear ?? ""}
      />
      <Champ
        label="Quartier"
        name="district"
        defaultValue={club?.district ?? ""}
      />
      <Champ
        label="Président"
        name="president"
        defaultValue={club?.president ?? ""}
      />
      <Champ label="Entraîneur" name="coach" defaultValue={club?.coach ?? ""} />
      <Champ
        label="Téléphone (facultatif)"
        name="phone"
        type="tel"
        defaultValue={club?.phone ?? ""}
      />
      <Champ
        label="Page Facebook (facultatif)"
        name="facebookUrl"
        type="url"
        placeholder="https://facebook.com/…"
        defaultValue={club?.facebookUrl ?? ""}
      />
      <div className="sm:col-span-2 grid gap-3 sm:grid-cols-2">
        <DepotImage
          name="logoUrl"
          label="Logo"
          url={logoClub(club ?? {})}
          desactive={off}
        />
        <DepotImage
          name="teamPhotoUrl"
          label="Photo d'équipe"
          url={club?.teamPhotoUrl}
          desactive={off}
        />
      </div>
    </div>
  );
}

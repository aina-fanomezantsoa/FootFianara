import { Champ } from "@/app/_components/Champ";
import { DepotImage } from "@/app/_components/DepotImage";
import { uploadActif } from "@/lib/images";

// Champs partagés par la création et la modification d'une actualité.
export function ChampsNews({
  news,
}: {
  news?: { title: string; body: string; imageUrl: string | null };
}) {
  return (
    <div className="grid gap-3">
      <Champ
        label="Titre"
        name="title"
        defaultValue={news?.title}
        required
        maxLength={140}
      />
      <label className="grid gap-1 text-sm">
        <span className="text-muted">Texte</span>
        <textarea
          name="body"
          rows={8}
          required
          defaultValue={news?.body}
          className="w-full rounded-sm border border-border bg-background p-2 text-foreground"
        />
      </label>
      <DepotImage
        name="imageUrl"
        label="Image (facultatif)"
        url={news?.imageUrl}
        desactive={!uploadActif()}
      />
    </div>
  );
}

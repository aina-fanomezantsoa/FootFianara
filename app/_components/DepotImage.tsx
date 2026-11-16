"use client";

import { useId, useRef, useState } from "react";
import { IMAGE_MAX, IMAGE_TYPES } from "@/lib/images";

// Zone de glisser-déposer ; l'input file classique reste visible comme repli accessible.
// Le fichier part avec le formulaire parent (action serveur) ; la validation finale est côté serveur.
export function DepotImage({
  name,
  label,
  url,
  desactive = false,
}: {
  name: string;
  label: string;
  url?: string | null;
  desactive?: boolean;
}) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  // Seuls blob: (aperçu local) et https: (Cloudinary) sont acceptés comme source d'image.
  const [apercu, setApercu] = useState(
    /^https:\/\//.test(url ?? "") ? url! : "",
  );
  const [msg, setMsg] = useState("");
  const [survol, setSurvol] = useState(false);

  function choisir(files: FileList | null) {
    const f = files?.[0];
    const el = input.current;
    if (!f || !el) return;
    if (!IMAGE_TYPES.includes(f.type) || f.size > IMAGE_MAX) {
      el.value = "";
      setMsg("Image JPEG, PNG ou WebP de 2 Mo maximum.");
      return;
    }
    if (el.files !== files) el.files = files;
    setMsg("");
    setApercu(URL.createObjectURL(f));
  }

  return (
    <div className="grid gap-2">
      <label
        htmlFor={id}
        onDragOver={(e) => {
          e.preventDefault();
          if (!desactive) setSurvol(true);
        }}
        onDragLeave={() => setSurvol(false)}
        onDrop={(e) => {
          e.preventDefault();
          setSurvol(false);
          if (!desactive) choisir(e.dataTransfer.files);
        }}
        className={`flex min-h-24 items-center gap-3 rounded-sm border border-dashed p-3 text-sm ${
          survol ? "border-foreground" : "border-border"
        } ${desactive ? "opacity-50" : "cursor-pointer"}`}
      >
        {apercu && (
          // eslint-disable-next-line @next/next/no-img-element -- aperçu local (blob:) ou URL Cloudinary
          <img
            src={apercu}
            alt=""
            className="size-16 rounded-sm object-cover"
          />
        )}
        <span>
          <span className="font-semibold">{label}</span>
          <br />
          <span className="text-muted">
            {desactive
              ? "Téléversement désactivé : Cloudinary n'est pas configuré."
              : "Glisser une image ici ou choisir un fichier (JPEG, PNG, WebP, 2 Mo max)."}
          </span>
        </span>
      </label>
      <input
        ref={input}
        id={id}
        type="file"
        name={name}
        accept={IMAGE_TYPES.join(",")}
        disabled={desactive}
        onChange={(e) => choisir(e.target.files)}
        className="min-h-11 text-sm"
      />
      {msg && (
        <p role="alert" className="text-sm text-red-600">
          {msg}
        </p>
      )}
    </div>
  );
}

import type { ComponentProps } from "react";

// Champs de formulaire avec libellé visible, cible tactile de 44 px.
const style =
  "min-h-11 w-full rounded-sm border border-border bg-background p-2 text-foreground";

export function Champ({
  label,
  ...props
}: ComponentProps<"input"> & { label: string }) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="text-muted">{label}</span>
      <input className={style} {...props} />
    </label>
  );
}

export function Choix({
  label,
  options,
  vide = "—",
  ...props
}: ComponentProps<"select"> & {
  label: string;
  options: (string | { value: number | string; label: string })[];
  vide?: string;
}) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="text-muted">{label}</span>
      <select className={style} {...props}>
        <option value="">{vide}</option>
        {options.map((o) =>
          typeof o === "string" ? (
            <option key={o}>{o}</option>
          ) : (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ),
        )}
      </select>
    </label>
  );
}

export function Alerte({ children }: { children?: string }) {
  return children ? (
    <p role="alert" className="mb-3 text-red-600">
      {children}
    </p>
  ) : null;
}

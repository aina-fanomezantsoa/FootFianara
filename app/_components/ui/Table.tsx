import type { ComponentProps } from "react";

// Compact, sans défilement horizontal à 360 px : peu de colonnes, texte court.
export function Table({ className = "", ...props }: ComponentProps<"table">) {
  return (
    <table
      className={`num w-full border-collapse text-sm ${className}`}
      {...props}
    />
  );
}

export function Th({
  className = "",
  scope = "col",
  ...props
}: ComponentProps<"th">) {
  return (
    <th
      scope={scope}
      className={`border-b border-border px-2 py-2 text-left text-xs font-semibold uppercase text-muted ${className}`}
      {...props}
    />
  );
}

export function Td({ className = "", ...props }: ComponentProps<"td">) {
  return (
    <td
      className={`border-b border-border px-2 py-3 ${className}`}
      {...props}
    />
  );
}

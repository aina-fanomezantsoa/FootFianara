import type { ComponentProps } from "react";

export function Badge({
  inverted = false,
  className = "",
  ...props
}: ComponentProps<"span"> & { inverted?: boolean }) {
  const tone = inverted ? "bg-foreground text-background border-foreground" : "border-border text-muted";
  return (
    <span
      className={`inline-block rounded-sm border px-2 py-0.5 text-xs font-semibold uppercase tracking-wide ${tone} ${className}`}
      {...props}
    />
  );
}

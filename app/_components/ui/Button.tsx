import Link from "next/link";
import type { ComponentProps } from "react";

type Variant = "primary" | "secondary";

const base =
  "inline-flex min-h-11 items-center justify-center rounded-sm border px-4 text-sm font-semibold uppercase tracking-wide transition-colors disabled:opacity-50";
const variants: Record<Variant, string> = {
  primary: "border-foreground bg-foreground text-background hover:bg-muted hover:border-muted",
  secondary: "border-border bg-transparent text-foreground hover:border-foreground",
};

export function Button({
  variant = "primary",
  className = "",
  type = "button",
  ...props
}: ComponentProps<"button"> & { variant?: Variant }) {
  return <button type={type} className={`${base} ${variants[variant]} ${className}`} {...props} />;
}

export function ButtonLink({
  variant = "primary",
  className = "",
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant }) {
  return <Link className={`${base} ${variants[variant]} ${className}`} {...props} />;
}

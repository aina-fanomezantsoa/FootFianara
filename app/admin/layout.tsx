import { Suspense } from "react";
import { requireRole } from "@/lib/auth";

async function Garde({ children }: { children: React.ReactNode }) {
  await requireRole("ASSISTANT");
  return <>{children}</>;
}

// Cache Components : les données de requête (cookies) doivent être sous <Suspense>.
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<p className="p-6">Chargement…</p>}>
      <Garde>{children}</Garde>
    </Suspense>
  );
}

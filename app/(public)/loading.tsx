// Squelette statique, sans animation (rien qui bouge en continu).
export default function Chargement() {
  return (
    <div aria-busy="true" className="space-y-3">
      <span className="sr-only" role="status">
        Chargement…
      </span>
      <div className="h-9 w-48 rounded-md bg-surface" />
      <div className="h-11 rounded-md bg-surface" />
      <div className="grid gap-3 md:grid-cols-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-28 rounded-md bg-surface" />
        ))}
      </div>
    </div>
  );
}

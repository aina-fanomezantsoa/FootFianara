"use client";

import { Children, useEffect, useState } from "react";

/**
 * Une carte visible, glisse vers la gauche toutes les 6 s, en boucle.
 * La 1re carte est recopiée en fin de piste : on glisse vers la copie puis on revient
 * à l'original sans transition, d'où aucun retour visible vers l'arrière.
 */
export function Carrousel({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  const items = Children.toArray(children);
  const n = items.length;
  const [i, setI] = useState(0);
  const [anime, setAnime] = useState(true);
  const [survol, setSurvol] = useState(false);
  const [focus, setFocus] = useState(false);

  useEffect(() => {
    if (survol || focus || n < 2) return;
    const t = setInterval(() => {
      const reduit = matchMedia("(prefers-reduced-motion: reduce)").matches;
      setAnime(!reduit);
      // Sans animation, pas de transitionend : on boucle directement.
      setI((k) => (reduit ? (k + 1) % n : (k % n) + 1));
    }, 6000);
    return () => clearInterval(t);
  }, [survol, focus, n]);

  if (n === 0) return null;
  const actif = i % n;
  return (
    <div
      role="region"
      aria-roledescription="carrousel"
      aria-label={label}
      className="space-y-1"
      onMouseEnter={() => setSurvol(true)}
      onMouseLeave={() => setSurvol(false)}
      onFocus={() => setFocus(true)}
      onBlur={(e) =>
        !e.currentTarget.contains(e.relatedTarget) && setFocus(false)
      }
    >
      <div className="overflow-hidden">
        <div
          className={`flex ${anime ? "transition-transform duration-500 ease-out motion-reduce:transition-none" : ""}`}
          style={{ transform: `translateX(-${i * 100}%)` }}
          onTransitionEnd={(e) => {
            // Ignore les transitions des cartes (survol) qui remontent jusqu'ici.
            if (e.target !== e.currentTarget || i < n) return;
            setAnime(false);
            setI(0);
          }}
        >
          {[...items, items[0]].map((item, k) => (
            <div key={k} className="w-full shrink-0" inert={k !== i}>
              {item}
            </div>
          ))}
        </div>
      </div>
      {n > 1 && (
        <div className="flex justify-center">
          {items.map((_, k) => (
            <button
              key={k}
              type="button"
              aria-label={`Actualité ${k + 1} sur ${n}`}
              aria-current={k === actif || undefined}
              onClick={() => {
                setAnime(true);
                setI(k);
              }}
              className="flex min-h-11 min-w-11 items-center justify-center"
            >
              <span
                className={`size-2 rounded-full border border-foreground ${k === actif ? "bg-foreground" : ""}`}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

# DESIGN_PUBLIC — Site public (T20, T21, T22) et saisie de match (T12, T14, T15)

Spécification pour l'implémentation. S'appuie sur `UI_UX_GUIDELINES.md`, `REQUIREMENTS.md` (M10), `BUSINESS_RULES.md` et le design system T19 (`app/globals.css`, `app/_components/ui/`). Tout se fait en Tailwind 4 avec les tokens existants ; aucune nouvelle couleur.

## 1. Rappel des tokens (T19, ne pas en ajouter)

| Token Tailwind    | Valeur    | Usage                                                     |
| ----------------- | --------- | --------------------------------------------------------- |
| `bg-background`   | `#000000` | fond de page                                              |
| `bg-surface`      | `#111111` | cartes, barre de navigation                               |
| `border-border`   | `#2a2a2a` | bordures, séparateurs de lignes                           |
| `text-muted`      | `#9a9a9a` | libellés, métadonnées (date, stade, en-têtes de colonnes) |
| `text-foreground` | `#ffffff` | texte principal, scores, état actif                       |
| `.title-sport`    |           | titres en capitales                                       |
| `.num`            |           | chiffres tabulaires (scores, tableaux, stats)             |
| `:focus-visible`  |           | contour blanc 2 px, déjà global                           |

Composants existants à réutiliser : `Card`, `Button` / `ButtonLink` (`primary`, `secondary`, `min-h-11` = 44 px), `Badge` (`inverted`), `Table` / `Th` / `Td`.

Rayons : `rounded-sm` pour boutons, badges, onglets ; `rounded-md` pour les cartes. Pas d'autre rayon (pas de `rounded-full` sauf l'écusson par défaut, voir 4.3). Espacements : pile verticale `space-y-6` entre sections, `gap-3` entre cartes, `px-4` de marge de page mobile, conteneur `mx-auto max-w-5xl`.

Contraste : `#9a9a9a` sur `#000` ou `#111` dépasse 4.5:1, utilisable pour du texte. `#2a2a2a` sert uniquement aux bordures, jamais au texte.

## 2. Typographies

Chargées par `next/font/google` dans `app/layout.tsx` (remplacent Geist) :

| Rôle                | Famille exacte       | Import next/font                                                  | Variable CSS     | Token Tailwind |
| ------------------- | -------------------- | ----------------------------------------------------------------- | ---------------- | -------------- |
| Titres, scores, nav | **Barlow Condensed** | `Barlow_Condensed({ weight: ["600","700"], subsets: ["latin"] })` | `--font-display` | `font-display` |
| Texte, tableaux     | **Inter**            | `Inter({ subsets: ["latin"] })` (variable)                        | `--font-sans`    | `font-sans`    |

- Dans `@theme inline` : `--font-sans: var(--font-inter)` et `--font-display: var(--font-barlow)` (noms de variables au choix, tant que les deux tokens existent). Supprimer `--font-mono`, inutilisé.
- `.title-sport` ajoute `font-family: var(--font-display)` ; poids 700.
- Chiffres tabulaires : la classe `.num` (`tabular-nums`) sur les tableaux, statistiques et scores. Inter les fournit ; les scores en Barlow Condensed sont centrés dans une boîte de largeur fixe, donc l'alignement tient même sans `tnum`.
- Échelle (mobile, puis `sm:`) : titre de page `text-3xl sm:text-4xl`, titre de section `text-xl`, score de carte `text-2xl`, score de détail match `text-6xl`, texte `text-sm` / `text-base`, métadonnées `text-xs text-muted`.
- `<html lang="fr">`.

## 3. Navigation publique

Un groupe de routes `app/(public)/layout.tsx` porte l'en-tête et la navigation.

### En-tête (toutes tailles)

`header` collant (`sticky top-0 z-10 bg-background/95 border-b border-border`), hauteur 56 px : logo à gauche (lien vers `/`), nom « FOOT FIANARA » en `.title-sport text-lg`. Sur desktop, la navigation horizontale est dans cet en-tête, à droite.

Logo : `Logo/logo foot fianara.png` copié en `public/logo.png`, affiché par `next/image` en 32 × 32 dans un carré blanc `rounded-sm bg-foreground p-0.5` (le PNG a un fond blanc). C'est la seule couleur de la page en dehors des logos de clubs, ce qui est conforme (« la couleur vient des logos »). Plus tard : une version SVG blanche détourée.

### Mobile (< 768 px) : barre basse

`nav` fixe en bas (`fixed inset-x-0 bottom-0 bg-surface border-t border-border`, `pb-[env(safe-area-inset-bottom)]`), 5 entrées de largeur égale, chacune ≥ 56 px de haut : icône 20 px au-dessus d'un libellé `text-[11px] uppercase`.

| Entrée     | Route         | Actif quand le chemin commence par |
| ---------- | ------------- | ---------------------------------- |
| Accueil    | `/`           | `/` exact                          |
| Classement | `/classement` | `/classement`                      |
| Matchs     | `/matchs`     | `/matchs`                          |
| Clubs      | `/clubs`      | `/clubs`                           |
| Joueurs    | `/joueurs`    | `/joueurs`, `/statistiques`        |

Statistiques n'a pas sa propre entrée : la page Joueurs et la page Statistiques partagent deux onglets en haut « Joueurs | Statistiques » (même style que `DivisionTabs`). Pas de menu « Plus », pas de JS de menu.

État actif : texte et icône `text-foreground` + trait `h-0.5 bg-foreground` en haut de l'entrée ; inactif `text-muted`. `aria-current="page"` sur l'actif. Le `main` reçoit `pb-20 md:pb-0` pour ne pas passer sous la barre.

La détection d'actif demande `usePathname` : un petit composant client `NavLinks` utilisé par les deux navigations, le reste du layout reste serveur.

### Desktop (≥ 768 px)

Barre basse masquée (`md:hidden`). Les mêmes 6 liens (Statistiques ajouté) en ligne dans l'en-tête, `text-sm uppercase font-semibold`, actif souligné (`border-b-2 border-foreground`), inactif `text-muted hover:text-foreground`.

### Icônes

Pas de bibliothèque installée : 5 SVG inline dans `app/_components/icons.tsx` (trait 1.75, `stroke="currentColor"`, `aria-hidden`), dessinés simplement : maison, liste à rangs (classement), calendrier, écusson, silhouette. Jamais d'emoji.

## 4. Composants à créer

Dans `app/_components/` (pas dans `ui/`, réservé aux primitives). Tous serveur sauf mention.

### 4.1 `MatchCard`

```ts
type MatchCardProps = {
  id: number;
  home: { name: string; shortName: string; logoUrl: string | null };
  away: { name: string; shortName: string; logoUrl: string | null };
  kickoffAt: Date;
  stadium: string;
  status: "SCHEDULED" | "PLAYED" | "POSTPONED" | "FORFEIT";
  homeGoals: number | null;
  awayGoals: number | null;
  division?: string; // "D1", affiché en Badge si fourni (accueil, toutes divisions)
  matchday?: number;
};
```

`Card` cliquable entière (`Link` vers `/matchs/[id]`, `hover:border-foreground transition-colors`). Grille 3 colonnes `grid grid-cols-[1fr_auto_1fr] items-center gap-2` :

- gauche : `ClubCrest` 32 px au-dessus du `shortName` (centré, `truncate`) ;
- centre : selon le statut
  - joué / forfait : score `font-display text-2xl .num` « 2 – 1 », chaque nombre dans `w-6 text-center` ;
  - programmé : heure « 15:00 » `font-display text-2xl` ;
  - reporté : `Badge` « Reporté » ;
- droite : écusson + nom de l'extérieur.

Ligne de pied `text-xs text-muted` : « sam. 17 janv. · Ampasambazaha » ; `Badge` « Forfait » si forfait. Le vainqueur n'est pas coloré : le nom du perdant passe en `text-muted`, c'est tout.

Dates : `Intl.DateTimeFormat("fr-FR", { timeZone: "Indian/Antananarivo" })`, toujours ce fuseau (serveur en UTC sur Vercel).

`aria-label` du lien : « Club A 2, Club B 1, samedi 17 janvier » (lecture claire du score).

### 4.2 `StandingsTable`

```ts
type StandingRow = {
  position: number;
  club: { id: number; name: string; shortName: string; logoUrl: string | null };
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalDiff: number;
  points: number;
};
type StandingsTableProps = {
  rows: StandingRow[];
  compact?: boolean; // accueil : Pos, Club, J, Diff, Pts seulement
  limit?: number; // accueil : 5 premiers
  promotion?: number; // nb de places de montée (4 en D2, D3 ; 0 en D1)
  relegation?: number; // nb de places de descente (4 en D1, D2 ; 0 en D3)
};
```

Utilise `Table`, `Th`, `Td`. Colonnes : Pos, Club, J, G, N, P, Diff, Pts.

**Tenir dans 360 px sans défilement horizontal** (328 px utiles avec `px-4`) :

- `table-fixed w-full` ; `Td`/`Th` en `px-1 sm:px-2` (surcharge par `className`).
- Largeurs : Pos `w-7`, chaque colonne numérique `w-7` (J, G, N, P), Diff `w-9`, Pts `w-8`, Club prend le reste (environ 120 px à 360 px).
- Club : `ClubCrest` 20 px + `shortName` sur mobile (`sm:hidden`), `name` à partir de `sm` (`hidden sm:inline`), `truncate`.
- Nombres alignés à droite, `.num`. Pts en `font-bold text-foreground`, autres colonnes `text-muted`. Diff signé : « +5 », « −2 » (vrai signe moins U+2212), « 0 ».
- En-têtes abrégés avec `<abbr title="Joués">J</abbr>`, etc.
- Zones : `border-l-2 border-foreground` sur les lignes de montée, `border-l-2 border-dashed border-muted` sur les lignes de descente ; une légende `text-xs text-muted` sous le tableau (« Trait plein : montée · Pointillé : descente »). Pas de couleur verte ou rouge.
- La ligne entière est un lien vers la fiche club (lien dans la cellule Club, la cellule couvre la zone tactile ≥ 44 px grâce à `py-3`).

### 4.3 `ClubCrest`

```ts
type ClubCrestProps = {
  name: string;
  shortName: string;
  logoUrl: string | null;
  size?: 20 | 32 | 48 | 96; // px, défaut 32
};
```

- Logo présent : `next/image` (Cloudinary, `width`/`height` = size, `object-contain`), `alt=""` car le nom du club est toujours affiché à côté (décoratif).
- Logo absent (BR-41) : cercle `rounded-full border border-border bg-surface` avec les 2 ou 3 premières lettres du `shortName` en `font-display uppercase text-muted`, taille de police proportionnelle (`size * 0.4`). Le cercle est la seule forme ronde du site : il distingue « pas de logo » d'un vrai logo.

### 4.4 `PlayerCard`

```ts
type PlayerCardProps = {
  id: number;
  firstName: string;
  lastName: string;
  photoUrl: string | null;
  position: string; // « Attaquant »
  shirtNumber: number | null;
  club?: { name: string; shortName: string; logoUrl: string | null };
  suspended?: boolean;
};
```

Ligne cliquable (pas une grande carte, la liste peut compter 800 joueurs) : `Link` vers `/joueurs/[id]`, `flex items-center gap-3 min-h-14 border-b border-border`.
Numéro en `font-display text-xl .num w-8 text-center`, photo 40 px `rounded-sm` (ou carré `bg-surface` avec initiales), puis nom (`prénom` en `text-muted text-xs` au-dessus de `NOM` en `font-semibold uppercase`), puis à droite poste `text-xs text-muted` et `ClubCrest` 20 px. `Badge inverted` « Suspendu » si `suspended`.

### 4.5 `StatList`

```ts
type StatListProps = {
  title: string; // « Buteurs »
  unit: string; // « buts », lu par les lecteurs d'écran
  rows: {
    player: { id: number; name: string };
    club: { shortName: string; logoUrl: string | null; name: string };
    value: number;
  }[];
  limit?: number; // 5 sur l'accueil/club, 20 sur Statistiques
  emptyText: string;
};
```

`Card` avec titre `.title-sport text-xl`, puis `<ol>` : rang `.num text-muted w-6`, nom (lien fiche joueur), `ClubCrest` 20 + shortName `text-xs text-muted`, valeur à droite `font-display text-xl .num`. Le premier de la liste n'a pas de mise en avant spéciale (pas de médaille, pas de couronne). Égalités : même rang affiché.

### 4.6 `DivisionTabs`

```ts
type DivisionTabsProps = {
  items: { label: string; href: string }[]; // ex. { label: "D2", href: "/classement?division=D2" }
  active: string; // label actif
  ariaLabel: string; // « Divisions »
};
```

Props génériques volontairement : le même composant sert aux onglets « Joueurs | Statistiques ». La page construit les `href` (et conserve ses autres paramètres, ex. `journee`).

Liens simples (pas d'état client : la page reste serveur et partageable) dans un `nav aria-label={ariaLabel}`, `aria-current="page"` sur l'actif. Style : rangée `grid grid-flow-col auto-cols-fr` dans une bordure `border border-border rounded-sm`, chaque onglet `min-h-11 flex items-center justify-center font-display uppercase` ; actif `bg-foreground text-background`, inactif `text-muted hover:text-foreground`. Division par défaut : D1 (ordre par `level`).

### 4.7 `EmptyState`

```ts
type EmptyStateProps = {
  title: string;
  text?: string;
  action?: { label: string; href: string };
};
```

`Card` avec `border-dashed`, texte centré, titre `font-semibold`, texte `text-sm text-muted`, `ButtonLink secondary` optionnel. Pas d'illustration ni d'icône géante.

## 5. Pages

Toutes : `main` avec `mx-auto max-w-5xl px-4 py-6 space-y-6`, titre `h1.title-sport`. Pages rendues côté serveur. Saison affichée = saison en cours (la plus récente) ; pas de sélecteur de saison au MVP.

**État « saison sans match »** commun : si la saison n'a encore aucun match programmé, chaque page qui en dépend affiche un `EmptyState` « Le calendrier n'est pas encore publié » + texte « Les matchs apparaîtront ici dès que l'organisation les aura programmés. ». Si aucune saison n'existe : même message, sans onglets.

Erreur de chargement : `error.tsx` dans `(public)` → `EmptyState` « Impossible de charger la page » + bouton « Réessayer » (`reset`). `not-found.tsx` → « Page introuvable » + lien Accueil.

Chargement : `loading.tsx` avec des rectangles `bg-surface rounded-md` aux dimensions des cartes, sans animation `pulse` (règle « rien qui bouge en continu »).

### 5.1 Accueil `/` (T20)

1. Bandeau d'annonce (V1, réserver la place : rien au MVP).
2. **Prochains matchs** : titre de section + lien « Calendrier » à droite (`text-sm text-muted`). 4 prochains `MatchCard` (toutes divisions, `division` affiché), triés par `kickoffAt`. Mobile : pile `space-y-3` ; `md:grid-cols-2`.
   Vide : « Aucun match programmé ».
3. **Derniers résultats** : 4 derniers matchs joués ou forfait, même rendu. Vide : « Aucun résultat pour l'instant ».
4. **Classement** : `DivisionTabs` (liens `/?division=D2`) + `StandingsTable compact limit={5}` + `ButtonLink secondary` « Classement complet ». Vide : tableau avec tous les clubs à 0 si la division a des clubs ; sinon `EmptyState`.

Desktop (`lg`) : 2 colonnes, matchs à gauche (`lg:col-span-2`), classement à droite.

Données : matchs (clubs, logos, stade, statut, score), classement calculé (T16).

### 5.2 Classement `/classement` (T20)

1. `h1` « Classement » + sous-titre `text-sm text-muted` : nom de la saison, « Journée 7 » (dernière journée jouée).
2. `DivisionTabs`.
3. `StandingsTable` complet (12 lignes), `promotion`/`relegation` selon la division (D1 : 0/4, D2 : 4/4, D3 : 4/0).
4. Légende des zones + rappel du départage `text-xs text-muted` (« Égalité : différence de buts, buts marqués, confrontation directe »).

Vide : avant le premier match, le tableau s'affiche avec tous les clubs à 0, triés par nom, et une ligne `text-sm text-muted` « Aucun match joué ». Division sans club : `EmptyState`.

### 5.3 Calendrier / résultats `/matchs` (T20)

1. `h1` « Matchs ».
2. `DivisionTabs`.
3. Sélecteur de journée : rangée défilante horizontalement **seulement pour ce sélecteur** (`overflow-x-auto snap-x`, c'est une liste de boutons, pas un tableau) de liens « J1 … J22 », `min-w-11 min-h-11`, actif `bg-foreground text-background`. Liens `?division=D1&journee=7`. Journée par défaut : la première journée ayant un match non joué, sinon la dernière.
   Plus 2 liens texte « ‹ Journée précédente » / « Journée suivante › » sous la liste des matchs, pour éviter de défiler le sélecteur.
4. Matchs de la journée groupés par date : intertitre `text-xs uppercase text-muted` (« Samedi 17 janvier »), puis `MatchCard` (sans `division`, déjà filtrée).

Vide : « Le calendrier n'est pas encore publié » (voir état commun).

### 5.4 Détail match `/matchs/[id]` (T21)

1. Lien retour « ‹ Journée 7 » vers `/matchs?division=…&journee=…`.
2. **En-tête score** (`Card` `py-6`) : `Badge` division + « Journée 7 » ; grille `grid-cols-[1fr_auto_1fr]` : `ClubCrest` 48 (96 à `sm`), nom complet (`font-display uppercase text-lg`, lien fiche club), au centre score `font-display text-6xl .num` « 2 – 1 » ou heure si programmé ; `Badge` statut (Programmé, Reporté, Forfait ; rien si Joué).
3. Métadonnées `dl` en 2 colonnes `text-sm` : Date (« samedi 17 janvier 2026 »), Coup d'envoi (« 15:00 »), Stade.
4. **Événements** (si joué) : `Card` avec liste chronologique. Chaque ligne : minute `.num text-muted w-10` (« 67' »), marqueur, texte. Les événements du club domicile sont alignés à gauche, ceux de l'extérieur à droite (`text-right flex-row-reverse` sur `sm:` ; sur mobile tout à gauche avec `shortName` du club en `text-xs text-muted` pour lever l'ambiguïté).
   Marqueurs, sans couleur ni emoji :
   - But : texte « BUT » en `Badge inverted` ; ligne « Rakoto J. » puis « passe : Rabe A. » en `text-xs text-muted` ;
   - CSC : `Badge` « CSC », « Rakoto J. (c.s.c.) » ;
   - Jaune : rectangle 10 × 14 px `rounded-[1px] border border-foreground` (vide) + `sr-only` « Carton jaune » ;
   - Rouge : même rectangle plein `bg-foreground` + `sr-only` « Carton rouge ».
     Une légende `text-xs text-muted` sous la liste explique les deux rectangles.
5. **Résumé** sous les événements, 3 blocs : Buteurs, Passeurs, Cartons, par club (utile en lecture rapide). Facultatif si le temps manque : la liste chronologique suffit.

Forfait : pas de liste d'événements, texte « Victoire 3-0 sur tapis vert : forfait de Club X ». Programmé/reporté : bloc événements remplacé par « Le résultat sera publié après le match. » / « Match reporté, nouvelle date à venir. ».

### 5.5 Clubs `/clubs` (T21)

1. `h1` « Clubs ».
2. `DivisionTabs` (clubs de la division dans la saison en cours).
3. Grille `grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3` de `Card` liens : `ClubCrest` 48 centré, nom `font-semibold text-sm` sur 2 lignes max (`line-clamp-2`), quartier `text-xs text-muted`. Ordre alphabétique.

Vide : `EmptyState` « Aucun club inscrit dans cette division ».

### 5.6 Fiche club `/clubs/[id]` (T21)

1. En-tête : `ClubCrest` 96, nom `h1.title-sport`, `Badge` division, ligne `text-sm text-muted` « Fondé en 1998 · Quartier Tanana ». Photo d'équipe (si présente) en `next/image` pleine largeur `rounded-md aspect-[16/9] object-cover` sous l'en-tête.
2. **Infos** : `Card` avec `dl` : Président, Entraîneur, Couleurs (texte, ex. « Bleu et blanc », pas de pastille de couleur), Téléphone (`tel:`), Facebook (lien externe `rel="noopener"`). Les lignes vides sont omises (BR-43).
3. **Saison** : position au classement + mini-ligne J, G, N, P, Diff, Pts (`StandingsTable compact` d'une seule ligne, ou un `dl` en 6 blocs `.num`).
4. **Matchs** : 3 derniers résultats et 3 prochains `MatchCard`.
5. **Effectif** : liste de `PlayerCard` (sans `club`), groupée par poste (Gardiens, Défenseurs, Milieux, Attaquants), triée par numéro. Compteur « 18 joueurs ». Vide : « Effectif non renseigné ».

Si le temps manque (ROADMAP), garder 1, 2 et 5.

### 5.7 Joueurs `/joueurs` (T22)

1. Onglets « Joueurs | Statistiques ».
2. Recherche : `form` GET avec `input type="search" name="q"` (`min-h-11 w-full bg-surface border border-border rounded-sm px-3`, `label` visible `sr-only` « Rechercher un joueur ») + filtre club en `select name="club"` (option « Tous les clubs »). Fonctionne sans JS ; recherche sur nom et prénom, insensible à la casse et aux accents.
3. Résultats : liste de `PlayerCard` avec club. Tri par nom. Pagination « Plus de joueurs » (lien `?page=2`) au-delà de 50.

Vide : « Aucun joueur ne correspond à « xyz » » + lien « Effacer la recherche ». Aucun joueur en base : « Aucun joueur enregistré ».

### 5.8 Fiche joueur `/joueurs/[id]` (T22)

1. En-tête (`Card`) : numéro géant `font-display text-6xl .num text-muted` à gauche, photo détourée/carrée 96 px (`rounded-md`, ou bloc initiales), prénom `text-muted`, `NOM` en `h1.title-sport text-4xl`, poste + `ClubCrest` 20 + club actuel (lien).
2. **Suspension** (si active, BR-31) : `Card` `border-foreground` en tête de page, sous l'en-tête : « Suspendu · 1 match restant sur 2 » + motif `text-sm text-muted`. C'est l'information la plus importante quand elle existe, d'où le contour blanc.
3. **Profil** : `dl` grille `grid-cols-2 sm:grid-cols-4` : Âge (« 24 ans », date en `text-xs text-muted`), Taille (« 1,78 m »), Pied fort, Nationalité. Champs vides omis.
4. **Saison** : 4 blocs statistiques `grid-cols-4` : Matchs, Buts, Passes, Cartons (jaunes / rouges en « 3 / 0 »). Chaque bloc : valeur `font-display text-3xl .num`, libellé `text-xs uppercase text-muted`.
5. **Parcours** (BR-40) : 3 derniers clubs, liste : `ClubCrest` 32, nom du club, saison et numéro porté `text-xs text-muted`. Le club actuel en premier. Un seul club : la liste n'a qu'une ligne, pas de message.

### 5.9 Statistiques `/statistiques` (T22)

1. Onglets « Joueurs | Statistiques ».
2. `DivisionTabs`.
3. Trois `StatList` (`limit={20}`) : Buteurs (« buts », CSC exclus), Passeurs (« passes »), Cartons (valeur = jaunes, rouges en `text-xs` à côté ; tri rouges puis jaunes). Mobile : pile ; `lg:grid-cols-3`.

Vide (aucun match joué) : chaque `StatList` affiche « Aucune donnée pour l'instant ».

## 6. Écran admin : saisie d'un match (T12, T14, T15)

Route `/admin/matchs/[id]`, accessible depuis une liste de matchs par journée (même rendu que 5.3, sans `Link` public). Conçu pour un smartphone en 4G sur le bord du terrain : une colonne, gros champs, enregistrement explicite (pas d'autosave).

Droits (décision 60) : l'assistant voit et enregistre uniquement la section **Résultat**. Les sections **Programmation** et **Forfait** ne sont rendues que pour ADMIN et SUPER_ADMIN, et l'action serveur revérifie le rôle.

### Structure de haut en bas

1. **En-tête** : retour « ‹ Journée 7 », `Badge` statut, « D1 · Journée 7 », les deux clubs en `ClubCrest` 32 + nom. Ligne `text-xs text-muted` : « Dernière modification : 17/01 18:42 par Admin » (décision 38).

2. **Résultat** (`Card`, `form` avec action serveur) :
   - Score : deux compteurs côte à côte, un par club (nom court au-dessus). Chaque compteur : bouton « − », valeur `font-display text-5xl .num w-12 text-center`, bouton « + » ; boutons `Button secondary` carrés `size-12`, `aria-label="Retirer un but à Club A"`. Valeur réelle dans un `input type="number" min=0 inputMode="numeric"` (les boutons ne sont qu'un raccourci).
   - Contrôle BR-27 en direct : ligne `text-sm` « Buts saisis : 2 / 3 ». Tant que le compte d'événements But + CSC ne correspond pas au score, la ligne passe en `text-foreground font-semibold` avec le texte « Il manque 1 but pour Club A » et le bouton Enregistrer reste actif mais l'action serveur refuse avec ce même message (validation côté serveur obligatoire, le client n'est qu'une aide).
   - **Événements** : liste de lignes, une par événement, plus le bouton « + Ajouter un événement » (`Button secondary w-full`). Chaque ligne est un bloc `border-b border-border py-3 space-y-2` :
     - Type : 4 boutons radio en rangée façon onglets (`fieldset` + `legend sr-only`) : But, CSC, Jaune, Rouge.
     - Club : 2 boutons radio (shortName domicile / extérieur). Pour une CSC, c'est le club **du joueur** ; le but est compté pour l'adversaire (l'aide sous le champ le dit : « But compté pour Club B »).
     - Minute : `input type="number" inputMode="numeric" min=1 max=130 w-20`, placeholder « 67 ».
     - Joueur : `select` limité à l'effectif du club choisi, options « 9 · Rakoto Jean » triées par numéro.
     - Passeur (seulement pour But) : `select` même club, option vide « Sans passeur », le buteur exclu.
     - Bouton « Supprimer » `text-sm text-muted underline min-h-11`, `aria-label="Supprimer l'événement 3"`.
   - Les lignes sont triées par minute à l'affichage après enregistrement, pas pendant la saisie (évite qu'une ligne saute sous le doigt).
   - Barre d'action collante en bas de l'écran (`sticky bottom-0 bg-background border-t border-border py-3`) : `Button primary w-full` « Enregistrer et publier ». Le texte rappelle que la publication est immédiate (BR-26).
   - Composant client unique `MatchResultForm` (état local des lignes, `useActionState` pour l'erreur et le succès). Les effectifs des deux clubs sont passés en props par la page serveur : aucun appel réseau pendant la saisie.
   - Remplacements (SUB) et compositions : hors de cet écran (T13).

3. **Forfait** (ADMIN+, `Card`) : `Button secondary w-full` « Déclarer un forfait » ouvre un `<dialog>` natif : « Quel club est forfait ? » avec deux boutons (un par club), puis texte de conséquence « Club A perd 0-3. Les événements saisis seront supprimés. » et « Confirmer le forfait » (`primary`) / « Annuler ». Sur un match déjà en forfait : bouton « Annuler le forfait » (le match repasse en Programmé, score vidé).

4. **Programmation** (ADMIN+, `Card`, `form` séparé) : Date (`input type="date"`), Heure (`input type="time"`), Stade (`select` des stades + lien « Gérer les stades »), case « Match reporté » (statut POSTPONED ; décocher et changer la date le reprogramme). Bouton « Enregistrer la programmation ». Les heures saisies sont interprétées en heure de Madagascar.

### États

- Succès : message `role="status"` en haut de la `Card` : « Résultat publié. Classement mis à jour. », sans toast animé.
- Erreur de validation : `role="alert"`, texte précis (« Minute manquante pour l'événement 2 », « Le buteur doit appartenir à un des deux clubs »), le champ concerné reçoit `aria-invalid` et `border-foreground`. Aucune donnée saisie n'est perdue en cas d'erreur (l'état client est conservé).
- Erreur réseau : « Envoi impossible, vérifiez la connexion puis réessayez. » ; le bouton reste disponible.
- Envoi en cours : bouton désactivé, texte « Enregistrement… ».
- Effectif vide pour un club : le `select` Joueur affiche « Aucun joueur dans l'effectif » et la ligne ne peut pas être enregistrée ; lien vers la gestion de l'effectif (admin).

## 7. Interdits rappelés (UI_UX_GUIDELINES.md)

Aucun dégradé, halo, texte dégradé, emoji, badge « Nouveau », pastille qui pulse, `animate-pulse`/`animate-ping`/`animate-spin` continu. Aucune couleur hors des 5 tokens (exceptions : logo du site et logos de clubs). Pas d'élément de paris ni d'abonnement. Rayons limités à `rounded-sm` et `rounded-md` (+ `rounded-full` pour l'écusson par défaut). Animations : `transition-colors` au survol uniquement, et respecter `motion-reduce`.

## 8. Accessibilité et responsive (vérifications)

- Cibles tactiles ≥ 44 px (`min-h-11`), barre basse ≥ 56 px.
- Tableau de classement et statistiques lisibles à 360 px sans défilement horizontal (tester à 360 × 640).
- Tous les liens et champs atteignables au clavier, focus visible (global).
- Titres hiérarchisés : un `h1` par page, `h2` par section.
- Scores et cartons ont une alternative texte (`aria-label`, `sr-only`) ; aucune information portée par la seule forme.
- Points de rupture : défaut mobile, `sm` 640, `md` 768 (bascule de navigation), `lg` 1024 (2-3 colonnes).
- Images : `next/image` avec `sizes`, logos ≤ 96 px, photos ≤ 400 px de large (4G, T24).

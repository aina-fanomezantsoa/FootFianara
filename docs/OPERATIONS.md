# Foot Fianara : exploitation (installation, sauvegarde, déploiement)

Site du championnat de football de Fianarantsoa : Next.js 16, Prisma 7 + PostgreSQL (Neon), Auth.js v5, Cloudinary, hébergé sur Vercel (offres gratuites).

## Prérequis

- Node.js 22 (version utilisée par la CI)
- Git Bash (Windows) pour les scripts de sauvegarde
- Comptes gratuits : [Neon](https://neon.tech), [Cloudinary](https://cloudinary.com), [Vercel](https://vercel.com)
- Client PostgreSQL 18 (`pg_dump`, `pg_restore`) pour les sauvegardes, voir plus bas

## Installation locale

```bash
git clone <url-du-dépôt> && cd FootFianara
npm install                 # lance aussi `prisma generate`
cp .env.example .env        # puis remplir .env
npx prisma migrate dev      # applique les migrations à la base de DATABASE_URL
npx prisma db seed          # crée le super admin et les données de test
npm run dev                 # http://localhost:3000
```

## Variables d'environnement

| Variable                | Rôle                                                                    | Où la trouver                                                  |
| ----------------------- | ----------------------------------------------------------------------- | -------------------------------------------------------------- |
| `DATABASE_URL`          | Connexion PostgreSQL                                                    | Neon > projet > Connect (chaîne « pooled », `sslmode=require`) |
| `AUTH_SECRET`           | Signature des sessions Auth.js                                          | `npx auth secret` ou `openssl rand -base64 32`                 |
| `SEED_ADMIN_PASSWORD`   | Mot de passe du super admin créé par le seed                            | À choisir (long, unique)                                       |
| `CLOUDINARY_CLOUD_NAME` | Upload des images (T09)                                                 | Cloudinary > Dashboard > Product Environment Credentials       |
| `CLOUDINARY_API_KEY`    | idem                                                                    | idem                                                           |
| `CLOUDINARY_API_SECRET` | idem, secret serveur uniquement                                         | idem                                                           |
| `AUTH_URL`              | Inutile sur Vercel (Auth.js v5 détecte l'hôte via `VERCEL`) et en local | Seulement si hébergement hors Vercel : URL publique du site    |

`.env` n'est jamais commité (voir `.gitignore`).

## Commandes

| Commande                             | Effet                                 |
| ------------------------------------ | ------------------------------------- |
| `npm run dev`                        | Serveur de développement              |
| `npm run lint` / `npm run typecheck` | ESLint / TypeScript                   |
| `npm test`                           | Tests unitaires Vitest                |
| `npm run format:check`               | Vérification Prettier                 |
| `npm run build`                      | Build de production                   |
| `npm run db:backup`                  | Sauvegarde de la base dans `backups/` |
| `npm run db:restore -- <fichier>`    | Restauration d'une sauvegarde         |

## Migrations

- Développement : `npx prisma migrate dev --name <nom>` crée et applique une migration (à commiter dans `prisma/migrations/`).
- Production : le build Vercel n'applique pas les migrations. Avant de déployer un changement de schéma, faire une sauvegarde puis lancer `npx prisma migrate deploy` avec `DATABASE_URL` pointant sur la base de production.

## Sauvegarde et restauration (T25)

Les scripts lisent `DATABASE_URL` depuis l'environnement ou depuis `.env`, et passent automatiquement par l'hôte direct Neon (sans `-pooler`), comme le recommande Neon pour `pg_dump`.

```bash
npm run db:backup                               # -> backups/AAAA-MM-JJ.dump
npm run db:restore -- backups/2026-11-15.dump   # demande de taper OUI
```

La restauration **remplace** les tables existantes de la base visée. Pour tester une sauvegarde sans risque, restaurer dans une branche Neon (Neon > Branches > Create branch) en mettant l'URL de cette branche dans `DATABASE_URL` le temps de la commande.

### Installer pg_dump sous Windows

La base Neon tourne en **PostgreSQL 18** (vérifié avec `SHOW server_version;`). `pg_dump` refuse de sauvegarder un serveur plus récent que lui : il faut le client **18** (ou plus).

1. Télécharger l'installeur EDB PostgreSQL 18 pour Windows : https://www.postgresql.org/download/windows/
2. Dans l'installeur, ne cocher que **Command Line Tools** (le serveur local est inutile).
3. Ajouter `C:\Program Files\PostgreSQL\18\bin` au PATH Windows (Paramètres > Variables d'environnement), puis rouvrir Git Bash.
4. Vérifier : `pg_dump --version` doit afficher 18.x.

Lancer `npm run db:*` depuis **Git Bash** : npm exécute `bash`, qui n'est trouvé que si Git Bash est dans le PATH.

### Sauvegarde automatique hebdomadaire

Le workflow `.github/workflows/backup.yml` lance `scripts/backup.sh` chaque lundi à 02:00 UTC (et à la demande via l'onglet Actions > Weekly Database Backup > Run workflow). Le dump est conservé 90 jours comme artefact de l'exécution.

- Prérequis : secret de dépôt `DATABASE_URL` (GitHub > Settings > Secrets and variables > Actions).
- Récupérer une sauvegarde : Actions > exécution voulue > Artifacts > télécharger, dézipper, puis `npm run db:restore -- <fichier>.dump`.
- Si Neon passe à une version majeure supérieure, changer `PG_MAJOR` dans le workflow.

## Déploiement Vercel

Chaque push sur `main` déploie en production ; chaque autre branche obtient une URL de prévisualisation.

1. Vercel > Add New > Project > importer le dépôt GitHub (framework détecté : Next.js, réglages par défaut).
2. Settings > Environment Variables, pour **Production** (et Preview si utilisé) : `DATABASE_URL`, `AUTH_SECRET`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`. Pas besoin de `AUTH_URL` ni de `SEED_ADMIN_PASSWORD`.
3. Utiliser un `AUTH_SECRET` différent de celui du local.
4. Après toute modification de variable : Deployments > dernier déploiement > Redeploy.

Limite : l'offre Vercel gratuite (Hobby) interdit l'usage commercial ; passer à une offre payante si un sponsor finance le site.

## CI

`.github/workflows/quality-gate.yml` exécute à chaque push et pull request : ESLint, TypeScript, Prettier, Vitest, `npm audit`, build, plus une analyse CodeQL. Le build ne demande aucune variable d'environnement aujourd'hui (pages dynamiques, la base n'est pas lue au build). Si une page lit un jour la base ou Cloudinary pendant le build, ajouter les secrets correspondants au job.

## Checklist de mise en ligne (T26)

- [ ] CI verte sur `main`
- [ ] Variables de production renseignées dans Vercel (liste ci-dessus), `AUTH_SECRET` propre à la production
- [ ] Migrations appliquées en production : `npx prisma migrate deploy`
- [ ] Super admin créé (seed) et mot de passe changé ; données de test retirées, vraies données saisies (T25)
- [ ] Sauvegarde manuelle faite **et restaurée avec succès** dans une branche Neon (critère T25 : export restaurable)
- [ ] Secret `DATABASE_URL` ajouté dans GitHub et workflow de sauvegarde lancé une fois à la main avec succès
- [ ] Connexion admin testée sur l'URL de production ; un visiteur non connecté est refusé sur `/admin`
- [ ] Upload d'un logo testé en production (Cloudinary)
- [ ] Contrôle manuel sur téléphone en 4G (pages publiques, classement)
- [ ] Domaine : URL `*.vercel.app` ou domaine personnalisé configuré dans Vercel > Settings > Domains

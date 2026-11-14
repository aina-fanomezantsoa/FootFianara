# TECHNICAL_ARCHITECTURE — Proposition à valider

## Principe

Une seule application Next.js (App Router, TypeScript) qui sert le site public et l'administration. Pas de backend séparé, pas de microservices : un seul projet, un seul déploiement, géré par une seule personne.

## Stack

| Couche            | Choix                                                                           | Raison                                                           |
| ----------------- | ------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Framework         | Next.js + TypeScript                                                            | Choisi par le client ; pages serveur légères pour la 4G          |
| Base de données   | PostgreSQL gratuit chez Neon                                                    | Gratuit, ne se met pas en pause longue comme d'autres offres     |
| Accès aux données | Prisma                                                                          | Migrations et typage simples                                     |
| Authentification  | Auth.js (email + mot de passe), 3 comptes                                       | Suffisant, pas d'inscription publique                            |
| Images            | Cloudinary (offre gratuite)                                                     | Redimensionne et compresse automatiquement les photos pour la 4G |
| Hébergement       | Vercel (offre gratuite)                                                         | Déploiement Next.js direct depuis Git                            |
| Style             | Tailwind CSS                                                                    | Rapide, léger                                                    |
| Tests             | Vitest pour le calcul du classement et des suspensions ; contrôle manuel mobile | Le classement est le point sensible                              |

Limite connue : les offres gratuites ont des quotas. Ils suffisent pour un site local, mais l'usage commercial de Vercel gratuit est interdit ; si un sponsor paie plus tard, il faudra passer à une offre payante.

## Fonctionnement

- **Public** : pages rendues côté serveur avec mise en cache ; elles se rafraîchissent quand l'assistant enregistre un résultat. Aucune API publique nécessaire.
- **Admin** : pages protégées par rôle sous `/admin`. Les écritures passent par des actions serveur qui vérifient le rôle avant chaque opération.
- Les règles (BR-xx) vivent dans un seul module `lib/rules`, testé.

## Structure des dossiers

```
app/
  (public)/            accueil, classement, calendrier, match/[id], clubs/[id], joueurs/[id], stats
  admin/               tableau de bord, clubs, joueurs, matchs, saisie, stades, comptes, paramètres
  api/auth/            Auth.js
lib/
  rules/               classement, suspensions, validation de saisie
  db.ts                client Prisma
  auth.ts              rôles et gardes
prisma/schema.prisma   + migrations
components/            cartes de match, tableau de classement, fiche joueur
docs/
```

## Matrice d'accès aux actions serveur

Identique à USER_ROLES.md : chaque action serveur appelle `requireRole()` avec le rôle minimum.

## Sécurité

Mots de passe hachés (bcrypt), sessions par cookie sécurisé, validation de toutes les saisies côté serveur, variables d'environnement hors du dépôt Git, limite de taille et de type pour les images.

## Déploiement et sauvegardes

Branche `main` → déploiement automatique Vercel ; environnement de test via branche. Sauvegarde : export hebdomadaire de la base (script `pg_dump` manuel au démarrage), à automatiser ensuite.

## Évolutions prévues sans refonte

Coupes (nouvelles tables `Cup`, `CupMatch`), comptes visiteurs, PWA hors ligne.

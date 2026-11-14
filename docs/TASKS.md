# TASKS — Plan de développement MVP

Agents : PO = chef de projet, ARCH = architecte, DB = base de données, BE = backend, FE = frontend, UX = designer, QA = tests, OPS = déploiement.
Difficulté : F facile, M moyenne, D difficile. Un seul développeur : les sprints se font dans l'ordre.

## Sprint 1 — Initialisation

| ID  | Tâche                                                | Resp. | Dépend de | Diff. | Validation                         |
| --- | ---------------------------------------------------- | ----- | --------- | ----- | ---------------------------------- |
| T01 | Projet Next.js + TypeScript + Tailwind, dépôt Git    | ARCH  |           | F     | `npm run dev` fonctionne           |
| T02 | Base Neon + Prisma, schéma MVP et première migration | DB    | T01       | M     | Migration appliquée, tables créées |
| T03 | Déploiement Vercel avec variables d'environnement    | OPS   | T01       | F     | Page d'accueil vide en ligne       |
| T04 | Données de test (3 divisions, 12 clubs, joueurs)     | DB    | T02       | F     | Script de seed exécutable          |

## Sprint 2 — Comptes et rôles

| T05 | Auth.js, connexion email + mot de passe | BE | T02 | M | Connexion et déconnexion OK |
| T06 | Gardes de rôles `requireRole` et limite de 3 comptes | BE | T05 | M | Un assistant ne peut pas ouvrir une page admin |
| T07 | Gestion des comptes (super admin) | FE/BE | T06 | F | Création et suppression de comptes |

## Sprint 3 — Données de base (admin)

| T08 | CRUD saisons, divisions, stades | BE/FE | T06 | F | Création et modification OK |
| T09 | CRUD clubs + import d'images glisser-déposer (Cloudinary) + logo par défaut | BE/FE | T08 | M | Club sans logo affiche le logo par défaut |
| T10 | CRUD joueurs, effectif ≤ 24, numéro unique | BE/FE | T09 | M | 25e joueur refusé |

## Sprint 4 — Matchs

| T11 | Génération du calendrier aller-retour d'une division | BE | T08 | D | 12 clubs donnent 132 matchs, chaque paire deux fois |
| T12 | Modification date, heure, stade, report | FE/BE | T11 | F | Calendrier modifiable |
| T13 | Saisie des compositions | FE/BE | T10 | M | Compositions enregistrées |
| T14 | Saisie du résultat : score, buteurs, passeurs, cartons | FE/BE | T11 | D | Score cohérent avec les buts (BR-27) ; publié directement |
| T15 | Forfait 0-3 et correction par l'admin | BE | T14 | M | Points corrects ; dernière modification enregistrée |

## Sprint 5 — Classement et statistiques

| T16 | Module de classement (points, diff., départage) | BE | T14 | D | Tests Vitest sur les cas d'égalité |
| T17 | Buteurs, passeurs, cartons | BE | T14 | M | Totaux justes |
| T18 | Suspensions automatiques (5 jaunes ou 1 rouge) | BE | T14 | M | Alerte à l'admin ; affichage sur fiche |

## Sprint 6 — Site public

| T19 | Design system noir et blanc, composants | UX/FE | direction validée | M | Palette en variables |
| T20 | Accueil, classement, calendrier/résultats | FE | T16, T19 | M | Lisible à 360 px de large |
| T21 | Détail match, clubs, fiche club | FE | T20 | M | |
| T22 | Joueurs, fiche joueur, statistiques | FE | T17, T20 | M | 3 derniers clubs affichés |

## Sprint 7 — Tests et mise en ligne

| T23 | Tests du classement, des permissions, du calendrier | QA | tout | M | Plan de test passé |
| T24 | Test sur vrai smartphone en 4G, optimisation des images | QA/FE | T22 | M | Accueil chargé en moins de 3 s |
| T25 | Sauvegarde de la base et saisie de vraies données | OPS | T24 | F | Export restaurable |
| T26 | Mise en ligne | OPS | T25 | F | Site public accessible |

## V1 (après lancement)

Actualités, annonces, sponsors, statistiques par club, blessures, remplacements, mode clair, Facebook, À propos et Contact.

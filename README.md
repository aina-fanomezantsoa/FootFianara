# Foot Fianara : le championnat de football de Fianarantsoa, en ligne

[![CI](https://github.com/aina-fanomezantsoa/FootFianara/actions/workflows/quality-gate.yml/badge.svg)](https://github.com/aina-fanomezantsoa/FootFianara/actions/workflows/quality-gate.yml)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Statut](https://img.shields.io/badge/statut-en%20ligne-brightgreen)

<!-- TODO : ajouter une capture ou un GIF (accueil + classement) -->
![aperçu](docs/img/apercu.png)

## Le projet : problème et objectif

TODO : en 2-3 phrases, quel problème réel (qui consulte les résultats aujourd'hui ? combien de clubs, de joueurs ?) et pour qui.

## Fonctionnalités clés

- Classement calculé automatiquement à partir des résultats
- Génération du calendrier d'une saison
- Fiches clubs, joueurs et matchs, statistiques et suspensions
- Actualités et mode clair / sombre
- Espace d'administration avec rôles et accès protégé

## Stack technique

| Couche | Techno | Pourquoi ce choix |
| --- | --- | --- |
| Front + back | Next.js 16, React 19, TypeScript | Un seul projet pour le site public et l'admin |
| Données | PostgreSQL, Prisma | Typage de bout en bout |
| Authentification | Auth.js | Sessions et rôles |
| Images | Cloudinary | Stockage externe des logos et photos |
| Qualité | Vitest, ESLint, Prettier, GitHub Actions | Contrôles à chaque push |
| Hébergement | Vercel | Déploiement continu |

## Architecture

```
Visiteur ──► Site public ─┐
                          ├─► Logique métier (classement, calendrier, suspensions) ─► Base PostgreSQL
Admin ─────► Espace admin ┘                                                          └─► Images (CDN)
```

## Défis techniques et apprentissages

- Règles de classement et de suspensions isolées dans une couche métier testée unitairement
- Génération de calendrier équilibrée
- Contrôle d'accès par rôles sur toute l'administration
- Sauvegardes automatiques de la base

TODO : ajouter 1-2 anecdotes personnelles (un bug difficile, un choix revu).

## Résultats

- 15 fichiers de tests unitaires, CI complète (lint, types, tests, audit, build, analyse de sécurité)
- TODO : nombre d'utilisateurs, score Lighthouse

## Démo

**https://foot-fianara.vercel.app**

TODO : lien vers une courte vidéo de démonstration.

## À propos de moi

TODO : rôle recherché, LinkedIn, contact.

## Licence

TODO : choisir une licence (voir `RECRUITER_PLAN.md`).

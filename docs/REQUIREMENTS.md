# REQUIREMENTS — Cahier des charges fonctionnel

## MVP (obligatoire pour janvier)

| ID  | Fonction                | Critère d'acceptation                                                                                                               |
| --- | ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| M1  | Comptes staff (3 rôles) | Chaque rôle voit uniquement ses actions (USER_ROLES.md)                                                                             |
| M2  | Saisons, 3 divisions    | L'admin crée une saison et ses divisions                                                                                            |
| M3  | Clubs                   | Fiche : nom, logo (défaut si absent), couleurs, fondation, quartier, président, entraîneur, photo ; glisser-déposer pour les images |
| M4  | Joueurs                 | Fiche : photo, poste, numéro, naissance, taille, pied fort, nationalité, 3 derniers clubs ; maximum 24 par club                     |
| M5  | Stades                  | Ajout, modification, choix lors de la planification                                                                                 |
| M6  | Calendrier              | L'admin génère ou saisit les matchs (aller-retour) avec date, heure, stade                                                          |
| M7  | Saisie de match         | L'assistant saisit score, buteurs, passeurs, cartons ; publication immédiate                                                        |
| M8  | Classement automatique  | Calcul conforme à BR-11 à BR-12, recalculé après chaque saisie                                                                      |
| M9  | Statistiques            | Meilleurs buteurs, passeurs, cartons                                                                                                |
| M10 | Site public mobile      | Accueil (prochains matchs, derniers résultats, classement), Classement, Calendrier/résultats, Détail match, Clubs, Joueurs          |

## V1

Actualités (écrites par l'admin), bandeau d'annonces, sponsors, statistiques par club, suspensions et blessures, compositions et remplacements, mode sombre, lien Facebook, pages À propos et Contact, contacts des clubs.

## V2

Coupes, connexion facultative des visiteurs, galerie photo et vidéos (liens externes).

## V3

Mode hors ligne, application mobile.

## Exclus

Paiements, inscriptions en ligne, PDF, notifications, score en direct, comptes clubs, multilingue.

## Contraintes non fonctionnelles

- Mobile first, pages légères pour la 4G.
- Animations très discrètes ; design sobre, jamais générique (références et palette fournies par le client).
- Hébergement gratuit au démarrage.

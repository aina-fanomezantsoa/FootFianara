# DECISIONS — Championnat de Fianarantsoa

Statut : ✅ validé · 🟡 provisoire (à confirmer) · ❓ ouvert

## Série 1 — Vision et organisation (2026-11-13)

| #   | Sujet                  | Décision                                                                               | Statut |
| --- | ---------------------- | -------------------------------------------------------------------------------------- | ------ |
| 1   | Nom                    | « Championnat de Fianarantsoa » (nom définitif inconnu)                                | ❓     |
| 2   | Lieu                   | Stade Ampasambazaha (un seul stade)                                                    | ✅     |
| 3   | Rythme                 | Semestriel, début en janvier                                                           | ✅     |
| 4   | Taille                 | 3 divisions × 12 clubs pour la V1 (extensible)                                         | 🟡     |
| 5   | Public / objectif      | Fans de foot locaux : suivre infos et matchs, découvrir clubs et joueurs               | ✅     |
| 6   | Design                 | Style Premier League ; palette de couleurs fournie plus tard par le client             | 🟡     |
| 7   | Existant               | Page Facebook où sont diffusés les résultats                                           | ✅     |
| 8   | Format ligue           | Championnat tous contre tous, aller-retour, par division                               | ✅     |
| 8b  | Coupes                 | Des coupes existent (nombre et format à préciser)                                      | ❓     |
| 9   | Coupes                 | Demi-finales et finale en match unique                                                 | ✅     |
| 10  | Points                 | Victoire 3, nul 1, défaite 0                                                           | ✅     |
| 11  | Départage              | Différence de buts, puis buts marqués, puis confrontation directe, puis décision admin | ✅     |
| 12  | Promotion / relégation | Oui (nombre de places à préciser)                                                      | ✅     |
| 13  | Forfaits               | Défaite 0-3 pour le fautif, victoire 3-0 pour l'adversaire                             | ✅     |
| 14  | Discipline             | Cartons cumulés → suspension, décidée par la fédération                                | ✅     |
| 15  | Validation résultat    | L'arbitre                                                                              | ✅     |
| 16  | Calendrier             | Dates configurées par l'admin du site                                                  | ✅     |
| 17  | Saisie                 | Un assistant, depuis smartphone ou laptop                                              | ✅     |
| 18  | Audience technique     | 4G, surtout smartphones → mobile first, pages légères                                  | ✅     |
| 19  | Budget / hébergement   | À discuter avec l'admin                                                                | ❓     |

## Série 2 — Coupes, clubs, joueurs, matchs (2026-11-13)

| #   | Sujet                   | Décision                                                                                                                            | Statut |
| --- | ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ------ |
| 20  | Stades                  | L'admin crée et modifie les stades ; plusieurs possibles                                                                            | ✅     |
| 21  | Validation résultat     | Pas de validation par l'arbitre sur le site : le résultat saisi est publié directement (annule la ligne 15 pour le site)            | ✅     |
| 22  | Coupes : nombre         | À discuter avec l'admin                                                                                                             | ❓     |
| 23  | Coupes : format         | Phase de poules (prolongation + tirs au but en cas d'égalité) puis demi-finales et finale en match unique                           | 🟡     |
| 24  | Promotion/relégation    | 4 montent et 4 descendent entre divisions (confirmé)                                                                                | ✅     |
| 25  | Divisions               | D1, D2, D3                                                                                                                          | ✅     |
| 26  | Création des clubs      | Admin seulement ; pas de comptes clubs                                                                                              | ✅     |
| 27  | Fiche club              | Logo, couleurs, fondation, quartier, président, entraîneur, photo d'équipe, réseaux sociaux ; logo par défaut si absent             | ✅     |
| 28  | Images                  | Admin seul ; interface en glisser-déposer                                                                                           | ✅     |
| 29  | Fiche joueur            | Photo, poste, numéro, naissance/âge, taille, pied fort, nationalité                                                                 | ✅     |
| 30  | Photos joueurs          | Prises et ajoutées par l'admin                                                                                                      | ✅     |
| 31  | Effectif                | Maximum 24 joueurs, valeur modifiable par l'admin                                                                                   | ✅     |
| 32  | Historique joueur       | Affiche les 3 derniers clubs                                                                                                        | ✅     |
| 33  | Blessures / suspensions | Affichées sur la fiche joueur                                                                                                       | ✅     |
| 34  | Match                   | 90 min + temps additionnel, mi-temps 45 min                                                                                         | ✅     |
| 35  | Saisie match            | Score, buteurs, passeurs, cartons, remplacements                                                                                    | ✅     |
| 36  | Compositions            | Saisies environ 1 h avant le match                                                                                                  | ✅     |
| 37  | Direct                  | Saisie après le match uniquement ; pas de score en direct                                                                           | ✅     |
| 38  | Correction de résultat  | Par l'admin ; aucun historique des modifications (sauf « dernière modification : date + utilisateur » visible de l'admin, confirmé) | ✅     |
| 39  | Statistiques            | Classement, buteurs, passeurs, cartons, fiche statistique par club                                                                  | ✅     |
| 39b | Publication directe     | Résultat publié dès la saisie par l'assistant, corrigé par l'admin si erreur (confirmé)                                             | ✅     |

## Série 3 — Comptes, contenus, design, technique (2026-11-14)

| #   | Sujet                        | Décision                                                                                                                                       | Statut |
| --- | ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| 40  | Comptes staff                | 3 maximum : super admin (le client), admin, assistant admin                                                                                    | ✅     |
| 41  | Assistant admin              | Saisit les résultats et compositions seulement                                                                                                 | ✅     |
| 42  | Comptes visiteurs            | Non nécessaires ; connexion possible mais facultative                                                                                          | 🟡     |
| 43  | Inscriptions, paiements, PDF | Non                                                                                                                                            | ✅     |
| 44  | Actualités                   | Oui, articles écrits par l'admin                                                                                                               | ✅     |
| 45  | Médias                       | Photos et vidéos (liens YouTube/Facebook), résumés de matchs                                                                                   | ✅     |
| 46  | Facebook                     | Intégration / lien vers la page                                                                                                                | ✅     |
| 47  | Sponsors                     | Affichage logos sponsors et partenaires                                                                                                        | ✅     |
| 48  | Notifications                | Non                                                                                                                                            | ✅     |
| 49  | Annonces officielles         | Oui (bandeau)                                                                                                                                  | ✅     |
| 50  | Pages publiques              | Accueil, Classement, Calendrier/résultats, Détail match, Clubs, Fiche club, Joueurs, Fiche joueur, Statistiques, Actualités, À propos, Contact | ✅     |
| 51  | Design                       | Mode sombre, animations très discrètes                                                                                                         | ✅     |
| 52  | Accueil                      | Prochains matchs, derniers résultats et classement dès l'ouverture                                                                             | ✅     |
| 53  | Langue                       | Français uniquement                                                                                                                            | ✅     |
| 54  | Équipe                       | Le client seul, assisté par Claude                                                                                                             | ✅     |
| 55  | Stack                        | Next.js                                                                                                                                        | ✅     |
| 56  | Hors ligne / appli mobile    | Peut-être plus tard (hors V1)                                                                                                                  | ✅     |
| 57  | Modèle économique            | Plateforme gratuite                                                                                                                            | ✅     |
| 58  | Délai                        | Le plus vite possible → périmètre MVP strict                                                                                                   | ✅     |

## Série 4 — Périmètre et derniers points (2026-11-14)

| #   | Sujet                  | Décision                                                                                      | Statut |
| --- | ---------------------- | --------------------------------------------------------------------------------------------- | ------ |
| 59  | Découpage MVP/V1/V2/V3 | Validé (voir REQUIREMENTS.md) ; coupes en V2 ; connexion visiteurs hors MVP                   | ✅     |
| 60  | Droits                 | Super admin : comptes et paramètres ; admin : tout le reste ; assistant : résultats seulement | ✅     |
| 61  | Contacts clubs         | Facultatifs sur la fiche club (téléphone, Facebook)                                           | ✅     |
| 62  | Nom                    | « Foot Fianara » ; logo fourni plus tard dans le dossier du projet                            | ✅     |
| 63  | Hébergement            | Démarrage sur offres gratuites (Next.js + base gratuite) ; domaine et budget à voir plus tard | ✅     |
| 64  | Connexion assistant    | 4G disponible sur le terrain → saisie en ligne, pas de mode hors ligne                        | ✅     |

## Série 5 — Discipline et design (2026-11-14)

| #   | Sujet             | Décision                                                                                                            | Statut                                     |
| --- | ----------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| 65  | Suspension        | 5 jaunes cumulés ou 1 rouge = 2 matchs                                                                              | 🟡 (remise à zéro du compteur à confirmer) |
| 66  | Palette           | Noir et blanc provisoire ; l'admin préfère le monochrome, à rediscuter                                              | 🟡                                         |
| 67  | Références design | 4 captures fournies (dashboards sportifs sombres, fiche joueur) : structure reprise, effets violets et paris exclus | ✅                                         |
| 68  | Domaine / budget  | Gratuit pour l'instant                                                                                              | ✅                                         |

## Série 6 — Validation de l'architecture (2026-11-14)

| #   | Sujet          | Décision                                                                  | Statut |
| --- | -------------- | ------------------------------------------------------------------------- | ------ |
| 69  | Stack          | Next.js, Neon (PostgreSQL), Prisma, Auth.js, Cloudinary, Vercel, Tailwind | ✅     |
| 70  | Classement     | Calculé à la lecture, non stocké                                          | ✅     |
| 71  | Schéma de base | Tel que dans DATABASE_SCHEMA.md                                           | ✅     |

## Série 7 — Lancement (2026-11-14)

| #   | Sujet                  | Décision                                                                                                  | Statut |
| --- | ---------------------- | --------------------------------------------------------------------------------------------------------- | ------ |
| 72  | Jaunes                 | Le compteur repart à zéro après la suspension                                                             | ✅     |
| 73  | Palette                | Noir et blanc ; logo dans `Logo/logo foot fianara.png`                                                    | ✅     |
| 74  | Format des coupes (V2) | Poules, 8es de finale, quarts, demis, finale (match unique en demi et finale, prolongation + tirs au but) | ✅     |
| 75  | Domaine                | Aucun : adresse gratuite fournie par l'hébergeur                                                          | ✅     |
| 76  | Sprint 1               | Lancé                                                                                                     | ✅     |

## Série 8 — Résultats et discipline, choix techniques (2026-11-15)

| #   | Sujet                    | Décision                                                                                                                                                                      | Statut |
| --- | ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| 77  | Compteur de jaunes       | Par saison ; chaque tranche de 5 jaunes déclenche 2 matchs et remet le compteur à zéro (décision 72) ; remise à zéro en fin de saison (hypothèse des points ouverts)          | 🟡     |
| 78  | Rouge et jaunes du match | Un rouge = 2 matchs ; les jaunes reçus dans le même match ne comptent pas au cumul (double jaune = rouge)                                                                     | 🟡     |
| 79  | Purge de la suspension   | Calculée automatiquement : chaque match suivant du club du joueur (joué ou forfait) dans la saison compte ; ordre chronologique par date du match puis journée                | 🟡     |
| 80  | Suspensions automatiques | Recalculées entièrement après chaque saisie, correction ou forfait (`Suspension.seasonId` et `matchId` renseignés) ; les suspensions saisies à la main (matchId vide) restent | ✅     |
| 81  | Stockage du forfait      | Score 0-3 / 3-0 enregistré sur le match, sans événements ; le fautif se déduit du score                                                                                       | ✅     |
| 82  | Correction               | L'assistant fait la première saisie ; un match déjà joué ou forfait ne se corrige que par l'admin                                                                             | ✅     |

## Série 9 — Design du site public (2026-11-15)

| #   | Sujet        | Décision                                                                                                       | Statut |
| --- | ------------ | -------------------------------------------------------------------------------------------------------------- | ------ |
| 83  | Typographies | Barlow Condensed (titres, scores, capitales) et Inter (texte, tableaux, chiffres tabulaires) via next/font ; voir DESIGN_PUBLIC.md | 🟡     |
| 84  | Nombre impair de clubs | Génération du calendrier refusée (pas de club exempt) ; la division doit compter un nombre pair de clubs | ✅     |
| 85  | Suspension manuelle    | Rattachée à la saison la plus récente ; seule une manuelle peut être marquée purgée à la main (les automatiques se recalculent) | ✅     |
| 86  | Saisie de la date      | Un seul champ date et heure (heure de Madagascar, UTC+3) | ✅     |
| 87  | Remplacements          | Saisis avec le résultat dans le même formulaire | ✅     |

## Points encore ouverts

- Remise à zéro des jaunes en fin de saison (hypothèse appliquée : oui, décision 77)
- Nombre de coupes (une par division ou une seule) (V2)

# BUSINESS_RULES — Règles métier

## Structure

- BR-01 : une saison = un semestre. Elle contient 3 divisions (D1, D2, D3), chacune d'environ 12 clubs.
- BR-02 : un club appartient à une seule division par saison.
- BR-03 : un club a au plus 24 joueurs (paramètre modifiable par le super admin).

## Championnat (ligue)

- BR-10 : chaque division est un tous contre tous aller-retour (12 clubs = 22 journées, 132 matchs).
- BR-11 : victoire 3 points, nul 1, défaite 0.
- BR-12 : classement par points, puis différence de buts, puis buts marqués, puis confrontation directe, puis décision de l'admin.
- BR-13 : à la fin de la saison, les 4 derniers de D1 et D2 descendent et les 4 premiers de D2 et D3 montent.

## Match

- BR-20 : durée 90 min (2 × 45) plus temps additionnel.
- BR-21 : l'admin planifie date, heure et stade ; il peut ajouter ou modifier des stades. Plusieurs matchs par jour sont possibles.
- BR-22 : statuts d'un match : programmé, joué, reporté, forfait.
- BR-23 : forfait = 0-3 pour le fautif, 3-0 pour l'adversaire, 3 points pour l'adversaire.
- BR-24 : les compositions sont saisies environ 1 h avant le match.
- BR-25 : après le match, on saisit score, buteurs, passeurs, cartons et remplacements. Pas de score en direct.
- BR-26 : le résultat est publié dès la saisie ; l'admin peut le corriger. Le classement et les statistiques se recalculent à chaque saisie ou correction.
- BR-27 : un buteur et un passeur doivent appartenir à l'un des deux clubs du match. La somme des buts saisis doit égaler le score.

## Discipline

- BR-30 : les cartons jaunes et rouges sont enregistrés par match et par joueur.
- BR-31 : la suspension est décidée par la fédération ; l'admin l'enregistre (joueur, durée) et elle apparaît sur la fiche du joueur.
- BR-32 : 5 jaunes cumulés ou 1 rouge = 2 matchs de suspension. **À confirmer** : le compteur de jaunes repart-il à zéro après la suspension, et en fin de saison ?

## Joueurs et clubs

- BR-40 : l'historique d'un joueur affiche ses 3 derniers clubs.
- BR-41 : un club sans logo reçoit un logo par défaut, remplaçable par l'admin à tout moment.
- BR-42 : numéro de maillot unique au sein d'un club pour une saison.
- BR-43 : les contacts d'un club (téléphone, Facebook) sont facultatifs.

## Coupes (V2)

- BR-50 : phase de poules, puis demi-finales et finale en match unique.
- BR-51 : en cas d'égalité en match à élimination, prolongation puis tirs au but.
- BR-52 : nombre et format des coupes **à définir** avec l'admin.

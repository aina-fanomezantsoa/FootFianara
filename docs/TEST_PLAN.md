# TEST_PLAN

## Tests automatiques (Vitest)

- Classement : victoire/nul/défaite, forfait 0-3, égalité de points départagée par différence de buts, buts marqués, confrontation directe, tout égal.
- Calendrier : 12 clubs donnent 132 matchs, chaque paire se joue deux fois (domicile/extérieur inversés), aucun club ne joue deux fois le même jour de match.
- Suspensions : 5e jaune et rouge direct donnent 2 matchs.
- Saisie : buts saisis ≠ score refusé ; joueur d'un autre club refusé.

## Tests manuels

- Permissions : assistant refusé sur clubs, comptes, paramètres ; admin refusé sur comptes ; public refusé sur `/admin`.
- Effectif : 25e joueur refusé, numéro de maillot en double refusé.
- Correction d'un résultat : le classement se met à jour.
- Mobile : vrai smartphone, écran 360 px, 4G, chargement de l'accueil < 3 s, tableaux sans défilement horizontal.
- Images : logo absent = logo par défaut ; photo trop lourde refusée.

## Critère de livraison

Tous les tests automatiques passent et la liste manuelle est cochée sur le site déployé, pas seulement en local.

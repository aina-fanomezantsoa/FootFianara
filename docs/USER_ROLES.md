# USER_ROLES — Rôles et permissions

Maximum 3 comptes staff. Les clubs et les visiteurs n'ont pas de compte (connexion visiteur : V2, facultative).

| Action                                                  | Public | Assistant admin | Admin | Super admin |
| ------------------------------------------------------- | ------ | --------------- | ----- | ----------- |
| Consulter le site public                                | ✅     | ✅              | ✅    | ✅          |
| Saisir score, buteurs, passeurs, cartons, remplacements | ❌     | ✅              | ✅    | ✅          |
| Saisir les compositions (≈ 1 h avant le match)          | ❌     | ✅              | ✅    | ✅          |
| Corriger un résultat publié                             | ❌     | ❌              | ✅    | ✅          |
| Gérer clubs, joueurs, images, stades                    | ❌     | ❌              | ✅    | ✅          |
| Gérer saisons, divisions, calendrier                    | ❌     | ❌              | ✅    | ✅          |
| Enregistrer suspensions et blessures                    | ❌     | ❌              | ✅    | ✅          |
| Écrire actualités, annonces, sponsors (V1)              | ❌     | ❌              | ✅    | ✅          |
| Gérer les comptes staff                                 | ❌     | ❌              | ❌    | ✅          |
| Paramètres (effectif max, points, etc.)                 | ❌     | ❌              | ❌    | ✅          |

Règles :

- Un résultat saisi est publié immédiatement.
- Chaque résultat garde « dernière modification : date + utilisateur », visible du staff uniquement. Pas d'historique complet.

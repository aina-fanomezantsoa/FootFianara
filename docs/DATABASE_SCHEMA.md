# DATABASE_SCHEMA — Base de données (proposition à valider)

SGBD : PostgreSQL. Accès via Prisma. Clés `id` en entier auto-incrémenté.

## Tables MVP

| Table        | Colonnes principales                                                                                                                                                                   | Contraintes                                                                                                                                                                |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `User`       | email, passwordHash, name, role (SUPER_ADMIN, ADMIN, ASSISTANT)                                                                                                                        | email unique ; 3 comptes maximum vérifié à la création                                                                                                                     |
| `Season`     | name, startDate, endDate                                                                                                                                                               |                                                                                                                                                                            |
| `Division`   | name (D1, D2, D3), level (1 à 3)                                                                                                                                                       | name unique                                                                                                                                                                |
| `Club`       | name, shortName, logoUrl (nullable → logo par défaut), colors, foundedYear, district, president, coach, teamPhotoUrl, phone, facebookUrl                                               | name unique                                                                                                                                                                |
| `ClubSeason` | seasonId, divisionId, clubId                                                                                                                                                           | unique (seasonId, clubId). Porte la division d'un club pour une saison : historique et promotion/relégation sans copie de données                                          |
| `Player`     | firstName, lastName, photoUrl, position, birthDate, heightCm, strongFoot, nationality                                                                                                  |                                                                                                                                                                            |
| `Squad`      | clubSeasonId, playerId, shirtNumber                                                                                                                                                    | unique (clubSeasonId, playerId) et unique (clubSeasonId, shirtNumber) ; effectif ≤ `maxSquad` vérifié à l'ajout. Les 3 derniers clubs d'un joueur = ses 3 dernières lignes |
| `Stadium`    | name, city                                                                                                                                                                             |                                                                                                                                                                            |
| `Match`      | seasonId, divisionId, matchday, homeClubSeasonId, awayClubSeasonId, stadiumId, kickoffAt, status (SCHEDULED, PLAYED, POSTPONED, FORFEIT), homeGoals, awayGoals, updatedAt, updatedById | home ≠ away ; unique (home, away) par division (aller-retour = 2 lignes avec rôles inversés)                                                                               |
| `MatchEvent` | matchId, type (GOAL, OWN_GOAL, YELLOW, RED, SUB), minute, playerId, assistPlayerId (nullable), playerInId (pour SUB)                                                                   | joueur appartenant à un des deux clubs du match                                                                                                                            |
| `Lineup`     | matchId, playerId, isStarter                                                                                                                                                           | unique (matchId, playerId)                                                                                                                                                 |
| `Suspension` | playerId, matchesTotal, matchesServed, reason                                                                                                                                          |                                                                                                                                                                            |
| `Setting`    | key, value                                                                                                                                                                             | `maxSquad`=24, `ptsWin`=3, `ptsDraw`=1, `yellowLimit`=5, `suspensionMatches`=2                                                                                             |

## Tables V1 (non créées au MVP)

`Injury` (playerId, note, since, until), `Article`, `Announcement`, `Sponsor`.

## Choix clés

- **Le classement n'est pas stocké.** Il est calculé à la lecture à partir des `Match` joués (132 matchs par division, très léger). Aucune donnée ne peut devenir incohérente après une correction de résultat. Le départage par confrontation directe se calcule dans le code.
- Les statistiques (buteurs, passeurs, cartons) sont des agrégations de `MatchEvent`.
- Cohérence : le nombre de `GOAL` et `OWN_GOAL` d'un match doit égaler le score (BR-27), sauf forfait (3-0 sans événements).
- Pas de table d'historique des modifications ; seulement `updatedAt` et `updatedById` sur `Match`.
- Sauvegardes : export de la base chaque semaine via l'hébergeur (voir TECHNICAL_ARCHITECTURE.md).

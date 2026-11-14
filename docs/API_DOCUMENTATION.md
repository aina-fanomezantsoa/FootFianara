# API_DOCUMENTATION

Pas d'API REST publique au MVP : le site public lit la base directement côté serveur. Les écritures sont des actions serveur Next.js, chacune protégée par un rôle minimum.

| Action                                                                 | Rôle minimum |
| ---------------------------------------------------------------------- | ------------ |
| `createUser`, `deleteUser`, `updateSettings`                           | SUPER_ADMIN  |
| `createSeason`, `createDivision`, `createStadium` (et modifications)   | ADMIN        |
| `createClub`, `updateClub`, `uploadClubImage`                          | ADMIN        |
| `createPlayer`, `updatePlayer`, `addToSquad`, `removeFromSquad`        | ADMIN        |
| `generateFixtures(divisionId)`, `updateMatchSchedule`, `postponeMatch` | ADMIN        |
| `saveLineup(matchId)`                                                  | ASSISTANT    |
| `saveResult(matchId, score, events)`                                   | ASSISTANT    |
| `correctResult(matchId, ...)`, `setForfeit(matchId, club)`             | ADMIN        |
| `createSuspension`, `clearSuspension`                                  | ADMIN        |

Lectures publiques (fonctions serveur) : `getStandings(divisionId)`, `getFixtures(divisionId, matchday)`, `getMatch(id)`, `getClub(id)`, `getPlayer(id)`, `getTopScorers(divisionId)`, `getTopAssists(divisionId)`, `getCards(divisionId)`.

Une API REST (`/api/...`) ne sera ajoutée que si une application mobile (V3) en a besoin.

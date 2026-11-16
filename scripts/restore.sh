#!/usr/bin/env bash
# Restauration : ÉCRASE les tables de la base pointée par DATABASE_URL avec le contenu du dump.
# Usage : npm run db:restore -- backups/AAAA-MM-JJ.dump
set -euo pipefail
cd "$(dirname "$0")/.."
. scripts/env.sh

file=${1:-}
if [ -z "$file" ] || [ ! -f "$file" ]; then
  echo "Usage : npm run db:restore -- backups/AAAA-MM-JJ.dump" >&2
  exit 1
fi
pg_restore --list "$file" >/dev/null

host=$(echo "$DB_URL" | sed -E 's#^[a-z]+://[^@]*@([^/:?]+).*#\1#')
echo "ATTENTION : les données actuelles de $host vont être remplacées par $file."
read -r -p "Tapez OUI pour continuer : " answer
[ "$answer" = "OUI" ] || { echo "Annulé."; exit 1; }

pg_restore --clean --if-exists --no-owner --no-privileges --single-transaction \
  --dbname="$DB_URL" "$file"
echo "Restauration OK depuis $file"

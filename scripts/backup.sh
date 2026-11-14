#!/usr/bin/env bash
# Sauvegarde de la base : backups/AAAA-MM-JJ.dump (format custom, à restaurer avec restore.sh).
set -euo pipefail
cd "$(dirname "$0")/.."
. scripts/env.sh

mkdir -p backups
out="backups/$(date +%F).dump"
pg_dump --format=custom --no-owner --no-privileges --file="$out" "$DB_URL"
# Vérifie que le fichier est un dump lisible (sinon la sauvegarde ne sert à rien).
pg_restore --list "$out" >/dev/null
echo "Sauvegarde OK : $out ($(du -h "$out" | cut -f1))"

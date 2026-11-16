# Sourcé par backup.sh et restore.sh : fournit DB_URL (connexion directe Neon).
# DATABASE_URL vient de l'environnement (CI) ou, à défaut, du fichier .env.
if [ -z "${DATABASE_URL:-}" ] && [ -f .env ]; then
  # tr -d '\r' : .env édité sous Windows peut avoir des fins de ligne CRLF.
  DATABASE_URL=$(sed -n 's/^DATABASE_URL=//p' .env | tr -d '\r' | sed 's/^"//; s/"$//')
fi
if [ -z "${DATABASE_URL:-}" ]; then
  echo "Erreur : DATABASE_URL absente (ni dans l'environnement, ni dans .env)." >&2
  exit 1
fi
command -v pg_dump >/dev/null || {
  echo "Erreur : pg_dump introuvable. Installez le client PostgreSQL 18 (voir README, section Sauvegarde)." >&2
  exit 1
}
# Neon : pg_dump/pg_restore doivent passer par l'hôte direct, pas par le pooler PgBouncer.
DB_URL=${DATABASE_URL/-pooler./.}

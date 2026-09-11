#!/bin/sh
set -e

echo "[entrypoint] Applying database migrations..."
npx prisma migrate deploy

echo "[entrypoint] Seeding database (idempotent)..."
npx tsx prisma/seed.ts

echo "[entrypoint] Starting Practice Drill..."
exec npm start

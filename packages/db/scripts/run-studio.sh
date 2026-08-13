#!/bin/bash
set -euo pipefail

ENV=${MODE_ENV:-dev}

# Function to cleanup on exit
cleanup() {
  if [ "$ENV" = "dev" ]; then
    echo "🛑 Stopping local database..."
    docker compose stop db
  fi
  # uat/prod talk to Neon directly — nothing to tear down.
}

# Trap Multiple Signals (SIGINT = Ctrl+C, SIGTERM = Kill)
trap cleanup EXIT SIGINT SIGTERM

echo "🚀 Starting Drizzle Studio against '$ENV' environment..."

if [ "$ENV" = "dev" ]; then
  # Start (or reuse) the local database and wait until it is healthy.
  docker compose up db -d --wait
fi

# Neon (uat/prod) is reachable directly via DATABASE_URL — no proxy needed.
pnpm drizzle-kit studio

set -e

pnpm install --production --frozen-lockfile

node dist/apps/gateway/main.js

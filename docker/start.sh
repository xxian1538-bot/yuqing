#!/bin/sh
set -e

cd /app
npx tsx server/index.ts &
exec nginx -g 'daemon off;'

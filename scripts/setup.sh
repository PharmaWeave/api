#!/bin/sh
set -e

# Copy the .env.local file to .env
cp .env.local .env

# Give execution permissions
chmod +x ./src/config/entrypoint.sh

exec "$@"
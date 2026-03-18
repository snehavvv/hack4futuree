#!/bin/bash
# Runs the SquintScale backend Docker container.
# Requires backend/.env to exist with correct values.
# Supabase must be running before executing this script.
docker run -p 8080:8080 --env-file .env squintscale-backend

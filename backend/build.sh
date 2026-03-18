#!/bin/bash
# Builds the SquintScale backend Docker image.
# Run this from the backend/ directory.
# Supabase must be running first: npx supabase start (from project root)
docker build -t squintscale-backend .

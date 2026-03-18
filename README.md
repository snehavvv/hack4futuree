# SquintScale

SquintScale is an accessibility vision platform that scores and simulates impairments across visual dimensions to provide UX intelligence, complete with actionable AI-driven repair suggestions and PDF reporting.

## Prerequisites
- **Docker Desktop** (or equivalent containerization tool)
- **Node.js 20+**
- **Supabase CLI**: `npm install -g supabase`

## Local Development (run in this exact order)

### Step 1 — Start Supabase
```bash
npx supabase start
```
*(Run from project root. First run takes a few minutes to pull images.)*
This spins up PostgreSQL, the auth server, storage bucket, and REST API all locally on Docker. Our `supabase/migrations/` apply intelligently to stand up the base schematics.

### Step 2 — Get your local keys
```bash
npx supabase status
```
Copy these values into your `.env` files locally in the next steps:
- **API URL** → `SUPABASE_URL` / `VITE_SUPABASE_URL`
- **anon key** → `VITE_SUPABASE_ANON_KEY`
- **service_role key** → `SUPABASE_SERVICE_KEY`
- **JWT secret** → `SUPABASE_JWT_SECRET`
- **DB URL** → base for `DATABASE_URL`

### Step 3 — Configure backend
```bash
cp backend/.env.example backend/.env
```
Fill in `backend/.env` using values from Step 2.
**Important**: `DATABASE_URL` must use `host.docker.internal`, not `localhost`, because the backend runs inside Docker and needs to access the host's Supabase instance.
Example: `postgresql+asyncpg://postgres:postgres@host.docker.internal:54322/postgres`

### Step 4 — Configure frontend
```bash
cp .env.example .env
```
Fill in `.env` using values from Step 2.
These use `localhost` (not `host.docker.internal`) because Vite runs directly on your host machine.

### Step 5 — Build and start backend
```bash
cd backend
./build.sh
./run.sh
cd ..
```
*(If on Windows, you can simply run the Docker commands in those files manually: `docker build -t squintscale-backend .` and `docker run -p 8080:8080 --env-file .env squintscale-backend`)*
Verify: `curl http://localhost:8080/api/v1/health` should return `{"status":"ok",...}`

### Step 6 — Start frontend
```bash
npm install
npm run dev
```
Open `http://localhost:5173`

---

## Environment variable reference

| Variable               | File            | Description                              |
|------------------------|-----------------|------------------------------------------|
| SUPABASE_URL           | backend/.env    | Supabase API URL (host.docker.internal)  |
| SUPABASE_SERVICE_KEY   | backend/.env    | Service role key (bypasses RLS)          |
| SUPABASE_JWT_SECRET    | backend/.env    | For validating user JWTs                 |
| DATABASE_URL           | backend/.env    | Direct asyncpg connection string         |
| FRONTEND_URL           | backend/.env    | Allowed CORS origin                      |
| STORAGE_BUCKET         | backend/.env    | Supabase Storage bucket name             |
| VITE_SUPABASE_URL      | .env (root)     | Supabase API URL (localhost)             |
| VITE_SUPABASE_ANON_KEY | .env (root)     | Public anon key for frontend JS client   |
| VITE_API_URL           | .env (root)     | FastAPI backend URL                      |

---

## Why `host.docker.internal` vs `localhost`?
The backend runs inside an isolated Docker container. From inside Docker, "localhost" routes directly back into the container itself (which prevents it from reaching Supabase). `host.docker.internal` is Docker's magic host resolution DNS that escapes the container barrier and points backward to your PC (specifically to the Supabase PostgreSQL exposed ports).
The frontend runs natively on your machine, so it correctly resolves `localhost`.

---

## Deploying to production

1. Create a pristine production project at [Supabase](https://supabase.com).
2. Manually execute the `supabase/migrations/20250001000000_init.sql` payload inside the Supabase cloud SQL Editor.
3. Push the codebase up to GitHub.
4. Establish a connected project matrix via the Render dashboard. Sync changes and import `render.yaml`. 
5. In your target Render dashboard settings, safely inject all explicit production variables representing the cloud Supabase URL, anon key, service key, and databases (stripping out any references to `host.docker.internal`).
6. Let Render build and automatically orchestrate both the Docker Web container and Static React builds!

# Render setup (Next phase)

This repo is a monorepo with two deployable apps:
- `hb-technologies/` (Next.js App Router)
- `hb-technologies-api/` (Express API)

Below is the cleanest way to deploy both on Render.

## 0) Prereqs
- Push your repo to GitHub
- Make sure `main` builds locally (you already verified `npm run build` in `hb-technologies`)

## 1) Deploy the API (Express) on Render
1. In Render: **New → Web Service**
2. Connect your GitHub repo and pick branch `main`
3. Configure:
   - **Root Directory**: `hb-technologies-api`
   - **Runtime**: Node
   - **Build Command**: `npm ci`
   - **Start Command**: `npm start`

### 1.1) Set environment variables (API)
In the Render service → **Environment**:
- `NODE_ENV=production`
- `JWT_SECRET=<generate a long random string>`
- `JWT_EXPIRES_IN=15m`
- `SUPABASE_URL=<Supabase project URL>`
- `SUPABASE_SERVICE_ROLE_KEY=<Supabase service role key>`
- `CORS_ORIGINS=https://<your-frontend-domain>`

Notes:
- Do not set `PORT` manually unless Render requires it; Render injects `PORT`.
- Keep the service role key server-only.

### 1.2) Health check
After deploy, open:
- `https://<your-api-domain>/health`

You should see JSON like `{ ok: true, status: "healthy", ... }`.

## 2) Deploy the frontend (Next.js) on Render
1. In Render: **New → Web Service**
2. Pick the same repo/branch
3. Configure:
   - **Root Directory**: `hb-technologies`
   - **Runtime**: Node
   - **Build Command**: `npm ci && npm run build`
   - **Start Command**: `npm start`

### 2.1) Set environment variables (frontend)
In the Render service → **Environment**:
- `NEXT_PUBLIC_SITE_URL=https://vizia-technologies.vercel.app`
- `API_URL=https://<your-api-domain>`

Use the generated Render/Vercel frontend URL until a custom domain is connected.
Do not point `NEXT_PUBLIC_SITE_URL` at a domain you do not own yet; canonical URLs, Open Graph URLs, Twitter image URLs, sitemap hosts, and structured data URLs all depend on it.

Important:
- `.env.example` files are **not** used by Render automatically.
- You must define environment variables in the Render dashboard for each service.
- After adding/changing env vars, trigger a redeploy (or at minimum restart) so Next.js picks them up.

Why this works well:
- The browser submits to `POST /api/consultation` on the same origin.
- Next.js forwards server-to-server to your Express API using `API_URL`.

## 3) Wire the domains together
Once both services are live:
- Update **API** `CORS_ORIGINS` to the final frontend domain.
- Update **frontend** `API_URL` to the final API domain.

Then redeploy both services.

## 4) End-to-end verification
1. Visit your frontend `/contact`
2. Submit the consultation form
3. Confirm:
   - frontend returns success/expected error
   - API logs show `POST /consultation`
   - Supabase `consultations` table has a new row

## 5) Troubleshooting
- If you see `SUPABASE_NOT_CONFIGURED` from the API, set `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` and redeploy.
- If you see `CSRF_BLOCKED` in production, confirm:
  - `CORS_ORIGINS` includes your frontend domain exactly
  - the frontend has `NEXT_PUBLIC_SITE_URL` set to that same domain
- If you see `HTTPS_REQUIRED`, your proxy/forwarding headers aren’t being set correctly by the platform (Render should set `x-forwarded-proto`).

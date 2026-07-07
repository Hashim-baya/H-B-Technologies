# Deployment (Phase 11)

## Recommended deployment split
- Frontend: Render (Next.js SSR) or Vercel
- Backend: Render (Node/Express)
- Database: Supabase managed Postgres + Storage

## Backend (Render)
Create a **Web Service** pointing to this repo.

Suggested settings:
- Root Directory: `hb-technologies-api`
- Build Command: `npm ci`
- Start Command: `npm start`

### Required env vars
- NODE_ENV=production
- JWT_SECRET=<long random string>
- JWT_EXPIRES_IN=15m
- SUPABASE_URL=<your supabase project url>
- SUPABASE_SERVICE_ROLE_KEY=<service role key>
- CORS_ORIGINS=https://<your-frontend-domain>

If you deploy multiple frontends (e.g., Render frontend + Vercel), include them comma-separated:
- CORS_ORIGINS=https://frontend-a.example.com,https://frontend-b.example.com

Notes:
- Render will set `PORT` automatically. The API reads it from `process.env.PORT`.
- The API enforces HTTPS in production via `x-forwarded-proto` (Render sets this behind its proxy).

### Health check
- GET /health

## Frontend (Render)
If you want everything on Render, deploy the Next.js app as another **Web Service**.

Suggested settings:
- Root Directory: `hb-technologies`
- Build Command: `npm ci && npm run build`
- Start Command: `npm start`

### Required env vars
- NEXT_PUBLIC_SITE_URL=https://vizia-technologies.vercel.app
- API_URL=https://<your-backend-domain>

Use the current Render/Vercel-generated frontend URL until a custom domain is connected.
Do not set `NEXT_PUBLIC_SITE_URL` to a domain you do not control yet; canonical URLs, Open Graph URLs, Twitter image URLs, sitemap hosts, and structured data URLs are generated from this value.

The frontend uses a server-side proxy route:
- POST /api/consultation  -> forwards to `${API_URL}/consultation`

This means the browser doesn’t need direct access to the backend URL, and avoids CORS issues.

If you later decide to call the API directly from the browser (not recommended for this setup), you’ll need to keep `CORS_ORIGINS` correct and ensure endpoints return the right CORS headers.

## Post-deploy checks
- Open the site and submit the consultation form
- Confirm backend logs show POST /consultation
- Confirm Supabase has a new row in `consultations`
- Run Lighthouse on the deployed domain

## Frontend (Vercel)
If you prefer Vercel for the Next.js app:

Project settings:
- Framework: Next.js
- Root Directory: `hb-technologies`

### Required env vars (Vercel)
Set these in Vercel → Project → Settings → Environment Variables (apply to Production, and Preview if you use preview URLs):
- `NEXT_PUBLIC_SITE_URL=https://vizia-technologies.vercel.app`
- `API_URL=https://<your-backend-domain>`

Important:
- Vercel does **not** load `.env.example` automatically.
- After adding env vars, trigger a redeploy so server route handlers (like `/api/consultation`) can read them.

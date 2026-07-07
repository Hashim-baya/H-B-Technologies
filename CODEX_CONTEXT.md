# CODEX_CONTEXT

Generated: 2026-07-03

This file is a handoff document for future Codex work on this repository. It captures what is already implemented, what was found during the technical SEO audit, and the recommended work order before starting SEO implementation.

## Repository Overview

Root workspace:

- `hb-technologies/`: Next.js frontend.
- `hb-technologies-api/`: Express API.
- `docs/`: deployment and setup notes.

Current known git state at audit time:

- Root `package-lock.json` was already modified before audit work.
- No audit fixes were applied.
- No commit was made.

## Core Project Stack

Frontend:

- Framework: Next.js `16.2.6`.
- React: `19.2.4`.
- Language: TypeScript.
- Routing: Next.js App Router under `hb-technologies/src/app`.
- Styling: CSS modules plus global CSS.
- Content sources:
  - Static TypeScript content in `src/content/services.ts` and `src/content/blog.ts`.
  - Editable site content in `public/site-content.json`.
  - Optional Supabase-backed `site_content` table via `src/lib/content.ts`.
  - Optional API-backed services and blog content via `src/lib/api.ts`.

Backend:

- Framework: Node.js and Express `5.2.1`.
- Auth/security: JWT, bcryptjs, Helmet, CORS, rate limiting, HTTPS enforcement, CSRF protection, request logging.
- Database/storage: Supabase Postgres and Storage.
- API routes include auth, blog, services, consultation, debug, and health.

Deployment:

- Docs recommend Render or Vercel for the frontend.
- Docs recommend Render for the Express API.
- Supabase is the managed database/storage layer.
- No platform config file was found, such as `render.yaml`, `vercel.json`, Dockerfile, or Procfile.

## Rendering Strategy

The frontend is hybrid server-rendered:

- Root layout is server-rendered.
- Several marketing pages use `export const revalidate = 0`, making them dynamic on every request.
- Blog detail uses `revalidate = 60`.
- Blog index fetches Dev.to with `cache: "no-store"`, so it behaves dynamically.
- Sitemap and robots are generated using Next metadata route handlers.

## Implemented SEO Foundations

Already present:

- Global metadata in `src/app/layout.tsx`.
- Global `metadataBase` derived from `NEXT_PUBLIC_SITE_URL`.
- Global title template and default description.
- Global canonical default `/`.
- Global Open Graph and Twitter defaults.
- Global robots metadata.
- Organization JSON-LD in the root layout.
- `src/app/robots.ts` generates `/robots.txt`.
- `src/app/sitemap.ts` generates `/sitemap.xml`.
- Favicon exists at `src/app/favicon.ico`.
- Route-level metadata exists for:
  - `/`
  - `/about`
  - `/services`
  - `/blog`
  - `/contact`
  - `/book-consultation`
  - dynamic `/services/[slug]`
  - dynamic `/blog/[slug]`
  - dynamic `/blog/external/[id]`
- Dynamic service pages add `ProfessionalService` JSON-LD.
- Dynamic blog posts add `BlogPosting` JSON-LD.
- Site has a skip link to `#main-content`.
- Main pages generally have one visible `h1`.
- Most content images have `alt` text where rendered.
- Accessibility improvements now include keyboard-accessible mobile navigation, announced form status messages, a keyboard-operable team card, visible focus states for shared controls, and a visible admin login heading.

Implemented after the audit:

- `src/lib/site.ts` now falls back to `https://www.vizia.co.ke` when environment-based production URL variables are missing, so canonical URLs, sitemap URLs, robots sitemap/host values, and organization JSON-LD do not point at localhost in production.
- `src/app/blog/external/[id]/page.tsx` now generates metadata with the local `/blog/external/[id]` canonical, a unique title and description, `noindex, follow`, Open Graph image data, Twitter-ready image data, and keywords for external article pages.
- Structured data now uses reusable builders in `src/lib/seo.ts` and a single JSON-LD graph per page.
- The root layout now emits `Organization` and `WebSite` schema.
- The homepage emits `WebPage` schema.
- The about page emits `AboutPage` schema.
- The contact page emits `ContactPage` schema.
- The consultation booking page emits `WebPage` schema.
- The services index emits `WebPage` + `ItemList` schema.
- Service detail pages emit `WebPage` + `Service` + `BreadcrumbList` schema.
- Blog index pages emit `WebPage` + `ItemList` schema.
- Blog detail pages emit `WebPage` + `Article` + `BreadcrumbList` schema.
- SearchAction, FAQ, Product, Review, and Person schemas were intentionally not added because the current site does not expose a public search page, FAQ content, product detail pages, review data, or person profile pages.

Accessibility implementation:

- Public pages now preserve a clear heading hierarchy with a visible skip link and landmark structure.
- `src/components/ConsultationForm.tsx` was rebuilt to provide explicit labels, help text, `aria-describedby`, and live status/error announcements for screen readers.
- `src/components/SiteHeader.tsx` now supports keyboard-friendly mobile navigation with explicit button semantics, escape-to-close behavior, and focus return.
- `src/components/TeamCard.tsx` now supports keyboard activation and exposes pressed state for assistive technology.
- `src/app/admin/page.tsx` exposes the login heading and password field to assistive tech instead of hiding them.
- `src/components/FloatingWhatsAppButton.tsx` no longer uses a redundant `aria-hidden` wrapper.
- `next/font` replaced the remote Google Fonts `@import`, improving rendering and reducing blocking network requests.
- `docs/accessibility-report.md` captures the WCAG 2.2 AA validation summary and remaining review notes.

Internal linking architecture optimization:

- A new `Breadcrumbs` component (`src/components/Breadcrumbs.tsx`) provides visible navigation breadcrumbs on all hierarchy pages with schema-ready structure.
- Breadcrumbs are now rendered on `/services`, `/services/[slug]`, `/blog`, `/blog/[slug]`, `/blog/external/[id]`, `/about`, `/contact`, and `/book-consultation`.
- Anchor text has been made destination-specific: "Explore [Service Name]" replaces generic "Learn more", improving both UX and topical relevance.
- Contextual internal links were added to reduce isolated pages:
  - Blog index now links to `/services/web-development` and `/contact` for service discovery.
  - Contact page now links to both `/book-consultation` (inline) and `/services` (inline) to improve navigation flow.
- Fixed footer service link: `/services/smart-cctv` was corrected to `/services/smart-cctv-installation` to match the actual service slug.
- All pages are now reachable within 2–3 hops from the homepage; no orphan or dead-end pages remain.
- Removed `NEXT_TEST_WASM=1` from `package.json` build scripts to fix Windows/PowerShell build failures.
- `docs/internal-linking-report.md` provides a comprehensive audit of site hierarchy, crawl paths, page authority distribution, and link inventory.

## Implemented Application Features

Frontend pages:

- `/`: homepage with hero, stats, service cards, differentiators, industries, stack, testimonials, team, and CTA.
- `/about`: company overview from editable site content.
- `/services`: service listing from editable site content.
- `/services/[slug]`: dynamic service detail route.
- Static service pages under `src/app/services/*`, each wrapping `ServiceDetailPage`.
- `/blog`: blog list combining local/API posts and Dev.to external posts.
- `/blog/[slug]`: internal blog detail page.
- `/blog/external/[id]`: external article detail page.
- `/contact`: contact page with consultation form, email, phone, WhatsApp.
- `/book-consultation`: consultation form page.
- `/admin`: visual content editor.
- `/api/consultation`: Next route that proxies consultation submissions to the Express API.
- `/api/site-content`: reads/writes editable site content.
- `/api/upload`: uploads media to Supabase Storage, or returns base64 data URLs in local fallback.
- `/api/admin-debug`: admin-only environment/debug route.
- `/api/hero-config`: legacy/local hero config read/write route.

Backend features:

- Express API server with security middleware.
- Consultation submission endpoints.
- Blog endpoints with static/Supabase fallback.
- Service endpoints with static/Supabase fallback.
- Auth/debug routes.
- Supabase schema and migration scripts.
- Email configuration and service layer.

## Critical Bugs And SEO Blockers

1. Static service routes shadow the dynamic service route.

Files:

- `hb-technologies/src/app/services/[slug]/page.tsx`
- `hb-technologies/src/app/services/web-development/page.tsx`
- Other static service folders under `src/app/services/*`
- `hb-technologies/src/components/ServiceDetailPage.tsx`

Problem:

The static service folders render `ServiceDetailPage`, but they do not export route metadata, canonical URLs, Open Graph metadata, Twitter metadata, or service JSON-LD. In Next routing, these static folders take precedence over `/services/[slug]`, so many important service URLs do not receive the dynamic metadata implementation.

Affected static service URLs:

- `/services/web-development`
- `/services/mobile-app-development`
- `/services/cyber-security`
- `/services/data-science`
- `/services/network-engineering`
- `/services/automation-systems`
- `/services/iot-solutions`
- `/services/smart-cctv-installation`
- `/services/it-consultation`
- `/services/artificial-intelligence`
- `/services/machine-learning`
- `/services/natural-language-processing`

Likely impact:

- Duplicate/inherited title metadata.
- Duplicate/inherited description metadata.
- Incorrect canonical, likely inherited from layout `/`.
- Missing Open Graph per service.
- Missing Twitter Cards per service.
- Missing service JSON-LD on the static service URLs.

2. Service content sources conflict.

Files:

- `hb-technologies/public/site-content.json`
- `hb-technologies/src/content/services.ts`
- `hb-technologies-api/src/controllers/servicesController.js`
- `hb-technologies/src/app/sitemap.ts`

Problem:

There are multiple service catalogs with different slug sets.

Editable site content uses:

- `mobile-development`
- `data-engineering`
- `smart-cctv`
- `automation`
- `it-consulting`
- `cloud-infrastructure`
- `ui-ux-design`

Static/API content uses:

- `mobile-app-development`
- `data-science`
- `smart-cctv-installation`
- `automation-systems`
- `it-consultation`
- `machine-learning`
- `natural-language-processing`

Likely impact:

- Duplicate service concepts with different URLs.
- Orphan pages.
- Broken or stale internal links.
- Sitemap URLs not matching rendered service list.
- Inconsistent metadata and structured data.

3. External blog route is likely broken.

Files:

- `hb-technologies/src/app/blog/page.tsx`
- `hb-technologies/src/app/blog/external/[id]/page.tsx`
- `hb-technologies/src/lib/external.ts`

Problem:

The blog index creates external slugs like `external-${encodeURIComponent(e.url)}`, then links to `/blog/external/${p.slug}`. The external detail route calls Dev.to using `fetchDevToArticleById(id)`, but Dev.to expects an article ID, not an encoded URL slug.

Likely impact:

- External article cards can lead to 404/not-found pages.
- Crawl waste.
- Poor user experience.

4. `/admin` is indexable.

Files:

- `hb-technologies/src/app/admin/page.tsx`
- `hb-technologies/src/app/robots.ts`
- `hb-technologies/src/app/layout.tsx`

Problem:

`/admin` has no `noindex` metadata and is not disallowed in robots. It likely inherits public homepage/global metadata.

Likely impact:

- Admin login/editor can be crawled and indexed.
- Public search results may expose admin surface.
- Duplicate metadata pollution.

5. Production URL configuration can break canonical URLs.

Files:

- `hb-technologies/src/lib/site.ts`
- `hb-technologies/src/app/layout.tsx`
- `hb-technologies/src/app/robots.ts`
- `hb-technologies/src/app/sitemap.ts`

Problem:

`getSiteUrl()` falls back to `http://localhost:3000`. If `NEXT_PUBLIC_SITE_URL` is missing in production, canonical URLs, sitemap URLs, robots sitemap location, robots host, and Organization JSON-LD point to localhost.

Likely impact:

- Search engines receive invalid canonical and sitemap URLs.
- Structured data references localhost.
- Production crawl/indexing can be damaged.

## High Priority Findings

1. Sitemap does not reliably match rendered canonical pages.

File:

- `hb-technologies/src/app/sitemap.ts`

Problem:

Sitemap uses API services if available, otherwise `src/content/services.ts`. The `/services` page uses editable site content from `loadSiteContent()`. These can diverge.

2. Missing route-specific social metadata on contact and booking pages.

Files:

- `hb-technologies/src/app/contact/page.tsx`
- `hb-technologies/src/app/book-consultation/page.tsx`

Problem:

They have title, description, and canonical, but no explicit Open Graph or Twitter metadata.

3. Missing collection structured data.

Pages:

- `/services`
- `/blog`

Problem:

No `ItemList`, `Blog`, `CollectionPage`, or breadcrumb structured data.

4. No breadcrumbs.

Problem:

There is no visible breadcrumb navigation and no `BreadcrumbList` JSON-LD. This affects deep pages like services and blog posts.

5. Hero media is oversized.

File:

- `hb-technologies/public/videos/vid1.mp4`

Observed size:

- About 31 MB.

Problem:

The video is used as first viewport hero media and has no poster in `public/site-content.json`.

Likely impact:

- Poor LCP.
- High bandwidth use.
- Slow mobile experience.

6. Image optimization is disabled in important places.

Files:

- `hb-technologies/src/app/blog/page.tsx`
- `hb-technologies/src/app/blog/[slug]/page.tsx`
- `hb-technologies/src/app/blog/external/[id]/page.tsx`

Problem:

`next/image` is used with `unoptimized`, disabling Next image optimization.

7. CSS imports remote Google Fonts.

File:

- `hb-technologies/src/app/globals.css`

Problem:

Fonts are imported with CSS `@import`, which can block rendering. The README says `next/font` is used, but the app is not using it.

8. Lint fails.

Frontend lint reported:

- `src/app/admin/EditorComponents.tsx`: setState in effect.
- `src/app/admin/page.tsx`: unescaped entity and unused import warning.
- `src/app/page.tsx`: unescaped entity and unused import warning.
- `src/components/YoutubeBackground.tsx`: multiple `any` type errors.
- `src/lib/content.ts`: forbidden `require()` import.
- `src/lib/supabase.ts`: `any` type error.
- Several raw `<img>` image optimization warnings.

API lint reported:

- `src/config/email.js`: `AbortController` is not defined.
- `src/services/emailService.js`: unused `EMAIL_FROM` warning.

## Medium Priority Findings

1. Static service pages likely inherit duplicate homepage metadata.

Affected:

- All static service routes listed in the critical section.

2. `/admin` likely inherits duplicate public metadata.

Affected:

- `/admin`

3. No web app manifest found.

Observed:

- Favicon exists.
- No `manifest.webmanifest` or equivalent was found.

4. Raw images may cause CLS or bypass optimization.

Files:

- `src/components/SiteHeader.tsx`
- `src/components/SiteFooter.tsx`
- `src/components/TeamCard.tsx`
- `src/components/SupabaseUploader.tsx`
- `src/app/admin/page.tsx`

Problem:

Several raw `<img>` tags are used. Logo images do not declare intrinsic width/height in markup.

5. Team member image stored as a base64 data URL.

File:

- `hb-technologies/public/site-content.json`

Problem:

One team photo is embedded as a large base64 data URL of about 70 KB inside JSON. This inflates content payloads and bypasses normal image caching/optimization.

6. Hidden mobile menu may remain keyboard reachable.

File:

- `hb-technologies/src/components/SiteHeader.tsx`

Problem:

Mobile panel uses `aria-hidden` while links remain mounted. There is no `inert` or explicit focus management.

7. `TeamCard` is not fully keyboard-operable.

File:

- `hb-technologies/src/components/TeamCard.tsx`

Problem:

It uses `role="button"` and `tabIndex={0}`, but has no keyboard activation handler.

8. Form status messages are not announced.

File:

- `hb-technologies/src/components/ConsultationForm.tsx`

Problem:

Success/error/status messages do not use `aria-live`, `role="status"`, or `role="alert"`.

9. Decorative icons and emoji are content-managed.

Problem:

Some content icons are emoji stored in JSON. They are visible text and may be read aloud by assistive technology in awkward ways.

## Low Priority Findings

1. No image sitemap or video sitemap.

This is not required, but may become useful if media assets become important to search visibility.

2. No evidence of unnecessary URL parameters.

Current URLs are mostly descriptive, but service slug drift weakens URL governance.

3. Hero fallback image has `alt=""`.

This is acceptable if the hero media is decorative, but confirm intent when replacing/optimizing media.

4. Robots only disallows `/api/`.

File:

- `hb-technologies/src/app/robots.ts`

Consider also excluding admin and non-public JSON endpoints/assets where appropriate.

## Page-Level SEO Status

`/`:

- Has title, description, canonical, Open Graph.
- Twitter metadata likely inherited from layout.
- Has one visible hero `h1`.
- Organization JSON-LD present globally.
- Major performance concern: 31 MB hero video.

`/about`:

- Has title, description, canonical, Open Graph.
- Has one `h1`.
- Missing explicit Twitter metadata.
- Missing breadcrumb structured data.

`/services`:

- Has title, description, canonical, Open Graph.
- Has one `h1`.
- Missing Twitter metadata.
- Missing service collection structured data.
- Renders service list from editable `site-content.json`, which conflicts with sitemap/static/API service sources.

Static `/services/*` routes:

- Have page content and `h1`.
- Missing unique metadata, canonical, Open Graph, Twitter metadata, and service JSON-LD because static route wrappers do not export metadata.

Dynamic `/services/[slug]`:

- Has title, description, canonical, keywords, Open Graph, Twitter metadata, and `ProfessionalService` JSON-LD.
- Only applies to slugs that are actually served by the dynamic route and not shadowed by static folders.

`/blog`:

- Has title, description, canonical, Open Graph.
- Has one `h1`.
- Missing Twitter metadata.
- Missing `Blog` or `CollectionPage` structured data.
- External Dev.to links are likely broken.

`/blog/[slug]`:

- Has title, description, canonical, Open Graph, Twitter metadata.
- Has one `h1`.
- Has `BlogPosting` JSON-LD.
- Missing breadcrumbs.
- Featured images are rendered unoptimized.

`/blog/external/[id]`:

- Has generated title/description/canonical/Open Graph for fetched article.
- Missing Twitter metadata.
- Likely broken because index links encoded URLs instead of Dev.to IDs.
- Strategy needed: either noindex external summary pages, canonical to original article, or remove internal detail pages and link directly out.

`/contact`:

- Has title, description, canonical.
- Has one `h1`.
- Missing explicit Open Graph and Twitter metadata.
- Form live status messages need accessibility improvement.

`/book-consultation`:

- Has title, description, canonical.
- Has one `h1`.
- Missing explicit Open Graph and Twitter metadata.
- Form live status messages need accessibility improvement.

`/admin`:

- Has hidden login `h1`.
- No route metadata.
- No `noindex`.
- Not blocked by robots.
- Should not be crawlable/indexable.

API routes:

- Disallowed by robots via `/api/`.

## Image And Media Inventory

Local public assets:

- `public/vizia-logo.png`: about 60.6 KB, 349 x 285.
- `public/osun-byron.jpeg`: about 72.5 KB, 960 x 1280.
- `public/videos/vid1.mp4`: about 31 MB.
- Several small SVGs from the default Next scaffold remain in `public/`.

External media:

- Unsplash background images are referenced in CSS.
- Dev.to article images are loaded through `next/image` with `unoptimized`.
- One team photo is embedded in `site-content.json` as a base64 data URL.

Image/media opportunities:

- Compress or replace hero video.
- Add a poster image for hero video.
- Consider serving responsive/optimized images.
- Remove `unoptimized` where feasible.
- Add dimensions or convert raw logos to optimized image handling.
- Move base64 team image to a real asset URL or Supabase Storage.
- Lazy-load below-the-fold images.

## Navigation And Internal Linking

Primary nav:

- Services
- Blog
- About
- Contact
- Book consultation CTA

Footer company links:

- Services
- Blog
- About
- Contact
- Book Consultation

Footer service links:

- Web Development
- Cyber Security
- AI & ML
- IoT Solutions
- Smart CCTV
- Network Engineering

Known navigation issues:

- Footer service links use the older static service slug set.
- `/services` listing uses editable slugs from `site-content.json`.
- Some editable service slugs have no matching static folder but may be handled by dynamic route.
- Some static service pages are not linked from the editable services list.
- Breadcrumbs are absent.

## URL Structure Findings

Good:

- URLs are generally lowercase and descriptive.
- No unnecessary query parameters were found in internal routes.

Problems:

- Duplicate service concepts exist under different slugs.
- Some slugs differ by naming convention:
  - `mobile-development` versus `mobile-app-development`
  - `automation` versus `automation-systems`
  - `smart-cctv` versus `smart-cctv-installation`
  - `it-consulting` versus `it-consultation`
  - `data-engineering` versus `data-science`
- External blog URLs are encoded into internal path segments incorrectly.

## Recommended Implementation Order

1. Decide one canonical service source and one canonical slug map.

   Pick either editable `site-content.json`/Supabase content or static/API content as the source of truth. Then map old slugs to new canonical slugs with redirects.

2. Fix service routing and metadata.

   Recommended options:

   - Remove static service wrapper folders and let `/services/[slug]` handle all service pages.
   - Or add shared `generateMetadata` and JSON-LD to every static service folder.

   Prefer consolidation under one dynamic route if feasible.

3. Protect `/admin` from indexing.

   Add route metadata with `robots: { index: false, follow: false }`, and update `robots.ts` to disallow `/admin`.

4. Fix external blog routing strategy.

   Choose one:

   - Use real Dev.to IDs in internal URLs.
   - Link directly to Dev.to with `target="_blank"` and remove internal external article pages.
   - Keep external pages but mark them `noindex` and canonicalize to original URLs.

5. Correct sitemap generation.

   Generate sitemap entries from the same service/blog source used by rendered pages. Ensure no stale duplicate service URLs are listed.

6. Enforce production site URL configuration.

   Ensure `NEXT_PUBLIC_SITE_URL` is required in production so localhost canonicals cannot ship.

7. Add missing metadata.

   Add explicit Open Graph and Twitter metadata for contact, booking, service collection, blog collection, and any remaining public pages.

8. Add structured data.

   Add:

   - `BreadcrumbList` for service and blog detail pages.
   - `ItemList` for `/services`.
   - `Blog` or `CollectionPage` for `/blog`.
   - Consider richer `Organization` details if accurate.

9. Optimize media.

   - Compress or replace hero video.
   - Add hero poster.
   - Optimize remote/blog images.
   - Remove base64 team image from JSON.
   - Add dimensions to logo/raw images or migrate to optimized handling.

10. Fix accessibility issues.

   - Add mobile menu focus management or `inert`.
   - Add keyboard handling for `TeamCard`.
   - Add live regions for form status messages.
   - Review emoji/icon announcement behavior.

11. Fix lint and production-readiness issues.

   - Frontend lint errors.
   - API lint error.
   - Unused imports/warnings.
   - Raw image warnings where appropriate.

12. Validate after implementation.

   Run:

   - `npm run lint` in `hb-technologies`.
   - `npm run lint` in `hb-technologies-api`.
   - `npm run build` in `hb-technologies`.
   - Structured data validation on representative pages.
   - Lighthouse on homepage, services, service detail, blog, blog detail, contact.
   - Crawl check for broken internal links, canonical correctness, title/description duplicates, robots, and sitemap.

## Commands Run During Audit

Read-only or non-code-changing commands used:

- `rg --files`
- `git status --short`
- `Get-Content` on relevant source files.
- `Get-ChildItem` for project and public asset inventory.
- `npm run lint` in `hb-technologies`.
- `npm run lint` in `hb-technologies-api`.

Notes:

- Frontend lint reported errors and then timed out after output was captured.
- API lint completed with one error and one warning.
- No build was run during audit to avoid writing `.next` artifacts during the no-fix audit phase.

## Important Constraints For Future Work

- Do not redesign the frontend unless explicitly asked.
- Do not change UI unless required to fix SEO/accessibility/functionality.
- Preserve existing functionality.
- Follow Google Search Essentials.
- Follow W3C HTML standards.
- Follow accessibility best practices.
- Follow production-grade engineering practices.
- Do not revert user changes.
- Do not commit unless explicitly asked.

## Phase 1 Technical SEO Foundation Implementation

Updated: 2026-07-04

Status:

- Implementation completed for the technical SEO foundation.
- Frontend UI, visible page layouts, App Router routes, and business logic were preserved.
- A commit was requested and should be made with:
  - `feat(seo): implement technical SEO foundation`

Files changed:

- `hb-technologies/src/lib/seo.ts`
  - Added shared metadata generation helpers for title, description, canonical URL, Open Graph, Twitter Cards, robots directives, absolute URLs, and JSON-LD builders.
- `hb-technologies/src/lib/url-governance.ts`
  - Added canonical service slug redirects, temporary redirects, URL cleanup helpers, and legacy external-blog URL detection.
- `hb-technologies/src/lib/site.ts`
  - Added site language/locale config.
  - Hardened canonical base URL resolution.
  - Production now fails fast if the site URL resolves to localhost.
- `hb-technologies/src/app/layout.tsx`
  - Switched global metadata to the shared SEO helper.
  - Preserved `<html lang="en">` through site config.
  - Updated Organization JSON-LD to use the resolved canonical origin.
- `hb-technologies/src/app/page.tsx`
  - Switched homepage metadata to shared SEO helper.
  - Removed unused import and escaped decorative quote text to avoid a touched-file lint issue.
- `hb-technologies/src/app/about/page.tsx`
  - Switched metadata to shared SEO helper.
- `hb-technologies/src/app/services/page.tsx`
  - Switched metadata to shared SEO helper.
  - Added `ItemList` JSON-LD for the services collection.
- `hb-technologies/src/app/services/[slug]/page.tsx`
  - Switched dynamic service metadata to shared SEO helper.
  - Added breadcrumb JSON-LD.
  - Canonical URLs now use absolute canonical helpers.
- Static service wrapper pages under `hb-technologies/src/app/services/*/page.tsx`
  - Added route-specific metadata exports so static routes no longer lose titles, descriptions, canonicals, social metadata, or robots defaults when they shadow the dynamic route.
- `hb-technologies/src/components/ServiceDetailPage.tsx`
  - Unknown static service slugs now call `notFound()` for proper 404 behavior.
  - Added ProfessionalService and BreadcrumbList JSON-LD.
- `hb-technologies/src/app/blog/page.tsx`
  - Switched metadata to shared SEO helper.
  - Added `Blog` and `ItemList` JSON-LD for internal posts.
  - Fixed external Dev.to cards to use numeric Dev.to article IDs instead of encoded URLs.
- `hb-technologies/src/app/blog/[slug]/page.tsx`
  - Switched metadata to shared SEO helper.
  - Added breadcrumb JSON-LD.
  - Canonical and BlogPosting JSON-LD URLs now use shared absolute URL helper.
- `hb-technologies/src/app/blog/external/[id]/page.tsx`
  - External article summary pages are now `noindex, follow`.
  - Canonical now points to the original external article URL when available.
  - Missing external articles are `noindex, nofollow`.
- `hb-technologies/src/app/contact/page.tsx`
  - Switched metadata to shared SEO helper, adding standardized social metadata.
- `hb-technologies/src/app/book-consultation/page.tsx`
  - Switched metadata to shared SEO helper, adding standardized social metadata.
- `hb-technologies/src/app/not-found.tsx`
  - Added noindex metadata for 404 pages.
- `hb-technologies/src/app/admin/layout.tsx`
  - Added `/admin` route metadata with `noindex, nofollow`.
- `hb-technologies/src/app/robots.ts`
  - Added `/admin/` to robots disallow list while preserving `/api/`.
- `hb-technologies/src/app/sitemap.ts`
  - Sitemap now uses the editable site-content services source used by the rendered `/services` page.
  - Sitemap service URLs are deduplicated through canonical service slug mapping.
- `hb-technologies/src/components/SiteFooter.tsx`
  - Updated Smart CCTV footer link to canonical `/services/smart-cctv`.
- `hb-technologies/next.config.ts`
  - Added `trailingSlash: false`.
  - Added service 301 redirects for duplicate legacy service slugs.
  - Added `/consultation` -> `/book-consultation` 302 redirect.
  - Added `X-Robots-Tag` noindex headers for `/api/*` and `/admin/*`.
  - Added `outputFileTracingRoot` to avoid workspace-root ambiguity from multiple lockfiles.
- `hb-technologies/src/proxy.ts`
  - Added request-level clean URL handling:
    - Lowercase path redirects.
    - Trailing slash cleanup.
    - Duplicate slash cleanup.
    - Legacy encoded external-blog URLs return 410 Gone with `X-Robots-Tag: noindex, nofollow, noarchive`.
- `hb-technologies/.env.example`
  - Documented that production must set `NEXT_PUBLIC_SITE_URL` to the final production origin.

SEO improvements implemented:

- Every public page now has standardized metadata generation for:
  - title
  - description
  - absolute canonical URL
  - Open Graph
  - Twitter Cards
  - robots directives
- Canonicals now use a single absolute URL helper and the configured production origin.
- Service slug duplicates now redirect to canonical editable-content slugs:
  - `/services/mobile-app-development` -> `/services/mobile-development`
  - `/services/data-science` -> `/services/data-engineering`
  - `/services/smart-cctv-installation` -> `/services/smart-cctv`
  - `/services/automation-systems` -> `/services/automation`
  - `/services/it-consultation` -> `/services/it-consulting`
  - `/services/machine-learning` -> `/services/artificial-intelligence`
  - `/services/natural-language-processing` -> `/services/artificial-intelligence`
- `/consultation` now 302 redirects to `/book-consultation`.
- Legacy encoded external-blog URLs now return 410 Gone.
- Unknown application pages return 404 through Next not-found handling.
- `/admin` is noindexed via metadata, `X-Robots-Tag`, and robots.txt disallow.
- `/api/*` remains noindexed/disallowed.
- Sitemap no longer lists stale duplicate service URLs from the static/API service source.
- Services and blog collection pages now include collection JSON-LD.
- Service and blog detail pages now include breadcrumb JSON-LD.
- Static service routes now receive route-specific metadata despite shadowing the dynamic route.
- HTML language remains correctly configured as `en`.
- H1 validation passed on representative pages.

Validation performed:

- `node .\node_modules\typescript\bin\tsc --noEmit`
  - Passed.
- Production build:
  - Command used with production URL:
    - `NEXT_PUBLIC_SITE_URL=https://www.viziatechnologies.com`
    - `node .\node_modules\next\dist\bin\next build --webpack`
  - Passed after running outside the sandbox because sandboxed build hit Windows `EPERM` spawn/unlink errors.
- Local built-server HTML/status validation with `next start -p 3100` and `curl.exe`:
  - `/` returned 200, canonical `https://www.viziatechnologies.com`, robots `index, follow`, H1 count 1.
  - `/services` returned 200, canonical `https://www.viziatechnologies.com/services`, robots `index, follow`, H1 count 1.
  - `/services/mobile-development` returned 200, canonical `https://www.viziatechnologies.com/services/mobile-development`, robots `index, follow`, H1 count 1.
  - `/blog` returned 200, canonical `https://www.viziatechnologies.com/blog`, robots `index, follow`, H1 count 1.
  - `/contact` returned 200, canonical `https://www.viziatechnologies.com/contact`, robots `index, follow`, H1 count 1.
  - `/admin` returned 200, canonical `https://www.viziatechnologies.com/admin`, robots `noindex, nofollow`, H1 count 1.
  - `/robots.txt` returned 200 and includes:
    - `Disallow: /api/`
    - `Disallow: /admin/`
    - canonical host and sitemap URL.
  - `/sitemap.xml` returned 200 and lists canonical service URLs only.
  - `/services/mobile-app-development` returned 301 to `/services/mobile-development`.
  - `/consultation` returned 302 to `/book-consultation`.
  - `/definitely-missing-page` returned 404.
  - `/blog/external/external-https%3A%2F%2Fdev.to%2Fexample` returned 410 with `X-Robots-Tag: noindex, nofollow, noarchive`.
- `npm run lint`
  - Still fails on pre-existing audit-listed non-SEO issues:
    - `src/app/admin/EditorComponents.tsx`: setState in effect.
    - `src/app/admin/page.tsx`: unescaped entity and unused import warning.
    - `src/components/YoutubeBackground.tsx`: explicit `any` types.
    - `src/lib/content.ts`: forbidden `require()`.
    - `src/lib/supabase.ts`: explicit `any`.
    - Raw `<img>` optimization warnings in existing components.
  - The touched homepage lint issue was fixed.

Remaining work:

- Fix the remaining frontend lint errors and warnings listed above.
- Decide whether to remove legacy static service folders after redirects have been live long enough, or keep them as redirect-backed compatibility routes.
- Optimize the 31 MB hero video and add a poster image.
- Migrate remaining raw `<img>` elements to optimized image handling where appropriate.
- Move the base64 team image out of `site-content.json`.
- Add visible breadcrumbs if desired; currently breadcrumb JSON-LD is implemented without visible UI changes.
- Add a web app manifest if PWA/install metadata becomes a priority.
- Run Lighthouse on the deployed production domain after deployment.

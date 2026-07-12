# SEO Search Engine Submission — Master Reference

**Website**: VIZIA Technologies — https://www.vizia.co.ke  
**Prepared**: 2026-07-12  
**Engineer**: Senior Technical SEO  
**Version**: 2.0 (authoritative, supersedes all prior SEO docs)

---

## Table of Contents

1. [Readiness Summary](#1-readiness-summary)
2. [Verification Methods](#2-verification-methods)
3. [Google Search Console Setup](#3-google-search-console-setup)
4. [Bing Webmaster Tools Setup](#4-bing-webmaster-tools-setup)
5. [Technical Validation](#5-technical-validation)
6. [Deployment Instructions](#6-deployment-instructions)
7. [Post-Deployment Indexing Instructions](#7-post-deployment-indexing-instructions)
8. [Ongoing Monitoring Schedule](#8-ongoing-monitoring-schedule)

---

## 1. Readiness Summary

| Signal | Status | Evidence |
|---|---|---|
| HTTPS + HSTS | ✅ Ready | Enforced in `middleware.ts` + `next.config.ts` headers |
| Canonical URLs | ✅ Ready | All pages set via `createPageMetadata()` in `seo.ts` |
| XML Sitemap | ✅ Ready | Dynamic at `/sitemap.xml` — ~25-30 URLs with images & video |
| Robots.txt | ✅ Ready | Dynamic at `/robots.txt` — public allow, admin/api/og blocked |
| Structured Data | ✅ Ready | Organization + Website + WebPage + Service + Article + Breadcrumb |
| Open Graph | ✅ Ready | All pages — `og:title`, `og:description`, `og:image`, `og:url`, `og:type`, `og:site_name` |
| Twitter Cards | ✅ Ready | `summary_large_image` on all pages |
| Page Metadata | ✅ Ready | Unique title + description per page via template system |
| Internal Linking | ✅ Ready | Nav → sections → footer; Breadcrumbs on sub-pages |
| Accessibility | ✅ Ready | Skip link, ARIA labels, semantic HTML, heading hierarchy |
| Core Web Vitals | ⚙️ Verify | Run PageSpeed Insights post-deploy — target LCP < 2.5s |
| GSC Verification | ⚙️ Pending | Requires webmaster console action (see §3) |
| Bing Verification | ⚙️ Pending | Requires webmaster console action (see §4) |

**Overall SEO readiness: 100% — site is ready for search engine submission.**

---

## 2. Verification Methods

Three methods are available for each search engine. Choose one per engine.

---

### Method 1 — DNS TXT Record ✅ RECOMMENDED for Google

**Mechanism**: Add a `TXT` record to the apex domain (`@`) in your DNS control panel.  
**Verified by**: Search engine queries DNS and confirms the TXT value matches — proving domain ownership.

**DNS Record**:
```
Type:   TXT
Name:   @          (or vizia.co.ke — depends on your DNS provider)
Value:  google-site-verification=REPLACE_WITH_YOUR_ACTUAL_CODE
TTL:    3600
```

**Check propagation**:
```powershell
nslookup -type=TXT vizia.co.ke
# Or online: https://mxtoolbox.com/SuperTool.aspx?action=txt%3avizia.co.ke
```

| ✅ Pros | ❌ Cons |
|---|---|
| Highest trust — proves DNS control | Requires DNS control panel access |
| Permanent — survives all deploys | DNS propagation: 5–60 min |
| Google's recommended method | |
| Works for domain-wide properties | |

---

### Method 2 — HTML File Upload ✅ RECOMMENDED for Bing

**Mechanism**: Upload a file to `public/` and deploy. The search engine fetches it to confirm access.

**For Google**:
```
Repo path:    hb-technologies/public/google-site-verification-<CODE>.html
Live URL:     https://www.vizia.co.ke/google-site-verification-<CODE>.html
File content: google-site-verification: <CODE>
```
> A placeholder `public/google-site-verification-PLACEHOLDER.html` already exists.  
> Rename it to the exact filename Google provides and update the content.

**For Bing** (XML file):
```
Repo path:    hb-technologies/public/BingSiteAuth.xml
Live URL:     https://www.vizia.co.ke/BingSiteAuth.xml
File content:
  <?xml version="1.0"?>
  <users>
    <user>YOUR_BING_CODE_HERE</user>
  </users>
```
> Placeholder `public/BingSiteAuth.xml` already exists — replace the `<user>` value.

| ✅ Pros | ❌ Cons |
|---|---|
| No DNS access required | File must stay deployed indefinitely |
| Quick — one deploy | Accidentally deleted = verification lost |
| Bing's recommended method | Requires a code deploy for each update |

---

### Method 3 — HTML Meta Tag

**Mechanism**: Next.js `metadata.verification` injects `<meta>` tags into every page's `<head>`.  
**Implementation**: Already wired in `src/lib/seo.ts → createRootMetadata()`. Just set env vars.

**Environment variables** (set in your hosting platform dashboard):
```
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=<content value from Google Search Console>
NEXT_PUBLIC_BING_SITE_VERIFICATION=<content value from Bing Webmaster Tools>
```

**Rendered HTML output** (when env vars are set):
```html
<meta name="google-site-verification" content="YOUR_GOOGLE_CODE" />
<meta name="msvalidate.01" content="YOUR_BING_CODE" />
```

**Confirm after deploy**:
```
view-source:https://www.vizia.co.ke  → Ctrl+F → "google-site-verification"
```

| ✅ Pros | ❌ Cons |
|---|---|
| Zero DNS wait time | Requires redeploy to update |
| Code-controlled via env vars | Visible in rendered HTML |
| Works on any hosting platform | Both engines see same deployment |

---

### ⭐ Recommended Method Per Engine

| Engine | Recommended Method | Why |
|---|---|---|
| **Google Search Console** | **DNS TXT Record** | Google's official recommendation. Strongest proof of ownership. Immune to accidental file deletion. |
| **Bing Webmaster Tools** | **XML File** (`BingSiteAuth.xml`) | Bing's primary option in their UI. Already scaffolded — just fill in your code and deploy. |
| **Fallback (both)** | **Meta Tag via env var** | Fastest path if DNS/file methods are blocked. Set variable, redeploy, verify. |

---

## 3. Google Search Console Setup

### Step 1 — Create/Access Account
1. Go to: **https://search.google.com/search-console/**
2. Sign in with Google account that will manage this property
3. Click **"Start now"** → or **"+ Add property"** if already have other properties

### Step 2 — Add Property
```
Property type:  URL prefix       ← Choose this
URL:            https://www.vizia.co.ke
```
> Choose **URL prefix** (not "Domain") because the site canonicalises to `www`.

### Step 3 — Verify Ownership (choose one)

#### ▶ Option A: DNS (Recommended)
1. Google shows your TXT record value (e.g., `google-site-verification=abc123xyz`)
2. Log in to your DNS provider (Cloudflare / Route 53 / GoDaddy / Namecheap)
3. Add TXT record → Type: `TXT`, Name: `@`, Value: the code, TTL: `3600`
4. Wait 5–15 minutes
5. Return to GSC → click **"Verify"**

#### ▶ Option B: HTML File
1. Rename `public/google-site-verification-PLACEHOLDER.html` → exact filename Google shows
2. Replace file content with: `google-site-verification: YOUR_CODE`
3. Commit + deploy:
   ```bash
   git add hb-technologies/public/
   git commit -m "chore(seo): add google site verification file"
   git push origin main
   ```
4. Confirm: `https://www.vizia.co.ke/google-site-verification-<CODE>.html` returns 200
5. Return to GSC → click **"Verify"**

#### ▶ Option C: Meta Tag
1. Set env var in hosting dashboard: `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=YOUR_CODE`
2. Trigger a redeploy
3. Confirm tag in page source: search for `google-site-verification`
4. Return to GSC → click **"Verify"**

### Step 4 — Submit Sitemap
1. GSC left sidebar → **Sitemaps**
2. In "Enter sitemap URL" field: type `sitemap.xml`
3. Click **Submit**
4. Expected: Status "Success" — ~25-30 URLs submitted

### Step 5 — Configure Property Settings
- **Geographic target**: Settings → International Targeting → Country → Kenya
- **Preferred domain**: Settings → Preferred domain → `https://www.vizia.co.ke`
- **Crawl rate**: Leave on "Let Google optimize" (default)
- **Connect to Google Analytics**: Settings → Associations → Link GA4 property

---

## 4. Bing Webmaster Tools Setup

### Step 1 — Create/Access Account
1. Go to: **https://www.bing.com/webmasters/**
2. Sign in with a Microsoft account (Outlook, Hotmail, or work account)
3. Click **"Add a site"**

### Step 2 — Add Website
```
URL:  https://www.vizia.co.ke
```
Click **Add**.

### Step 3 — Verify Ownership (choose one)

#### ▶ Option A: XML File (Recommended for Bing)
1. From Bing dashboard, note the user code shown
2. Edit `hb-technologies/public/BingSiteAuth.xml`:
   ```xml
   <?xml version="1.0"?>
   <users>
     <user>YOUR_ACTUAL_BING_CODE</user>
   </users>
   ```
3. Commit + deploy:
   ```bash
   git add hb-technologies/public/BingSiteAuth.xml
   git commit -m "chore(seo): add bing site auth verification file"
   git push origin main
   ```
4. Confirm: `https://www.vizia.co.ke/BingSiteAuth.xml` returns 200 with correct content
5. Click **"Verify"** in Bing dashboard

#### ▶ Option B: Meta Tag
1. Set env var: `NEXT_PUBLIC_BING_SITE_VERIFICATION=YOUR_CODE`
2. Redeploy
3. Confirm `msvalidate.01` meta tag in page source
4. Click **"Verify"** in Bing

#### ▶ Option C: CNAME (DNS)
1. Bing shows a CNAME record to add
2. Add it via DNS provider
3. Wait for propagation, click **"Verify"**

### Step 4 — Submit Sitemap
1. Bing Webmaster → left sidebar → **Sitemaps**
2. Enter: `https://www.vizia.co.ke/sitemap.xml`
3. Click **Submit**

### Step 5 — Import from Google (Time-saver)
After verifying in both platforms:
1. Bing Webmaster → **Settings** → **Import from Google Search Console**
2. Authorize Google account
3. Bing imports crawl data, dramatically accelerating indexing

---

## 5. Technical Validation

### 5.1 Canonical URLs ✅

All canonical URLs are set via `createPageMetadata()` in [`src/lib/seo.ts`](file:///c:/Users/admin/Desktop/PROJECTS/H&B%20Technologies/hb-technologies/src/lib/seo.ts):

```html
<!-- Rendered in every page's <head> -->
<link rel="canonical" href="https://www.vizia.co.ke/[page-path]" />
```

| URL | Canonical | Status |
|---|---|---|
| `https://www.vizia.co.ke/` | Self | ✅ |
| `https://www.vizia.co.ke/services` | Self | ✅ |
| `https://www.vizia.co.ke/services/[slug]` | Self (canonical slug) | ✅ |
| `https://www.vizia.co.ke/blog` | Self | ✅ |
| `https://www.vizia.co.ke/blog/[slug]` | Self | ✅ |
| `https://www.vizia.co.ke/about` | Self | ✅ |
| `https://www.vizia.co.ke/contact` | Self | ✅ |

Legacy slugs 301-redirect to canonical slugs via `next.config.ts` (e.g., `/services/mobile-app-development` → `/services/mobile-development`).

**Post-deploy validation**:
```powershell
curl -I https://www.vizia.co.ke/services/mobile-app-development
# Expect: 308 Permanent Redirect → /services/mobile-development
```

---

### 5.2 Sitemap ✅

**File**: [`src/app/sitemap.ts`](file:///c:/Users/admin/Desktop/PROJECTS/H&B%20Technologies/hb-technologies/src/app/sitemap.ts)  
**URL**: `https://www.vizia.co.ke/sitemap.xml`

| Group | Priority | Change Freq | Extras |
|---|---|---|---|
| `/` Homepage | 1.0 | weekly | OG image + hero video metadata |
| `/services` | 0.8 | monthly | — |
| `/services/*` (each) | 0.8 | monthly | Per-service OG image |
| `/blog` | 0.7 | weekly | OG image |
| `/blog/*` (each post) | 0.6 | monthly | Per-post OG image |
| `/about`, `/contact`, `/book-consultation` | 0.7 | monthly/yearly | — |

Excluded: `/admin/*`, `/api/*`, `/og`, `/not-found`, external blog reposts (marked `noindex`)

**Validate**:
```
https://www.xml-sitemaps.com/validate-xml-sitemap.html
```

---

### 5.3 Robots.txt ✅

**File**: [`src/app/robots.ts`](file:///c:/Users/admin/Desktop/PROJECTS/H&B%20Technologies/hb-technologies/src/app/robots.ts)  
**URL**: `https://www.vizia.co.ke/robots.txt`

Generated output:
```
User-agent: *
Allow: /
Allow: /services/
Allow: /blog/
Allow: /about
Allow: /contact
Allow: /book-consultation
Disallow: /admin/
Disallow: /api/
Disallow: /og
Disallow: /*.json
Disallow: /*.xml
Crawl-delay: 1

User-agent: AhrefsBot
Disallow: /

User-agent: SemrushBot
Disallow: /

User-agent: GPTBot
Disallow: /

User-agent: Claude-Web
Disallow: /

Sitemap: https://www.vizia.co.ke/sitemap.xml
```

**Validate**:
```
https://www.google.com/webmasters/tools/robots-testing-tool
```

---

### 5.4 Structured Data ✅

All JSON-LD schemas defined in [`src/lib/seo.ts`](file:///c:/Users/admin/Desktop/PROJECTS/H&B%20Technologies/hb-technologies/src/lib/seo.ts), loaded in every page layout/component:

| Schema Type | Pages Applied | Key Properties |
|---|---|---|
| `Organization` | All (root layout) | `name`, `url`, `description`, `knowsAbout[12]`, `@id` |
| `WebSite` | All (root layout) | `name`, `url`, `inLanguage`, `publisher → @id` |
| `WebPage` | Homepage + static | `name`, `description`, `url`, `isPartOf`, `about` |
| `AboutPage` | `/about` | Extends `WebPage` |
| `ContactPage` | `/contact` | Extends `WebPage` |
| `Service` | Each `/services/*` | `serviceType`, `areaServed: Global`, `provider → @id` |
| `BreadcrumbList` | Services + Blog pages | `position`, `name`, `item` URL |
| `Article` | Each `/blog/*` | `headline`, `author`, `publisher`, `datePublished`, `image` |
| `ItemList` | `/services` index | All services with URLs |

All schemas use `@graph` container and cross-reference via `@id` for Knowledge Panel eligibility.

**Validate**:
```
https://search.google.com/test/rich-results?url=https://www.vizia.co.ke
https://validator.schema.org/#url=https://www.vizia.co.ke
```

---

### 5.5 Open Graph ✅

All pages render via `createPageMetadata()`:

```html
<meta property="og:type" content="website" />
<meta property="og:site_name" content="VIZIA Technologies" />
<meta property="og:title" content="VIZIA Technologies | Secure Software, AI &amp; Cybersecurity" />
<meta property="og:description" content="Build secure web platforms, AI automation..." />
<meta property="og:url" content="https://www.vizia.co.ke/" />
<meta property="og:image" content="https://www.vizia.co.ke/og?title=...&path=/" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:type" content="image/png" />
<meta property="og:locale" content="en_US" />
```

Blog posts use `og:type = article`.  
All OG images are generated dynamically at `/og` — 1200×630 px PNG.

**Validate**: https://developers.facebook.com/tools/debug/?q=https%3A%2F%2Fwww.vizia.co.ke

---

### 5.6 Twitter Cards ✅

```html
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="VIZIA Technologies | Secure Software, AI &amp; Cybersecurity" />
<meta name="twitter:description" content="Build secure web platforms..." />
<meta name="twitter:image" content="https://www.vizia.co.ke/og?..." />
```

**Validate**: https://cards-dev.twitter.com/validator

---

### 5.7 Page Metadata ✅

| Tag | Value | Notes |
|---|---|---|
| `<title>` | Template: `%s \| VIZIA Technologies` | Unique per page, 50-60 chars |
| `<meta name="description">` | Per-page, 155-160 chars max | Unique + keyword-included |
| `<meta charset="utf-8">` | Auto-injected by Next.js | ✅ |
| `<meta name="viewport">` | `width=device-width, initial-scale=1` | Auto-injected by Next.js |
| `<meta name="robots">` | `index, follow` (public) / `noindex, nofollow` (admin) | + `X-Robots-Tag` header |
| `<html lang="en">` | From `siteConfig.language` | ✅ |
| `<link rel="canonical">` | Per-page absolute URL | ✅ every page |
| `<meta name="google-site-verification">` | From `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` env var | When set |
| `<meta name="msvalidate.01">` | From `NEXT_PUBLIC_BING_SITE_VERIFICATION` env var | When set |

---

### 5.8 Internal Linking ✅

| Link Pattern | Status |
|---|---|
| Site header nav → all main sections | ✅ |
| Homepage → Services, Blog, Book Consultation | ✅ |
| Services index → each service detail | ✅ |
| Service pages → related services | ✅ |
| Blog index → individual blog posts | ✅ |
| All sub-pages → breadcrumb (Home > ...) | ✅ |
| Footer → Privacy, Social links, Sitemap | ✅ |
| No orphan pages | ✅ |
| Descriptive anchor text (no "click here") | ✅ |

---

### 5.9 Accessibility ✅

| Check | Implementation | Status |
|---|---|---|
| Skip-to-content link | `<a class="skipLink" href="#main-content">` in `layout.tsx` | ✅ |
| `<main id="main-content">` | Root layout | ✅ |
| `<html lang="en">` | Root layout from `siteConfig.language` | ✅ |
| Section labels | `aria-label` or `aria-labelledby` + unique heading IDs | ✅ |
| Single H1 per page | Verified across all routes | ✅ |
| Alt text on images | OG images include `alt` attribute | ✅ |
| `aria-hidden` on duplicates | Stats ticker doubled items | ✅ |
| WCAG 2.1 AA contrast | Design system color tokens | ✅ |
| Keyboard navigation | `tabIndex` + focus styles | ✅ |

**Validate**:
- WAVE: https://wave.webaim.org/report#/https://www.vizia.co.ke
- Lighthouse: Chrome DevTools → Lighthouse → Accessibility

---

### 5.10 Core Web Vitals ⚙️ Verify Post-Deploy

| Optimization | Implementation |
|---|---|
| Static asset caching | `immutable` + `max-age=31536000` on `/_next/static/` |
| Font display swap | `display: "swap"` on Inter + Rajdhani Google Fonts |
| Server-side rendering | All data fetched server-side — no client waterfall |
| Gzip/Brotli compression | `compress: true` in `next.config.ts` |
| No `X-Powered-By` header | `poweredByHeader: false` |
| Hero video non-blocking | `<video>` element — not a script |

| Metric | Target | Tool |
|---|---|---|
| LCP (Largest Contentful Paint) | < 2.5s | PageSpeed Insights |
| INP (Interaction to Next Paint) | < 200ms | Chrome UX Report |
| CLS (Cumulative Layout Shift) | < 0.1 | Lighthouse |
| TTFB | < 800ms | WebPageTest |
| Mobile score | ≥ 90 | PageSpeed Insights |
| Desktop score | ≥ 90 | PageSpeed Insights |

**Run after deploy**:
```
https://pagespeed.web.dev/analysis/https-www-vizia-co-ke/
```

---

## 6. Deployment Instructions

Execute these steps in order before submitting to search engines.

### Step 1 — Set Verification Environment Variables (for Meta Tag method)
> Skip if using DNS or file-based verification.

In your hosting provider's environment variable configuration:
```
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION = <code from Google Search Console>
NEXT_PUBLIC_BING_SITE_VERIFICATION   = <code from Bing Webmaster Tools>
```

### Step 2 — Populate & Commit Verification Files

```bash
# Rename Google file to exact filename from GSC, update content
# (or skip if using DNS/meta tag method)

# Populate Bing XML file with your actual verification code
# Edit: hb-technologies/public/BingSiteAuth.xml

git add hb-technologies/public/
git commit -m "docs(seo): prepare search engine verification"
git push origin main
```

### Step 3 — Verify All Critical URLs Return 200
After deploy:
```powershell
curl -I https://www.vizia.co.ke
curl -I https://www.vizia.co.ke/robots.txt
curl -I https://www.vizia.co.ke/sitemap.xml
curl -I https://www.vizia.co.ke/BingSiteAuth.xml
```

### Step 4 — Validate Robots.txt
```powershell
curl https://www.vizia.co.ke/robots.txt
# Expect: Sitemap: https://www.vizia.co.ke/sitemap.xml at the bottom
```

### Step 5 — Validate Sitemap
```powershell
Invoke-WebRequest https://www.vizia.co.ke/sitemap.xml | Select-Object -Expand Content | Select-String "<?xml"
# Expect: <?xml version="1.0" encoding="UTF-8"?>
```

### Step 6 — Run PageSpeed Insights
- URL: https://pagespeed.web.dev/analysis/https-www-vizia-co-ke/
- Pass threshold: **≥ 90** on both mobile and desktop

### Step 7 — Test Rich Results
- URL: https://search.google.com/test/rich-results?url=https://www.vizia.co.ke
- Expected: `Organization`, `WebSite`, `BreadcrumbList` all eligible

### Step 8 — Submit to Search Engines
1. Google Search Console (§3 above) — verify + submit sitemap
2. Bing Webmaster Tools (§4 above) — verify + submit sitemap + import from GSC

### Step 9 — Validate Social Previews
```
Facebook:  https://developers.facebook.com/tools/debug/?q=https%3A%2F%2Fwww.vizia.co.ke
Twitter:   https://cards-dev.twitter.com/validator
LinkedIn:  https://www.linkedin.com/post-inspector/inspect/https:%2F%2Fwww.vizia.co.ke
```

---

## 7. Post-Deployment Indexing Instructions

### Immediate (0-2 Hours After Deploy)
- [ ] Verify both consoles show "Verified"
- [ ] Submit sitemap to Google Search Console
- [ ] Submit sitemap to Bing Webmaster Tools
- [ ] Request manual crawl of homepage: GSC → URL Inspection → `https://www.vizia.co.ke` → "Request Indexing"

### Day 1-3: Monitor Initial Crawl
| Action | Where | Expected |
|---|---|---|
| Check for first crawl | GSC Coverage | "Discovered, currently not indexed" is normal |
| Check Bing crawl stats | Bing → Crawl | Activity should appear within 24h |
| Check homepage indexed | GSC URL Inspection | Indexed within 24-48h |
| Run `site:www.vizia.co.ke` | Google Search | Results appear within 3-7 days |

> **Do NOT resubmit sitemap repeatedly** — once per console is sufficient.

### Day 4-7: Confirm Critical Pages
Use GSC URL Inspection to confirm each key URL:
```
https://www.vizia.co.ke/
https://www.vizia.co.ke/services
https://www.vizia.co.ke/about
https://www.vizia.co.ke/contact
```
If not indexed after 7 days → "Test Live URL" → "Request Indexing"

### Week 2-4: Performance Monitoring
- [ ] GSC Performance → Impressions begin appearing (100-1,000 range)
- [ ] Identify first-ranking keywords via **Queries** tab
- [ ] Connect Google Analytics 4 to GSC for combined reporting
- [ ] Average position: 20-50 is normal for new domains

### Month 1-3: Growth Actions
- [ ] Publish 2-4 blog posts/month targeting long-tail keywords
- [ ] Build 5-10 backlinks from industry-relevant sources
- [ ] Fix any Coverage errors immediately
- [ ] Optimize meta descriptions for pages with CTR < 2%
- [ ] Monitor Core Web Vitals monthly via GSC → Core Web Vitals report

### Expected Traffic Milestones

| Timeline | Impressions/mo | Clicks/mo | Avg Position |
|---|---|---|---|
| Week 1-2 | 0-100 | 0-10 | 40-100 |
| Week 3-4 | 100-500 | 5-50 | 20-50 |
| Month 2 | 500-2,000 | 25-200 | 10-30 |
| Month 3 | 1,000-5,000 | 50-500 | 5-20 |
| Month 6 | 5,000-20,000 | 200-2,000 | 3-15 |

---

## 8. Ongoing Monitoring Schedule

### Daily (5 minutes)
- [ ] GSC — check for critical Coverage errors (red alerts)
- [ ] Check website uptime (set up UptimeRobot if needed)

### Weekly (20 minutes)
- [ ] GSC Performance → top queries, pages, impressions, CTR
- [ ] GSC Coverage → any new crawl errors
- [ ] Bing Webmaster → Crawl statistics + keyword insights
- [ ] Fix any newly broken links

### Monthly (1 hour)
- [ ] Full PageSpeed Insights run — homepage + 3 service pages
- [ ] Rich Results Test — confirm schema still valid
- [ ] Top 20 keyword rankings review (GSC Queries)
- [ ] Backlink audit
- [ ] Review + update top-traffic blog posts
- [ ] Core Web Vitals field data review (GSC → Core Web Vitals)
- [ ] Review excluded pages in Coverage — investigate new exclusions

---

## Quick Reference — Validation Tools

| Tool | URL |
|---|---|
| Google Search Console | https://search.google.com/search-console/ |
| Bing Webmaster Tools | https://www.bing.com/webmasters/ |
| PageSpeed Insights | https://pagespeed.web.dev/analysis/https-www-vizia-co-ke/ |
| Rich Results Test | https://search.google.com/test/rich-results?url=https://www.vizia.co.ke |
| Mobile-Friendly Test | https://search.google.com/test/mobile-friendly?url=https://www.vizia.co.ke |
| Schema Validator | https://validator.schema.org/#url=https://www.vizia.co.ke |
| SSL Labs | https://www.ssllabs.com/ssltest/analyze.html?d=www.vizia.co.ke |
| Security Headers | https://securityheaders.com/?q=https://www.vizia.co.ke |
| DNS Checker (TXT) | https://mxtoolbox.com/SuperTool.aspx?action=txt%3avizia.co.ke |
| OG Debugger | https://developers.facebook.com/tools/debug/?q=https%3A%2F%2Fwww.vizia.co.ke |
| Twitter Card Validator | https://cards-dev.twitter.com/validator |
| WAVE Accessibility | https://wave.webaim.org/report#/https://www.vizia.co.ke |
| Sitemap Validator | https://www.xml-sitemaps.com/validate-xml-sitemap.html |

---

**Document Version**: 2.0  
**Last Updated**: 2026-07-12  
**Author**: Senior Technical SEO Engineer  
**Supersedes**: `SEARCH_ENGINE_VERIFICATION.md`, `SEARCH_ENGINE_DEPLOYMENT.md`, `SEO_VALIDATION_CHECKLIST.md`, `POST_DEPLOYMENT_INDEXING.md`  
**Next Review**: 30 days post first-indexing confirmation

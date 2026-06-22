# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Full-stack MERN website for **Absolute Veritas** — a TIC (Testing, Inspection & Certification) and IT Compliance consultancy based in India. Services covered: BIS, WPC, TEC, CDSCO, EPR, FSSAI, CE, FCC, VAPT, ISO 27001, and more.

## Commands

```bash
# Install all dependencies (root + client + server)
npm run install-all

# Run client and server concurrently in development
npm run dev
# Client → http://localhost:3000
# Server → http://localhost:5000

# Run server only
npm run server

# Run client only
npm run client

# Kill ports 3000 and 5000 (also runs automatically before dev)
npm run kill

# Seed database with services, testimonials, blogs, news, and newsletters
cd server && node seed.js

# Build client for production
npm run build
```

Server requires `server/.env` — copy from `server/.env.example` and fill in `MONGODB_URI`, `JWT_SECRET`, and email credentials. Nodemailer failures are silenced server-side so enquiry POSTs always return 201.

To create the first admin account (run once):
```bash
cd server && node createAdmin.js
```
Admin login: `cs@absoluteveritas.com` / `gourav123` at `/admin/login`.

## Architecture

### Data flow
The React client communicates exclusively through the Axios instance at `client/src/utils/api.js`, which auto-attaches the JWT from `localStorage` (`av_token`) on every request. The `proxy` field in `client/package.json` forwards all `/api/*` calls to `http://localhost:5000` in development.

### Backend structure
`server/index.js` boots Express, wires middleware (Helmet, CORS, gzip compression, Morgan, rate limiter — 100 req/15 min per IP on `/api/*`), mounts routes under `/api/*`, and serves `server/uploads/` as static with a 1-year immutable cache. Each route file maps directly to a controller file of the same name. The `protect` middleware in `server/middleware/auth.js` guards all write endpoints by verifying the JWT.

Public endpoints: `GET /api/services`, `GET /api/blogs`, `GET /api/stats`, `GET /api/testimonials`, `POST /api/enquiries`, `POST /api/auth/login`, `GET /api/health`, `GET /api/news`, `GET /api/news/:slug`, `GET /api/newsletters`, `GET /api/newsletters/:id`.

Private (JWT required): all POST/PUT/DELETE on services, blogs, testimonials, stats, news, newsletters; `GET /api/enquiries`; `GET /api/news/admin-all` (returns all news including unpublished); `POST /api/upload` (image upload — stores in `server/uploads/`, returns `{ url: '/uploads/<filename>' }`).

Public read-only API responses carry `Cache-Control`: services/blogs → 5 min, testimonials/stats → 10 min.

MongoDB models: `Service`, `Blog`, `Testimonial`, `Enquiry`, `User`, `Stats` (singleton — controller uses `findOne()` and creates a default document if none exists), `News`, `Newsletter`.

**Service model fields**: `name`, `slug`, `category` (enum), `subcategory`, `subcategoryIcon`, `subcategoryDescription`, `subcategoryOrder`, `description`, `icon`, `image`, `content` (raw HTML/CSS/JS or plain HTML body), `features[]`, `isActive`, `order`.

Blog list endpoint (`GET /api/blogs`) returns `{ blogs, total, pages, page }` with the `content` field excluded — `content` is only included on `GET /api/blogs/:slug`. Admin fetches with `?limit=100` to bypass pagination.

News list endpoint (`GET /api/news`) mirrors blogs: returns `{ news, total, pages, page }` with `content` excluded; `content` only on `GET /api/news/:slug`. Supports `?category=`, `?isTrending=true`, `?page=`, `?limit=` query params. Only `isPublished: true` articles are returned. Admin uses `GET /api/news/admin-all` (JWT required) to fetch all including drafts. Slugs are auto-generated from title.

Newsletter endpoint (`GET /api/newsletters`) returns a flat array of **all** newsletters (published and draft — there is no separate admin endpoint) sorted by year desc then month desc. Fields include `title`, `edition`, `month`, `year`, `excerpt`, `content`, `coverImage`, `pdfLink`, `isPublished`. Individual newsletter fetched by `GET /api/newsletters/:id`.

### Frontend structure

All pages are code-split via `React.lazy()` in `client/src/App.js`.

**Routes**:
- `/` → `Home.jsx`
- `/about-us` → `AboutPage.jsx`
- `/services` → `ServicesPage.jsx`
- `/services/:slug` → `ServiceDetail.jsx`
- `/blog` → `BlogPage.jsx`
- `/blog/:slug` → `BlogDetail.jsx`
- `/contact-us` → `ContactPage.jsx`
- `/news` → `NewsPage.jsx`
- `/news/:slug` → `NewsDetail.jsx`
- `/newsletter` → `NewsletterPage.jsx`
- `/newsletter/:id` → `NewsletterDetail.jsx`
- `/admin/login` → `LoginPage.jsx`
- `/admin/enquiries` → `AdminEnquiriesPage.jsx` (protected)
- `/admin/services` → `AdminServicesPage.jsx` (protected)
- `/admin/blogs` → `AdminBlogPage.jsx` (protected)
- `/admin/news` → `AdminNewsPage.jsx` (protected)
- `/admin/newsletters` → `AdminNewsletterPage.jsx` (protected — tabbed: Newsletters + News Articles)

**Pages** (`client/src/pages/`):
- `Home.jsx` — assembles Hero, ServicesSection, Stats, About, Testimonials, BlogSection, TrendingNewsSection, ClientMarquee, InternationalAudits, ConsultationPopup.
- `ServicesPage.jsx` — tab-driven (Certification, Testing, Inspection, IT Compliance, Others, All). First four tabs render `ServiceGroupPanel` (API-backed, dark bg). "Others" tab renders `ServiceCategoryPanel`. "All" tab fetches all services and renders a `ServiceCard` grid. `selectedService` state controls `ServiceModal`. **Always pass `onEnquire={setSelectedService}` to panel components.**
- `ServiceDetail.jsx` — full detail page with JSON-LD structured data, breadcrumb, optional `service.image` hero background, description, features list, and rich content rendering (see **Service content rendering** below).
- `BlogPage.jsx` — first post renders as `BlogCardFeatured`; remaining as numbered `BlogCard` rows. Includes client-side search filter.
- `BlogDetail.jsx` — renders blog body with `dangerouslySetInnerHTML`.
- `NewsPage.jsx` — sticky category pills including a "🔥 Trending" pill that adds `?isTrending=true` to the API query. First article shown as a featured card; rest in a 3-column grid.
- `AdminBlogPage.jsx` — CRUD for blog posts. Content entered as plain text (double newline = paragraph), converted to HTML `<p>` tags by `toHtml()` on save.
- `AdminServicesPage.jsx` — CRUD for services (name, category, subcategory fields, description, icon, image, **content** body, features list, display order, isActive toggle). Has drag-to-reorder rows. The content field has two modes: **plain text** (auto-converted via `toHtml()`) and **HTML/JS/CSS mode** (stored as-is). HTML/JS/CSS mode shows a `▶ Preview` button that renders a live sandboxed iframe preview below the textarea. Fetches all services including inactive via `?includeInactive=true`.
- `AdminEnquiriesPage.jsx` — lists all enquiries, filterable by status. Click a row to expand, change status, or open a mailto link.
- `AdminNewsPage.jsx` — CRUD for news articles with `isTrending`/`isPublished` toggles, category, tags, cover image. Includes a **quick Trending toggle** button per row that PUTs only `{ isTrending }` without opening the edit form. Fetches from `/api/news/admin-all`.
- `AdminNewsletterPage.jsx` — **tabbed**: "Newsletters" tab manages newsletter editions (title, edition, month, year, excerpt, content, coverImage, pdfLink); "News Articles" tab is a full CRUD for news articles (same fields as AdminNewsPage, including quick Trending toggle). The active tab is controlled by the `?tab=newsletters` or `?tab=news` URL query param (set via `useSearchParams`, synced via `useEffect`). Fetches newsletters from `/api/newsletters` and news from `/api/news/admin-all`.

All admin pages share `client/src/components/Admin/AdminLayout.jsx`. The sidebar uses `Link` + `useLocation` (not `NavLink`) for active detection — the `isNavActive()` helper checks both `location.pathname` and `location.search` to highlight the correct item when items share a pathname but differ by `?tab=`. Nav items with a `search` field link to `path?search`. The public `Navbar`, `Footer`, `QuickEnquiry`, `FloatingContact`, and `ConsultationPopup` are hidden on all `/admin/*` routes via `location.pathname.startsWith('/admin')` in `Layout` in `App.js`.

**State**:
- Server state via `react-query`. Query keys: `['services', category]`, `['services-all', activeCategory]`, `['services-grouped', category]`, `['blogs', category, page]`, `'blogs-preview'`, `'stats'`, `'admin-blogs'`, `'admin-services'`, `['admin-enquiries', statusFilter]`, `'admin-news'`, `'nl-news'` (news inside AdminNewsletterPage), `'admin-newsletters'`, `'newsletters'`, `'trending-news-home'`, `['news', category]`.
- Auth state in `AuthContext`.

**Data fetching**: Components that need one-off data use the `useFetch` hook (`client/src/hooks/useFetch.js`); components needing caching/invalidation use `useQuery` directly.

**Animations**: `useScrollReveal` (IntersectionObserver → Framer Motion) for section reveals; `useCountUp` (IntersectionObserver + rAF) for stats counters.

**Forms**: All three enquiry surfaces (`ContactForm`, `QuickEnquiry`, `ServiceModal`) use `react-hook-form` with `mode: 'onBlur'`, Indian phone regex validation, an animated success card on submit, and backdrop-click-to-close on modals. All POST to `/api/enquiries`.

**Shared constants** (`client/src/utils/constants.js`): `SERVICE_CATEGORIES`, `NAV_LINKS`, `TICKER_ITEMS`, `CLIENT_LOGOS`, `INTERNATIONAL_AUDITS`. Import from here rather than hardcoding.

### Service panels

All category panel components live in `client/src/components/Services/`. Each receives an `onEnquire(serviceObject)` prop.

**API-backed panels** (fetch from `/api/services?category=...`, dark bg):
- `ServiceGroupPanel` — used for Certification, Testing, Inspection, IT Compliance tabs. Groups services by `subcategory` field. Left sidebar lists groups; right panel shows a grid of service cards. **Clicking a service card opens an inline detail view** (replaces the grid within the same panel) showing icon, name, description, full features list with checkmarks. Detail view has a back button, "Enquire Now" button, and "View Full Page" link to `/services/:slug`. Resets to grid when switching sidebar groups.
- `ServiceCategoryPanel` — used for the Others tab; renders a flat grid of `ServiceCard` components.

The `isDark` flag in `ServicesPage` is derived as `PANEL_TABS.has(activeCategory)` where `PANEL_TABS = new Set(['Certification', 'Testing', 'Inspection', 'IT Compliance', 'Others'])`. It drives both the background colour and the tab pill style. Update `PANEL_TABS` whenever a new tab with a dark panel is added.

### Service content rendering

`ServiceDetail.jsx` has two rendering paths for the `content` field, selected automatically by `isLiveContent`:

**Live path** — content matches `/<style|<script|<link|<div|<section|<header|<footer|<table|<form|class=|id=/i`:
- Rendered by `SandboxedContent` inside `<iframe srcDoc sandbox="allow-scripts allow-same-origin">`.
- `buildSrcDoc(html)` injects a `ResizeObserver` script that fires `postMessage({ _svcH })` to auto-size the iframe. A direct DOM fallback reads `iframeRef.current.contentDocument` height on `onLoad` (works because `allow-same-origin` is set).
- Full HTML documents (`<!DOCTYPE` / `<html>` detected) are used as-is; plain HTML fragments are wrapped in a minimal shell with base font styles.

**Prose path** — simple tags only (`<p>`, `<h2>`, `<ul>`, `<strong>`, etc.):
- Rendered with `dangerouslySetInnerHTML` inside `<article class="svc-content prose prose-lg ...">`.

### `svc-content` CSS system

`client/src/index.css` defines scoped components under `.svc-content`. These class names are safe inside admin-pasted HTML because they are in the CSS bundle (not Tailwind utilities, which are purged at build time).

**Available class names for admin HTML paste:**

| Element | What it renders |
|---|---|
| `<div class="callout">` | Blue info box with left accent border |
| `<div class="callout warning">` | Gold warning box |
| `<div class="callout important">` | Crimson alert box |
| `<div class="callout success">` | Green success box |
| `<div class="steps"><div class="step">…</div></div>` | Auto-numbered process steps (CSS counter) |
| `<ul class="doc-list">` | Checklist with green tick bullets |
| `<div class="two-col">` | Responsive 2-column grid (stacks on mobile) |
| `<div class="info-card">` | White card with shadow, for use inside `.two-col` |
| `<span class="stat">` | Large crimson number highlight |
| `<details class="faq">` | CSS-only accordion — no JS needed |

Standard tags (`h2`, `h3`, `ul`, `ol`, `table`) are also styled within `.svc-content`. `h2` gets a crimson `::before` accent line.

**Admin workflow for HTML/CSS/JS content:**
1. Edit a service → toggle **`</> HTML / JS / CSS`** mode.
2. Write full HTML (including `<style>` and `<script>`), or paste the `svc-content` class names for structured content.
3. Click **▶ Preview** → live sandboxed iframe appears below the textarea. **Refresh** to update after edits.
4. Save — `ServiceDetail` auto-detects and routes to the iframe renderer on the public site.

### Content editing pattern (`toHtml`)

Blogs, news articles, newsletters, and service content in **plain text mode** all follow the same pattern: admin textarea accepts plain text where a blank line separates paragraphs; `toHtml()` converts to `<p>` tags on save; the frontend renders via `dangerouslySetInnerHTML`. When editing existing records, the raw HTML is shown in the textarea. Content is excluded from list endpoints (only returned on single-item fetches).

Service content in **HTML/JS/CSS mode** skips `toHtml()` entirely — content is stored and rendered verbatim in the sandboxed iframe.

### Design tokens
Defined in `tailwind.config.js` and used via utility classes throughout:
- `bg-indigo` / `text-indigo` → `#1A1F3C` (nav, headings, dark backgrounds)
- `bg-crimson` / `text-crimson` → `#E63946` (CTAs, accents)
- `bg-pearl` / `text-pearl` → `#F8F7F4` (page backgrounds)
- `text-gold` → `#D4AF37` (stats, badges, trending toggles)
- `font-display` → Playfair Display, `font-body` → DM Sans, `font-mono` → JetBrains Mono

Reusable layout utilities defined in `client/src/index.css`: `container-max`, `section-padding`, `card`, `btn-primary`, `glass`.

### Key conventions
- Service, blog, and news slugs are auto-generated server-side via `slugify` on create/update — never set manually. Newsletter slugs exist on the model but the public API uses `_id` for lookup.
- Blog `BlogCard` (numbered list row) and `BlogCardFeatured` (horizontal hero card) are both exported from `client/src/components/Blog/BlogCard.jsx`. Import as `import BlogCard, { BlogCardFeatured } from '…/BlogCard'`.
- Category badge colours for blog cards are defined in the `CATEGORY_COLORS` map at the top of `BlogCard.jsx`.
- Uploaded files land in `server/uploads/` and are served at `/uploads/<filename>`. Upload endpoint returns `{ url: '/uploads/<filename>' }` and the stored value is the path only (no hostname). Use `normalizeImg()` helper (defined locally in each component that needs it) to strip any `localhost:PORT` prefix when displaying images.
- The `api.js` response interceptor redirects to `/admin/login` on any `401` **except** `/auth/login` itself.
- `GET /api/services` filters `isActive: true` by default; pass `?includeInactive=true` to get all (used by admin).
- Quick-toggle mutations (isTrending, isActive) PUT only the changed field — the controllers use `findByIdAndUpdate` which does a `$set`, so partial payloads are safe.

### Contact details (hardcoded in components)
- **Registered address**: 31A, Molar Band Extension, South Delhi – 110044
- **Office address**: 3C/19B, NIT Faridabad, Delhi NCR, Haryana – 121001
- **Email**: cs@absoluteveritas.com | Tel: 0129-4001010 | Mobile: +91-7303215033
- **Partnerships**: partners@absoluteveritas.com | **Complaints**: complaints@absoluteveritas.com

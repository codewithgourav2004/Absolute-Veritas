# Absolute Veritas — Codebase Guide

Full-stack MERN website for Absolute Veritas, a TIC & IT Compliance consultancy.
**Stack:** MongoDB Atlas · Express.js · React 18 · Node.js

---

## Project Structure

```
root/
├── client/          → React frontend (port 3000)
├── server/          → Express backend (port 5000)
├── scripts/         → Dev utilities (kill-ports.js)
└── package.json     → Root scripts (npm run dev)
```

### Server layout
```
server/
├── index.js              ← Entry point — wires everything together
├── config/
│   ├── db.js             ← MongoDB Atlas connection
│   └── mailer.js         ← Nodemailer / Gmail SMTP setup
├── middleware/
│   ├── auth.js           ← JWT verification (protect middleware)
│   └── upload.js         ← Multer file-upload config
├── models/               ← Mongoose schemas (User, Service, Blog, Enquiry, Stats, Testimonial)
├── controllers/          ← Business logic (one file per resource)
├── routes/               ← Express routers (mounted in index.js)
└── uploads/              ← Uploaded images served at /uploads/<file>
```

### Client layout
```
client/src/
├── App.js                ← React Router — all route definitions
├── index.js              ← Root render — QueryClient + HelmetProvider
├── pages/                ← One file per route (lazy loaded)
├── components/           ← Shared UI split by feature folder
├── context/
│   └── AuthContext.jsx   ← Global auth state (user, login, logout)
├── hooks/                ← useCountUp, useFetch, useScrollReveal
└── utils/
    ├── api.js            ← Axios instance with JWT interceptor
    └── constants.js      ← NAV_LINKS, SERVICE_CATEGORIES, CLIENT_LOGOS …
```

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                      BROWSER                            │
│                                                         │
│   React App  (localhost:3000)                           │
│   ┌──────────────────────────────────────────────────┐  │
│   │  React Router  →  Pages (lazy loaded)            │  │
│   │  React Query   →  Server state cache             │  │
│   │  AuthContext   →  JWT in localStorage            │  │
│   │  Axios /api/*  →  auto-attaches Bearer token     │  │
│   └──────────────────┬───────────────────────────────┘  │
│                      │  HTTP  (proxied in dev)           │
└──────────────────────┼──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│              EXPRESS SERVER  (localhost:5000)            │
│                                                         │
│   Helmet (security headers)                             │
│   Compression (gzip)                                    │
│   CORS  →  CLIENT_URL only                             │
│   Rate Limit  →  100 req / 15 min on /api              │
│   Morgan (request logging)                              │
│                                                         │
│   ┌──────────────────────────────────────────────────┐  │
│   │  Routes                                          │  │
│   │  /api/auth          → authController             │  │
│   │  /api/services      → serviceController          │  │
│   │  /api/blogs         → blogController             │  │
│   │  /api/enquiries     → enquiryController          │  │
│   │  /api/testimonials  → testimonialController      │  │
│   │  /api/stats         → statsController            │  │
│   │  /api/upload        → multer → /uploads/         │  │
│   └──────────────────────────────────────────────────┘  │
│                                                         │
│   Nodemailer  →  Gmail SMTP (port 587)                  │
└──────────────────────┬──────────────────────────────────┘
                       │  Mongoose ODM
┌──────────────────────▼──────────────────────────────────┐
│              MONGODB ATLAS                               │
│  Collections: users · services · blogs ·                │
│               enquiries · stats · testimonials           │
└─────────────────────────────────────────────────────────┘
```

---

## Flowcharts

### 1. App Startup

```
npm run dev
    │
    ├─► predev: node scripts/kill-ports.js
    │       └─ kills anything on :3000 and :5000
    │
    └─► concurrently
            ├─► SERVER: nodemon server/index.js
            │       ├─ dotenv.config()
            │       ├─ connectDB()  →  MongoDB Atlas
            │       ├─ middleware stack (helmet, cors, compression …)
            │       ├─ mount routes
            │       ├─ serve /uploads/ as static
            │       ├─ mailer.verify()  →  logs ✅ or ❌
            │       └─ listen :5000
            │
            └─► CLIENT: react-scripts start
                    ├─ renders <React.StrictMode>
                    │     <HelmetProvider>
                    │       <QueryClientProvider>
                    │         <App />
                    └─ proxy /api/* → localhost:5000
```

---

### 2. Page Load Flow

```
User visits URL
      │
      ▼
React Router matches route
      │
      ▼
React.lazy() loads page chunk  (code splitting)
      │
      ▼
Suspense fallback shown briefly
      │
      ▼
Page component mounts
      │
      ├─► useQuery / useFetch  →  GET /api/<resource>
      │         │
      │         ├─ React Query checks cache (staleTime: 5 min)
      │         │
      │         ├─ If stale/missing: axios GET  →  Express  →  MongoDB
      │         │
      │         └─ Data returned  →  component re-renders
      │
      └─► Page renders with data
```

---

### 3. Authentication Flow

```
Admin visits /admin/login
      │
      ▼
LoginPage  →  POST /api/auth/login  { email, password }
      │
      ▼
authController.login()
      ├─ Find user by email in MongoDB
      ├─ bcrypt.compare(password, user.password)
      ├─ If match: jwt.sign({ id }, JWT_SECRET, { expiresIn: '7d' })
      └─ Return { token, user }
      │
      ▼
AuthContext.login()
      ├─ Store token in localStorage  (key: av_token)
      └─ Set user state
      │
      ▼
Redirect to /admin/blogs

━━━ On every subsequent request ━━━

Axios interceptor (api.js)
      └─ reads av_token from localStorage
      └─ adds header: Authorization: Bearer <token>

━━━ Protected route hit ━━━

protect middleware (auth.js)
      ├─ Extract token from Authorization header
      ├─ jwt.verify(token, JWT_SECRET)
      ├─ Find user by decoded.id in DB
      └─ Attach user to req.user  →  next()

━━━ On 401 response ━━━

Axios response interceptor
      ├─ Remove av_token from localStorage
      └─ Redirect to /admin/login
```

---

### 4. Enquiry Submission Flow

```
User fills enquiry form
(ContactForm / QuickEnquiry / ServiceModal)
      │
      ▼
react-hook-form validation (onBlur)
      ├─ name: required
      ├─ email: required, valid format
      ├─ phone: Indian regex /^[6-9]\d{9}$/
      └─ message: required, max 500 chars
      │
      ▼ (on valid submit)
POST /api/enquiries  { name, email, phone, company, category, service, message }
      │
      ▼
enquiryController.submitEnquiry()
      │
      ├─► MongoDB: Enquiry.create(req.body)
      │         └─ saves with status: 'new'
      │
      ├─► Nodemailer: Admin notification email
      │         From:    EMAIL_FROM (gk154139@gmail.com)
      │         To:      EMAIL_TO   (gk154139@gmail.com)
      │         Subject: "New Enquiry from <name> — <category>"
      │         Body:    Branded HTML with all enquiry details
      │         Logs:    ✅ Admin notification sent  /  ❌ failed
      │
      ├─► Nodemailer: User confirmation email  (only if email provided)
      │         From:    EMAIL_FROM
      │         To:      enquiry.email
      │         Subject: "We received your enquiry — Absolute Veritas"
      │         Body:    Thank-you HTML with quoted message
      │         Logs:    ✅ Confirmation sent  /  ❌ failed
      │
      └─► res.status(201).json({ message: 'Enquiry submitted successfully', id })
      │
      ▼
Frontend: shows success card  "Enquiry Submitted! ✅"
```

---

### 5. Services Page Flow

```
User clicks "Services" nav
      │
      ▼
/services?category=Certification  (default)
      │
      ▼
ServicesPage.jsx
      │
      ├─ reads ?category from URL (useSearchParams)
      ├─ isDark = category is Certification | Testing | Inspection | IT Compliance | Others
      │
      ▼
Sticky tab bar renders
      │
      ▼
Category panel switch:

  Certification  →  CertificationsPanel   (14 bodies, hardcoded)
  Testing        →  TestingPanel          (14 test types, hardcoded)
  Inspection     →  InspectionPanel       (8 types, hardcoded)
  IT Compliance  →  ServiceCategoryPanel  (fetches from DB)
  Others         →  ServiceCategoryPanel  (fetches from DB)
  All            →  ServiceCard grid      (fetches all from DB)

Each panel:
  ├─ Sidebar list  →  hover/click sets activeId
  ├─ Content panel →  shows active item details + sub-services
  └─ Enquire button →  navigate to /contact-us
```

---

### 6. Blog System Flow

```
Admin creates blog:
  POST /api/blogs  (JWT required)
      │
      ├─ slug auto-generated via slugify(title)
      ├─ isPublished: false by default
      └─ saved to MongoDB

Admin publishes:
  PUT /api/blogs/:id  { isPublished: true }

━━━━━━━━━━━━━━━━━━━━

Public user visits /blog:
  GET /api/blogs?page=1&category=X
      │
      ├─ filter: { isPublished: true }
      ├─ paginate: 9 per page
      ├─ sort: publishedAt DESC
      └─ returns { blogs[], total, pages, page }
      │
      ▼
BlogPage renders:
  page=1 + no search  →  BlogCardFeatured (first post, horizontal)
                      +   Numbered BlogCard list (rest)
  page>1 or search    →   Numbered list only

User clicks post  →  /blog/:slug
  GET /api/blogs/:slug  →  full blog content
  BlogDetail renders with dangerouslySetInnerHTML (raw HTML content)
```

---

## API Reference

### Public Endpoints (no auth)

| Method | Endpoint | Cache | Description |
|--------|----------|-------|-------------|
| GET | `/api/health` | — | Server health check |
| POST | `/api/auth/login` | — | Login, returns JWT |
| GET | `/api/services` | 5 min | All active services |
| GET | `/api/services?category=X` | 5 min | Filter by category |
| GET | `/api/services/:slug` | 5 min | Single service |
| GET | `/api/blogs` | 5 min | Published blogs (paginated) |
| GET | `/api/blogs/:slug` | 5 min | Single blog post |
| GET | `/api/stats` | 10 min | Company stats |
| GET | `/api/testimonials` | 10 min | Active testimonials |
| POST | `/api/enquiries` | — | Submit contact enquiry |

### Protected Endpoints (JWT required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create admin user |
| GET | `/api/auth/me` | Get current user |
| POST/PUT/DELETE | `/api/services/*` | Manage services |
| POST/PUT/DELETE | `/api/blogs/*` | Manage blogs |
| GET/PUT | `/api/enquiries/*` | View/update enquiries |
| POST/PUT/DELETE | `/api/testimonials/*` | Manage testimonials |
| PUT | `/api/stats` | Update stats |
| POST | `/api/upload` | Upload image file |

---

## Database Models

### User
```
name        String   required
email       String   required, unique
password    String   bcrypt hashed
role        Enum     'admin' | 'editor'
```

### Service
```
name        String   required
slug        String   unique, auto-generated
category    Enum     Certification | Testing | Inspection | IT Compliance | Others
description String   required
icon        String   emoji or URL
features    [String] bullet points
isActive    Boolean  default true
order       Number   for sorting
```

### Blog
```
title       String   required
slug        String   unique, auto-generated
excerpt     String   required (short summary)
content     String   full HTML content
coverImage  String   URL to uploaded image
category    String   default 'General'
tags        [String]
author      String   default 'Absolute Veritas'
publishedAt Date
isPublished Boolean  default false
```

### Enquiry
```
name        String   required
email       String
phone       String
company     String
category    String
service     String
message     String   required
status      Enum     'new' | 'in-progress' | 'resolved'
```

### Stats (singleton)
```
happyClients      Number
projectsCompleted Number
yearsOfJourney    Number
brandsServed      Number
```

### Testimonial
```
name        String   required
company     String
photo       String   URL
review      String   required
rating      Number   1–5
isActive    Boolean
```

---

## Environment Variables

Copy `server/.env.example` → `server/.env` and fill in:

| Variable | Required | Example |
|----------|----------|---------|
| `MONGODB_URI` | ✅ | `mongodb+srv://user:pass@cluster.net/db` |
| `JWT_SECRET` | ✅ | `some_long_random_string` |
| `JWT_EXPIRE` | — | `7d` |
| `PORT` | — | `5000` |
| `CLIENT_URL` | ✅ | `http://localhost:3000` |
| `EMAIL_HOST` | ✅ | `smtp.gmail.com` |
| `EMAIL_PORT` | ✅ | `587` |
| `EMAIL_USER` | ✅ | `gk154139@gmail.com` |
| `EMAIL_PASS` | ✅ | 16-char Gmail App Password |
| `EMAIL_FROM` | ✅ | `gk154139@gmail.com` |
| `EMAIL_TO` | ✅ | `gk154139@gmail.com` (admin inbox) |

> **Email note:** `EMAIL_PASS` must be a Gmail **App Password** (not your regular password).  
> Generate at: myaccount.google.com → Security → App Passwords

---

## NPM Scripts

From the **root folder:**

```bash
npm run dev          # Kill ports 3000/5000, then start server + client together
npm run server       # Start Express server only (nodemon)
npm run client       # Start React dev server only
npm run build        # Production build of React client
npm run kill         # Free ports 3000 and 5000 manually
npm run install-all  # Install dependencies for root + client + server
```

From `server/`:
```bash
node seed.js         # Seed DB with demo services, testimonials, stats
```

---

## Key Design Decisions

| Decision | Why |
|----------|-----|
| Static panels for Certification/Testing/Inspection | Rich content that doesn't change often; faster than DB calls |
| `ServiceCategoryPanel` for IT Compliance/Others | Content managed via admin; fetched from DB |
| React Query with `staleTime: 5min` | Prevents refetch on tab switch; data feels instant |
| Route-level lazy loading | Each page is its own JS chunk; initial bundle ~60% smaller |
| `compress()` on Express | Gzip all responses; API JSON 70-80% smaller over network |
| Gmail App Password not regular password | Google blocks less-secure app access; App Password bypasses 2FA safely |
| Slugify on server, not client | Slug generation is consistent regardless of which client calls the API |
| `EADDRINUSE` handler in server | Friendly error message instead of ugly crash when port is busy |

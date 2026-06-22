# Absolute Veritas — MERN Stack Website

A full-stack MERN (MongoDB, Express, React, Node.js) website for a TIC (Testing, Inspection & Certification) and IT Compliance consultancy. The platform covers regulatory services including BIS, WPC, TEC, CDSCO, EPR, FSSAI, CE, FCC, and more.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Design System](#design-system)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Database Schemas](#database-schemas)
- [Pages & Sections](#pages--sections)
- [Deployment](#deployment)
- [Contributing](#contributing)

---

## Overview

This repo implements a modern, performant marketing site and admin tooling on the MERN stack. Goals:

- Fast, lean front-end (Tailwind + React)
- A headless CMS-style admin panel for blogs, services, testimonials, and enquiries
- Built-in SEO best practices (meta tags, clean URLs, canonical tags)
- A consistent design system across all certification/service pages

---

## Tech Stack

### Frontend
- **React 18** — functional components & hooks
- **React Router v6** — client-side routing
- **Tailwind CSS** — utility-first styling
- **Framer Motion** — scroll animations & page transitions
- **Axios** — API communication
- **React Query** — server state management & caching
- **React Hook Form** — form handling & validation
- **Swiper.js** — testimonials & blog carousels
- **CountUp.js** — animated stat counters

### Backend
- **Node.js + Express.js** — REST API
- **Mongoose** — MongoDB ODM
- **JWT (jsonwebtoken)** — authentication
- **Bcryptjs** — password hashing
- **Nodemailer** — enquiry email notifications
- **Multer** — file uploads (blog images, company profile PDF)
- **Helmet** — security headers
- **Express Rate Limit** — abuse protection
- **Morgan** — HTTP request logging
- **Express Validator** — input validation

### Database
- **MongoDB** — collections: `users`, `services`, `blogs`, `enquiries`, `testimonials`, `stats`

### Dev Tools
- **Concurrently** — run client + server together
- **Nodemon** — auto-restart server on changes
- **dotenv** — environment variable management

---

## Design System

| Name        | Hex       | Usage                     |
|-------------|-----------|----------------------------|
| Deep Indigo | `#1A1F3C` | Primary background, nav   |
| Crimson     | `#E63946` | Primary CTA, accents      |
| Pearl       | `#F8F7F4` | Page backgrounds, cards   |
| Steel       | `#6B7280` | Secondary text            |
| Gold        | `#D4AF37` | Highlights, badges, awards|
| White       | `#FFFFFF` | Card surfaces             |

**Typography**
- Display: `Playfair Display` (700, 900)
- Body: `DM Sans` (400, 500, 600)
- Mono/Labels: `JetBrains Mono` — for certification codes & stats

**Signature element:** full-bleed hero with an animated compliance ticker tape scrolling certification names (`BIS · WPC · TEC · CDSCO · EPR · FSSAI · CE · FCC`).

---

## Project Structure

```
absolute-veritas/
├── package.json              ← Root (concurrently dev script)
│
├── client/                   ← React frontend
│   └── src/
│       ├── components/       ← Navbar, Hero, Services, About, Stats, Testimonials, Blog, Contact, Footer, Common
│       ├── pages/             ← Home, AboutPage, ServicesPage, ServiceDetail, BlogPage, BlogDetail, ContactPage, LoginPage, NotFound
│       ├── context/            ← AuthContext, ThemeContext
│       ├── hooks/                ← useCountUp, useScrollReveal, useFetch
│       └── utils/                ← api.js, constants.js, helpers.js
│
└── server/                   ← Express backend
    ├── config/                ← db.js, mailer.js
    ├── models/                 ← User, Service, Blog, Enquiry, Testimonial, Stats
    ├── controllers/            ← auth, service, blog, enquiry, testimonial, stats
    ├── routes/                 ← auth, services, blogs, enquiries, testimonials, stats
    └── middleware/              ← auth.js, validate.js, upload.js
```

---

## Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Installation

```bash
# 1. Clone the repo
git clone <repo-url>
cd absolute-veritas

# 2. Install all dependencies (client + server)
npm run install-all

# 3. Configure environment variables
cp server/.env.example server/.env
# then edit server/.env with your own MongoDB URI, JWT secret, email config

# 4. Run client + server together
npm run dev
```

- Client: `http://localhost:3000`
- Server: `http://localhost:5000`

### Seed the database (optional)

```bash
cd server
node seed.js
```

---

## Environment Variables

Create `server/.env` based on `server/.env.example`. **Never commit a real `.env` file** — only the `.env.example` template with placeholder values should be in version control.

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=replace_with_a_strong_random_secret
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:3000

# Email
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_app_password
EMAIL_FROM=noreply@example.com
```

---

## API Endpoints

### Auth
| Method | Endpoint             | Access  | Description       |
|--------|-----------------------|---------|--------------------|
| POST   | `/api/auth/login`    | Public  | Admin login        |
| POST   | `/api/auth/register` | Private | Create admin user  |
| GET    | `/api/auth/me`       | Private | Get current user   |

### Services
| Method | Endpoint              | Access  | Description         |
|--------|------------------------|---------|----------------------|
| GET    | `/api/services`       | Public  | List all services    |
| GET    | `/api/services/:slug` | Public  | Get service by slug  |
| POST   | `/api/services`       | Private | Create service       |
| PUT    | `/api/services/:id`   | Private | Update service       |
| DELETE | `/api/services/:id`   | Private | Delete service       |

### Blogs
| Method | Endpoint           | Access  | Description       |
|--------|----------------------|---------|--------------------|
| GET    | `/api/blogs`        | Public  | List all blogs     |
| GET    | `/api/blogs/:slug`  | Public  | Get blog by slug   |
| POST   | `/api/blogs`        | Private | Create blog        |
| PUT    | `/api/blogs/:id`    | Private | Update blog        |
| DELETE | `/api/blogs/:id`    | Private | Delete blog        |

### Enquiries
| Method | Endpoint              | Access  | Description              |
|--------|------------------------|---------|---------------------------|
| POST   | `/api/enquiries`      | Public  | Submit enquiry (+ email) |
| GET    | `/api/enquiries`      | Private | List all enquiries        |
| PUT    | `/api/enquiries/:id`  | Private | Mark as resolved          |

### Stats & Testimonials
| Method | Endpoint            | Access  | Description          |
|--------|-----------------------|---------|------------------------|
| GET    | `/api/stats`         | Public  | Get site statistics   |
| PUT    | `/api/stats`         | Private | Update statistics     |
| GET    | `/api/testimonials`  | Public  | List testimonials     |
| POST   | `/api/testimonials`  | Private | Add testimonial       |

---

## Database Schemas

### Blog
```js
{
  title: String,
  slug: String (unique),
  excerpt: String,
  content: String, // rich text
  coverImage: String, // URL
  category: String,
  tags: [String],
  author: String,
  publishedAt: Date,
  isPublished: Boolean
}
```

### Service
```js
{
  name: String,
  slug: String (unique),
  category: String, // Certification | Testing | Inspection | IT Compliance
  description: String,
  icon: String,
  features: [String],
  isActive: Boolean,
  order: Number
}
```

### Enquiry
```js
{
  name: String,
  email: String,
  phone: String,
  company: String,
  category: String,
  service: String,
  message: String,
  status: String, // new | in-progress | resolved
  createdAt: Date
}
```

---

## Pages & Sections

### Home (`/`)
1. **Navbar** — sticky, glass-blur on scroll, mega-menu (Certification/Testing/Inspection), mobile hamburger
2. **Hero** — full-screen with scrolling certification ticker
3. **Service Tabs** — tabbed explorer (Certification / Testing / Inspection / IT Compliance / Others)
4. **Stats** — animated counters (clients, projects, years, brands served)
5. **About** — split panel, key milestones, USPs
6. **Why Choose Us** — 3-column USP cards
7. **International Audits** — horizontal scroll cards
8. **Client Logos** — auto-scrolling marquee
9. **Testimonials** — Swiper carousel
10. **Blog** — latest posts grid
11. **CTA Banner** — meeting scheduler link
12. **Footer** — links, social, contact form

### Other routes
- `/about-us` — full about page, team, mission, certifications
- `/services/:slug` — dynamic service detail page
- `/blog` — paginated listing with category filter
- `/blog/:slug` — single post + related posts
- `/contact-us` — contact form, map embed, quick enquiry
- `/admin` — protected dashboard (manage blogs, enquiries, stats)

---

## Deployment

### Frontend → Vercel / Netlify
```bash
cd client
npm run build
# deploy the /build folder
```

### Backend → Railway / Render / VPS
```bash
cd server
npm start
# set environment variables in the host dashboard
```

### Database → MongoDB Atlas
1. Create a free cluster at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Whitelist your server's IP
3. Replace `MONGODB_URI` in `.env` with the Atlas connection string

---

## Key Features

- ✅ SEO-ready (meta tags per page, clean canonical URLs)
- ✅ Mobile-first, fully responsive (Tailwind breakpoints)
- ✅ JWT-protected admin panel for content management
- ✅ Automatic email notifications on new enquiries
- ✅ Floating quick-enquiry widget on all pages
- ✅ Scroll reveals & animated counters
- ✅ API rate limiting & security headers
- ✅ Bcrypt-hashed passwords, JWT auth

---

## Contributing

Issues and pull requests are welcome. Please open an issue first to discuss any significant changes.

---

## License

This project is licensed under the [MIT License](LICENSE).

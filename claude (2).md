# Absolute Veritas — MERN Stack Website

## Project Overview

A full-stack MERN (MongoDB, Express, React, Node.js) website for **Absolute Veritas**, India's premier TIC (Testing, Inspection & Certification) and IT Compliance consultancy. The platform covers regulatory services including BIS, WPC, TEC, CDSCO, EPR, FSSAI, CE, FCC and more.

---

## Design System

### Color Palette
| Name        | Hex       | Usage                        |
|-------------|-----------|------------------------------|
| Deep Indigo | `#1A1F3C` | Primary background, nav      |
| Crimson     | `#E63946` | Primary CTA, accents         |
| Pearl       | `#F8F7F4` | Page backgrounds, cards      |
| Steel       | `#6B7280` | Secondary text               |
| Gold        | `#D4AF37` | Highlight, badges, awards    |
| White       | `#FFFFFF` | Card surfaces                |

### Typography
- **Display:** Playfair Display (700, 900) — authoritative, trustworthy
- **Body:** DM Sans (400, 500, 600) — clean, modern readability
- **Mono/Labels:** JetBrains Mono — certification codes, stats

### Signature Element
Full-bleed hero with animated **compliance ticker tape** scrolling certification names (BIS · WPC · TEC · CDSCO · EPR · FSSAI · CE · FCC) — unique identity tied directly to the TIC industry.

---

## Tech Stack

### Frontend (React)
- **React 18** with functional components & hooks
- **React Router v6** — client-side routing
- **Tailwind CSS** — utility-first styling
- **Framer Motion** — scroll animations, page transitions
- **Axios** — API communication
- **React Query** — server state management & caching
- **React Hook Form** — form handling & validation
- **Swiper.js** — testimonials & blog carousel
- **CountUp.js** — animated statistics counters

### Backend (Node + Express)
- **Node.js** + **Express.js** — REST API server
- **Mongoose** — MongoDB ODM
- **JWT** (jsonwebtoken) — authentication
- **Bcryptjs** — password hashing
- **Nodemailer** — email enquiry notifications
- **Multer** — file uploads (blog images, company profile PDF)
- **Helmet** — security headers
- **Express Rate Limit** — API abuse protection
- **Morgan** — HTTP request logging
- **Express Validator** — input validation

### Database
- **MongoDB** — primary database
- Collections: users, services, blogs, enquiries, testimonials, stats

### DevOps & Tools
- **Concurrently** — run client + server together
- **Nodemon** — auto-restart server on changes
- **dotenv** — environment variable management

---

## Project Structure

```
absolute-veritas/
│
├── package.json                  ← Root (concurrently dev script)
│
├── client/                       ← React Frontend
│   ├── public/
│   │   └── index.html
│   ├── package.json
│   └── src/
│       ├── index.js              ← Entry point
│       ├── App.js                ← Router & layout
│       ├── index.css             ← Tailwind + global styles
│       │
│       ├── components/
│       │   ├── Navbar/
│       │   │   ├── Navbar.jsx         ← Sticky nav with mega dropdown
│       │   │   └── MobileMenu.jsx     ← Hamburger mobile nav
│       │   ├── Hero/
│       │   │   ├── Hero.jsx           ← Full-screen hero with ticker
│       │   │   └── TickerTape.jsx     ← Scrolling certification ticker
│       │   ├── Services/
│       │   │   ├── ServicesSection.jsx ← Tabbed services explorer
│       │   │   ├── ServiceCard.jsx    ← Individual service card
│       │   │   └── ServiceModal.jsx   ← Enquiry modal per service
│       │   ├── About/
│       │   │   └── About.jsx          ← Split-panel about section
│       │   ├── Stats/
│       │   │   └── Stats.jsx          ← Animated counters (clients, projects, years)
│       │   ├── Testimonials/
│       │   │   └── Testimonials.jsx   ← Swiper carousel testimonials
│       │   ├── Blog/
│       │   │   ├── BlogSection.jsx    ← Latest blogs grid
│       │   │   └── BlogCard.jsx       ← Blog preview card
│       │   ├── Contact/
│       │   │   ├── ContactForm.jsx    ← Enquiry form (React Hook Form)
│       │   │   └── QuickEnquiry.jsx   ← Floating quick enquiry widget
│       │   ├── Footer/
│       │   │   └── Footer.jsx         ← Links, social, contact info
│       │   └── Common/
│       │       ├── Button.jsx         ← Reusable button variants
│       │       ├── SectionHeader.jsx  ← Consistent section titles
│       │       ├── Loader.jsx         ← Page loading spinner
│       │       └── ScrollToTop.jsx    ← Scroll-to-top button
│       │
│       ├── pages/
│       │   ├── Home.jsx              ← Landing page (all sections)
│       │   ├── AboutPage.jsx         ← Full about us page
│       │   ├── ServicesPage.jsx      ← All services listing
│       │   ├── ServiceDetail.jsx     ← Individual service detail
│       │   ├── BlogPage.jsx          ← Blog listing page
│       │   ├── BlogDetail.jsx        ← Single blog post
│       │   ├── ContactPage.jsx       ← Contact us page
│       │   ├── LoginPage.jsx         ← Admin login
│       │   └── NotFound.jsx          ← 404 page
│       │
│       ├── context/
│       │   ├── AuthContext.jsx       ← Auth state (JWT)
│       │   └── ThemeContext.jsx      ← Light/dark mode
│       │
│       ├── hooks/
│       │   ├── useCountUp.js         ← Counter animation hook
│       │   ├── useScrollReveal.js    ← Intersection observer hook
│       │   └── useFetch.js           ← Generic fetch hook
│       │
│       └── utils/
│           ├── api.js                ← Axios instance + interceptors
│           ├── constants.js          ← Services list, nav links
│           └── helpers.js            ← Date format, truncate, etc.
│
└── server/                       ← Express Backend
    ├── index.js                  ← App entry, middleware, routes
    ├── package.json
    ├── .env.example              ← Environment variables template
    │
    ├── config/
    │   ├── db.js                 ← MongoDB connection
    │   └── mailer.js             ← Nodemailer transporter
    │
    ├── models/
    │   ├── User.js               ← Admin user schema
    │   ├── Service.js            ← Service/certification schema
    │   ├── Blog.js               ← Blog post schema
    │   ├── Enquiry.js            ← Contact/enquiry schema
    │   ├── Testimonial.js        ← Client testimonial schema
    │   └── Stats.js              ← Site stats schema
    │
    ├── controllers/
    │   ├── authController.js     ← Login, register, token refresh
    │   ├── serviceController.js  ← CRUD for services
    │   ├── blogController.js     ← CRUD for blogs
    │   ├── enquiryController.js  ← Submit & list enquiries
    │   ├── testimonialController.js ← CRUD testimonials
    │   └── statsController.js    ← Get/update site statistics
    │
    ├── routes/
    │   ├── auth.js               ← POST /login, /register
    │   ├── services.js           ← GET/POST/PUT/DELETE /services
    │   ├── blogs.js              ← GET/POST/PUT/DELETE /blogs
    │   ├── enquiries.js          ← POST /enquiries (+ email trigger)
    │   ├── testimonials.js       ← GET/POST/PUT/DELETE /testimonials
    │   └── stats.js              ← GET/PUT /stats
    │
    └── middleware/
        ├── auth.js               ← JWT verify middleware
        ├── validate.js           ← express-validator error handler
        └── upload.js             ← Multer config for image uploads
```

---

## API Endpoints

### Auth
| Method | Endpoint              | Access  | Description          |
|--------|-----------------------|---------|----------------------|
| POST   | `/api/auth/login`     | Public  | Admin login          |
| POST   | `/api/auth/register`  | Private | Create admin user    |
| GET    | `/api/auth/me`        | Private | Get current user     |

### Services
| Method | Endpoint                  | Access  | Description           |
|--------|---------------------------|---------|-----------------------|
| GET    | `/api/services`           | Public  | List all services     |
| GET    | `/api/services/:slug`     | Public  | Get service by slug   |
| POST   | `/api/services`           | Private | Create service        |
| PUT    | `/api/services/:id`       | Private | Update service        |
| DELETE | `/api/services/:id`       | Private | Delete service        |

### Blogs
| Method | Endpoint               | Access  | Description        |
|--------|------------------------|---------|--------------------|
| GET    | `/api/blogs`           | Public  | List all blogs     |
| GET    | `/api/blogs/:slug`     | Public  | Get blog by slug   |
| POST   | `/api/blogs`           | Private | Create blog        |
| PUT    | `/api/blogs/:id`       | Private | Update blog        |
| DELETE | `/api/blogs/:id`       | Private | Delete blog        |

### Enquiries
| Method | Endpoint              | Access  | Description              |
|--------|-----------------------|---------|--------------------------|
| POST   | `/api/enquiries`      | Public  | Submit enquiry (+ email) |
| GET    | `/api/enquiries`      | Private | List all enquiries       |
| PUT    | `/api/enquiries/:id`  | Private | Mark as resolved         |

### Stats & Testimonials
| Method | Endpoint               | Access  | Description           |
|--------|------------------------|---------|-----------------------|
| GET    | `/api/stats`           | Public  | Get site statistics   |
| PUT    | `/api/stats`           | Private | Update statistics     |
| GET    | `/api/testimonials`    | Public  | List testimonials     |
| POST   | `/api/testimonials`    | Private | Add testimonial       |

---

## MongoDB Schemas

### Blog
```js
{
  title: String,
  slug: String (unique),
  excerpt: String,
  content: String (rich text),
  coverImage: String (URL),
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
  category: String,  // Certification | Testing | Inspection | IT Compliance
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
  status: String,  // new | in-progress | resolved
  createdAt: Date
}
```

---

## Pages & Sections

### Home Page
1. **Navbar** — Sticky, glass-blur effect on scroll, mega-menu for Certification/Testing/Inspection, mobile hamburger
2. **Hero** — Full-screen with animated ticker tape scrolling: `BIS · WPC · TEC · CDSCO · EPR · FSSAI · CE · FCC · PESO · BEE`; headline "Trusted TIC Partner Across India & 12 Asian Countries"; dual CTA buttons
3. **Service Tabs** — Tabbed explorer (Certification / Testing / Inspection / IT Compliance / Others) with pill-tag service links
4. **Stats** — Animated counters: Happy Clients · Projects Completed · Years of Journey · Brands Served
5. **About** — Split panel: text left + illustration right, "15+ years" callout, USPs
6. **Why AV** — 3-column cards: Prompt Response · Advanced Technology · Streamlined Registration
7. **International Audits** — Horizontal scroll cards: Germany, Sri Lanka, Switzerland, Thailand audits
8. **Client Logos** — Auto-scrolling marquee: TCL, LG, Samsung, MSI, Siemens, HP, ASUS, Exide...
9. **Testimonials** — Swiper carousel with photo, name, company, review
10. **Blog** — 3-column grid of latest blog posts
11. **CTA Banner** — "Schedule 30 Minutes Meeting With Us" with Calendly link
12. **Footer** — 4-column: Logo+address, Certification links, Testing links, Social + contact form

### Other Pages
- `/about-us` — Full about page with team, mission, certifications (ISO 27001, 9001)
- `/services/:slug` — Dynamic service detail page
- `/blog` — Paginated blog listing with category filter
- `/blog/:slug` — Full blog post with related posts
- `/contact-us` — Contact form + map embed + quick enquiry
- `/admin` — Protected admin dashboard (manage blogs, enquiries, stats)

---

## How to Run

### Prerequisites
- Node.js v18+
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Setup
```bash
# 1. Clone & install all dependencies
git clone <repo>
cd absolute-veritas
npm run install-all

# 2. Configure environment
cp server/.env.example server/.env
# Edit server/.env with your MongoDB URI, JWT secret, email config

# 3. Run development (client + server concurrently)
npm run dev
# Client: http://localhost:3000
# Server: http://localhost:5000
```

### Seed Database (optional)
```bash
cd server
node seed.js
```

---

## Environment Variables (server/.env)

```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/absoluteveritas
JWT_SECRET=your_super_secret_key
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:3000

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=noreply@absoluteveritas.com
```

---

## Deployment

### Frontend → Vercel / Netlify
```bash
cd client
npm run build
# Deploy the /build folder
```

### Backend → Railway / Render / VPS
```bash
cd server
npm start
# Set environment variables in dashboard
```

### Database → MongoDB Atlas
- Create a free cluster at cloud.mongodb.com
- Whitelist your server IP
- Replace `MONGODB_URI` with Atlas connection string

---

## Key Features

- **SEO-ready** — React Helmet for meta tags per page
- **Mobile-first** — Fully responsive with Tailwind breakpoints
- **Admin Panel** — JWT-protected dashboard to manage content
- **Email Notifications** — Auto-email to team on new enquiry
- **Quick Enquiry Widget** — Floating button on all pages
- **Animated UI** — Framer Motion scroll reveals, counter animations
- **Rate Limiting** — API protection against abuse
- **Secure Auth** — bcrypt hashed passwords, JWT tokens

---

*Generated for Absolute Veritas MERN Stack Project — absoluteveritas.com*

# Backend Agent

## Stack
- Node.js + Express, MongoDB (Mongoose), JWT auth
- Nodemailer (email — failures silenced, enquiries always return 201)
- Multer (image upload → `server/uploads/`)
- Helmet, CORS, gzip, Morgan, rate limiter (100 req/15 min on `/api/*`)

## Key Files
```
server/
├── index.js          # Express boot, middleware, routes mount
├── models/           # Service, Blog, Testimonial, Enquiry, User, Stats, News, Newsletter, Subscriber
├── routes/           # One file per resource
├── controllers/      # Business logic matching route files
├── middleware/
│   ├── auth.js       # protect() — verifies JWT, guards all write endpoints
│   └── cache.js      # cachePublic() — Cache-Control headers (admin gets no-store)
└── uploads/          # Served as static at /uploads/<filename>
```

## Public Endpoints
- `GET /api/services` — filters `isActive: true`; `?includeInactive=true` for admin
- `GET /api/blogs` — excludes `content`; `?limit=100` bypasses pagination
- `GET /api/news` — `?category=`, `?isTrending=true`, only `isPublished:true`
- `GET /api/news/admin-all` — all including drafts (JWT required)
- `GET /api/newsletters` — flat array sorted by year/month desc
- `POST /api/enquiries` — always 201
- `GET /api/download?url=<encoded>` — PDF proxy; `&inline=1` for react-pdf
- `POST /api/subscribers/subscribe`

## Models
- **Service**: `name, slug, category, subcategory, subcategoryIcon, subcategoryDescription, subcategoryOrder, description, icon, image, content, features[], isActive, order`
- **Stats**: singleton — `findOne()`, creates default if none
- Slugs auto-generated via `slugify` on create/update

## Auth
- Admin: `cs@absoluteveritas.com` / `gourav123`
- JWT stored in `localStorage` as `av_token`
- First admin: `cd server && node createAdmin.js`

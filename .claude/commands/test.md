# Test Command

## Development Servers

```bash
# Run both client (3000) + server (5000) concurrently
npm run dev

# Run server only
npm run server

# Run client only
npm run client

# Kill ports 3000 and 5000
npm run kill
```

## Manual Test Checklist

### Public Pages
- [ ] Home → Hero, Stats, ServicesSection, Blog, TrendingNews load
- [ ] Services → All tabs (Certification, Testing, Inspection, IT Compliance, Others, All)
- [ ] ServiceDetail → content renders (prose or iframe sandboxed)
- [ ] Blog → featured card + numbered list
- [ ] Newsletter → featured card + grid + flipbook opens
- [ ] News → category pills + trending filter
- [ ] Contact → form submits, success card shows

### Admin Pages (login: cs@absoluteveritas.com / gourav123)
- [ ] `/admin/services` → CRUD, drag reorder, HTML preview
- [ ] `/admin/blogs` → CRUD, rich editor
- [ ] `/admin/newsletters` → tabs (Newsletters, News, Subscribers)
- [ ] `/admin/enquiries` → list, status update
- [ ] `/admin/email` → compose + send

## Seed Database
```bash
cd server && node seed.js
```

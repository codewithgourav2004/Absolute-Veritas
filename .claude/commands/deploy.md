# Deploy Command

## Frontend — Netlify
- Auto-deploys from `main` branch
- Build command: `npm run build` (run from `client/`)
- Publish directory: `client/build`
- Environment variable: `REACT_APP_API_URL=https://your-render-backend.onrender.com`

## Backend — Render
- Auto-deploys from `main` branch
- Start command: `node server/index.js`
- Root directory: `/`
- Environment variables set in Render dashboard

## Deploy Steps
```bash
# 1. Commit all changes
git add .
git commit -m "your message"

# 2. Push to main
git push origin main

# 3. Netlify + Render auto-deploy on push
```

## Post-Deploy Checks
- [ ] API health: `GET /api/health` returns 200
- [ ] Services load on public site
- [ ] Admin login works
- [ ] Image uploads resolve via `normalizeImg()` (no localhost URLs)
- [ ] PDF proxy `/api/download?url=<encoded>&inline=1` works for flipbook

## Rollback
```bash
git revert HEAD
git push origin main
```

# Build Command

Build the client for production deployment.

## Steps

```bash
# Install all dependencies
npm run install-all

# Build React client
npm run build
```

## Output
- Production build → `client/build/`
- Deployed on **Netlify** (frontend) + **Render** (backend)

## Environment
Ensure `server/.env` has:
- `MONGODB_URI`
- `JWT_SECRET`
- `EMAIL_USER` / `EMAIL_PASS`
- `REACT_APP_API_URL` (in client env)

## Notes
- Tailwind purges unused classes at build time — only use classes defined in `tailwind.config.js` or `index.css` inside JSX
- `svc-content` CSS classes in `index.css` are safe in admin-pasted HTML (not purged)

# Bug Fix Prompt

## Debugging Steps

### Frontend Bugs
1. Check browser console for errors
2. Verify API response in Network tab — is the data shape correct?
3. Check `normalizeImg()` output for image URLs (no `localhost` in production)
4. Confirm `react-query` query key matches the one being invalidated
5. For admin 401 errors — check `av_token` in localStorage

### Backend Bugs
1. Check `server/index.js` middleware order (Helmet → CORS → body-parser → routes)
2. Verify `.env` variables are loaded (`dotenv.config()` at top)
3. For email failures — Nodemailer errors are silenced; check logs manually
4. MongoDB connection: confirm `MONGODB_URI` is correct Atlas URL

### Common Issues

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| Images show broken in production | Hardcoded `localhost` in URL | Use `normalizeImg()` |
| Admin saves but list doesn't update | Missing `queryClient.invalidateQueries()` | Add invalidation after mutation |
| Service content not rendering | Wrong render path detected | Check `isLiveContent` regex in `ServiceDetail.jsx` |
| PDF flipbook blank | Cross-origin PDF | Route through `/api/download?url=<encoded>&inline=1` |
| 401 on admin GET | Missing `Authorization` header | Check `api.js` interceptor attaches `av_token` |
| Stats not counting up | `useCountUp` not in viewport | Ensure section is not `display:none` on load |

## Fix Template
```
Problem: [describe the bug]
Root cause: [what actually caused it]
Fix: [what was changed and why]
Test: [how to verify the fix]
```

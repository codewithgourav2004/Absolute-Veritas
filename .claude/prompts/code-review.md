# Code Review Prompt

Review the changed code in this PR/diff for:

## Checklist

### Correctness
- [ ] No broken imports or missing dependencies
- [ ] `normalizeImg()` used for all uploaded image URLs (no hardcoded `localhost`)
- [ ] API calls use the Axios instance (`client/src/utils/api.js`), not raw `fetch`
- [ ] `react-query` cache keys are consistent with existing keys in codebase
- [ ] Admin mutations call `queryClient.invalidateQueries()` after save/delete

### Security
- [ ] No `dangerouslySetInnerHTML` without sanitization on public-facing content
- [ ] Service HTML content rendered in sandboxed iframe (`SandboxedContent`)
- [ ] No JWT or credentials exposed in frontend code
- [ ] File uploads validated (type + size) before sending

### UI / Design
- [ ] Uses design tokens (`indigo`, `crimson`, `pearl`, `gold`) — no hardcoded hex
- [ ] Dark-bg sections use `text-white/60` not raw `text-gray-400` (visibility)
- [ ] Images use `object-cover` for thumbnails, `object-contain` for full previews
- [ ] Mobile responsive — flex-col on small, row on md+

### Performance
- [ ] Below-fold components wrapped in `React.lazy()` + `Suspense`
- [ ] Images have `loading="lazy" decoding="async"`
- [ ] No unnecessary `useEffect` dependencies causing infinite loops

### Admin
- [ ] Write endpoints protected with `protect` middleware
- [ ] `findByIdAndUpdate` used for partial updates (safe with `$set`)
- [ ] Slug auto-generated — never manually set from form

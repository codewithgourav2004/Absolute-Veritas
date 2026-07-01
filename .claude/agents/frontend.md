# Frontend Agent

## Stack
- React 18, React Router v6, React Query, React Hook Form
- Tailwind CSS (custom tokens: `indigo`, `crimson`, `pearl`, `gold`, `steel`)
- Tiptap (RibbonEditor), react-pdf (FlipbookViewer)
- Axios instance at `client/src/utils/api.js` (auto-attaches JWT)

## Key Directories
```
client/src/
├── pages/          # Route-level components (lazy loaded)
├── components/     # Shared UI components
│   ├── Admin/      # AdminLayout, RibbonEditor, CodeEditor
│   ├── Hero/       # Hero, TickerTape
│   ├── Services/   # ServiceGroupPanel, ServiceCategoryPanel, ServiceCard
│   ├── Newsletter/ # FlipbookViewer
│   └── Blog/       # BlogCard, BlogCardFeatured
├── hooks/          # useFetch, useCountUp, useScrollReveal
├── utils/          # api.js, constants.js, normalizeImg.js, helpers.js
└── index.css       # Design tokens + .svc-content scoped CSS
```

## Design Tokens (tailwind.config.js)
| Token | Value | Usage |
|-------|-------|-------|
| `indigo` | `#1A1F3C` | Nav, headings, dark backgrounds |
| `crimson` | `#E63946` | CTAs, accents |
| `pearl` | `#F8F7F4` | Page backgrounds |
| `gold` | `#D4AF37` | Stats, badges |
| `steel` | (gray) | Body text |

## Rules
- Always use `normalizeImg()` for uploaded image URLs
- Use `SERVICE_CATEGORIES`, `NAV_LINKS`, `TICKER_ITEMS` from `constants.js`
- Query keys: `['services', category]`, `'admin-blogs'`, `'newsletters'`, etc.
- All admin pages use `AdminLayout` with `back={fn}` prop for back button
- `401` responses auto-redirect to `/admin/login` (except `/auth/login`)

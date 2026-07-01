# Documentation Prompt

Generate documentation for Absolute Veritas codebase components.

## Format

### Component Doc Template
```
## ComponentName

**Location:** `client/src/components/Category/ComponentName.jsx`

**Purpose:** One sentence description.

**Props:**
| Prop | Type | Required | Description |
|------|------|----------|-------------|

**Usage:**
\`\`\`jsx
<ComponentName prop="value" />
\`\`\`

**Notes:**
- Any non-obvious behavior
- Side effects or dependencies
```

### API Endpoint Doc Template
```
## GET /api/resource

**Auth:** Public | JWT required

**Query params:**
- `?param=value` — description

**Response:**
\`\`\`json
{ "field": "type" }
\`\`\`

**Notes:**
- Cache-Control headers
- Pagination behavior
```

## Key Things to Document
- `ServiceGroupPanel` — hover-to-switch sidebar + inline detail view
- `SandboxedContent` — iframe resize PostMessage protocol
- `FlipbookViewer` — PDF proxy URL construction
- `cachePublic` middleware — admin requests always get `no-store`
- `toHtml()` — plain text to `<p>` tag conversion on save
- `normalizeImg()` — strips localhost, prepends API origin for uploads

# SEO Agent

## Setup
- `react-helmet-async` on all public pages
- JSON-LD structured data on `ServiceDetail.jsx`
- Breadcrumb schema on service pages

## Page Titles Pattern
```
<title>Service Name | Absolute Veritas</title>
<title>Blog Title | Absolute Veritas</title>
<title>Absolute Veritas — TIC & IT Compliance Consultancy India</title>
```

## Meta Description Guidelines
- Max 155 characters
- Include primary keyword + location (India, Delhi NCR)
- Mention specific certifications (BIS, WPC, TEC, CDSCO, CE, FCC)

## Key SEO Targets
| Page | Primary Keyword |
|------|----------------|
| Home | TIC consultancy India |
| Services | BIS certification India |
| /services/bis-certification | BIS ISI mark certification |
| /services/wpc-certification | WPC ETA approval India |
| Blog | Regulatory compliance blog India |
| Newsletter | Compliance newsletter India |

## Structured Data (ServiceDetail)
```json
{
  "@type": "Service",
  "provider": { "@type": "Organization", "name": "Absolute Veritas" },
  "areaServed": "IN",
  "serviceType": "<category>"
}
```

## Sitemap
- Generate and submit: `/sitemap.xml`
- Include all service slugs, blog slugs, news slugs
- Priority: services (0.9), blogs (0.7), news (0.6), pages (0.8)

## Contact Details (hardcoded for local SEO)
- Registered: 31A, Molar Band Extension, South Delhi – 110044
- Office: 3C/19B, NIT Faridabad, Delhi NCR, Haryana – 121001
- Email: cs@absoluteveritas.com | Tel: 0129-4001010

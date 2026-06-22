export const TICKER_ITEMS = ['BIS', 'WPC', 'TEC', 'CDSCO', 'EPR', 'FSSAI', 'CE', 'FCC', 'PESO', 'BEE', 'ISI', 'ISO 9001', 'ISO 27001', 'ETA'];

export const SERVICE_CATEGORIES = ['Certification', 'Testing', 'Inspection', 'IT Compliance', 'Others'];

export const NAV_LINKS = [
  { label: 'Home', path: '/' },
  { label: 'About Us', path: '/about-us' },
  {
    label: 'Services',
    path: '/services',
    children: [
      { label: 'Certification', path: '/services?category=Certification' },
      { label: 'Testing', path: '/services?category=Testing' },
      { label: 'Inspection', path: '/services?category=Inspection' },
      { label: 'IT Compliance', path: '/services?category=IT+Compliance' },
    ],
  },
  {
    label: 'Knowledge',
    path: '/news',
    children: [
      { label: 'Trending News', path: '/news' },
      { label: 'Newsletter', path: '/newsletter' },
      { label: 'Blog', path: '/blog' },
    ],
  },
  { label: 'Contact', path: '/contact-us' },
];

export const CLIENT_LOGOS = ['TCL', 'LG', 'Samsung', 'MSI', 'Siemens', 'HP', 'ASUS', 'Exide', 'Philips', 'Bosch', 'Sony', 'Panasonic'];

export const INTERNATIONAL_AUDITS = [
  { country: 'Germany', flag: '🇩🇪', description: 'CE Marking & European compliance audits' },
  { country: 'Sri Lanka', flag: '🇱🇰', description: 'TRCSL type approval & regulatory audits' },
  { country: 'Switzerland', flag: '🇨🇭', description: 'ISO certification & quality audits' },
  { country: 'Thailand', flag: '🇹🇭', description: 'NBTC homologation & testing audits' },
];

export const formatDate = (dateStr, includeTime = false) => {
  const d = new Date(dateStr);
  const date = d.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
  if (!includeTime) return date;
  const time = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  return `${date}, ${time}`;
};

export const truncate = (str, n) => (str.length > n ? str.slice(0, n) + '...' : str);

export const slugify = (str) =>
  str.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

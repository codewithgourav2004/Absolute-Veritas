const API_ORIGIN = (process.env.REACT_APP_API_URL || '').replace(/\/api\/?$/, '');

const normalizeImg = (url) => {
  if (!url) return null;
  url = url.replace(/^https?:\/\/localhost:\d+/, '');
  if (url.startsWith('/uploads/')) return `${API_ORIGIN}${url}`;
  return url;
};

export default normalizeImg;

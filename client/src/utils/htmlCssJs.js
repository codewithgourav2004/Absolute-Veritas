export const parseHtmlCssJs = (raw = '') => {
  const styleMatch  = raw.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
  const scriptMatch = raw.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
  const html = raw
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .trim();
  return {
    html,
    css: styleMatch?.[1]?.trim()  || '',
    js:  scriptMatch?.[1]?.trim() || '',
  };
};

export const combineHtmlCssJs = (html = '', css = '', js = '') => {
  const parts = [];
  if (css.trim())  parts.push(`<style>\n${css}\n</style>`);
  if (html.trim()) parts.push(html);
  if (js.trim())   parts.push(`<script>\n${js}\n</script>`);
  return parts.join('\n');
};

export const buildMultiPreview = (html = '', css = '', js = '') =>
  `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
*,*::before,*::after{box-sizing:border-box}
body{margin:0;font-family:'DM Sans',system-ui,sans-serif;color:#374151;line-height:1.7;padding:1.5rem}
${css}
</style>
</head>
<body>
${html}
<script>
${js}
</` + `script>
</body>
</html>`;

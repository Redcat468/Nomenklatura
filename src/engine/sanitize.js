export function sanitizeDefault(text) {
  return text
    .replace(/[^A-Za-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_');
}

export function stripDotsCommas(text) {
  return text.replace(/[.,]/g, '');
}

export function sanitize(value, shouldSanitize, rule) {
  if (!shouldSanitize) return value;
  if (rule === 'strip_dots_commas') return stripDotsCommas(value);
  return sanitizeDefault(value);
}

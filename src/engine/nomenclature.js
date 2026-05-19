import { sanitize } from './sanitize';

export function formatDate(dateStr, format) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  if (isNaN(d.getTime())) return '';

  if (format === 'YYMMDD') {
    const yy = String(d.getFullYear()).slice(2);
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yy}${mm}${dd}`;
  }
  return dateStr;
}

function resolveSegmentValue(segment, formValues) {
  const raw = formValues[segment.id] ?? '';
  if (raw === '') return '';

  if (segment.type === 'date') {
    return formatDate(raw, segment.format);
  }

  let value = sanitize(raw, segment.sanitize, segment.sanitizeRule);

  if (segment.prefix && value !== segment.noValueToken) {
    value = segment.prefix + value;
  }

  return value;
}

function resolveSegments(schema, formValues) {
  const sorted = [...schema.segments].sort((a, b) => a.position - b.position);
  const compositeTargets = new Set();
  const compositeMap = {};

  for (const seg of sorted) {
    if (seg.composite) {
      compositeTargets.add(seg.id);
      compositeMap[seg.composite.mergeWith] = seg;
    }
  }

  const result = [];

  for (const seg of sorted) {
    if (compositeTargets.has(seg.id)) continue;

    const value = resolveSegmentValue(seg, formValues);

    if (compositeMap[seg.id]) {
      const childSeg = compositeMap[seg.id];
      const childValue = resolveSegmentValue(childSeg, formValues);
      const mergedValue = childSeg.composite.format
        .replace(`{${seg.id}}`, value)
        .replace(`{${childSeg.id}}`, childValue);

      if (value || childValue) {
        result.push({ type: seg.id, value: mergedValue });
      }
    } else {
      if (value) {
        result.push({ type: seg.id, value });
      }
    }
  }

  return result;
}

export function buildTypedSegments(schema, formValues) {
  return resolveSegments(schema, formValues);
}

export function buildFilename(schema, formValues) {
  const segments = resolveSegments(schema, formValues);
  return segments.map(s => s.value).join(schema.separator);
}

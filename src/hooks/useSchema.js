import { useMemo } from 'react';
import defaultSchema from '../schemas/default.json';

export function useSchema() {
  const schema = defaultSchema;

  const sortedSegments = useMemo(
    () => [...schema.segments].sort((a, b) => a.position - b.position),
    [schema]
  );

  const initialFormValues = useMemo(() => {
    const values = {};
    for (const seg of schema.segments) {
      if (seg.type === 'select' && seg.options?.length) {
        const firstWithValue = seg.options.find(o => o.value !== '');
        values[seg.id] = firstWithValue ? firstWithValue.value : '';
      } else {
        values[seg.id] = '';
      }
    }
    return values;
  }, [schema]);

  return { schema, sortedSegments, initialFormValues };
}

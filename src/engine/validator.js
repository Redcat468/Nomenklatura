export function validateForm(schema, formValues) {
  const errors = [];

  for (const segment of schema.segments) {
    if (segment.required) {
      const value = formValues[segment.id];
      if (value === undefined || value === null || value === '') {
        errors.push(segment.id);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

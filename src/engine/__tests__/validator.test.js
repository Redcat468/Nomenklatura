import { describe, it, expect } from 'vitest';
import { validateForm } from '../validator';
import schema from '../../schemas/default.json';

describe('validateForm', () => {
  const validValues = {
    program: 'MonFilm',
    version: '',
    date: '2025-05-19',
    language: 'FR',
    subtitles: 'NOSUB',
    fileformat: 'MOV',
    videoformat: 'HD',
    videoaspect: '',
    videores: '',
    cadence: '',
    audioformat: '51',
    audiocodec: '',
  };

  it('returns valid for complete required fields', () => {
    const result = validateForm(schema, validValues);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('returns invalid when required field is missing', () => {
    const values = { ...validValues, program: '' };
    const result = validateForm(schema, values);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('program');
  });

  it('returns multiple errors for multiple missing fields', () => {
    const values = { ...validValues, program: '', language: '', audioformat: '' };
    const result = validateForm(schema, values);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('program');
    expect(result.errors).toContain('language');
    expect(result.errors).toContain('audioformat');
  });

  it('ignores optional fields that are empty', () => {
    const values = { ...validValues, version: '', videoaspect: '', cadence: '' };
    const result = validateForm(schema, values);
    expect(result.valid).toBe(true);
  });
});

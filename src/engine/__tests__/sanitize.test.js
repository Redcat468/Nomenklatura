import { describe, it, expect } from 'vitest';
import { sanitizeDefault, stripDotsCommas, sanitize } from '../sanitize';

describe('sanitizeDefault', () => {
  it('removes special characters', () => {
    expect(sanitizeDefault('Mon Film!')).toBe('Mon_Film');
  });

  it('replaces spaces with underscores', () => {
    expect(sanitizeDefault('hello world')).toBe('hello_world');
  });

  it('collapses multiple spaces into single underscore', () => {
    expect(sanitizeDefault('hello   world')).toBe('hello_world');
  });

  it('trims whitespace', () => {
    expect(sanitizeDefault('  hello  ')).toBe('hello');
  });

  it('preserves alphanumeric characters', () => {
    expect(sanitizeDefault('MonFilm2024')).toBe('MonFilm2024');
  });

  it('handles empty string', () => {
    expect(sanitizeDefault('')).toBe('');
  });

  it('removes accented/special chars but keeps alphanum', () => {
    expect(sanitizeDefault('Café@Résumé#3')).toBe('CafRsum3');
  });
});

describe('stripDotsCommas', () => {
  it('removes dots', () => {
    expect(stripDotsCommas('1.85')).toBe('185');
  });

  it('removes commas', () => {
    expect(stripDotsCommas('1,85')).toBe('185');
  });

  it('removes both dots and commas', () => {
    expect(stripDotsCommas('2.39,1')).toBe('2391');
  });

  it('leaves other characters intact', () => {
    expect(stripDotsCommas('hello')).toBe('hello');
  });
});

describe('sanitize (dispatcher)', () => {
  it('uses default sanitize when no rule specified', () => {
    expect(sanitize('Mon Film!', true)).toBe('Mon_Film');
  });

  it('uses strip_dots_commas rule', () => {
    expect(sanitize('1.85', true, 'strip_dots_commas')).toBe('185');
  });

  it('returns value unchanged when sanitize is false', () => {
    expect(sanitize('Mon Film!', false)).toBe('Mon Film!');
  });
});

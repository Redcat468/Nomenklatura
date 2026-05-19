import { describe, it, expect } from 'vitest';
import { buildFilename, buildTypedSegments, formatDate } from '../nomenclature';
import schema from '../../schemas/default.json';

describe('formatDate', () => {
  it('formats a date string as YYMMDD', () => {
    expect(formatDate('2025-05-19', 'YYMMDD')).toBe('250519');
  });

  it('handles different dates', () => {
    expect(formatDate('2024-12-01', 'YYMMDD')).toBe('241201');
  });

  it('returns empty string for empty input', () => {
    expect(formatDate('', 'YYMMDD')).toBe('');
  });
});

describe('buildFilename', () => {
  const fullValues = {
    program: 'MonFilm',
    version: 'V2',
    date: '2025-05-19',
    language: 'FR',
    subtitles: 'FR',
    fileformat: 'MOV',
    videoformat: 'HD',
    videoaspect: '1.85',
    videores: '1920x1080',
    cadence: '25',
    audioformat: '51',
    audiocodec: 'PCM',
  };

  it('builds a complete filename with all fields', () => {
    const result = buildFilename(schema, fullValues);
    expect(result).toBe('MonFilm_V2_FR-STFR_MOV_HD_185_1920x1080_25_51_PCM_250519');
  });

  it('skips optional empty fields', () => {
    const values = {
      ...fullValues,
      version: '',
      videoaspect: '',
      videores: '',
      cadence: '',
      audiocodec: '',
    };
    const result = buildFilename(schema, values);
    expect(result).toBe('MonFilm_FR-STFR_MOV_HD_51_250519');
  });

  it('handles NOSUB without prefix', () => {
    const values = { ...fullValues, subtitles: 'NOSUB' };
    const result = buildFilename(schema, values);
    expect(result).toBe('MonFilm_V2_FR-NOSUB_MOV_HD_185_1920x1080_25_51_PCM_250519');
  });

  it('applies ST prefix to non-NOSUB subtitles', () => {
    const values = { ...fullValues, subtitles: 'EN' };
    const result = buildFilename(schema, values);
    expect(result).toBe('MonFilm_V2_FR-STEN_MOV_HD_185_1920x1080_25_51_PCM_250519');
  });

  it('sanitizes text fields', () => {
    const values = { ...fullValues, program: 'Mon Film!' };
    const result = buildFilename(schema, values);
    expect(result).toMatch(/^Mon_Film_/);
  });

  it('applies strip_dots_commas to aspect ratio', () => {
    const values = { ...fullValues, videoaspect: '2.39' };
    const result = buildFilename(schema, values);
    expect(result).toContain('_239_');
  });
});

describe('buildTypedSegments', () => {
  const fullValues = {
    program: 'MonFilm',
    version: 'V2',
    date: '2025-05-19',
    language: 'FR',
    subtitles: 'FR',
    fileformat: 'MOV',
    videoformat: 'HD',
    videoaspect: '1.85',
    videores: '1920x1080',
    cadence: '25',
    audioformat: '51',
    audiocodec: 'PCM',
  };

  it('returns typed segments with correct types', () => {
    const segments = buildTypedSegments(schema, fullValues);
    expect(segments[0]).toEqual({ type: 'program', value: 'MonFilm' });
    expect(segments[1]).toEqual({ type: 'version', value: 'V2' });
    const langSub = segments.find(s => s.type === 'language');
    expect(langSub.value).toBe('FR-STFR');
  });

  it('omits empty optional segments', () => {
    const values = { ...fullValues, version: '', cadence: '' };
    const segments = buildTypedSegments(schema, values);
    const types = segments.map(s => s.type);
    expect(types).not.toContain('version');
    expect(types).not.toContain('cadence');
  });
});

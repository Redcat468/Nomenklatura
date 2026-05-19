import { useMemo } from 'react';
import { buildTypedSegments } from '../../engine/nomenclature';

const SEGMENT_COLORS = {
  program: 'var(--color-seg-program)',
  version: 'var(--color-seg-version)',
  language: 'var(--color-seg-langsub)',
  fileformat: 'var(--color-seg-fileformat)',
  videoformat: 'var(--color-seg-videoformat)',
  videoaspect: 'var(--color-seg-aspect)',
  videores: 'var(--color-seg-resolution)',
  cadence: 'var(--color-seg-cadence)',
  audioformat: 'var(--color-seg-audioformat)',
  audiocodec: 'var(--color-seg-audiocodec)',
  date: 'var(--color-seg-date)',
};

const PLACEHOLDER_SEGMENTS = [
  { type: 'program', value: 'program' },
  { type: 'version', value: 'version' },
  { type: 'language', value: 'lang' },
  { type: 'fileformat', value: 'format' },
  { type: 'videoformat', value: 'video' },
  { type: 'videoaspect', value: 'aspect' },
  { type: 'videores', value: 'res' },
  { type: 'cadence', value: 'fps' },
  { type: 'audioformat', value: 'audio' },
  { type: 'audiocodec', value: 'codec' },
  { type: 'date', value: 'date' },
];

export default function FilenamePreview({ schema, formValues }) {
  const typedSegments = useMemo(
    () => buildTypedSegments(schema, formValues),
    [schema, formValues]
  );

  const isEmpty = typedSegments.length === 0;
  const segments = isEmpty ? PLACEHOLDER_SEGMENTS : typedSegments;

  return (
    <div className="bg-bg-base border border-border-subtle rounded-[10px] px-4.5 py-3.5 font-mono text-[15px] font-medium">
      {segments.map((seg, i) => (
        <span key={seg.type + i}>
          {i > 0 && <span className="text-text-muted">_</span>}
          <span style={{ color: isEmpty ? 'var(--color-text-muted)' : (SEGMENT_COLORS[seg.type] || 'var(--color-text-primary)') }}>
            {seg.value}
          </span>
        </span>
      ))}
    </div>
  );
}

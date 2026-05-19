import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import EntryActions from './EntryActions';

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

export default function EntryRow({ entry, index, isEditing, onEdit, onDuplicate, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: entry.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.9 : 1,
    zIndex: isDragging ? 50 : 'auto',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center gap-3 bg-bg-elevated border rounded-[10px] px-4 py-3 hover:bg-bg-hover transition-colors duration-150 ${isDragging ? 'shadow-[0_8px_24px_rgba(0,0,0,0.4)] scale-[1.02]' : ''} ${isEditing ? 'border-warning animate-pulse-border' : 'border-border-subtle'}`}
    >
      <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-text-muted hover:text-text-secondary touch-none">
        <GripVertical size={16} />
      </button>

      <span className="shrink-0 bg-accent-subtle text-accent rounded-md px-2 py-0.5 text-xs font-semibold font-mono">
        {entry.id}
      </span>

      <div className="flex-1 min-w-0">
        <div className="font-mono text-[13px] font-medium truncate" title={entry.filename}>
          {entry.segments.map((seg, i) => (
            <span key={seg.type + i}>
              {i > 0 && <span className="text-text-muted">_</span>}
              <span style={{ color: SEGMENT_COLORS[seg.type] || 'var(--color-text-primary)' }}>{seg.value}</span>
            </span>
          ))}
        </div>
        {entry.metadata?.description && (
          <div className="text-xs italic text-text-secondary mt-0.5 truncate">{entry.metadata.description}</div>
        )}
      </div>

      <EntryActions entry={entry} onEdit={() => onEdit(index)} onDuplicate={() => onDuplicate(index)} onDelete={() => onDelete(index)} />
    </div>
  );
}

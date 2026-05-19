import { useState } from 'react';
import { Copy, Check, Pencil, CopyPlus, Trash2 } from 'lucide-react';

export default function EntryActions({ entry, onEdit, onDuplicate, onDelete }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(entry.filename);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const btnClass = 'p-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-bg-hover transition-colors duration-150';

  return (
    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150 max-sm:opacity-100">
      <button onClick={handleCopy} className={btnClass} title="Copy filename">
        {copied ? <Check size={16} className="text-success" /> : <Copy size={16} />}
      </button>
      <button onClick={onEdit} className={btnClass} title="Edit entry">
        <Pencil size={16} />
      </button>
      <button onClick={onDuplicate} className={btnClass} title="Duplicate entry">
        <CopyPlus size={16} />
      </button>
      <button onClick={onDelete} className={`${btnClass} hover:!text-error`} title="Delete entry">
        <Trash2 size={16} />
      </button>
    </div>
  );
}

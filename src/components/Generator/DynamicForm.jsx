import { useState, useCallback, useEffect } from 'react';
import FormField from './FormField';
import FilenamePreview from './FilenamePreview';
import { validateForm } from '../../engine/validator';
import { X } from 'lucide-react';

export default function DynamicForm({ schema, initialFormValues, onAdd, onUpdate, editingEntry, onCancelEdit }) {
  const [formValues, setFormValues] = useState(initialFormValues);
  const [metadata, setMetadata] = useState({});
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    if (editingEntry) {
      setFormValues(editingEntry.formValues);
      setMetadata(editingEntry.metadata || {});
      setErrors([]);
    }
  }, [editingEntry]);

  const handleFieldChange = useCallback((id, value) => {
    setFormValues(prev => ({ ...prev, [id]: value }));
    setErrors(prev => prev.filter(e => e !== id));
  }, []);

  const handleMetadataChange = useCallback((id, value) => {
    setMetadata(prev => ({ ...prev, [id]: value }));
  }, []);

  const handleSubmit = useCallback(() => {
    const validation = validateForm(schema, formValues);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }
    if (editingEntry) {
      onUpdate(formValues, metadata);
      setFormValues(initialFormValues);
      setMetadata({});
    } else {
      onAdd(formValues, metadata);
    }
    setErrors([]);
  }, [schema, formValues, metadata, editingEntry, onAdd, onUpdate, initialFormValues]);

  const handleCancel = useCallback(() => {
    setFormValues(initialFormValues);
    setMetadata({});
    setErrors([]);
    onCancelEdit();
  }, [initialFormValues, onCancelEdit]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleSubmit();
      }
      if (e.key === 'Escape' && editingEntry) {
        handleCancel();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleSubmit, handleCancel, editingEntry]);

  const sortedSegments = [...schema.segments].sort((a, b) => a.position - b.position);

  return (
    <div className={`bg-bg-surface border rounded-xl p-5 ${editingEntry ? 'border-warning/40' : 'border-border-subtle'}`}>
      <h2 className="text-[11px] uppercase tracking-[0.08em] font-semibold text-text-muted mb-4">Generator</h2>

      {editingEntry && (
        <div className="flex items-center gap-3 mb-4 bg-warning/10 border-l-[3px] border-warning rounded-r-lg px-3 py-2">
          <span className="text-sm text-text-primary truncate flex-1">
            Editing entry #{editingEntry.id} — {editingEntry.filename}
          </span>
          <button onClick={handleCancel} className="text-text-muted hover:text-text-primary transition-colors">
            <X size={16} />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {sortedSegments.map(seg => (
          <FormField key={seg.id} segment={seg} value={formValues[seg.id] ?? ''} onChange={handleFieldChange} hasError={errors.includes(seg.id)} />
        ))}
      </div>

      {schema.metadata?.length > 0 && (
        <div className="mt-3 grid grid-cols-1 gap-3">
          {schema.metadata.map(meta => (
            <FormField key={meta.id} segment={meta} value={metadata[meta.id] ?? ''} onChange={(id, val) => handleMetadataChange(id, val)} hasError={false} />
          ))}
        </div>
      )}

      <div className="mt-4">
        <FilenamePreview schema={schema} formValues={formValues} />
      </div>

      <button
        onClick={handleSubmit}
        className={`mt-4 w-full h-11 rounded-lg font-semibold text-sm text-white transition-all duration-150 active:scale-[0.98] ${editingEntry ? 'bg-warning hover:bg-warning/90' : 'bg-accent hover:bg-accent-hover'}`}
      >
        {editingEntry ? 'Update entry' : '+ Add to list'}
      </button>
    </div>
  );
}

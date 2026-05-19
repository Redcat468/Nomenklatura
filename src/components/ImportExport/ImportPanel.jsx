import { useState, useCallback } from 'react';
import { Upload, X, FileText } from 'lucide-react';
import Papa from 'papaparse';
import { buildFilename, buildTypedSegments } from '../../engine/nomenclature';

function buildEntryFromRow(row, schema) {
  const formValues = {};
  for (const seg of schema.segments) formValues[seg.id] = row[seg.id] || '';
  const metadata = {};
  for (const meta of schema.metadata || []) metadata[meta.id] = row[meta.id] || '';
  return {
    id: '', filename: row.filename || buildFilename(schema, formValues),
    segments: buildTypedSegments(schema, formValues), formValues, metadata,
  };
}

export default function ImportPanel({ schema, onImport, onClose }) {
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState('replace');

  const processFile = useCallback((file) => {
    setError(null);
    const ext = file.name.split('.').pop().toLowerCase();
    if (ext === 'csv') {
      Papa.parse(file, {
        header: true, skipEmptyLines: true,
        complete: (result) => {
          try {
            const entries = result.data.map(row => buildEntryFromRow(row, schema));
            setPreview({ entries, filename: file.name });
          } catch (e) { setError(e.message); }
        },
        error: (err) => setError(err.message),
      });
    } else if (ext === 'json') {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          const entries = (data.entries || []).map(entry => {
            const fv = entry.formValues;
            return { id: '', filename: buildFilename(schema, fv), segments: buildTypedSegments(schema, fv), formValues: fv, metadata: entry.metadata || {} };
          });
          setPreview({ entries, filename: file.name });
        } catch { setError('Invalid JSON file'); }
      };
      reader.readAsText(file);
    } else { setError('Unsupported file type. Use CSV or JSON.'); }
  }, [schema]);

  const handleDrop = useCallback((e) => { e.preventDefault(); setDragOver(false); const file = e.dataTransfer.files[0]; if (file) processFile(file); }, [processFile]);
  const handleFileSelect = useCallback((e) => { const file = e.target.files[0]; if (file) processFile(file); }, [processFile]);
  const handleConfirm = () => { if (preview) { onImport(preview.entries, mode); onClose(); } };

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-bg-surface border border-border-subtle rounded-xl w-full max-w-lg p-5" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-text-primary">Import Entries</h2>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors"><X size={18} /></button>
        </div>
        {!preview ? (
          <div onDragOver={(e) => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl py-12 flex flex-col items-center gap-3 cursor-pointer transition-colors ${dragOver ? 'border-accent bg-accent-subtle' : 'border-border-subtle'}`}
            onClick={() => document.getElementById('import-file-input').click()}>
            <Upload size={24} className="text-text-muted" />
            <p className="text-sm text-text-muted">Drop CSV or JSON file here, or click to browse</p>
            <input id="import-file-input" type="file" accept=".csv,.json" onChange={handleFileSelect} className="hidden" />
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 mb-3 text-sm text-text-secondary"><FileText size={16} /><span>{preview.filename} — {preview.entries.length} entries</span></div>
            <div className="max-h-48 overflow-y-auto border border-border-subtle rounded-lg mb-4">
              {preview.entries.slice(0, 5).map((entry, i) => (
                <div key={i} className="px-3 py-2 text-xs font-mono text-text-primary border-b border-border-subtle last:border-0 truncate">{entry.filename}</div>
              ))}
              {preview.entries.length > 5 && <div className="px-3 py-2 text-xs text-text-muted">…and {preview.entries.length - 5} more</div>}
            </div>
            <div className="flex gap-3 mb-4">
              <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
                <input type="radio" name="mode" value="replace" checked={mode === 'replace'} onChange={() => setMode('replace')} className="accent-accent" /> Replace list
              </label>
              <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
                <input type="radio" name="mode" value="append" checked={mode === 'append'} onChange={() => setMode('append')} className="accent-accent" /> Append to list
              </label>
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setPreview(null)} className="px-4 py-2 text-sm border border-border-subtle rounded-lg hover:bg-bg-hover transition-colors">Back</button>
              <button onClick={handleConfirm} className="px-4 py-2 text-sm font-semibold text-white bg-accent rounded-lg hover:bg-accent-hover transition-colors">Import {preview.entries.length} entries</button>
            </div>
          </div>
        )}
        {error && <p className="mt-3 text-sm text-error">{error}</p>}
      </div>
    </div>
  );
}

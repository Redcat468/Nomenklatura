import { useState, useEffect, useCallback } from 'react';
import { X, FileText } from 'lucide-react';
import { buildFilename, buildTypedSegments } from '../../engine/nomenclature';

export default function TemplateLoader({ schema, onLoad, onClose }) {
  const [templates, setTemplates] = useState([]);
  const [selected, setSelected] = useState(null);
  const [programName, setProgramName] = useState('');
  const [mode, setMode] = useState('replace');
  const [step, setStep] = useState('select');

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}templates/index.json`)
      .then(r => r.json())
      .then(setTemplates)
      .catch(() => setTemplates([]));
  }, []);

  const handleSelect = useCallback((tpl) => {
    fetch(`${import.meta.env.BASE_URL}templates/${tpl.file}`)
      .then(r => r.json())
      .then(data => {
        setSelected(data);
        const needsProgram = data.entries.some(e => !e.formValues.program);
        setStep(needsProgram ? 'program' : 'confirm');
      });
  }, []);

  const handleConfirm = useCallback(() => {
    if (!selected) return;
    const entries = selected.entries.map(e => {
      const fv = { ...e.formValues };
      if (!fv.program && programName) fv.program = programName;
      if (!fv.date) fv.date = new Date().toISOString().split('T')[0];
      return { id: '', filename: buildFilename(schema, fv), segments: buildTypedSegments(schema, fv), formValues: fv, metadata: e.metadata || {} };
    });
    onLoad(entries, mode);
    onClose();
  }, [selected, programName, schema, mode, onLoad, onClose]);

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-bg-surface border border-border-subtle rounded-xl w-full max-w-lg p-5" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-text-primary">Load Template</h2>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors"><X size={18} /></button>
        </div>

        {step === 'select' && (
          <div className="flex flex-col gap-2">
            {templates.map(tpl => (
              <button key={tpl.file} onClick={() => handleSelect(tpl)} className="text-left p-3 border border-border-subtle rounded-lg hover:bg-bg-hover transition-colors">
                <div className="flex items-center gap-2"><FileText size={16} className="text-accent shrink-0" /><span className="text-sm font-medium text-text-primary">{tpl.name}</span></div>
                <p className="text-xs text-text-secondary mt-1 ml-6">{tpl.description}</p>
              </button>
            ))}
            {templates.length === 0 && <p className="text-sm text-text-muted text-center py-4">No templates found</p>}
          </div>
        )}

        {step === 'program' && (
          <div>
            <label className="block text-[11px] uppercase tracking-[0.08em] font-semibold text-text-muted mb-2">Program Name</label>
            <input type="text" value={programName} onChange={e => setProgramName(e.target.value)} placeholder="Enter program name..." autoFocus
              className="w-full bg-bg-elevated border border-border-subtle rounded-lg px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-border-focus focus:shadow-[0_0_0_3px_var(--color-accent-subtle)] transition-[border-color,box-shadow] duration-150"
              onKeyDown={e => { if (e.key === 'Enter' && programName) setStep('confirm'); }} />
            <div className="flex justify-end mt-4">
              <button onClick={() => setStep('confirm')} disabled={!programName} className="px-4 py-2 text-sm font-semibold text-white bg-accent rounded-lg hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Next</button>
            </div>
          </div>
        )}

        {step === 'confirm' && selected && (
          <div>
            <p className="text-sm text-text-secondary mb-3">
              <strong className="text-text-primary">{selected.name}</strong> — {selected.entries.length} entries
              {programName && <> for <strong className="text-text-primary">{programName}</strong></>}
            </p>
            <div className="flex gap-3 mb-4">
              <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer"><input type="radio" name="tplmode" value="replace" checked={mode === 'replace'} onChange={() => setMode('replace')} className="accent-accent" /> Replace list</label>
              <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer"><input type="radio" name="tplmode" value="append" checked={mode === 'append'} onChange={() => setMode('append')} className="accent-accent" /> Append to list</label>
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setStep('select')} className="px-4 py-2 text-sm border border-border-subtle rounded-lg hover:bg-bg-hover transition-colors">Back</button>
              <button onClick={handleConfirm} className="px-4 py-2 text-sm font-semibold text-white bg-accent rounded-lg hover:bg-accent-hover transition-colors">Load {selected.entries.length} entries</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import { ChevronDown, Upload } from 'lucide-react';

export default function AppHeader({ onOpenTemplates, onOpenImport }) {
  return (
    <header className="sticky top-0 z-50 bg-bg-surface border-b border-border-subtle h-16 flex items-center px-6">
      <div className="flex items-center gap-2.5">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-accent">
          <path d="M10 1L19 10L10 19L1 10L10 1Z" fill="currentColor" />
        </svg>
        <div>
          <h1 className="text-lg font-bold tracking-[0.06em] uppercase leading-tight">Nomenklatura</h1>
          <p className="text-xs text-text-muted font-normal">Filename nomenclature engine</p>
        </div>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <button onClick={onOpenTemplates} className="flex items-center gap-1.5 px-3 py-2 text-sm text-text-primary border border-border-subtle rounded-lg hover:bg-bg-hover transition-colors">
          Templates <ChevronDown size={14} className="text-text-muted" />
        </button>
        <button onClick={onOpenImport} className="flex items-center gap-1.5 px-3 py-2 text-sm text-text-primary border border-border-subtle rounded-lg hover:bg-bg-hover transition-colors">
          <Upload size={14} /> Import
        </button>
      </div>
    </header>
  );
}

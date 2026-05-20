import { Upload } from 'lucide-react';

export default function AppHeader({ onOpenImport }) {
  return (
    <header className="sticky top-0 z-50 bg-bg-surface border-b border-border-subtle h-16 flex items-center px-6">
      <div className="flex items-center gap-3">
        <img
          src={`${import.meta.env.BASE_URL}SB_NOBG_WHITE.svg`}
          alt="Nomenklatura"
          className="h-10"
        />
        <div className="h-6 w-px bg-border-subtle" />
        <div>
          <h1 className="text-[15px] font-bold tracking-[0.06em] uppercase leading-tight">Nomenklatura</h1>
          <p className="text-[10px] text-text-muted font-normal">Filename nomenclature engine</p>
        </div>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <button onClick={onOpenImport} className="flex items-center gap-1.5 px-3 py-2 text-sm text-text-primary border border-border-subtle rounded-lg hover:bg-bg-hover transition-colors">
          <Upload size={14} /> Import
        </button>
      </div>
    </header>
  );
}

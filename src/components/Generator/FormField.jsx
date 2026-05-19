import { ChevronDown } from 'lucide-react';

export default function FormField({ segment, value, onChange, hasError }) {
  const isRequired = segment.required;

  const baseInputClasses = `
    w-full bg-bg-elevated border rounded-lg px-3 py-2.5 text-sm text-text-primary
    placeholder:text-text-muted outline-none
    transition-[border-color,box-shadow] duration-150
    focus:border-border-focus focus:shadow-[0_0_0_3px_var(--color-accent-subtle)]
    ${hasError ? 'border-error' : 'border-border-subtle'}
  `;

  const renderInput = () => {
    switch (segment.type) {
      case 'select':
        return (
          <div className="relative">
            <select
              value={value}
              onChange={(e) => onChange(segment.id, e.target.value)}
              className={`${baseInputClasses} appearance-none pr-8 cursor-pointer`}
            >
              {segment.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
          </div>
        );
      case 'date':
        return (
          <input type="date" value={value} onChange={(e) => onChange(segment.id, e.target.value)} className={baseInputClasses} />
        );
      case 'number':
        return (
          <input type="number" value={value} onChange={(e) => onChange(segment.id, e.target.value)} placeholder={segment.placeholder || ''} className={baseInputClasses} />
        );
      default:
        return (
          <input type="text" value={value} onChange={(e) => onChange(segment.id, e.target.value)} placeholder={segment.placeholder || ''} maxLength={segment.maxLength} className={baseInputClasses} />
        );
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.08em] font-semibold text-text-muted">
        {isRequired && <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block" />}
        {segment.label}
      </label>
      {renderInput()}
    </div>
  );
}

import { useState } from 'react';
import { ChevronDown, Calculator } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function estimateFileSize(hours, minutes, seconds, bitrateMbps) {
  const totalSeconds = hours * 3600 + minutes * 60 + seconds;
  const sizeMB = (bitrateMbps * totalSeconds) / 8;
  const sizeGB = sizeMB / 1024;
  return { mb: sizeMB * 1.01, gb: sizeGB * 1.01 };
}

export default function FileSizeCalculator() {
  const [open, setOpen] = useState(false);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [bitrate, setBitrate] = useState(50);

  const result = estimateFileSize(hours, minutes, seconds, bitrate);
  const hasInput = hours > 0 || minutes > 0 || seconds > 0;

  const inputClass = 'w-20 bg-bg-elevated border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary text-center outline-none focus:border-border-focus focus:shadow-[0_0_0_3px_var(--color-accent-subtle)] transition-[border-color,box-shadow] duration-150';

  return (
    <div className="border border-border-subtle rounded-xl overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-4 py-3 hover:bg-bg-hover transition-colors">
        <div className="flex items-center gap-2">
          <Calculator size={16} className="text-text-muted" />
          <span className="text-[11px] uppercase tracking-[0.08em] font-semibold text-text-muted">File Size Calculator</span>
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }}>
          <ChevronDown size={16} className="text-text-muted" />
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }} className="overflow-hidden">
            <div className="px-4 pb-4 flex flex-wrap items-end gap-4">
              <div className="flex items-end gap-2">
                <div><label className="block text-[11px] uppercase tracking-[0.08em] font-semibold text-text-muted mb-1.5">H</label><input type="number" min="0" value={hours} onChange={e => setHours(Number(e.target.value))} className={inputClass} /></div>
                <div><label className="block text-[11px] uppercase tracking-[0.08em] font-semibold text-text-muted mb-1.5">M</label><input type="number" min="0" max="59" value={minutes} onChange={e => setMinutes(Number(e.target.value))} className={inputClass} /></div>
                <div><label className="block text-[11px] uppercase tracking-[0.08em] font-semibold text-text-muted mb-1.5">S</label><input type="number" min="0" max="59" value={seconds} onChange={e => setSeconds(Number(e.target.value))} className={inputClass} /></div>
              </div>
              <div><label className="block text-[11px] uppercase tracking-[0.08em] font-semibold text-text-muted mb-1.5">Bitrate (Mbps)</label><input type="number" min="0" step="0.1" value={bitrate} onChange={e => setBitrate(Number(e.target.value))} className={inputClass} /></div>
              {hasInput && (
                <div className="flex items-baseline gap-2 text-sm">
                  <span className="text-text-muted">=</span>
                  <span className="font-mono font-bold text-accent">{result.mb.toFixed(1)} MB</span>
                  <span className="text-text-muted">/</span>
                  <span className="font-mono font-bold text-accent">{result.gb.toFixed(2)} GB</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

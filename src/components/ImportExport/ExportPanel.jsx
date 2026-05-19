import { Download } from 'lucide-react';
import Papa from 'papaparse';
import { generatePDF } from '../../engine/pdf';

function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ExportPanel({ entries, schema }) {
  if (entries.length === 0) return null;
  const programName = entries[0]?.formValues?.program || 'export';

  const handleExportCSV = () => {
    const segmentIds = schema.segments.map(s => s.id);
    const metadataIds = (schema.metadata || []).map(m => m.id);
    const rows = entries.map(entry => {
      const row = { id: entry.id };
      for (const sid of segmentIds) row[sid] = entry.formValues[sid] || '';
      for (const mid of metadataIds) row[mid] = entry.metadata?.[mid] || '';
      row.filename = entry.filename;
      return row;
    });
    const csv = Papa.unparse(rows);
    downloadFile(csv, `${programName}_export.csv`, 'text/csv');
  };

  const handleExportJSON = () => {
    const data = { schema: schema.id, exportedAt: new Date().toISOString(), program: programName, entries };
    const json = JSON.stringify(data, null, 2);
    downloadFile(json, `${programName}_export.json`, 'application/json');
  };

  const handleExportPDF = () => {
    generatePDF(entries, schema, programName);
  };

  const btnClass = 'flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-accent rounded-lg hover:bg-accent-hover transition-colors active:scale-[0.98]';

  return (
    <div className="flex flex-wrap gap-2">
      <button onClick={handleExportCSV} className={btnClass}><Download size={14} /> Export CSV</button>
      <button onClick={handleExportJSON} className={btnClass}><Download size={14} /> Export JSON</button>
      <button onClick={handleExportPDF} className={btnClass}><Download size={14} /> Export PDF</button>
    </div>
  );
}

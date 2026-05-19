import { useState, useCallback } from 'react';
import AppHeader from './components/Layout/AppHeader';
import AppFooter from './components/Layout/AppFooter';
import DynamicForm from './components/Generator/DynamicForm';
import EntryList from './components/EntryList/EntryList';
import ExportPanel from './components/ImportExport/ExportPanel';
import ImportPanel from './components/ImportExport/ImportPanel';
import TemplateLoader from './components/ImportExport/TemplateLoader';
import { useSchema } from './hooks/useSchema';
import { useEntries } from './hooks/useEntries';

function App() {
  const { schema, initialFormValues } = useSchema();
  const { entries, addEntry, updateEntry, duplicateEntry, deleteEntry, reorderEntries, replaceAllEntries, appendEntries } = useEntries(schema);

  const [editingIndex, setEditingIndex] = useState(null);
  const [showImport, setShowImport] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  const editingEntry = editingIndex !== null ? entries[editingIndex] : null;

  const handleAdd = useCallback((formValues, metadata) => {
    addEntry(formValues, metadata);
  }, [addEntry]);

  const handleUpdate = useCallback((formValues, metadata) => {
    if (editingIndex !== null) {
      updateEntry(editingIndex, formValues, metadata);
      setEditingIndex(null);
    }
  }, [editingIndex, updateEntry]);

  const handleEdit = useCallback((index) => {
    setEditingIndex(index);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingIndex(null);
  }, []);

  const handleDelete = useCallback((index) => {
    if (editingIndex === index) setEditingIndex(null);
    deleteEntry(index);
  }, [editingIndex, deleteEntry]);

  const handleImport = useCallback((newEntries, mode) => {
    if (mode === 'replace') replaceAllEntries(newEntries);
    else appendEntries(newEntries);
  }, [replaceAllEntries, appendEntries]);

  const handleTemplateLoad = useCallback((newEntries, mode) => {
    if (mode === 'replace') replaceAllEntries(newEntries);
    else appendEntries(newEntries);
  }, [replaceAllEntries, appendEntries]);

  return (
    <div className="min-h-screen flex flex-col bg-bg-base">
      <AppHeader onOpenTemplates={() => setShowTemplates(true)} onOpenImport={() => setShowImport(true)} />

      <main className="flex-1 w-full max-w-[960px] mx-auto px-6 py-6 flex flex-col gap-6">
        <DynamicForm schema={schema} initialFormValues={initialFormValues} onAdd={handleAdd} onUpdate={handleUpdate} editingEntry={editingEntry} onCancelEdit={handleCancelEdit} />
        <EntryList entries={entries} editingIndex={editingIndex} onEdit={handleEdit} onDuplicate={duplicateEntry} onDelete={handleDelete} onReorder={reorderEntries} />
        <ExportPanel entries={entries} schema={schema} />
      </main>

      <AppFooter />

      {showImport && <ImportPanel schema={schema} onImport={handleImport} onClose={() => setShowImport(false)} />}
      {showTemplates && <TemplateLoader schema={schema} onLoad={handleTemplateLoad} onClose={() => setShowTemplates(false)} />}
    </div>
  );
}

export default App;

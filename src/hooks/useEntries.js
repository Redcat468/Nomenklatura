import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { buildFilename, buildTypedSegments } from '../engine/nomenclature';

function renumberEntries(entries) {
  return entries.map((entry, i) => ({
    ...entry,
    id: String(i + 1).padStart(2, '0'),
  }));
}

export function useEntries(schema) {
  const [entries, setEntries] = useLocalStorage('nomenklatura_entries', []);

  const addEntry = useCallback((formValues, metadata = {}) => {
    const filename = buildFilename(schema, formValues);
    const segments = buildTypedSegments(schema, formValues);
    const entry = { id: '', filename, segments, formValues: { ...formValues }, metadata: { ...metadata } };
    setEntries(prev => renumberEntries([...prev, entry]));
  }, [schema, setEntries]);

  const updateEntry = useCallback((index, formValues, metadata = {}) => {
    const filename = buildFilename(schema, formValues);
    const segments = buildTypedSegments(schema, formValues);
    setEntries(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], filename, segments, formValues: { ...formValues }, metadata: { ...metadata } };
      return renumberEntries(updated);
    });
  }, [schema, setEntries]);

  const duplicateEntry = useCallback((index) => {
    setEntries(prev => {
      const clone = { ...prev[index], formValues: { ...prev[index].formValues }, metadata: { ...prev[index].metadata } };
      const updated = [...prev];
      updated.splice(index + 1, 0, clone);
      return renumberEntries(updated);
    });
  }, [setEntries]);

  const deleteEntry = useCallback((index) => {
    setEntries(prev => renumberEntries(prev.filter((_, i) => i !== index)));
  }, [setEntries]);

  const reorderEntries = useCallback((fromIndex, toIndex) => {
    setEntries(prev => {
      const updated = [...prev];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      return renumberEntries(updated);
    });
  }, [setEntries]);

  const replaceAllEntries = useCallback((newEntries) => {
    setEntries(renumberEntries(newEntries));
  }, [setEntries]);

  const appendEntries = useCallback((newEntries) => {
    setEntries(prev => renumberEntries([...prev, ...newEntries]));
  }, [setEntries]);

  const clearEntries = useCallback(() => {
    setEntries([]);
  }, [setEntries]);

  return { entries, addEntry, updateEntry, duplicateEntry, deleteEntry, reorderEntries, replaceAllEntries, appendEntries, clearEntries };
}

import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { AnimatePresence, motion } from 'framer-motion';
import { FileText } from 'lucide-react';
import EntryRow from './EntryRow';

export default function EntryList({ entries, editingIndex, onEdit, onDuplicate, onDelete, onReorder }) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = entries.findIndex(e => e.id === active.id);
    const newIndex = entries.findIndex(e => e.id === over.id);
    onReorder(oldIndex, newIndex);
  };

  if (entries.length === 0) {
    return (
      <div className="border border-dashed border-border-subtle rounded-xl py-12 flex flex-col items-center justify-center gap-3">
        <FileText size={32} className="text-text-muted" />
        <p className="text-sm text-text-muted text-center max-w-xs">
          No entries yet — fill the form above to start building your export list
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <h2 className="text-[11px] uppercase tracking-[0.08em] font-semibold text-text-muted">Export List</h2>
        <span className="bg-accent-subtle text-accent text-xs font-semibold rounded-full px-2 py-0.5">{entries.length}</span>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd} modifiers={[restrictToVerticalAxis]}>
        <SortableContext items={entries.map(e => e.id)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-1.5 max-h-[50vh] overflow-y-auto pr-1">
            <AnimatePresence initial={false}>
              {entries.map((entry, i) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                >
                  <EntryRow entry={entry} index={i} isEditing={editingIndex === i} onEdit={onEdit} onDuplicate={onDuplicate} onDelete={onDelete} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { AnimatePresence } from 'framer-motion';
import type { Task } from '../../types';
import { useApp } from '../../context/AppContext';
import { TaskCard } from './TaskCard';
import { BulkActionsBar } from './BulkActionsBar';

interface TaskListProps {
  tasks: Task[];
  dragEnabled?: boolean;
}

export function TaskList({ tasks, dragEnabled = true }: TaskListProps) {
  const { reorderTasks } = useApp();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = tasks.findIndex((t) => t.id === active.id);
    const newIndex = tasks.findIndex((t) => t.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const reordered = [...tasks];
    const [removed] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, removed);
    reorderTasks(reordered);
  };

  return (
    <div className="space-y-3">
      <BulkActionsBar taskIds={tasks.map((t) => t.id)} />
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          <AnimatePresence mode="popLayout">
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} dragEnabled={dragEnabled} />
            ))}
          </AnimatePresence>
        </SortableContext>
      </DndContext>
    </div>
  );
}

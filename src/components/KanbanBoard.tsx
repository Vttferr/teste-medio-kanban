import { Task, Column, ColumnId } from '../types/kanban';
import { KanbanColumn } from './KanbanColumn';

interface KanbanBoardProps {
  columns: Column[];
  tasks: Task[];
  onDropTask?: (taskId: string, columnId: ColumnId) => void;
}

export function KanbanBoard({ columns, tasks, onDropTask }: KanbanBoardProps) {
  return (
    <div className="flex gap-6 overflow-x-auto p-4 min-h-[calc(100vh-100px)]">
      {columns.map((column) => (
        <KanbanColumn
          key={column.id}
          column={column}
          tasks={tasks.filter((t) => t.columnId === column.id)}
          onDropTask={onDropTask}
        />
      ))}
    </div>
  );
}

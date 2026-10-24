import { Task, Column } from '../types/kanban';
import { TaskCard } from './TaskCard';

interface KanbanColumnProps {
  column: Column;
  tasks: Task[];
}

export function KanbanColumn({ column, tasks }: KanbanColumnProps) {
  const bgColor = column.id === 'todo' ? 'bg-gray-100' : column.id === 'doing' ? 'bg-blue-50' : 'bg-green-50';
  
  return (
    <div className={`w-80 flex-shrink-0 ${bgColor} rounded-xl flex flex-col p-3`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-700">{column.title}</h2>
        <span className="bg-white px-2 py-0.5 rounded-full text-xs font-medium text-gray-600 border border-gray-200">
          {tasks.length}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto space-y-3">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Task } from '../types/kanban';

interface TaskCardProps {
  task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    setIsDragging(true);
    e.dataTransfer.setData('text/plain', task.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all cursor-grab active:cursor-grabbing select-none ${
        isDragging ? 'opacity-40 scale-95 border-blue-400 shadow-inner' : 'opacity-100'
      }`}
    >
      <h3 className="font-bold text-gray-900 mb-1">{task.title}</h3>
      <p className="text-sm text-gray-500 mb-3">{task.description}</p>
      <div className="flex flex-wrap gap-2 mb-3">
        {task.tags.map((tag) => (
          <span key={tag} className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">
            {tag}
          </span>
        ))}
      </div>
      <div className="text-xs text-gray-400">
        {new Date(task.createdAt).toLocaleDateString()}
      </div>
    </div>
  );
}

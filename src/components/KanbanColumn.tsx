import { useState } from 'react';
import { Task, Column, ColumnId } from '../types/kanban';
import { TaskCard } from './TaskCard';
import { stateManager } from '../utils/stateManager';

interface KanbanColumnProps {
  column: Column;
  tasks: Task[];
  onDropTask?: (taskId: string, targetColumnId: ColumnId) => void;
}

export function KanbanColumn({ column, tasks, onDropTask }: KanbanColumnProps) {
  const [dragCounter, setDragCounter] = useState(0);
  const isDragOver = dragCounter > 0;

  const baseBgColor =
    column.id === 'todo'
      ? 'bg-gray-100'
      : column.id === 'doing'
      ? 'bg-blue-50'
      : 'bg-green-50';

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragCounter((prev) => prev + 1);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragCounter((prev) => Math.max(0, prev - 1));
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragCounter(0);
    const taskId = e.dataTransfer.getData('text/plain');

    if (taskId) {
      if (onDropTask) {
        onDropTask(taskId, column.id);
      } else {
        stateManager.moveTask(taskId, column.id);
      }
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`w-80 flex-shrink-0 ${baseBgColor} rounded-xl flex flex-col p-3 transition-all duration-200 border-2 ${
        isDragOver
          ? 'border-dashed border-blue-500 ring-4 ring-blue-200/80 bg-blue-100/60 shadow-lg scale-[1.01]'
          : 'border-transparent'
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-700">{column.title}</h2>
        <span className="bg-white px-2 py-0.5 rounded-full text-xs font-medium text-gray-600 border border-gray-200 shadow-sm">
          {tasks.length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 min-h-[150px]">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}

        {isDragOver && (
          <div className="border-2 border-dashed border-blue-400 bg-blue-50/80 rounded-lg p-4 text-center text-xs font-semibold text-blue-600 animate-pulse">
            Solte o cartão aqui
          </div>
        )}

        {tasks.length === 0 && !isDragOver && (
          <div className="h-full min-h-[100px] flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg text-xs text-gray-400">
            Nenhuma tarefa nesta coluna
          </div>
        )}
      </div>
    </div>
  );
}

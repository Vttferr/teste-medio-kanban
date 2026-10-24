import { Task } from '../types/kanban';

interface TaskCardProps {
  task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <h3 className="font-bold text-gray-900 mb-1">{task.title}</h3>
      <p className="text-sm text-gray-500 mb-3">{task.description}</p>
      <div className="flex flex-wrap gap-2 mb-3">
        {task.tags.map((tag) => (
          <span key={tag} className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
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

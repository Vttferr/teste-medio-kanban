import { Task, ColumnId } from '../types/kanban';

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Omit<Task, 'id' | 'createdAt'>) => void;
}

export function NewTaskModal({ isOpen, onClose, onSave }: NewTaskModalProps) {
  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    onSave({
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      columnId: formData.get('columnId') as ColumnId,
      tags: (formData.get('tags') as string).split(',').map(tag => tag.trim()).filter(Boolean),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <h2 className="text-xl font-bold mb-4">Nova Tarefa</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="title" placeholder="Título" required className="w-full p-2 border border-gray-300 rounded" />
          <textarea name="description" placeholder="Descrição" className="w-full p-2 border border-gray-300 rounded" />
          <select name="columnId" className="w-full p-2 border border-gray-300 rounded">
            <option value="todo">To Do</option>
            <option value="doing">Doing</option>
            <option value="done">Done</option>
          </select>
          <input name="tags" placeholder="Tags (separadas por vírgula)" className="w-full p-2 border border-gray-300 rounded" />
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Criar Tarefa</button>
          </div>
        </form>
      </div>
    </div>
  );
}

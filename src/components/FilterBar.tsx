import { Search, Plus } from 'lucide-react';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onNewTaskClick: () => void;
}

export function FilterBar({ searchQuery, onSearchChange, onNewTaskClick }: FilterBarProps) {
  return (
    <header className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Pesquisar tarefas..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>
      <button
        onClick={onNewTaskClick}
        className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center hover:bg-blue-700"
      >
        <Plus className="w-4 h-4 mr-2" />
        Nova Tarefa
      </button>
    </header>
  );
}

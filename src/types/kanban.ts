export type ColumnId = 'todo' | 'doing' | 'done';

export interface Task {
  id: string;
  title: string;
  description: string;
  columnId: ColumnId;
  tags: string[];
  createdAt: number;
}

export interface Column {
  id: ColumnId;
  title: string;
}

export interface KanbanState {
  tasks: Task[];
  searchQuery: string;
  selectedTags: string[];
  isModalOpen: boolean;
}

export interface KanbanActions {
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  moveTask: (taskId: string, targetColumnId: ColumnId) => void;
  deleteTask: (taskId: string) => void;
  setSearchQuery: (query: string) => void;
  setSelectedTags: (tags: string[]) => void;
  toggleTagFilter: (tag: string) => void;
  clearFilters: () => void;
  setModalOpen: (isOpen: boolean) => void;
}

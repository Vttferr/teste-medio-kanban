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
  isModalOpen: boolean;
}

export interface KanbanActions {
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  setSearchQuery: (query: string) => void;
  setModalOpen: (isOpen: boolean) => void;
}

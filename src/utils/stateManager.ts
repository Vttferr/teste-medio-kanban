import { Task, ColumnId, KanbanState } from '../types/kanban';

const STORAGE_KEY = 'kanban_tasks_v1';

const DEFAULT_TASKS: Task[] = [
  { id: '1', title: 'Task 1', description: 'Description 1', columnId: 'todo', tags: ['work'], createdAt: Date.now() },
  { id: '2', title: 'Task 2', description: 'Description 2', columnId: 'doing', tags: ['urgent'], createdAt: Date.now() },
  { id: '3', title: 'Task 3', description: 'Description 3', columnId: 'done', tags: ['finished'], createdAt: Date.now() }
];

function isValidTask(item: unknown): item is Task {
  if (!item || typeof item !== 'object') return false;
  const t = item as Record<string, unknown>;
  const validColumns: ColumnId[] = ['todo', 'doing', 'done'];

  return (
    typeof t.id === 'string' &&
    typeof t.title === 'string' &&
    typeof t.description === 'string' &&
    typeof t.columnId === 'string' &&
    validColumns.includes(t.columnId as ColumnId) &&
    Array.isArray(t.tags) &&
    t.tags.every(tag => typeof tag === 'string') &&
    typeof t.createdAt === 'number'
  );
}

function loadPersistedTasks(): Task[] {
  if (typeof window === 'undefined' || !window.localStorage) {
    return DEFAULT_TASKS;
  }

  try {
    const rawData = window.localStorage.getItem(STORAGE_KEY);
    if (!rawData) {
      persistTasks(DEFAULT_TASKS);
      return DEFAULT_TASKS;
    }

    const parsed = JSON.parse(rawData);
    if (Array.isArray(parsed) && parsed.length > 0 && parsed.every(isValidTask)) {
      return parsed;
    }

    // Se o storage contiver um array vazio ou dados inválidos, restauramos os dados de exemplo
    console.warn('[stateManager] Dados no localStorage inválidos ou vazios. Restaurando dados iniciais.');
    persistTasks(DEFAULT_TASKS);
    return DEFAULT_TASKS;
  } catch (error) {
    console.error('[stateManager] Falha ao processar localStorage (JSON corrompido). Aplicando fallback seguro:', error);
    try {
      persistTasks(DEFAULT_TASKS);
    } catch {
      // Ignora erro de escrita caso o storage esteja bloqueado
    }
    return DEFAULT_TASKS;
  }
}

function persistTasks(tasks: Task[]): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.error('[stateManager] Falha ao salvar tarefas no localStorage:', error);
  }
}

class StateManager {
  private state: KanbanState;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.state = {
      tasks: loadPersistedTasks(),
      searchQuery: '',
      selectedTags: [],
      isModalOpen: false,
    };
  }

  // --- Pub/Sub ---
  public subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  private notify = (): void => {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (err) {
        console.error('[stateManager] Erro no listener:', err);
      }
    });
  };

  private setState = (updater: (prevState: KanbanState) => Partial<KanbanState>): void => {
    const changes = updater(this.state);
    this.state = { ...this.state, ...changes };
    this.notify();
  };

  // --- Getters ---
  public getState = (): KanbanState => {
    return this.state;
  };

  public getTasks = (): Task[] => {
    return this.state.tasks;
  };

  public getAllTags = (): string[] => {
    const tagSet = new Set<string>();
    this.state.tasks.forEach((task) => {
      task.tags.forEach((tag) => {
        const trimmed = tag.trim();
        if (trimmed) tagSet.add(trimmed);
      });
    });
    return Array.from(tagSet).sort((a, b) => a.localeCompare(b));
  };

  public getFilteredTasks = (): Task[] => {
    const { tasks, searchQuery, selectedTags } = this.state;
    const query = searchQuery.trim().toLowerCase();

    return tasks.filter((task) => {
      // Busca textual por título OU descrição (case-insensitive)
      const matchesSearch =
        query === '' ||
        task.title.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query);

      // Filtro por múltiplas tags (lógica AND: a tarefa deve conter TODAS as tags selecionadas)
      const matchesTags =
        selectedTags.length === 0 ||
        selectedTags.every((selectedTag) =>
          task.tags.some((taskTag) => taskTag.toLowerCase() === selectedTag.toLowerCase())
        );

      return matchesSearch && matchesTags;
    });
  };

  // --- Actions ---
  public addTask = (taskInput: Omit<Task, 'id' | 'createdAt'>): void => {
    const newTask: Task = {
      ...taskInput,
      id: typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : Math.random().toString(36).substring(2, 11),
      createdAt: Date.now(),
    };

    const nextTasks = [newTask, ...this.state.tasks];
    persistTasks(nextTasks);
    this.setState(() => ({ tasks: nextTasks }));
  };

  public moveTask = (taskId: string, targetColumnId: ColumnId): void => {
    const taskIndex = this.state.tasks.findIndex((t) => t.id === taskId);
    if (taskIndex === -1) return;

    const currentTask = this.state.tasks[taskIndex];
    if (currentTask.columnId === targetColumnId) return;

    const updatedTasks = this.state.tasks.map((task) =>
      task.id === taskId ? { ...task, columnId: targetColumnId } : task
    );

    persistTasks(updatedTasks);
    this.setState(() => ({ tasks: updatedTasks }));
  };

  public deleteTask = (taskId: string): void => {
    const updatedTasks = this.state.tasks.filter((t) => t.id !== taskId);
    persistTasks(updatedTasks);
    this.setState(() => ({ tasks: updatedTasks }));
  };

  public setSearchQuery = (query: string): void => {
    this.setState(() => ({ searchQuery: query }));
  };

  public setSelectedTags = (tags: string[]): void => {
    this.setState(() => ({ selectedTags: tags }));
  };

  public toggleTagFilter = (tag: string): void => {
    const normalizedTag = tag.trim();
    if (!normalizedTag) return;

    const exists = this.state.selectedTags.some(
      (t) => t.toLowerCase() === normalizedTag.toLowerCase()
    );

    const nextTags = exists
      ? this.state.selectedTags.filter((t) => t.toLowerCase() !== normalizedTag.toLowerCase())
      : [...this.state.selectedTags, normalizedTag];

    this.setState(() => ({ selectedTags: nextTags }));
  };

  public clearFilters = (): void => {
    this.setState(() => ({ searchQuery: '', selectedTags: [] }));
  };

  public setModalOpen = (isOpen: boolean): void => {
    this.setState(() => ({ isModalOpen: isOpen }));
  };

  public resetToDefaults = (): void => {
    persistTasks(DEFAULT_TASKS);
    this.setState(() => ({
      tasks: DEFAULT_TASKS,
      searchQuery: '',
      selectedTags: [],
      isModalOpen: false,
    }));
  };
}

export const stateManager = new StateManager();

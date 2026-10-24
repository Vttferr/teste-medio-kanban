import { useSyncExternalStore, useMemo } from 'react';
import { KanbanState, KanbanActions, Task } from '../types/kanban';
import { stateManager } from '../utils/stateManager';

export interface UseKanbanStateReturn extends KanbanState, KanbanActions {
  filteredTasks: Task[];
  allTags: string[];
}

export const useKanbanState = (): UseKanbanStateReturn => {
  const state = useSyncExternalStore(
    stateManager.subscribe,
    stateManager.getState,
    stateManager.getState
  );

  const filteredTasks = useMemo(() => stateManager.getFilteredTasks(), [state]);
  const allTags = useMemo(() => stateManager.getAllTags(), [state.tasks]);

  return {
    ...state,
    filteredTasks,
    allTags,
    addTask: stateManager.addTask,
    moveTask: stateManager.moveTask,
    deleteTask: stateManager.deleteTask,
    setSearchQuery: stateManager.setSearchQuery,
    setSelectedTags: stateManager.setSelectedTags,
    toggleTagFilter: stateManager.toggleTagFilter,
    clearFilters: stateManager.clearFilters,
    setModalOpen: stateManager.setModalOpen,
  };
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { useKanbanState } from './hooks/useKanbanState';
import { FilterBar } from './components/FilterBar';
import { KanbanBoard } from './components/KanbanBoard';
import { NewTaskModal } from './components/NewTaskModal';
import { ExportCsvModal } from './components/ExportCsvModal';
import { Column } from './types/kanban';

const columns: Column[] = [
  { id: 'todo', title: 'A fazer' },
  { id: 'doing', title: 'Em progresso' },
  { id: 'done', title: 'Concluído' },
];

export default function App() {
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const {
    filteredTasks,
    allTags,
    tasks,
    searchQuery,
    selectedTags,
    isModalOpen,
    addTask,
    moveTask,
    setSearchQuery,
    toggleTagFilter,
    clearFilters,
    setModalOpen,
  } = useKanbanState();

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        availableTags={allTags}
        selectedTags={selectedTags}
        onToggleTag={toggleTagFilter}
        onClearFilters={clearFilters}
        onExportCsvClick={() => setIsExportModalOpen(true)}
        onNewTaskClick={() => setModalOpen(true)}
      />
      <main className="flex-1 overflow-hidden">
        <KanbanBoard
          columns={columns}
          tasks={filteredTasks}
          onDropTask={moveTask}
        />
      </main>
      <NewTaskModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onSave={addTask}
      />
      <ExportCsvModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        tasks={tasks}
        filteredTasks={filteredTasks}
      />
    </div>
  );
}
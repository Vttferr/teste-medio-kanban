/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useKanbanState } from './hooks/useKanbanState';
import { FilterBar } from './components/FilterBar';
import { KanbanBoard } from './components/KanbanBoard';
import { NewTaskModal } from './components/NewTaskModal';
import { Column } from './types/kanban';

const columns: Column[] = [
  { id: 'todo', title: 'A fazer' },
  { id: 'doing', title: 'Em progresso' },
  { id: 'done', title: 'Concluído' },
];

export default function App() {
  const { tasks, searchQuery, isModalOpen, addTask, setSearchQuery, setModalOpen } = useKanbanState();

  const filteredTasks = tasks.filter(
    (t) =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onNewTaskClick={() => setModalOpen(true)}
      />
      <KanbanBoard columns={columns} tasks={filteredTasks} />
      <NewTaskModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onSave={addTask}
      />
    </div>
  );
}

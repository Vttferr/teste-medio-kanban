import { useState } from 'react';
import { Task, KanbanState, KanbanActions } from '../types/kanban';

export const useKanbanState = (): KanbanState & KanbanActions => {
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: 'Task 1', description: 'Description 1', columnId: 'todo', tags: ['work'], createdAt: Date.now() },
    { id: '2', title: 'Task 2', description: 'Description 2', columnId: 'doing', tags: ['urgent'], createdAt: Date.now() },
    { id: '3', title: 'Task 3', description: 'Description 3', columnId: 'done', tags: ['finished'], createdAt: Date.now() }
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setModalOpen] = useState(false);

  const addTask = (task: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = { ...task, id: Math.random().toString(36).substr(2, 9), createdAt: Date.now() };
    setTasks([...tasks, newTask]);
  };

  return { tasks, searchQuery, isModalOpen, addTask, setSearchQuery, setModalOpen };
};

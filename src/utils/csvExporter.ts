import { Task } from '../types/kanban';

export function generateCsvContent(tasks: Task[]): string {
  const BOM = '\uFEFF';
  const headers = ['ID', 'Título', 'Descrição', 'Status', 'Tags', 'Data de Criação'];

  const escapeCell = (val: string): string => {
    let sanitized = val.replace(/"/g, '""');
    // Prevenção de CSV Formula Injection (CWE-1236)
    if (/^[=+\-@\t\r]/.test(sanitized)) {
      sanitized = `'${sanitized}`;
    }
    return `"${sanitized}"`;
  };

  const rows = tasks.map(t => [
    escapeCell(t.id),
    escapeCell(t.title),
    escapeCell(t.description),
    escapeCell(t.columnId === 'todo' ? 'A fazer' : t.columnId === 'doing' ? 'Em progresso' : 'Concluído'),
    escapeCell(t.tags.join('; ')),
    escapeCell(new Date(t.createdAt).toISOString())
  ].join(','));

  return BOM + [headers.join(','), ...rows].join('\r\n');
}

export function downloadCsv(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Aliases para compatibilidade de nomenclatura
export const generateTasksCsv = generateCsvContent;
export const downloadCsvFile = downloadCsv;

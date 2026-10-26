import { useState } from 'react';
import { X, Download, FileSpreadsheet, CheckCircle2, Filter } from 'lucide-react';
import { Task, ColumnId } from '../types/kanban';
import { generateCsvContent, downloadCsv } from '../utils/csvExporter';

interface ExportCsvModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  filteredTasks: Task[];
}

export function ExportCsvModal({
  isOpen,
  onClose,
  tasks,
  filteredTasks,
}: ExportCsvModalProps) {
  const [exportScope, setExportScope] = useState<'all' | 'filtered'>('all');
  const [selectedColumns, setSelectedColumns] = useState<ColumnId[]>(['todo', 'doing', 'done']);

  if (!isOpen) return null;

  const baseTasks = exportScope === 'all' ? tasks : filteredTasks;
  const tasksToExport = baseTasks.filter((t) => selectedColumns.includes(t.columnId));
  const hasFilterDifference = tasks.length !== filteredTasks.length;

  const handleToggleColumn = (columnId: ColumnId) => {
    setSelectedColumns((prev) =>
      prev.includes(columnId)
        ? prev.filter((id) => id !== columnId)
        : [...prev, columnId]
    );
  };

  const handleExport = () => {
    const today = new Date().toISOString().split('T')[0];
    const filename = `relatorio-kanban-${today}.csv`;
    const csvContent = generateCsvContent(tasksToExport);
    downloadCsv(filename, csvContent);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 border border-gray-100 animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="export-csv-title"
      >
        {/* Cabeçalho */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 id="export-csv-title" className="text-lg font-bold text-gray-900">
                Exportar Relatório em CSV
              </h2>
              <p className="text-xs text-gray-500">
                Gere uma planilha compatível com Excel e Google Sheets (RFC 4180 / UTF-8 BOM)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-5">
          {/* Seleção de Escopo de Exportação */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
              Escopo dos Dados
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setExportScope('all')}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${exportScope === 'all'
                  ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20'
                  : 'border-gray-200 hover:border-gray-300 bg-gray-50/50'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-800">Todas as Tarefas</span>
                  {exportScope === 'all' && (
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  )}
                </div>
                <span className="text-xs text-gray-500">
                  Total de <strong>{tasks.length}</strong> registro(s) no sistema
                </span>
              </button>

              <button
                type="button"
                onClick={() => setExportScope('filtered')}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${exportScope === 'filtered'
                  ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20'
                  : 'border-gray-200 hover:border-gray-300 bg-gray-50/50'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-800 flex items-center gap-1">
                    <Filter className="w-3.5 h-3.5 text-gray-500" />
                    Tarefas Filtradas
                  </span>
                  {exportScope === 'filtered' && (
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  )}
                </div>
                <span className="text-xs text-gray-500">
                  <strong>{filteredTasks.length}</strong> registro(s) correspondentes
                  {hasFilterDifference && ' (filtros ativos)'}
                </span>
              </button>
            </div>
          </div>

          {/* Filtro por Colunas / Status */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
              Incluir Colunas / Status
            </label>
            <div className="flex gap-2 flex-wrap">
              {[
                { id: 'todo' as ColumnId, label: 'A fazer' },
                { id: 'doing' as ColumnId, label: 'Em progresso' },
                { id: 'done' as ColumnId, label: 'Concluído' },
              ].map(({ id, label }) => {
                const isChecked = selectedColumns.includes(id);
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => handleToggleColumn(id)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${isChecked
                      ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                  >
                    <span>{label}</span>
                    <span className={`text-[11px] px-1.5 py-0.2 rounded-full ${isChecked ? 'bg-blue-700 text-white' : 'bg-gray-100 text-gray-600'
                      }`}>
                      {baseTasks.filter((t) => t.columnId === id).length}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Prévia da Contagem de Registros */}
          <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between">
            <span className="text-xs text-gray-600 font-medium">
              Registros selecionados para exportação:
            </span>
            <span className="text-sm font-bold text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-full">
              {tasksToExport.length} tarefa(s)
            </span>
          </div>
        </div>

        {/* Rodapé / Ações */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleExport}
            disabled={tasksToExport.length === 0}
            className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-sm transition-all ${tasksToExport.length > 0
              ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer hover:shadow-md'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
          >
            <Download className="w-4 h-4" />
            <span>Baixar Arquivo CSV</span>
          </button>
        </div>
      </div>
    </div>
  );
}

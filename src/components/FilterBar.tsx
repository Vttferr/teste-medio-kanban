import { Search, Plus, X, Tag, RotateCcw } from 'lucide-react';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  availableTags?: string[];
  selectedTags?: string[];
  onToggleTag?: (tag: string) => void;
  onClearFilters?: () => void;
  onNewTaskClick: () => void;
}

export function FilterBar({
  searchQuery,
  onSearchChange,
  availableTags = [],
  selectedTags = [],
  onToggleTag,
  onClearFilters,
  onNewTaskClick,
}: FilterBarProps) {
  const hasActiveFilters = searchQuery.trim().length > 0 || selectedTags.length > 0;
  const activeFiltersCount = (searchQuery.trim().length > 0 ? 1 : 0) + selectedTags.length;

  return (
    <header className="bg-white border-b border-gray-200 p-4 shadow-xs">
      <div className="flex flex-col gap-3">
        {/* Linha Principal: Busca, Limpar Filtros e Nova Tarefa */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3 flex-1 min-w-[280px] max-w-lg">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Pesquisar por título ou descrição..."
                className="w-full pl-10 pr-9 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all placeholder:text-gray-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  title="Limpar texto de busca"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded-full"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {hasActiveFilters && onClearFilters && (
              <button
                type="button"
                onClick={onClearFilters}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors whitespace-nowrap"
                title="Limpar todos os filtros ativos"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Limpar filtros ({activeFiltersCount})</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onNewTaskClick}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 text-sm font-medium shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nova Tarefa</span>
            </button>
          </div>
        </div>

        {/* Linha de Tags: Seleção múltipla com lógica AND */}
        {availableTags.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-gray-100 text-xs">
            <div className="flex items-center gap-1.5 text-gray-500 font-medium mr-1">
              <Tag className="w-3.5 h-3.5 text-gray-400" />
              <span>Filtrar por tags (AND):</span>
            </div>

            {availableTags.map((tag) => {
              const isSelected = selectedTags.some(
                (t) => t.toLowerCase() === tag.toLowerCase()
              );

              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => onToggleTag && onToggleTag(tag)}
                  className={`px-2.5 py-1 rounded-full border text-xs font-medium transition-all cursor-pointer flex items-center gap-1 ${
                    isSelected
                      ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 hover:border-gray-300'
                  }`}
                >
                  <span>#{tag}</span>
                  {isSelected && <X className="w-3 h-3 ml-0.5" />}
                </button>
              );
            })}

            {selectedTags.length > 0 && (
              <span className="text-[11px] text-gray-400 italic ml-1">
                (exibindo tarefas contendo todas as {selectedTags.length} tags selecionadas)
              </span>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

# Roadmap e Especificação Técnica

Este documento descreve a API pública do gerenciador de estado (`stateManager.ts`) e detalha as próximas evoluções da plataforma, tendo como prioridade imediata o modal de exportação de dados em CSV.

---

## 1. Referência da API Pública de `stateManager.ts`

O módulo `src/utils/stateManager.ts` expõe a instância singleton `stateManager`, projetada para controle centralizado de dados, persistência e filtragem reativa.

| Método | Assinatura | Descrição / Comportamento |
| :--- | :--- | :--- |
| `subscribe` | `(listener: () => void) => () => void` | Registra uma função de callback para notificações de alteração de estado. Retorna uma função de limpeza (*cleanup/unsubscribe*) compatível com `useSyncExternalStore`. |
| `getState` | `() => KanbanState` | Retorna o snapshot atual e imutável do estado (`tasks`, `searchQuery`, `selectedTags`, `isModalOpen`). |
| `getTasks` | `() => Task[]` | Retorna a lista completa de tarefas armazenadas em memória. |
| `getAllTags` | `() => string[]` | Varre todas as tarefas existentes e retorna um array ordenado alfabeticamente contendo as tags únicas presentes no sistema. |
| `getFilteredTasks` | `() => Task[]` | Retorna as tarefas filtradas em tempo real combinando: (1) busca textual case-insensitive em `title` e `description`, e (2) lógica booleana AND sobre `selectedTags`. |
| `addTask` | `(task: Omit<Task, 'id' \| 'createdAt'>) => void` | Gera um identificador único (`crypto.randomUUID` ou fallback pseudoaleatório), define o timestamp de criação (`Date.now()`), adiciona a tarefa no início da lista e persiste no `localStorage`. |
| `moveTask` | `(taskId: string, targetColumnId: ColumnId) => void` | Atualiza a coluna de uma tarefa específica para `todo`, `doing` ou `done`. Ignora se a coluna já for a atual. Persiste a alteração no `localStorage` e notifica os assinantes. |
| `deleteTask` | `(taskId: string) => void` | Remove a tarefa informada pelo ID, atualiza o `localStorage` e emite notificação aos ouvintes. |
| `setSearchQuery` | `(query: string) => void` | Define a string de pesquisa de texto livre para filtragem instantânea. |
| `setSelectedTags` | `(tags: string[]) => void` | Define a coleção de tags ativas para filtragem por interseção (AND). |
| `toggleTagFilter` | `(tag: string) => void` | Alterna o estado de seleção de uma tag individual (adiciona se ausente, remove se presente). |
| `clearFilters` | `() => void` | Reseta `searchQuery` para `""` e `selectedTags` para `[]` em uma única operação. |
| `setModalOpen` | `(isOpen: boolean) => void` | Controla a exibição do modal de criação de novas tarefas. |
| `resetToDefaults` | `() => void` | Restaura as tarefas iniciais de exemplo e limpa todos os filtros ativos, regravando o `localStorage`. |

---

## 2. Item 1 do Roadmap: Especificação Técnica do Modal 'Exportar Relatório em CSV'

### 2.1 Objetivo
Permitir aos usuários extrair tarefas do Kanban em formato CSV padronizado para análise externa em ferramentas de planilhas (Microsoft Excel, Google Sheets, LibreOffice Calc) e integração com relatórios corporativos.

---

### 2.2 Requisitos de Interface (UI / UX)
1. **Gatilho de Abertura**:
   - Adição de um botão **"Exportar CSV"** na `FilterBar.tsx` com ícone `Download` de `lucide-react`, posicionado ao lado do botão "Nova Tarefa".
2. **Componente do Modal (`src/components/ExportCsvModal.tsx`)**:
   - **Cabeçalho**: Título claro ("Exportar Relatório em CSV") com botão de fechar (ícone `X`).
   - **Seleção de Escopo**:
     - Opção 1: *Todas as tarefas* (exibindo a contagem total, ex.: 12 tarefas).
     - Opção 2: *Apenas tarefas filtradas atualmente* (habilitado quando houver filtros aplicados, exibindo contagem filtrada).
   - **Filtro de Colunas/Status**:
     - Checkboxes para selecionar quais colunas incluir: `A Fazer`, `Em Progresso`, `Concluído`.
   - **Campos a Incluir**:
     - Seletores para marcar/desmarcar campos exportados: `ID`, `Título`, `Descrição`, `Coluna/Status`, `Tags`, `Data de Criação`.
   - **Ações**:
     - Botão "Cancelar" e Botão principal "Baixar Arquivo CSV".

---

### 2.3 Especificação de Formatação do CSV (RFC 4180 & Segurança)

#### Estrutura de Colunas Padrão:
```csv
ID,Título,Descrição,Status,Tags,Data de Criação
```

#### Regras de Higienização e Formatação:
1. **Tratamento contra CSV Injection / Fórmula Maliciosa (CWE-1236)**:
   - Se qualquer campo textual (`title`, `description` ou `tags`) iniciar com os caracteres `=`, `+`, `-`, `@`, `\t` ou `\r`, ele deve ser prefixado com um apóstrofo (`'`) para desarmar a execução de macros automáticas no Excel.
2. **Escapamento RFC 4180**:
   - Campos contendo vírgulas (`,`), aspas duplas (`"`) ou quebras de linha (`\n`) devem ser envolvidos por aspas duplas completas.
   - Aspas duplas existentes no texto interno devem ser duplicadas (`""`).
3. **Formatação de Dados Específicos**:
   - **Coluna/Status**: Traduzir identificadores técnicos para rótulos legíveis (`todo` -> `A fazer`, `doing` -> `Em progresso`, `done` -> `Concluído`).
   - **Tags**: Formatadas como lista separada por ponto-e-vírgula dentro de aspas (ex.: `"work; urgent"`).
   - **Data de Criação**: Formato legível ISO 8601 (`YYYY-MM-DD HH:mm:ss`) ou padrão local (`DD/MM/YYYY HH:mm`).
4. **Encoding e Byte Order Mark (BOM)**:
   - O payload deve conter o prefixo UTF-8 BOM (`\uFEFF`) antes do texto para garantir correta decodificação de caracteres com acentuação e cedilha no Microsoft Excel em qualquer sistema operacional.

---

### 2.4 Fluxo de Implementação e Código Proposto

```typescript
// Exemplo de utilitário gerador de CSV (src/utils/csvExporter.ts)
export function generateCsvContent(tasks: Task[], fields: ExportFields): string {
  const BOM = '\uFEFF';
  const headers = ['ID', 'Título', 'Descrição', 'Status', 'Tags', 'Data de Criação'];
  
  const escapeCell = (val: string): string => {
    let sanitized = val.replace(/"/g, '""');
    // Prevenção de CSV Formula Injection
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
```

---

### 2.5 Próximos Itens do Roadmap (Backlog Técnico)
- **Item 2**: Edição inline de tarefas e exclusão individual com confirmação.
- **Item 3**: Reordenação vertical de tarefas dentro da mesma coluna via Drag-and-Drop (ordenação customizada com campo `order: number`).
- **Item 4**: Suporte a temas visuais (modo escuro / alto contraste) e persistência de preferências de interface.
- **Item 5**: Suporte a datas de entrega (*due dates*) com sinalizadores de tarefas atrasadas.

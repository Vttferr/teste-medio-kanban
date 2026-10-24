# Relatório de Auditoria Arquitetural: Desacoplamento e Resiliência

## 1. Visão Geral da Transformação

A arquitetura original do projeto concentrava o estado e as regras de negócio diretamente dentro de um hook React (`src/hooks/useKanbanState.ts`) utilizando `useState` local. Essa abordagem causava três limitações críticas:
1. **Volatilidade dos dados**: Perda completa do estado ao recarregar a página (F5), sem persistência local.
2. **Acoplamento forte com o ciclo de vida do React**: Regras de negócio, mutações de tarefas e filtragem estavam presas à camada de renderização, dificultando testes unitários isolados e reutilização.
3. **Falta de interoperabilidade**: Ausência de suporte para manipulação direta de dados por eventos externos ou nativos do navegador (ex.: HTML5 Drag and Drop nativo).

Com a refatoração, foi estabelecida uma **Arquitetura em Três Camadas**:

```
┌────────────────────────────────────────────────────────┐
│             Camada de Apresentação (UI)                │
│ (App, FilterBar, KanbanBoard, KanbanColumn, TaskCard)  │
└───────────────────────────▲────────────────────────────┘
                            │ useSyncExternalStore
┌───────────────────────────┴────────────────────────────┐
│          Camada de Integração / Hook Reativo           │
│              (src/hooks/useKanbanState.ts)             │
└───────────────────────────▲────────────────────────────┘
                            │ Pub/Sub (subscribe / getState)
┌───────────────────────────┴────────────────────────────┐
│        Camada de Domínio e Estado Desacoplado          │
│             (src/utils/stateManager.ts)                │
│       - Gerenciamento de tarefas e filtros             │
│       - Persistência segura em localStorage            │
│       - Fallback contra JSON corrompido / vazio        │
└────────────────────────────────────────────────────────┘
```

---

## 2. Detalhamento das Camadas

### 2.1 Camada de Domínio e Estado (`src/utils/stateManager.ts`)
- **Isolamento Total**: Módulo TypeScript puro, sem nenhuma dependência de React ou de APIs específicas de frameworks.
- **Padrão Pub/Sub**: Implementa `subscribe(listener)` e `getState()`, permitindo múltiplos assinantes com ciclo de vida desacoplado.
- **Persistência Robusta**:
  - Armazenamento sob a chave controlada `kanban_tasks_v1`.
  - Type guard em runtime (`isValidTask`) validando estrutura obrigatória (`id`, `title`, `description`, `columnId`, `tags`, `createdAt`).
  - Fallback automático contra JSON corrompido ou vazio: caso o parsing falhe ou o armazenamento contenha dados inválidos, os 3 cartões de exemplo originais são restaurados e regravados silenciosamente no `localStorage`, evitando falhas catastróficas ou telas brancas.
  - Salvamento seguro encapsulado em `try/catch` para mitigar bloqueios de quota ou modo anônimo de navegadores restritivos.

### 2.2 Camada de Integração (`src/hooks/useKanbanState.ts`)
- **Consumo via `useSyncExternalStore`**:
  - Utiliza a API oficial do React 18+ para sincronização com stores externas sem tearing visual e sem risco de race conditions.
  - O hook atua como ponte fina de consumo, apenas expondo os dados do snapshot e repassando as ações para o `stateManager`.
  - Memoização seletiva (`useMemo`) das tarefas filtradas (`filteredTasks`) e da lista única de tags (`allTags`), evitando recálculos desnecessários durante renders.

### 2.3 Camada de Apresentação (`src/components/`)
- **Drag-and-Drop HTML5 Nativo**:
  - `TaskCard.tsx`: Elementos marcados com `draggable={true}`, empacotando o `id` da tarefa no evento `dragstart` via `dataTransfer.setData('text/plain', task.id)` e fornecendo feedback tátil com `cursor-grab` e opacidade reduzida ao arrastar.
  - `KanbanColumn.tsx`: Gerenciamento de eventos `dragover`, `dragenter`, `dragleave` e `drop`. Implementa um contador interno de eventos (`dragCounter`) para prevenir o tremor visual (*flickering*) causado por elementos filhos, aplicando destaque visual expressivo (`ring`, `border-dashed`, `scale-[1.01]`) na coluna de destino e persistindo a alteração via `stateManager.moveTask()`.
- **Filtros em Tempo Real (`FilterBar.tsx`)**:
  - **Busca Textual Composta**: Avalia `title` e `description` de forma insensível a maiúsculas/minúsculas (*case-insensitive*).
  - **Filtro Multi-tag com Lógica AND**: Exibe todas as tags existentes como botões alternáveis (*pills*). Exige que a tarefa possua **todas** as tags selecionadas para ser exibida.
  - **Ação Rápida de Limpeza**: Botão contextual visível apenas quando houver filtros ativos, permitindo resetar busca e tags selecionadas com um único clique.

---

## 3. Benefícios de Qualidade e Manutenibilidade

1. **Testabilidade Isolada**: Mutações de estado, lógica de persistência e filtros podem ser integralmente validados por testes unitários simples, sem a necessidade de simular o ciclo de renderização do React.
2. **Resiliência a Falhas**: Nenhuma falha de formatação no `localStorage` derruba a interface. A recuperação é automática e previsível.
3. **Performance Otimizada**: Componentes assinam apenas as alterações globais via external store padronizada, eliminando re-renders em cascata típicos de Context Providers superpovoados.
4. **Prontidão para Extensibilidade**: A interface pública de `stateManager.ts` fornece uma base sólida para novas funcionalidades (como exportações, ordenações e histórico de desfazer/refazer).

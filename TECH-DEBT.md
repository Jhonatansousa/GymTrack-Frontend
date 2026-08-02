# Dívidas Técnicas Conhecidas

Registro organizado de problemas conhecidos, não urgentes o suficiente para bloquear a feature em
andamento, mas que devem ser resolvidos antes de crescerem. Identificadores de código e endpoints
seguem em inglês; a descrição segue em português (mesmo padrão do `README.md`).

| # | Item | Impacto | Onde | Quando resolver |
|---|---|---|---|---|
| 1 | Contagem de séries ("N séries") ausente no card de exercício | O protótipo (Claude Design) mostra a contagem; hoje o card só exibe nome. Card menos informativo do que o design previa. | `exercise-row.component.ts` | Quando o backend expuser o campo no `GET /exercises/{divisionId}` (hoje omitido por YAGNI — não inventar campos de contagem no frontend, mesma regra já aplicada em `divisions`). |
| 2 | Erro silencioso ao carregar divisões | Se `GET /divisions` falhar, o dashboard mostra o empty-state ("Nenhuma divisão cadastrada ainda"), que é uma mentira — pode haver divisões salvas. Mesmo bug corrigido em `ExercisesComponent` nesta branch. | `DashboardComponent.loadDivisions()` | Replicar o padrão de `ExercisesComponent.loadExercises()` (signal `loadError` + terceiro ramo no template) na próxima vez que o `DashboardComponent` for tocado. |
| 3 | Falha de exclusão sem feedback ao usuário | Em `DashboardComponent.confirmDelete()` e `ExercisesComponent.confirmDelete()`, o handler de erro só reseta `isDeleting`; o diálogo de confirmação continua aberto sem nenhuma mensagem explicando por que a exclusão falhou. | `dashboard.component.ts`, `exercises.component.ts` | Adicionar um `deleteError` (mesmo padrão de `formError`) exibido no `ConfirmDialogComponent` quando a exclusão falhar. |
| 4 | Divisões vivem em `features/dashboard/`, não em `features/divisions/` | Inconsistente com `features/exercises/` (e futuramente `features/sets/`) — quebra a promessa do `CLAUDE.md` de organização por fatia de domínio. | `features/dashboard/` | Extração maior (mover componentes + specs, ajustar rota); avaliar quando o dashboard ganhar mais responsabilidades além de divisões. |
| 5 | `npm audit`: 15 high / 1 critical | Todas as vulnerabilidades estão em `devDependencies` (`vite`/`esbuild`, toolchain de build/teste) — não afetam o bundle de produção. Nenhuma dependência nova foi adicionada nesta branch. | `package.json` (devDependencies) | Rodar `npm audit fix` (ou `--force` com testes completos) numa tarefa dedicada de manutenção, fora do ciclo de uma feature. |
| 6 | Sem testes E2E | A cobertura é 100% unitária (componentes/serviços isolados com mocks). Nenhum teste exercita o fluxo real de navegação do usuário (login → dashboard → abrir divisão → CRUD de exercício). | projeto todo | Avaliar Playwright/Cypress quando o número de fluxos críticos justificar o investimento (YAGNI até lá). |

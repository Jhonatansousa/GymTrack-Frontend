# GymTrack Frontend

Frontend do projeto de estudos **GymTrack**, construído com Angular moderno e orientado por um modelo de desenvolvimento inspirado nas práticas defendidas por Fabio Akita (XP + TDD + micro-releases + feedback rápido).

Este repositório representa a camada de interface de uma solução cujo backend MVP já existe em Java com Spring.

## 1. Objetivo do Projeto

O objetivo principal deste projeto **não é apenas entregar telas**, mas validar na prática um processo de engenharia com IA como pair programming:

- Entregar incrementos pequenos e verificáveis (micro-releases)
- Evoluir com testes antes de código (TDD)
- Manter arquitetura simples, sem overengineering
- Garantir base sustentável para evoluir do MVP para produção

Em resumo: aprender e aplicar disciplina de desenvolvimento em um produto real, de ponta a ponta.

## 2. Estado Atual

### Status Geral

- Backend: MVP concluído (Java + Spring)
- Frontend: em desenvolvimento ativo
- Foco atual: autenticação, fundações de arquitetura e qualidade

### Funcionalidades já implementadas no Frontend

- Roteamento inicial com lazy loading
- Fluxo completo de autenticação (login e registro) entregue via ciclo TDD (Red → Green → Refactor)
- Formulários reativos tipados para login e registro
- Validações de formulário no cliente (required, formato de email, regras de senha)
- Navegação entre login e registro
- Integração HTTP real com os endpoints `/auth/login` e `/auth/register`
- Autenticação baseada em **HttpOnly cookie** (JWT emitido pelo backend; nenhum token armazenado em JS)
- `withCredentials` enviado automaticamente em chamadas para o backend via interceptor funcional
- Interceptor funcional de erros com redirecionamento para `/auth` em respostas `401`
- Tratamento explícito de erros HTTP (401, 409, etc.) na camada de UI
- Auth Guard funcional consumindo `/auth/me` para proteger rotas
- Redirecionamento para `/dashboard` após login/registro bem-sucedidos
- Dashboard com saudação personalizada (via `/auth/me`), incluindo variação "Bem-vindo" para o
  usuário recém-registrado (primeiro acesso) vs. "Bem-vindo de volta" nos acessos seguintes
- CRUD completo de Divisões de Treino no dashboard: listagem em grid, empty state, criação, edição
  (renomear) e exclusão com modal de confirmação avisando sobre a cascata (exercícios/sets)
- Card de divisão totalmente clicável (mouse e teclado — `Enter`/`Espaço`, com anel de foco visível)
  navegando para a página de exercícios daquela divisão
- CRUD completo de Exercícios por divisão: listagem, criação, renomear e exclusão com confirmação de
  cascata (apaga as séries do exercício), reaproveitando o padrão de modal das divisões; estado de
  erro dedicado quando o carregamento da lista falha (não confundido com "lista vazia")
- Linha de exercício totalmente clicável (mouse e teclado — `Enter`/`Espaço`, com anel de foco
  visível) navegando para a página de séries daquele exercício
- CRUD completo de Séries por exercício: listagem, empty state, estado de erro de carregamento,
  criação **sem formulário** (um clique cria a série e o backend a auto-nomeia "1", "2", ...),
  renomear **inline** no próprio card (`Enter` salva, `Esc` cancela, blur salva) e exclusão com
  diálogo de confirmação
- Edição de carga (kg) e repetições por série com botões `−` / `+` ou digitando direto no valor;
  o incremento da carga é selecionável (`0.5`, `1`, `2.5`, `5`) e as repetições variam de 1 em 1
- Persistência otimista das séries: a tela atualiza na hora e o `PATCH` sai com _debounce_ de 500ms
  por série — cliques rápidos sucessivos viram **uma** requisição; falha recarrega a lista para
  ressincronizar
- Modais de formulário e confirmação acessíveis (fecham no `Esc`, foco inicial gerenciado, botões
  desabilitados durante requisições em andamento) — construídos sem dependência de dialog/overlay
- Endpoint de logout integrado e ação de sair na UI (menu do usuário no header do dashboard)
- Testes unitários cobrindo o fluxo completo de autenticação (componentes, serviço, guard e interceptors),
  o CRUD de divisões, o CRUD de exercícios e o CRUD de séries (serviço, componentes smart/dumb,
  modais e a persistência com debounce via fake timers)

### Funcionalidades ainda em construção

- Melhorias de UX, feedback assíncrono e acessibilidade avançada
- Contagem de séries no card de exercício ("N séries") — aguardando o backend expor o campo
  (ver `TECH-DEBT.md`)
- "Segurar para repetir" (press-and-hold) nos botões `−` / `+` das séries (ver `TECH-DEBT.md`)

## 3. Stack e Versões

### Frontend

- Angular CLI: `21.2.0`
- Angular Core/Router/Forms: `^21.2.0`
- TypeScript: `~5.9.2`
- RxJS: `~7.8.0`
- Tailwind CSS: `^4.1.12`
- ESLint: `^10.0.3`
- Test Runner: Vitest (`^4.0.8`) via Angular build tooling
- Package Manager: npm (`11.9.0`)

### Backend (referência)

- Java + Spring Boot (MVP já implementado em repositório/backend separado)
- API REST com autenticação JWT

## 4. Arquitetura do Frontend

### Princípios arquiteturais

- Organização por feature (não por tipo global de arquivo)
- Componentes standalone
- Lazy loading de rotas para reduzir acoplamento inicial
- Formulários reativos tipados
- Design orientado a separação de responsabilidades

### Estrutura atual (resumo)

```text
src/
	app/
		app.config.ts
		app.routes.ts
		core/
			guards/
				auth.guard.ts
				auth.guard.spec.ts
				guest.guard.ts
				guest.guard.spec.ts
			interceptors/
				credentials.interceptor.ts
				credentials.interceptor.spec.ts
				error.interceptor.ts
				error.interceptor.spec.ts
			models/
				auth.model.ts
				division.model.ts
				exercise.model.ts
				workout-set.model.ts
			services/
				auth.service.ts
				auth.service.spec.ts
				divisions.service.ts
				divisions.service.spec.ts
				exercises.service.ts
				exercises.service.spec.ts
				sets.service.ts
				sets.service.spec.ts
		features/
			auth/
				login/
					login.component.ts
					login.component.spec.ts
				register/
					register.component.ts
					register.component.spec.ts
			dashboard/
				components/
					dashboard-header/
					division-card/
					division-form/
				dashboard.component.ts
				dashboard.component.spec.ts
				dashboard.component.divisions.spec.ts
			exercises/
				components/
					exercise-form/
					exercise-row/
				exercises.component.ts
				exercises.component.spec.ts
			sets/
				components/
					set-card/
					sets-header/
					stepper-field/
					weight-increment-selector/
				sets.component.ts
				sets.component.spec.ts
				sets.component.editing.spec.ts
		shared/
			ui/
				confirm-dialog/
			utils/
				form-errors.ts
				form-errors.spec.ts
	environments/
		environment.ts
		environment.development.ts
```

### Rotas atuais

- `/` -> redireciona para `/auth`
- `/auth` -> tela de login
- `/auth/register` -> tela de cadastro
- `/dashboard` -> área pós-login, protegida por `authGuard`
- `/dashboard/divisions/:divisionId/exercises` -> exercícios da divisão, protegida por `authGuard`
- `/dashboard/divisions/:divisionId/exercises/:exerciseId/sets` -> séries do exercício, protegida
  por `authGuard`

### Direção arquitetural alvo

Evoluir para um fluxo completo com:

- Camada de serviços HTTP por contexto de domínio
- Interceptadores funcionais para autenticação e erros
- Estado local com sinais/reatividade moderna onde fizer sentido
- Contratos tipados alinhados ao backend
- Estrutura pronta para escalar novas features sem reescrita estrutural

## 5. Modelo de Desenvolvimento (baseado no Akita)

Este projeto segue o modelo de engenharia orientado por:

- **Pair Programming com IA**: humano define direção e decisões; IA acelera implementação
- **TDD**: Red -> Green -> Refactor
- **Small Releases**: mudanças pequenas, testáveis e revertíveis
- **Refatoração contínua**: evitar acúmulo de dívida técnica
- **Integração contínua mental/operacional**: qualidade a cada incremento

### Regras práticas adotadas

- Sem feature grande em um único salto
- Sempre validar impacto antes de expandir escopo
- Evitar abstrações prematuras (YAGNI)
- Priorizar clareza e manutenção sobre “sofisticação”
- Documentar decisões para preservar contexto e consistência

## 6. Fluxo de Qualidade

### Testes

- Testes unitários de componentes e comportamento de UI
- Validação de regras de formulário com cenários positivos e negativos

### Lint e consistência

- ESLint com angular-eslint
- Convenções modernas de Angular

### Qualidade esperada por incremento

- Código funcional
- Testes passando
- Escopo claro
- Sem regressões no fluxo existente

## 7. Contratos de API (direção funcional)

Com base na especificação atual de integração, o frontend deve conversar com endpoints para:

- Autenticação (`/auth/register`, `/auth/login`)
- Divisões de treino (`/divisions`)
- Exercícios (`/exercises`)
- Séries (`/sets`)

Regras importantes já consideradas no desenho:

- JWT para endpoints protegidos
- Tratamento explícito de erros comuns (`401`, `409`, etc.)
- Respeito às regras de negócio do backend (ex.: auto naming de set quando permitido)

## 8. Como Executar o Projeto

### Pré-requisitos

- Node.js instalado
- npm instalado

### Instalação

```bash
npm install
```

### Rodar em desenvolvimento

```bash
npm start
```

Aplicação disponível em `http://localhost:4200`.

### Build

```bash
npm run build
```

### Testes

```bash
npm test
```

### Lint

```bash
npm run lint
```

## 9. Roadmap de Evolução

### Curto prazo

- [x] Integrar login/registro com backend real
- [x] Sessão autenticada via HttpOnly cookie (sem token em JS)
- [x] Guardas de rota para áreas autenticadas
- [x] Tela inicial pós-login
- [x] Endpoint e ação de logout integrados na UI

### Médio prazo

- [x] CRUD de divisões de treino
- [x] CRUD de exercícios por divisão
- [x] CRUD de sets por exercício
- [x] Feedback assíncrono (loading, sucesso, erro) no fluxo de divisões
- [x] Feedback assíncrono (loading, sucesso, erro e falha de carregamento) no fluxo de exercícios
- [x] Feedback assíncrono (loading, erro e falha de carregamento) no fluxo de séries, com
      atualização otimista e persistência com debounce

### Próximos passos de arquitetura

- [x] Interceptors funcionais (credenciais + erros)
- [x] Padronização de models/DTOs tipados para exercícios (`Exercise` vs. `ExerciseDto`, ver
      Hurdle H4 em `api-contracts.md`) e para séries (`WorkoutSet` vs. `WorkoutSetDto`, ver
      Hurdle H6) — pendente apenas para divisões
- [ ] Organização de serviços por domínio (divisões, exercícios, sets)
- [ ] Evolução da estratégia de estado e cache local

## 10. Filosofia do Repositório

Este projeto é um laboratório prático de engenharia de software aplicada, onde o sucesso é medido por:

- Evolução contínua com segurança
- Qualidade sustentada por testes
- Arquitetura compreensível e escalável
- Entrega incremental real

Não é um experimento de “gerar código rápido”; é um exercício de construir software de forma profissional, com disciplina.

## 11. Observações finais

- O backend já existe em MVP e guia os contratos funcionais do frontend
- O frontend está em fase ativa de construção de base arquitetural
- Este README deve evoluir junto com o produto, mantendo histórico claro do estado do projeto

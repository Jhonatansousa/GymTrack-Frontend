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
- Modais de formulário e confirmação acessíveis (fecham no `Esc`, foco inicial gerenciado, botões
  desabilitados durante requisições em andamento) — construídos sem dependência de dialog/overlay
- Endpoint de logout integrado e ação de sair na UI (menu do usuário no header do dashboard)
- Testes unitários cobrindo o fluxo completo de autenticação (componentes, serviço, guard e interceptors)
  e o CRUD de divisões (serviço, componentes smart/dumb e modais)

### Funcionalidades ainda em construção

- Gestão de exercícios e sets (CRUD por divisão/exercício)
- Melhorias de UX, feedback assíncrono e acessibilidade avançada

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
			services/
				auth.service.ts
				auth.service.spec.ts
				divisions.service.ts
				divisions.service.spec.ts
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
- [ ] CRUD de exercícios por divisão
- [ ] CRUD de sets por exercício
- [x] Feedback assíncrono (loading, sucesso, erro) no fluxo de divisões

### Próximos passos de arquitetura

- [x] Interceptors funcionais (credenciais + erros)
- [ ] Padronização de models/DTOs tipados para divisões, exercícios e sets
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

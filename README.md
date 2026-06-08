# Tech4um — Plataforma de Fóruns em Tempo Real

> Aplicação web full-stack de fóruns com chat em tempo real, mensagens privadas, indicadores de digitação e presença online, inspirada no Discord e Slack.

## Índice

- [Visão Geral](#visão-geral)
- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Arquitetura](#arquitetura)
- [Estrutura de Diretórios](#estrutura-de-diretórios)
- [Execução com Docker](#execução-com-docker)
- [Execução Local](#execução-local)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [API Reference](#api-reference)
- [WebSocket Events](#websocket-events)
- [Testes](#testes)
- [Usuários de Demonstração](#usuários-de-demonstração)

---

## Visão Geral

Tech4um é uma plataforma de fóruns para desenvolvedores com comunicação em tempo real. Os usuários podem criar fóruns temáticos, participar de conversas públicas e trocar mensagens privadas — tudo com atualizações instantâneas via WebSocket.

## Funcionalidades

### Autenticação
- Cadastro com username único, e-mail único e senha criptografada (bcrypt)
- Login com JWT (validade 7 dias)
- Proteção de rotas privadas no frontend e backend
- Exibição do perfil do usuário autenticado no header

### Dashboard de Fóruns
- Listagem de todos os fóruns com contagem de mensagens
- Busca em tempo real (debounced 300ms)
- Filtros de ordenação: mais recentes, mais antigos, por nome, mais mensagens
- Criação de fóruns com validação de nome único e descrição opcional
- Cards com gradientes, hover animations e navegação direta ao chat

### Chat em Tempo Real (Socket.IO)
- Histórico completo de mensagens persistido no PostgreSQL
- Envio e recebimento de mensagens sem atualização de página
- Separadores de data automáticos no histórico
- Auto-scroll inteligente (mantém posição se usuário rolar para cima)
- Textarea auto-resize com Shift+Enter para nova linha

### Mensagens Privadas
- Clique em qualquer usuário online para iniciar conversa privada
- Banner de contexto indicando o destinatário
- Diferenciação visual completa: border colorida, ícone de cadeado, badge "privado"
- Visível apenas para remetente e destinatário
- Notificação toast global para mensagens privadas recebidas em outras abas

### Usuários Online
- Lista de presença em tempo real por sala
- Atualização instantânea quando usuários entram ou saem
- Avatar com iniciais coloridas determinísticas por username
- Indicador de status online (dot verde)
- Botão para ocultar/exibir a lista lateralmente

### Indicador de Digitação
- Animação de três pontos pulsantes
- Exibe nome(s) de quem está digitando
- Timeout automático de 3.5s se o usuário parar de digitar
- Múltiplos usuários exibidos de forma natural ("Alice e Bob estão digitando...")

### UX/UI
- Design dark mode inspirado no Discord/Slack
- Interface responsiva: desktop, tablet e mobile
- Animações suaves em todas as interações
- Loader tela cheia com branding Tech4um
- Toasts para feedback de sucesso/erro
- Validação client-side completa com mensagens em PT-BR

## Tecnologias

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| Frontend | React | 18.x |
| Frontend | React Router | 6.x |
| Frontend | TailwindCSS | 3.x |
| Frontend | Socket.IO Client | 4.x |
| Frontend | Axios | 1.x |
| Frontend | date-fns | 3.x |
| Frontend | react-hot-toast | 2.x |
| Frontend | Vite | 5.x |
| Backend | Node.js | 20.x |
| Backend | Express | 4.x |
| Backend | Socket.IO | 4.x |
| Backend | PostgreSQL | 16.x |
| Backend | pg (node-postgres) | 8.x |
| Backend | JWT (jsonwebtoken) | 9.x |
| Backend | bcrypt | 5.x |
| Backend | express-validator | 7.x |
| Backend | helmet + cors | latest |
| Infra | Docker + Docker Compose | 3.9 |
| Infra | nginx (frontend) | alpine |

## Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
│  Login │ Register │ Dashboard │ ChatPage                     │
│  AuthContext │ SocketContext │ React Router                  │
│  Axios (REST) ◄──────────────────────────────────────────►  │
│  Socket.IO Client (WS) ◄─────────────────────────────────►  │
└─────────────────────────────────────────────────────────────┘
                         │ HTTP + WS
┌─────────────────────────────────────────────────────────────┐
│                    Backend (Node.js / Express)               │
│  Routes → Controllers → Services → Repositories             │
│  Middlewares: auth (JWT), validate, errorHandler, rateLimit  │
│  Socket.IO Manager: rooms, private msgs, typing, presence    │
└─────────────────────────────────────────────────────────────┘
                         │ pg (Pool)
┌─────────────────────────────────────────────────────────────┐
│                    PostgreSQL 16                             │
│  users │ forums │ messages                                   │
└─────────────────────────────────────────────────────────────┘
```

### Padrão de Camadas (Backend)
```
routes/         ← define endpoints e aplica middlewares
controllers/    ← extrai dados da req, chama service, retorna resp
services/       ← regras de negócio e validação semântica
repositories/   ← queries SQL puras, sem lógica de negócio
config/         ← database pool, JWT helpers
middlewares/    ← auth, validate, errorHandler, rateLimiter
socket/         ← gerenciamento de salas e eventos WebSocket
```

## Estrutura de Diretórios

```
Tech4um/
├── docker-compose.yml
├── .env.example
├── .gitignore
│
├── backend/
│   ├── src/
│   │   ├── app.js                    # Express app (sem listen)
│   │   ├── server.js                 # HTTP server + Socket.IO boot
│   │   ├── config/
│   │   │   ├── database.js           # pg Pool + helpers
│   │   │   └── jwt.js                # generateToken, verifyToken
│   │   ├── middlewares/
│   │   │   ├── auth.js               # Bearer JWT middleware
│   │   │   ├── errorHandler.js       # Global error + 404
│   │   │   ├── validate.js           # express-validator runner
│   │   │   └── rateLimiter.js        # express-rate-limit
│   │   ├── repositories/
│   │   │   ├── userRepository.js
│   │   │   ├── forumRepository.js
│   │   │   └── messageRepository.js
│   │   ├── services/
│   │   │   ├── authService.js
│   │   │   ├── forumService.js
│   │   │   └── messageService.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── forumController.js
│   │   │   ├── messageController.js
│   │   │   └── userController.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── forums.js
│   │   │   ├── messages.js
│   │   │   └── users.js
│   │   └── socket/
│   │       └── socketManager.js      # Socket.IO completo
│   ├── database/
│   │   ├── migrations/001_initial.sql
│   │   ├── seeds/seed.sql
│   │   ├── migrate.js
│   │   └── seed.js
│   ├── tests/
│   │   ├── auth.test.js
│   │   ├── forums.test.js
│   │   └── messages.test.js
│   ├── Dockerfile
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── App.jsx                   # Roteamento principal
    │   ├── main.jsx                  # Entry point + providers
    │   ├── index.css                 # Tailwind + custom styles
    │   ├── context/
    │   │   ├── AuthContext.jsx       # Autenticação global
    │   │   └── SocketContext.jsx     # Socket.IO global
    │   ├── hooks/
    │   │   ├── useAuth.js
    │   │   └── useSocket.js
    │   ├── services/
    │   │   └── api.js                # Axios + interceptors
    │   ├── utils/
    │   │   └── helpers.js
    │   ├── components/
    │   │   ├── common/
    │   │   │   ├── Avatar.jsx
    │   │   │   ├── Button.jsx
    │   │   │   ├── Input.jsx
    │   │   │   ├── Loader.jsx
    │   │   │   └── Modal.jsx
    │   │   ├── chat/
    │   │   │   ├── ChatRoom.jsx
    │   │   │   ├── MessageList.jsx
    │   │   │   ├── MessageItem.jsx
    │   │   │   ├── MessageInput.jsx
    │   │   │   ├── UserList.jsx
    │   │   │   └── TypingIndicator.jsx
    │   │   ├── forum/
    │   │   │   ├── ForumCard.jsx
    │   │   │   └── CreateForumModal.jsx
    │   │   └── layout/
    │   │       └── Header.jsx
    │   └── pages/
    │       ├── LoginPage.jsx
    │       ├── RegisterPage.jsx
    │       ├── DashboardPage.jsx
    │       └── ChatPage.jsx
    ├── public/favicon.svg
    ├── index.html
    ├── nginx.conf
    ├── Dockerfile
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── .env.example
    └── package.json
```

## Execução com Docker

### Pré-requisitos
- Docker Desktop instalado e rodando
- Portas 80, 3001 e 5432 disponíveis

### 1. Clone e configure

```bash
git clone https://github.com/Igorgaah/Tech4um.git
cd Tech4um
cp .env.example .env
```

### 2. Suba tudo com um único comando

```bash
docker compose up --build
```

### 3. Acesse

| Serviço | URL |
|---------|-----|
| Frontend | http://localhost |
| API | http://localhost:3001/api |
| Health | http://localhost:3001/health |

> O banco de dados é inicializado automaticamente com schema e dados de demonstração via docker-entrypoint-initdb.d.

### Parar e limpar

```bash
docker compose down          # Para os containers
docker compose down -v       # Para e remove os volumes (apaga dados)
```

---

## Execução Local

### Pré-requisitos
- Node.js 18+
- PostgreSQL 14+ rodando localmente
- npm

### Backend

```bash
cd backend

# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env
# Edite .env com suas credenciais do PostgreSQL

# 3. Criar banco e executar migrations
createdb tech4um
npm run migrate

# 4. (Opcional) Popular com dados de exemplo
npm run seed

# 5. Iniciar servidor de desenvolvimento
npm run dev          # porta 3001
```

### Frontend

```bash
cd frontend

# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env
# Por padrão aponta para http://localhost:3001

# 3. Iniciar servidor de desenvolvimento
npm run dev          # porta 5173
```

Acesse: http://localhost:5173

---

## Variáveis de Ambiente

### Backend (`backend/.env`)

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| `NODE_ENV` | `development` | Ambiente da aplicação |
| `PORT` | `3001` | Porta HTTP |
| `DATABASE_URL` | — | Connection string completa (prioridade) |
| `DB_HOST` | `localhost` | Host PostgreSQL |
| `DB_PORT` | `5432` | Porta PostgreSQL |
| `DB_NAME` | `tech4um` | Nome do banco |
| `DB_USER` | `tech4um_user` | Usuário |
| `DB_PASSWORD` | `tech4um_pass` | Senha |
| `JWT_SECRET` | — | Secret JWT (mín. 32 chars em produção) |
| `JWT_EXPIRES_IN` | `7d` | Validade do token |
| `BCRYPT_SALT_ROUNDS` | `10` | Rounds do bcrypt |
| `CORS_ORIGIN` | `http://localhost:5173` | Origem CORS permitida |

### Frontend (`frontend/.env`)

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| `VITE_API_URL` | `http://localhost:3001/api` | URL base da API REST |
| `VITE_SOCKET_URL` | `http://localhost:3001` | URL do Socket.IO |

---

## API Reference

Todos os endpoints protegidos requerem: `Authorization: Bearer <token>`

### Autenticação

| Método | Endpoint | Auth | Descrição |
|--------|----------|------|-----------|
| POST | `/api/auth/register` | ❌ | Cadastrar usuário |
| POST | `/api/auth/login` | ❌ | Fazer login |
| GET | `/api/auth/me` | ✅ | Perfil do usuário logado |
| POST | `/api/auth/logout` | ✅ | Fazer logout |

### Fóruns

| Método | Endpoint | Auth | Descrição |
|--------|----------|------|-----------|
| GET | `/api/forums?search=&limit=&offset=` | ✅ | Listar fóruns |
| GET | `/api/forums/:id` | ✅ | Detalhes de um fórum |
| POST | `/api/forums` | ✅ | Criar fórum |

### Mensagens

| Método | Endpoint | Auth | Descrição |
|--------|----------|------|-----------|
| GET | `/api/messages/forums/:forumId` | ✅ | Histórico |
| POST | `/api/messages/forums/:forumId` | ✅ | Enviar mensagem |

### Usuários

| Método | Endpoint | Auth | Descrição |
|--------|----------|------|-----------|
| GET | `/api/users/search?q=` | ✅ | Buscar usuários |
| GET | `/api/users/:id` | ✅ | Dados de um usuário |

---

## WebSocket Events

Autenticação: `{ auth: { token: "<jwt>" } }` no handshake.

### Cliente → Servidor

| Evento | Payload |
|--------|---------|
| `join-room` | `{ forumId }` |
| `leave-room` | `{ forumId }` |
| `send-message` | `{ forumId, content, isPrivate, recipientId }` |
| `typing-start` | `{ forumId }` |
| `typing-stop` | `{ forumId }` |

### Servidor → Cliente

| Evento | Payload |
|--------|---------|
| `room-joined` | `{ forumId, messages, onlineUsers }` |
| `new-message` | `{ ...message }` |
| `online-users-updated` | `{ forumId, users }` |
| `user-joined` | `{ forumId, user }` |
| `user-left` | `{ forumId, user }` |
| `user-typing` | `{ forumId, userId, username }` |
| `user-stop-typing` | `{ forumId, userId, username }` |
| `private-notification` | `{ from, forumId, content }` |
| `error` | `{ message }` |

---

## Testes

```bash
cd backend
npm test                  # Todos os testes
npm run test:coverage     # Com relatório de cobertura
```

Cobertura: autenticação, fóruns e mensagens via Jest + Supertest.

---

## Usuários de Demonstração

Após executar o seed, todos com senha **`senha123`**:

| Username | E-mail |
|----------|--------|
| admin | admin@tech4um.com |
| alice | alice@example.com |
| bob | bob@example.com |
| carol | carol@example.com |
| dave | dave@example.com |

---

## Diferenciais Implementados

- Indicador de digitação animado com timeout automático
- Mensagens privadas com diferenciação visual completa
- Notificação global (toast) para msgs privadas recebidas
- Agrupamento de mensagens por data (Hoje / Ontem / data)
- Auto-scroll inteligente preservando posição do usuário
- Busca de fóruns com debounce de 300ms
- 4 opções de ordenação de fóruns
- Persistência completa no PostgreSQL
- Rate limiting em todas as rotas
- Helmet para headers de segurança HTTP
- Docker multi-stage build (imagens menores)
- nginx com proxy WebSocket, gzip e cache de assets
- Testes automatizados nos 3 recursos principais
- Graceful shutdown no servidor Node.js
- Avatares coloridos determinísticos por username

---

*Desenvolvido para o desafio Tech4um — Stack: React + Node.js + PostgreSQL + Socket.IO + Docker*

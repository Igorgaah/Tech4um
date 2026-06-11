const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Tech4um API',
      version: '1.0.0',
      description: `
## Tech4um Forum Platform — REST API

Full-stack forum platform with real-time chat powered by Socket.IO.

### Authentication
Most endpoints require a **Bearer JWT token**. Obtain a token via \`POST /api/auth/login\` or \`POST /api/auth/register\`, then click the **Authorize** button and paste the token.

### Rate Limits
- Global: **500 requests / 15 min**
- Auth endpoints: **20 requests / 15 min**

### Real-time Events
Alongside the REST API, this server exposes a **Socket.IO** endpoint at the root URL.
See the [WebSocket Events](#/WebSocket) section for the full event contract.
      `.trim(),
      contact: {
        name: 'Tech4um Support',
        email: 'support@tech4um.dev',
      },
      license: { name: 'MIT' },
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Local development server',
      },
      {
        url: 'http://localhost',
        description: 'Docker Compose (nginx proxy)',
      },
    ],
    tags: [
      {
        name: 'Auth',
        description: 'Registration, login, logout and token validation',
      },
      {
        name: 'Forums',
        description: 'Forum board management — list, get, create',
      },
      {
        name: 'Messages',
        description: 'Forum message history and posting (public & private)',
      },
      {
        name: 'Users',
        description: 'User lookup and search',
      },
      {
        name: 'WebSocket',
        description: `
**Socket.IO** real-time events. Connect to the server root URL.

### Handshake (Authentication)
Pass the JWT token during the connection handshake:
\`\`\`js
const socket = io('http://localhost:3001', {
  auth: { token: '<your-jwt-token>' }
});
\`\`\`

---

### Client → Server Events

| Event | Payload | Description |
|-------|---------|-------------|
| \`join-room\` | \`{ forumId: number }\` | Join a forum room. Server replies with \`room-joined\`, emits \`user-joined\` + \`online-users-updated\` to the room. |
| \`leave-room\` | \`{ forumId: number }\` | Leave a forum room. Server emits \`user-left\` + \`online-users-updated\` to the room. |
| \`send-message\` | \`{ forumId: number, content: string, isPrivate?: boolean, recipientId?: number }\` | Send a public or private message. Server persists to DB and emits \`new-message\` (to room or sender+recipient). Private messages also emit \`private-notification\` to the recipient. |
| \`typing-start\` | \`{ forumId: number }\` | Broadcast typing indicator to other room members. |
| \`typing-stop\` | \`{ forumId: number }\` | Clear typing indicator for other room members. |

---

### Server → Client Events

| Event | Payload | Description |
|-------|---------|-------------|
| \`room-joined\` | \`{ forumId, messages: Message[], onlineUsers: OnlineUser[] }\` | Confirmation after joining; includes message history and current online list. |
| \`new-message\` | \`Message\` | A new message was posted (public or private directed at you). |
| \`online-users-updated\` | \`{ forumId, users: OnlineUser[] }\` | Full updated online user list for the room. |
| \`user-joined\` | \`{ forumId, user: OnlineUser }\` | A user joined the forum room. |
| \`user-left\` | \`{ forumId, user: { userId, username } }\` | A user left the forum room. |
| \`user-typing\` | \`{ forumId, userId, username }\` | A user started typing in the forum room. |
| \`user-stop-typing\` | \`{ forumId, userId, username }\` | A user stopped typing in the forum room. |
| \`private-notification\` | \`{ from: { id, username }, forumId, content }\` | You received a private message. |
| \`error\` | \`{ message: string }\` | Server-side error (auth failure, invalid payload, etc.). |

---

### OnlineUser object
\`\`\`json
{ "userId": 1, "username": "alice", "avatarUrl": null }
\`\`\`

### Message object
See the \`Message\` schema in the **Schemas** section below.
        `.trim(),
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token obtained from /api/auth/login or /api/auth/register',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            username: { type: 'string', example: 'alice' },
            email: { type: 'string', format: 'email', example: 'alice@example.com' },
            avatar_url: { type: 'string', nullable: true, example: null },
            created_at: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00.000Z' },
          },
        },
        AuthToken: {
          type: 'object',
          required: ['message', 'user', 'token'],
          properties: {
            message: { type: 'string', example: 'Login realizado com sucesso!' },
            user: { $ref: '#/components/schemas/User' },
            token: {
              type: 'string',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            },
          },
        },
        Forum: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'General Discussion' },
            description: { type: 'string', nullable: true, example: 'Talk about anything.' },
            created_by: { type: 'integer', example: 1 },
            creator_id: { type: 'integer', example: 1 },
            creator_username: { type: 'string', example: 'alice' },
            message_count: { type: 'integer', example: 42 },
            created_at: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00.000Z' },
          },
        },
        Message: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 42 },
            forum_id: { type: 'integer', example: 1 },
            user_id: { type: 'integer', example: 2 },
            username: { type: 'string', example: 'bob' },
            avatar_url: { type: 'string', nullable: true, example: null },
            content: { type: 'string', example: 'Hello everyone!' },
            is_private: { type: 'boolean', example: false },
            recipient_id: { type: 'integer', nullable: true, example: null },
            recipient_username: { type: 'string', nullable: true, example: null },
            created_at: { type: 'string', format: 'date-time', example: '2024-01-15T10:35:00.000Z' },
          },
        },
        PaginatedForums: {
          type: 'object',
          properties: {
            forums: {
              type: 'array',
              items: { $ref: '#/components/schemas/Forum' },
            },
            total: { type: 'integer', example: 8 },
            limit: { type: 'integer', example: 20 },
            offset: { type: 'integer', example: 0 },
          },
        },
        Error: {
          type: 'object',
          required: ['message'],
          properties: {
            message: { type: 'string', example: 'Mensagem de erro descritiva.' },
          },
        },
        ValidationError: {
          type: 'object',
          properties: {
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string', example: 'email' },
                  message: { type: 'string', example: 'Email inválido.' },
                },
              },
            },
          },
        },
      },
    },
  },
  apis: [
    path.join(__dirname, '../routes/*.js').replace(/\\/g, '/'),
    path.join(__dirname, '../docs/*.js').replace(/\\/g, '/'),
  ],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;

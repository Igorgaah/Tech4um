/**
 * @swagger
 * /websocket-events:
 *   get:
 *     tags: [WebSocket]
 *     summary: Socket.IO event reference (read-only documentation)
 *     description: >
 *       This is a **documentation-only** endpoint — it does not exist in the HTTP API.
 *       It is here solely to surface the Socket.IO event contract in the Swagger UI.
 *
 *
 *       Connect to the server root URL using the Socket.IO client library and pass
 *       the JWT token in the handshake `auth` object:
 *
 *
 *       ```js
 *
 *       import { io } from 'socket.io-client';
 *
 *
 *       const socket = io('http://localhost:3001', {
 *         auth: { token: localStorage.getItem('tech4um_token') }
 *       });
 *
 *       ```
 *
 *
 *       See the **WebSocket** tag description above for the full event tables.
 *     responses:
 *       200:
 *         description: Documentation reference only — not a real HTTP endpoint
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 note:
 *                   type: string
 *                   example: This endpoint is for documentation purposes only.
 */
// This file exists only to provide @swagger annotations for the WebSocket tag.
// No actual route is registered here.

/**
 * Chat Gateway for handling WebSocket connections in a NestJS application.
 * This gateway manages real-time chat functionality, allowing clients to send messages
 * and receive echoes and broadcasts.
 */

import {
  OnGatewayConnection, // Interface for handling client connections
  OnGatewayDisconnect, // Interface for handling client disconnections
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { assignUsername, releaseUsername } from './username.util';

// WebSocket gateway listening on port 4000 with 'chat' namespace and CORS enabled
@WebSocketGateway(4000, { namespace: 'chat', cors: { origin: '*' } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  // Reference to the Socket.IO server instance for broadcasting messages
  @WebSocketServer() server: Server;

  // Map to store client socket IDs and their assigned usernames
  private usernames = new Map<string, string>();

  // Logs when a client connects and notifies other clients
  handleConnection(client: Socket) {
    // Assign a unique username to the client
    const username = assignUsername();
    this.usernames.set(client.id, username);

    console.log(`Client connected: ${client.id} as ${username}`);

    // Send the username to the client
    client.emit('assigned-username', { username });

    // Get list of all online users
    const onlineUsers = Array.from(this.usernames.values());

    // Broadcast updated online users list to all clients
    this.server.emit('online-users', { users: onlineUsers });

    // Notify all clients about the new connection
    this.server.emit('user-joined', {
      username,
      message: `${username} has joined the chat`,
    });
  }

  // Logs when a client disconnects and notifies other clients
  handleDisconnect(client: Socket) {
    const username = this.usernames.get(client.id);

    console.log(`Client disconnected: ${client.id} (${username})`);

    if (username) {
      // Release the username back to the pool
      releaseUsername(username);
      this.usernames.delete(client.id);

      // Get updated list of online users
      const onlineUsers = Array.from(this.usernames.values());

      // Broadcast updated online users list to all clients
      this.server.emit('online-users', { users: onlineUsers });

      // Notify all clients about the disconnection
      this.server.emit('user-left', {
        username,
        message: `${username} has left the chat`,
      });
    }
  }

  // Handles incoming 'message' events from clients
  @SubscribeMessage('message')
  handleMessage(client: Socket, message: string) {
    const username = this.usernames.get(client.id);
    console.log(`Received message from ${username}:`, message);

    // Broadcast the message to all connected clients including sender
    this.server.emit('message', {
      username,
      message,
      senderId: client.id,
    });
  }
}

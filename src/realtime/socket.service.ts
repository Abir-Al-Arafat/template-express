import { Server as HttpServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { SOCKET_EVENTS, UserEventPayload } from "./socket.events";

export class SocketService {
  private io: SocketIOServer | null = null;

  initialize(server: HttpServer): void {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
      },
    });

    this.io.on("connection", (socket) => {
      console.log(`Socket connected: ${socket.id}`);

      socket.on("disconnect", () => {
        console.log(`Socket disconnected: ${socket.id}`);
      });
    });
  }

  emitUserRegistered(payload: UserEventPayload): void {
    if (!this.io) {
      return;
    }

    this.io.emit(SOCKET_EVENTS.USER_REGISTERED, payload);
  }

  emitUserLoggedIn(payload: UserEventPayload): void {
    if (!this.io) {
      return;
    }

    this.io.emit(SOCKET_EVENTS.USER_LOGGED_IN, payload);
  }
}

export const socketService = new SocketService();

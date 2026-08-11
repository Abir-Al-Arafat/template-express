import { io } from "socket.io-client";

const socketUrl = process.env.SOCKET_SERVER_URL || "http://localhost:5000";

const socket = io(socketUrl, {
  transports: ["websocket"],
  reconnection: true,
});

console.log(`Connecting to Socket.IO server at ${socketUrl}...`);

socket.on("connect", () => {
  console.log(`Connected with socket id: ${socket.id}`);
});

socket.on("disconnect", (reason) => {
  console.log(`Disconnected: ${reason}`);
});

socket.on("connect_error", (error) => {
  console.error("Connection error:", error.message);
});

socket.on("transaction:created", (payload) => {
  console.log("\n[transaction:created]");
  console.log(JSON.stringify(payload, null, 2));
});

socket.on("balance:updated", (payload) => {
  console.log("\n[balance:updated]");
  console.log(JSON.stringify(payload, null, 2));
});

socket.on("transaction:failed", (payload) => {
  console.log("\n[transaction:failed]");
  console.log(JSON.stringify(payload, null, 2));
});

process.on("SIGINT", () => {
  console.log("\nShutting down socket client...");
  socket.disconnect();
  process.exit(0);
});

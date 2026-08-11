import http from "http";
import { database } from "./config/database";
import { env } from "./config/env";
import { app } from "./app";
import { socketService } from "./realtime/socket.service";

const bootstrap = async (): Promise<void> => {
  await database.connect();

  const server = http.createServer(app);
  socketService.initialize(server);

  server.listen(env.port, () => {
    console.log(`Server is running on http://localhost:${env.port}`);
  });
};

void bootstrap();

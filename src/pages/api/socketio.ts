import { NextApiRequest } from "next";
import { NextApiResponseServerIO } from "src/types/next";
import { Server as ServerIO, Socket } from "socket.io";
import { Server as NetServer } from "http";
import { parseCookies } from "src/lib/strings";
import WordleStorage from "src/lib/WordleStorage";

const storage = WordleStorage.getInstance();

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async (_req: NextApiRequest, res: NextApiResponseServerIO) => {
  if (!res.socket.server.io) {
    console.log("New Socket.io server...");
    // adapt Next's net Server to http Server
    const httpServer: NetServer = res.socket.server as any;
    const io = new ServerIO(httpServer, {
      path: "/api/socketio",
    });
    // append SocketIO server to Next.js socket server response
    res.socket.server.io = io;

    const allClients = {};
    io.sockets.on('connection', (socket: Socket) => {
       const cookies = parseCookies(socket.handshake.headers.cookie);
       const playerId = cookies['player_id'];
       if (!allClients[playerId]) {
         allClients[playerId] = 0;
       }
       allClients[playerId] += 1;
       socket.on('disconnect', () => {
        allClients[playerId] -= 1;

        if (allClients[playerId] === 0) {
          storage.removePlayer(playerId);
          io?.emit("player:left", { playerId });
        }
       });
    });
  }
  res.end();
};

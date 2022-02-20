import { NextApiRequest } from "next";
import WordleStorage, { IPlayer } from "src/lib/WordleStorage";
import { NextApiResponseServerIO } from "src/types/next";
import Cookies from 'cookies';

const storage = WordleStorage.getInstance();

export default (req: NextApiRequest, res: NextApiResponseServerIO) => {
  console.log('[x-players] game id', storage._instanceId);
  if (req.method === "POST") {
    return handleNewPlayerJoined(req, res);
  } else if (req.method === 'PUT') {
    handleUpdatePlayer(req, res);
  }
};

function handleNewPlayerJoined(req: NextApiRequest, res: NextApiResponseServerIO) {
  const cookies = new Cookies(req, res);
  const message = req.body as IPlayer;
  if (!storage.isPlayer(message.playerId)) {
    storage.addPlayer(message.playerId, message.name);
  }

  // dispatch to channel "scored"
  res?.socket?.server?.io?.emit("player:joined", message);

  cookies.set('player_id', message.playerId);
  cookies.set('player_name', message.name);
  res.status(200).json(storage.scoreBoard);
}

function handleUpdatePlayer(req: NextApiRequest, res: NextApiResponseServerIO) {
  // get message
  const message = req.body as IPlayer;
  if (storage.isPlayer(message.playerId)) {
    storage.updatePlayerName(message.playerId, message.name);
  }

  // dispatch to channel "scored"
  res?.socket?.server?.io?.emit("player:updated", message);

  // return message
  res.status(201).json(message);
}
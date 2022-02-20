import { NextApiRequest } from "next";
import WordleStorage from "src/lib/WordleStorage";
import { NextApiResponseServerIO } from "src/types/next";
import Cookies from 'cookies';

const storage = WordleStorage.getInstance();

export default (req: NextApiRequest, res: NextApiResponseServerIO) => {
  if (req.method === "POST") {
    return handleJoinTheGame(req, res);
  }
};

function handleJoinTheGame(req: NextApiRequest, res: NextApiResponseServerIO) {
  const playerId = req.body.playerId;
  const playerName = req.body.name;
  if (playerId && !storage.isPlayer(playerId)) {
    storage.addPlayer(playerId, playerName);
  }

  // dispatch to channel "scored"
  res?.socket?.server?.io?.emit(
    "player:joined",
    storage.getPlayer(playerId)
  );

  res.status(200).json(storage.scoreBoard);
}

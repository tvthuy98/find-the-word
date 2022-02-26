import { NextApiRequest } from "next";
import WordleStorage from "src/lib/WordleStorage";
import { NextApiResponseServerIO } from "src/types/next";

const storage = WordleStorage.getInstance();

export default (req: NextApiRequest, res: NextApiResponseServerIO) => {
  if (req.method === "POST") {
    return handleJoinTheGame(req, res);
  }
};

function handleJoinTheGame(req: NextApiRequest, res: NextApiResponseServerIO) {
  const playerId = req.body.playerId;
  const playerName = req.body.name;
  if (!storage.currentQuestion) {
    storage.newGame();
  }

  console.log('[x] storage', storage.scoreBoard);

  if (playerId && !storage.isPlayer(playerId)) {
    storage.addPlayer(playerId, playerName);
  }

  // dispatch to channel "scored"
  res?.socket?.server?.io?.emit(
    "player:joined",
    storage.getPlayer(playerId)
  );

  res.status(200).json({
    score: storage.scoreBoard,
    data: storage.gameData,
    answered: storage.answered,
    current: storage.currentQuestion,
  });
}

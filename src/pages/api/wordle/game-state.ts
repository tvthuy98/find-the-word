import { NextApiRequest } from "next";
import WordleStorage from "src/lib/WordleStorage";
import { NextApiResponseServerIO } from "src/types/next";
import Cookies from 'cookies';

const storage = WordleStorage.getInstance();

export default (req: NextApiRequest, res: NextApiResponseServerIO) => {
  if (req.method === "POST") {
    return handlePostState(req, res);
  } else if (req.method === 'GET') {
    return handleGetState(req, res);
  }
};

function handlePostState(req: NextApiRequest, res: NextApiResponseServerIO) {
  const cookies = new Cookies(req, res);
  const player_id = cookies.get('player_id');
  if (player_id && !storage.isPlayer(player_id)) {
    storage.addPlayer(player_id, cookies.get('player_name'));
  }

  storage.answerCorrect(cookies.get('player_id'));
  const current = storage.currentQuestion;
  const nextQuestion = storage.nextQuestion();
  const currsentUser = storage.getPlayer(cookies.get('player_id'));

  if (currsentUser.score >= 20) {
    storage.newGame();
    res?.socket?.server?.io?.emit(
      "game:reset",
      {
        data: storage.gameData,
        next: storage.currentQuestion,
        scores: storage.scoreBoard,
      }
    );

  } else {
    res?.socket?.server?.io?.emit(
      "player:scored",
      {
        player: currsentUser,
        next: nextQuestion,
        current: current,
      }
    );
  }

  // return message
  res.status(201).json({ ok: 201 });
}

function handleGetState(req: NextApiRequest, res: NextApiResponseServerIO) {
  res.status(200).json(storage.scoreBoard);
}

import { NextApiRequest } from "next";
import WordleStorage, { IGameItem } from "src/lib/WordleStorage";
import { NextApiResponseServerIO } from "src/types/next";
import Cookies from 'cookies';

const storage = WordleStorage.getInstance();

export default (req: NextApiRequest, res: NextApiResponseServerIO) => {
  if (req.method === "POST") {
    return handlePostState(req, res);
  } else if (req.method === 'GET') {
    return handleGetState(req, res);
  } else if (req.method === 'PUT') {
    return handleNewGame(req, res);
  }
};

function handlePostState(req: NextApiRequest, res: NextApiResponseServerIO) {
  const cookies = new Cookies(req, res);
  const player_id = cookies.get('player_id');
  const answer = req.body;
  if (player_id && !storage.isPlayer(player_id)) {
    storage.addPlayer(player_id, cookies.get('player_name'));
  }

  const current = storage.currentQuestion as IGameItem;
  if (answer.value !== current.value) {
    return res.status(200).json({ incorrect: true });
  }

  storage.answerCorrect(cookies.get('player_id'));
  const nextQuestion = storage.nextQuestion();
  const currsentUser = storage.getPlayer(cookies.get('player_id'));

  if (currsentUser.score >= 15 || !nextQuestion) {
    return handleNewGame(req, res);

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

function handleGetState(_req: NextApiRequest, res: NextApiResponseServerIO) {
  res.status(200).json(storage.scoreBoard);
}

function handleNewGame(req: NextApiRequest, res: NextApiResponseServerIO) {
  if (req.body.puzzle) {
    storage.setPuzzle(req.body.puzzle);
  }
  storage.newGame();
  res?.socket?.server?.io?.emit(
    "game:reset",
    {
      data: storage.gameData,
      next: storage.currentQuestion,
      scores: storage.scoreBoard,
    }
  );

  res.status(201).json({ ok: 200 });
}

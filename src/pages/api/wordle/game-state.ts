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

  storage.plusOne(cookies.get('player_id'));

  // dispatch to channel "scored"
  res?.socket?.server?.io?.emit(
    "player:scored",
    storage.getPlayer(cookies.get('player_id'))
  );

  // return message
  res.status(201).json({ ok: 201 });
}

function handleGetState(req: NextApiRequest, res: NextApiResponseServerIO) {
  res.status(200).json(storage.scoreBoard);
}

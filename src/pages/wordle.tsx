import { NextPageContext } from "next";
import React, { useState, useEffect, useRef, useCallback, FormEvent } from "react";
import SocketIOClient from "socket.io-client";
import tw from "twin.macro";
import Cookies from 'cookies';
import getLocalIp from "src/lib/getIpAddress";
import GameBoard from "src/components/wordle/GameBoard";
import { Socket } from "socket.io-client";
import { IGameItem } from "src/lib/WordleStorage";
import { BOARD_BG_COLORS, DEFAULT_PUZZLE } from "src/lib/constants";

export interface IPlayer {
  playerId: string;
  name: string;
}

interface IScore {
  name: string;
  score: number;
  playerId: string;
}

interface IBoardScores {
  [key: string]: IScore;
}

// component
const Wordle: React.FC<{
  playerId: string;
  scoreBoard: IBoardScores;
  gameBoard: IGameItem[];
  answered: IGameItem[];
  current: IGameItem;
}> = (props) => {
  const socketRef = useRef<typeof Socket>();

  // connected flag
  const [connected, setConnected] = useState<boolean>(false);

  // init chat and message
  const [scores, setScores] = useState<IBoardScores>(props.scoreBoard);
  const [scoreBoard, setScoreBoard] = useState<IScore[]>([]);
  const [question, setQuestion] = useState<IGameItem>(props.current);
  const [gameBoard, setGameBoard] = useState<IGameItem[]>(props.gameBoard);
  const [answered, setAnswered] = useState<IGameItem[]>(props.answered);
  const [previous, setPrevAnswer] = useState<IGameItem>({ x: 0, y: 0, label: '', value: ''});
  const [boardBackground, setBoardBackground] = useState<string>(BOARD_BG_COLORS[0]);

  const boardElRef = React.useRef<HTMLDivElement>(null);

  useEffect((): any => {
    // connect to socket server
    const socket = SocketIOClient.connect(process.env.BASE_URL, {
      path: "/api/socketio",
    });

    // log socket connection
    socket.on("connect", () => {
      console.log("SOCKET CONNECTED!", socket.id);
      setConnected(true);
    });

    // update chat on new message dispatched
    socket.on("player:scored", (message: { player: IScore, current: IGameItem, next: IGameItem }) => {
      setScores(scrs => {
        scrs[message.player.playerId] = message.player;
        return { ...scrs };
      });
      setQuestion(current => {
        setPrevAnswer(current);
        return message.next;
      });
      setAnswered(curr => ([...curr, message.current]));
    });

    socket.on("player:joined", (message: IScore) => {
      setScores(scrs => {
        let copied = {...scrs};
        copied[message.playerId] = message;
        return copied;
      });
    });

    socket.on("player:left", (message: { playerId: string }) => {
      setScores(scrs => {
        let copied = {...scrs};
        delete copied[message.playerId];
        return copied;
      });
    });

    socket.on("game:reset", (message: { data: IGameItem[],  next: IGameItem, scores: IBoardScores }) => {
      setGameBoard(message.data);
      setAnswered([]);
      setQuestion(message.next);
      setScores(message.scores);
    });

    socketRef.current = socket;

    // socket disconnet onUnmount if exists
    if (socket) return () => socket.disconnect();
  }, []);

  useEffect((): any => {
    let newScoreBoard: IScore[] = Object.values(scores);
    newScoreBoard = newScoreBoard.sort((cur, next) => next.score - cur.score);
    setScoreBoard(newScoreBoard);
  }, [scores, props.scoreBoard]);

  useEffect(() => {
    setBoardBackground((current: string) => {
      const nextIndex = BOARD_BG_COLORS.indexOf(current) + 1;
      return (BOARD_BG_COLORS[nextIndex] || BOARD_BG_COLORS[0]);
    });
  }, [question]);

  const handleSubmitPuzzle = useCallback((event: FormEvent) => {
    event.preventDefault(); 
    const formData = new FormData(event.target as HTMLFormElement);
    const formProps = Object.fromEntries(formData);
    fetch("/api/wordle/game-state", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formProps),
    }).then(res => {
      console.log('[x] res', res.text());
    });
  }, []);

  return (<>
    <div className="board" tw="flex w-full" ref={boardElRef}>
      <div tw="flex w-1/2 max-w-xs flex-col h-screen">
        <div tw="flex flex-col flex-1 bg-gray-200">
          <div tw="flex-1 p-4 font-mono">
            {
              scoreBoard.map((plrScore, i) => (
                <div key={"msg_" + i} tw="mt-1">
                  <span
                    css={i < 3 ? tw`text-green-500` : tw`text-black`}
                  >
                    [{i + 1}]
                  </span>
                  <span
                    css={plrScore.playerId === props.playerId ? tw`text-red-500` : tw`text-black`}
                  >
                    {plrScore.playerId === props.playerId ? `${plrScore.name} (You)` : plrScore.name}
                  </span>
                  : {plrScore.score}
                </div>
              ))
            }
          </div>
        </div>
        <div tw="bg-blue-200 p-1">
          <form onSubmit={handleSubmitPuzzle}>
            <div tw="mb-4">
              <label tw="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                New Puzzle
              </label>
              <textarea
                rows={12}
                tw="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none resize-none"
                name="puzzle"
                defaultValue={DEFAULT_PUZZLE}>
              </textarea>
            </div>
            <div tw="flex items-center justify-center content-center">
              <input tw="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none" type="submit" value="Set Puzzle" />
            </div>
          </form>
        </div>
        <div tw="text-white p-0">{connected ? 'connected': 'connecting...'}</div>
      </div>
      <GameBoard
        boardData={gameBoard}
        answered={answered}
        question={question}
        previous={previous}
      />
    </div>

    <style jsx global={true}>{`
      body {
        background-color: ${boardBackground}
      }
    `}</style>
  </>);
};

export async function getServerSideProps(context: NextPageContext) {
  const cookies = new Cookies(context?.req, context?.res);
  let playerId = cookies.get('player_id');
  if (!playerId) {
    return {
      redirect: {
        permanent: false,
        destination: "/",
      }
    }
  }

  const myIp = getLocalIp();
  const port = process.env.PORT || 3000;
  const board = await fetch(`http:${myIp}:${port}/api/wordle/join`, {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      playerId,
      name: cookies.get('player_name')
    }),
  }).then(r => r.json());

  return {
    props: {
      playerId: playerId,
      scoreBoard: board.score,
      gameBoard: board.data,
      answered: board.answered,
      current: board.current,
    },
  }
}

export default Wordle;

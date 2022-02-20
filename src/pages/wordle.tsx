
import { NextPageContext } from "next";
import React, { useState, useEffect, useRef } from "react";
import SocketIOClient from "socket.io-client";
import tw from "twin.macro";
import Cookies from 'cookies';
import getLocalIp from "src/lib/getIpAddress";
import GameBoard from "src/components/wordle/GameBoard";
import { Socket } from "socket.io-client";
import { IGameItem } from "src/lib/WordleStorage";
import players from "./api/wordle/players";

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
  const inputRef = useRef(null);
  const socketRef = useRef<typeof Socket>();

  // connected flag
  const [connected, setConnected] = useState<boolean>(false);

  // init chat and message
  const [scores, setScores] = useState<IBoardScores>(props.scoreBoard);
  const [scoreBoard, setScoreBoard] = useState<IScore[]>([]);
  const [question, setQuestion] = useState<IGameItem>(props.current);
  const [gameBoard, setGameBoard] = useState<IGameItem[]>(props.gameBoard);
  const [answered, setAnswered] = useState<IGameItem[]>(props.answered);

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
      setQuestion(message.next);
      setAnswered(curr => ([...curr, message.current]));
    });

    socket.on("player:joined", (message: IScore) => {
      setScores(scrs => {
        scrs[message.playerId] = message;
        return { ...scrs };
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

  return (<><div tw="flex w-full">
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
                  {plrScore.playerId === props.playerId ? "You" : plrScore.name}
                </span>
                : {plrScore.score}
              </div>
            ))
          }
        </div>
      </div>
    </div>
    <GameBoard
      boardData={gameBoard}
      answered={answered}
      question={question}
    />
  </div></>);
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
  console.log('[x] score board', board);

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
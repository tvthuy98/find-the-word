
import { NextPageContext } from "next";
import React, { useState, useEffect, useRef } from "react";
import SocketIOClient from "socket.io-client";
import tw from "twin.macro";
import Cookies from 'cookies';
import getLocalIp from "src/lib/getIpAddress";

interface IPlayer {
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
const Wordle: React.FC<{ playerId: string, scoreBoard: IBoardScores }> = (props) => {
  const inputRef = useRef(null);

  // connected flag
  const [connected, setConnected] = useState<boolean>(false);

  // init chat and message
  const [scores, setScores] = useState<IBoardScores>(props.scoreBoard);
  const [msg, setMsg] = useState<string>("");
  const [scoreBoard, setScoreBoard] = useState<IScore[]>([]);

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
    socket.on("player:scored", (message: IScore) => {
      setScores(scrs => {
        scrs[message.playerId] = message;
        return { ...scrs };
      });
    });

    socket.on("player:joined", (message: IScore) => {
      setScores(scrs => {
        scrs[message.playerId] = message;
        return { ...scrs };
      });
    });

    // socket disconnet onUnmount if exists
    if (socket) return () => socket.disconnect();
  }, []);

  useEffect((): any => {
    let newScoreBoard: IScore[] = Object.values(scores);
    newScoreBoard = newScoreBoard.sort((cur, next) => next.score - cur.score);
    setScoreBoard(newScoreBoard);
  }, [scores, props.scoreBoard]);

  const sendMessage = async () => {
    if (msg) {
      // build message obj
      const message: IPlayer = {
        playerId: props.playerId,
        name: props.playerId,
      };

      // dispatch message to other users
      const resp = await fetch("/api/wordle/game-state", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(message),
      });

      // reset field if OK
      if (resp.ok) setMsg("");
    }

    // focus after click
    inputRef?.current?.focus();
  };

  return (
    <div tw="flex flex-col w-full h-screen">
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
        <div tw="bg-gray-400 p-4 h-20 sticky bottom-0">
          <div tw="flex flex-row flex-1 h-full divide-gray-200 divide-x">
            <div tw="pr-2 flex-1">
              <input
                ref={inputRef}
                type="text"
                value={msg}
                placeholder={connected ? "Type a message..." : "Connecting..."}
                tw="w-full h-full rounded shadow border-gray-400 border px-2"
                disabled={!connected}
                onChange={(e) => {
                  setMsg(e.target.value);
                }}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    sendMessage();
                  }
                }}
              />
            </div>
            <div tw="flex flex-col justify-center items-stretch pl-2">
              <button
                tw="bg-blue-500 rounded shadow text-sm text-white h-full px-2"
                onClick={sendMessage}
                disabled={!connected}
              >
                SEND
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
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
  console.log('[x] my ip', myIp);
  console.log('[x] port', port);
  const scoreBoard = await fetch(`http:${myIp}:${port}/api/wordle/join`, {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      playerId,
      name: cookies.get('player_name')
    }),
  }).then(r => r.json());
  console.log('[x] score board', scoreBoard);

  return {
    props: {
      playerId: playerId,
      scoreBoard: scoreBoard
    },
  }
}

export default Wordle;

import React  from "react";
import "twin.macro";

export interface IGameItem {
  value: string;
  x: number;
  y: number;
  label: string;
}

const GameBoard: React.FC<{
  playerId?: string;
  boardData?: IGameItem[];
  question?: IGameItem;
  answered?: IGameItem[];
}> = (props) => {
  const submitAnswer = async (answered: IGameItem) => {
    await fetch("/api/wordle/game-state", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(answered)
    });
  };

  const onPickItem = (item: IGameItem) => {
    if (item.value === props.question?.value) {
      submitAnswer(item);
    }
  }

  return (
    <div tw="w-1/2">
      <div tw="h-8 text-3xl mb-5 w-full bg-green-300 w-full text-center">
        {props.question?.value}
      </div>
      <div tw="relative">
        {
          props.boardData?.map(item => {
            return <button
              key={item.label}
              tw="absolute text-red-500 border"
              onClick={() => onPickItem(item)}
              style={{
                top: item.y,
                left: item.x,
                fontSize: 30,
                // width: 40,
                // height: 40,
              }}>
              {item.label}
            </button>
          })
        }
      </div>
    </div>
  )
};

export default GameBoard;

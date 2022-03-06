
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
  previous?: IGameItem;
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
    <div tw="w-full pl-1 pr-1">
      <div tw="text-3xl mb-5 w-full text-white border-b-2 w-full text-center p-2">
        {props.question?.value}
      </div>
      <div tw="relative">
        {
          props.boardData?.map(item => {
            return <button
              key={item.label}
              tw="absolute border rounded text-white"
              onClick={() => onPickItem(item)}
              style={{
                top: item.y,
                left: item.x,
                fontSize: 25,
                backgroundColor: props.previous?.value === item.value ? 'lime' : 'unset',
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

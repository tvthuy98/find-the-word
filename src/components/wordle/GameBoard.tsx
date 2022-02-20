
import React  from "react";
import "twin.macro";
import { defineGrid, extendHex } from 'honeycomb-grid'

const Grid = defineGrid(extendHex({
  size: 40,
}));
const characters = 'あいうえおかきくけこさしすせそtたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわゐゑを';
const board = Grid.rectangle({ width: 12, height: 12 });

function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

const gameData = [];

const getNewPos = (taken = []) => {
  let pos = board[randomNumber(0, board.length - 1)];
  if (taken.indexOf(pos) > -1) {
    return getNewPos();
  }

  taken.push(pos);
  return pos;
}

let taken = [];
for (let i = 0; i < characters.length; i++) {
  const pos = getNewPos(taken).toPoint();
  gameData.push({
    value: characters[i],
    x: pos.x,
    y: pos.y,
    label: characters[i]
  })
}

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
  const submitAnswer = async () => {
    await fetch("/api/wordle/game-state", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
  };

  const onPickItem = (item: IGameItem) => {
    if (item.value === props.question?.value) {
      submitAnswer();
    }
  }

  return (
    <div tw="w-1/2">
      <div tw="h-8 text-2xl mb-5 w-full bg-green-300 w-full text-center">
        {props.question?.value}
      </div>
      <div tw="relative">
        {
          props.boardData?.map(item => {
            return <div
              key={item.label}
              tw="absolute text-red-500 border"
              onClick={() => onPickItem(item)}
              style={{
                top: item.y,
                left: item.x,
                fontSize: 30,
                width: 40,
                height: 40,
              }}>
              {item.label}
            </div>
          })
        }
      </div>
    </div>
  )
};

export default GameBoard;

import React  from "react";
import "twin.macro";
import { styled } from "twin.macro";
import cls from 'classnames';

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
  className?: string;
}> = (props) => {
  const [suggesting, setSuggesting] = React.useState<boolean>(false);

  React.useEffect(() => {
    setSuggesting(false);

    let suggestTimer = setTimeout(() => {
      setSuggesting(true);
    }, 35000);

    return () => {
      clearTimeout(suggestTimer);
    }
  }, [props.question]);

  const submitAnswer = async (answered: IGameItem) => {
    await fetch("/api/wordle/game-state", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...answered, suggested: suggesting })
    });
  };

  const onPickItem = (item: IGameItem) => {
    if (item.value === props.question?.value) {
      submitAnswer(item);
    }
  }

  return (<>
    <div className={cls(props.className)} tw="w-full pl-1 pr-1">
      <style>

      </style>
      <div tw="text-3xl mb-5 w-full text-white border-b-2 w-full text-center p-2">
        {props.question?.value}
      </div>
      <div tw="relative">
        {
          props.boardData?.map(item => {
            return <button
              key={item.label}
              tw="absolute border rounded text-white font-bold"
              onClick={() => onPickItem(item)}
              className={cls({
                  'blinking': item.value === props.question.value && suggesting,
                })}
              style={{
                top: item.y,
                left: item.x,
                fontSize: 25,
                backgroundColor: props.previous?.value === item.value ? '#680065' : 'unset',
              }}>
              {item.label}
            </button>
          })
        }
      </div>
    </div>
  </>)
};

export default styled(GameBoard)`
  .blinking {
    animation: blinker 0.5s linear infinite;
  }

  @keyframes blinker {
    50% {
      opacity: 0.25;
    }
  }
`;

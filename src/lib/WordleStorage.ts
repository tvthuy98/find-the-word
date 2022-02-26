import { v4 as uuidv4 } from 'uuid';
import { defineGrid, extendHex, GridFactory, Hex } from 'honeycomb-grid'

const Grid = defineGrid(extendHex({
  size: 40,
}));

function shuffle(array: any[]) {
  let currentIndex = array.length, randomIndex: number;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}

export interface IPuzzle {
  label: string;
  value: string;
}

export interface IScore {
  name: string;
  score: number;
  playerId: string;
}

export interface IBoardScores {
  [key: string]: IScore;
}

export interface IPlayer {
  playerId: string;
  name: string;
}

export interface IGameItem {
  value: string;
  x: number;
  y: number;
  label: string;
}

class Storage {
  scoreBoard: IBoardScores = {};
  gameData: IGameItem[]  = [];
  answered: IGameItem[]  = [];
  remaining: IGameItem[] = [];
  currentQuestion: IGameItem;
  _instanceId: string;
  puzzle: IPuzzle[];
  boardWidth: number = 12;
  boardHeight: number = 12;
  board: any;

  constructor() {
    this._instanceId = uuidv4();
    this.board = Grid.rectangle({ width: this.boardWidth, height: this.boardHeight });
  }

  setPuzzle(newPuzzle: string) {
    const puzzles = newPuzzle.replace(/(?:\\[rn]|[\r\n]+)+/g, "\n").split('\n').filter(Boolean);
    this.puzzle = puzzles.map(item => {
      const [value, label] = item.split('-->');
      return { label: label.trim(), value: value.trim() } as IPuzzle;
    })
  }

  isPlayer(playerId: string) {
    return this.scoreBoard[playerId] !== undefined;
  }

  addPlayer(playerId: string, playerName: string): void {
    if (this.scoreBoard[playerId]) {
      throw Error(`player ${playerId} already exists`);
    }

    this.scoreBoard[playerId] = {
      playerId: playerId,
      name: playerName,
      score: 0
    };
  }

  updatePlayerName(playerId: string, newName: string): void {
    if (!this.scoreBoard[playerId]) {
      throw new Error(`player ${playerId} does not exits`);
    }

    this.scoreBoard[playerId].name = newName;
  }

  answerCorrect(playerId: string): void {
    if (!this.scoreBoard[playerId]) {
      throw new Error(`player ${playerId} does not exits`);
    }

    this.scoreBoard[playerId].score += 1;
  }

  nextQuestion() {
    this.answered.push(this.currentQuestion);
    this.currentQuestion = this.remaining.pop();
    return this.currentQuestion;
  }

  getPlayer(playerId: string) {
    return this.scoreBoard[playerId];
  }

  newGame() {
    if (!this.puzzle?.length) {
      this.setPuzzle('question --> answer');
    }
    this.gameData = [];
    this.answered = [];
    this.puzzle = shuffle(this.puzzle);

    const scores = Object.values(this.scoreBoard);
    for (let i = 0, len = scores.length; i < len; i++) {
      scores[i].score = 0;
    }

    const maxI = this.boardWidth * this.boardHeight;

    for (let i = 0; i < maxI; i++) {
      if (!this.puzzle[i]) {
        break;
      }
      const pos = this.board[i].toPoint();
      this.gameData.push({
        value: this.puzzle[i].label,
        x: pos.x,
        y: pos.y,
        label: this.puzzle[i].value
      });
    }

    this.remaining = shuffle([...this.gameData]);
    this.currentQuestion = this.remaining.pop();
  }

  reset() {
    this.scoreBoard = {};
    this.answered = [];
    this.remaining = [];
    this.currentQuestion = null;
  }
}

const storage = new Storage();

class WordleStorage {
  constructor() {
    throw new Error('Use Singleton.getInstance()');
  }
  static getInstance() {
    return storage;
  }
}

export default WordleStorage;

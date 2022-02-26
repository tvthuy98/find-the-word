import { v4 as uuidv4 } from 'uuid';
import { defineGrid, extendHex } from 'honeycomb-grid'

const Grid = defineGrid(extendHex({
  size: 40,
}));
const puzzle = 'あ,a|い,i|う,u|え,e|お,o|か,ka|き,ki|く,ku|け,ke|こ,ko|さ,sa|し,shi|す,su,|せ,se|そ,so|た,ta|ち,chi|つ,tsu|て,te|と,to|な,na|に,ni|ぬ,nu|ね,ne|の,no|は,ha|ひ,bi|ふ,fu|へ,he|ほ,ho|ま,ma|み,mi|む,mu|め,me|も,mo|や,ya|ゆ,yu|よ,yo|ら,ra|り,ri|る,ru|れ,re|ろ,ro|わ,wa|ゐ,wu|を,wo'.split('|').map(i => {
  const [value, label] = i.split(',');
  return { label, value };
});
let board = Grid.rectangle({ width: 5, height: 12 });

function shuffle(array) {
  let currentIndex = array.length, randomIndex;

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

board = shuffle(board);

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

  constructor() {
    this._instanceId = uuidv4();
  }

  setPuzzle(newPuzzle: string) {
    const puzzles = newPuzzle.replace(/(?:\\[rn]|[\r\n]+)+/g, "\n").split('\n').filter(Boolean);
    this.puzzle = puzzles.map(item => {
      const [value, label] = item.split('-->');
      console.log({ value, label });
      return { label: label, value: value } as IPuzzle;
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
    board = shuffle(board);
    if (!this.puzzle?.length) {
      this.setPuzzle('question --> answer');
    }
    this.gameData = [];
    this.answered = [];

    const scores = Object.values(this.scoreBoard);
    for (let i = 0, len = scores.length; i < len; i++) {
      scores[i].score = 0;
    }

    for (let i = 0; i < this.puzzle.length; i++) {
      const pos = board[i].toPoint();
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

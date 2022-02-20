
import { v4 as uuidv4 } from 'uuid';

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

class Storage {
  scoreBoard: IBoardScores = {};
  _instanceId: string;

  constructor() {
    this._instanceId = uuidv4();
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

  plusOne(playerId: string): void {
    if (!this.scoreBoard[playerId]) {
      throw new Error(`player ${playerId} does not exits`);
    }

    this.scoreBoard[playerId].score += 1;
  }

  getPlayer(playerId: string) {
    return this.scoreBoard[playerId];
  }

  newGame() {
    const scores = Object.values(this.scoreBoard);
    for (let i = 0, len = scores.length; i < len; i++) {
      scores[i].score = 0;
    }
  }

  reset() {
    this.scoreBoard = {};
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
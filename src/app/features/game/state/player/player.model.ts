export interface Player {
  id: string,
  name: 'Camaxtli' | 'Nanahuatzin',
  nick: string,
  godType: GodType,
  playerType: PlayerType,
  bot: boolean,
  botType: 'random' | 'minimax' | 'dqn' | 'unknown' | undefined;
  wins: number
}

export enum GodType {
  CAMAXTLI, // piece < 100
  NANAHUATZIN // piece >= 100
}

export enum PlayerType {
  P1,
  P2
}

export interface ColorMapping {
  p1: {
    color: string,
    godType: GodType
  },
  p2: {
    color: string
    godType: GodType
  }
}

export enum BotTypes {
  NONE, RANDOM, MINIMAX, DQN, UNKNOWN
}

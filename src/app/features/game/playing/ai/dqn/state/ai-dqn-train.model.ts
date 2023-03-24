import { MoveIndex } from '../../../../state/action/move.model';

export interface AISarsd {
  id: string;
  state: number[][];
  action: MoveIndex;
  reward: number;
  nextState: number[][];
  done: boolean;
  new: boolean;
}

export interface AIHistoryLoss {
  loss: number,
  steps: number
}
export interface AIHistoryRewards {
  reward: number,
  episode: number
}

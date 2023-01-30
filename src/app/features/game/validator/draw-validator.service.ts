import { Injectable } from '@angular/core';
import { GameManagerService } from '../../../core/state/game-manager/game-manager.service';

@Injectable({
  providedIn: 'root'
})
export class DrawValidatorService {

  memory: Map<string, number> = new Map(); // position, repetition
  rounds: number = 0;

  constructor() {
  }

  public checkDrawFromStates(matrix: number[][]): boolean {
    const matrixString = this.getBoardAsString(matrix);
    const repetition = this.memory.get(matrixString);
    this.rounds += 1;

    if (this.rounds >= GameManagerService.GAME_SETTINGS.draw.max) return true;

    if (repetition) {
      this.memory.set(matrixString, repetition + 1);

      // validate if it's a draw
      if (repetition + 1 >= GameManagerService.GAME_SETTINGS.draw.repetition) return true;
    } else {
      this.memory.set(matrixString, 1);
    }

    return false;
  }

  public checkDrawWithoutSave(matrix: number[][]): boolean {
    const matrixString = this.getBoardAsString(matrix);
    const repetition = this.memory.get(matrixString);

    if (repetition) {
      // validate if it's a draw
      if (repetition + 1 >= GameManagerService.GAME_SETTINGS.draw.repetition
        || this.rounds >= GameManagerService.GAME_SETTINGS.draw.max) return true;
    }

    return false;
  }


  public undo(matrix: number[][]): void {
    const matrixString = this.getBoardAsString(matrix);
    this.memory.set(matrixString, 0);
  }

  public reset(): void {
    this.memory = new Map();
    this.rounds = 0;
  }

  private getBoardAsString(matrix: number[][]): string {
    let position = '';

    for (let y = 0; y < matrix.length; y++) {
      for (let x = 0; x < matrix[y].length; x++) {
        position += '' + matrix[y][x];
      }
    }

    return position;
  }

}

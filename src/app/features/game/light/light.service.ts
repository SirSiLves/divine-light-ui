import { EventEmitter, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MatrixQuery } from '../state/matrix/matrix.query';
import { LightValidatorService } from '../validator/light-validator.service';
import { Destroy, Light } from './light.model';
import { Field } from '../state/action/field.model';
import { Direction, DirectionType } from './direction.model';
import { MatrixStore } from '../state/matrix/matrix.store';


@Injectable({
  providedIn: 'root'
})
export class LightService {

  private timer = 0;
  readonly timeIncrease = 75;
  readonly timeout = 300; // timeout before the light starts

  lightOff$ = new BehaviorSubject<boolean>(true);
  lightOnEvent$ = new EventEmitter<Light | undefined>();
  lightTime$ = new BehaviorSubject<number>(0);

  constructor(
    private matrixQuery: MatrixQuery
  ) {
  }

  getLightPoints(matrix: number[][], startPosition: Field | undefined, lights: Light[], direction: Direction): Destroy | undefined {
    if (!startPosition) throw new Error('ERROR in LightService.getLightPoints(), start position is missed: ' + startPosition);

    let piece = matrix[startPosition.y][startPosition.x];
    this.addLight(lights, 0, startPosition, direction.type);
    let nextPosition = LightValidatorService.getNextPosition(direction.type, startPosition);

    let timer = this.timer + this.timeIncrease;
    while (nextPosition && LightValidatorService.nextPositionAvailable(nextPosition, matrix)) {

      piece = matrix[nextPosition.y][nextPosition.x];

      if (piece !== 0) {
        const nextDirection: Direction = LightValidatorService.getDirection(piece, direction.type, nextPosition);

        if (nextDirection.destroy || nextDirection.block) {
          this.drawDestroyOrBlock(direction, timer, nextPosition, lights);
          return nextDirection.destroy ? {...nextDirection.destroy} : undefined;
        } else {
          this.drawCorner(direction, nextDirection, timer, nextPosition, lights);
          direction = nextDirection;
        }
      } else {
        this.drawStraight(direction, timer, nextPosition, lights);
      }

      nextPosition = LightValidatorService.getNextPosition(direction.type, nextPosition);

      timer += this.timeIncrease;
    }

    return undefined;
  }

  turnOnLight(piece: number): Destroy | undefined {
    this.lightOff$.next(false);

    const matrix: number[][] = this.matrixQuery.getLatestMatrixState();
    const startPosition: Field = (piece < 100 && matrix[0][0] < 100) || (piece >= 100 && matrix[0][0] >= 100) ? {
      x: 0,
      y: 0
    } : {x: MatrixStore.WIDTH_NUMBER - 1, y: MatrixStore.HEIGHT_NUMBER - 1};
    const lights: Light[] = [];
    const direction: Direction = LightValidatorService.getSUNDirection(matrix[startPosition.y][startPosition.x])

    const destroy: Destroy | undefined = this.getLightPoints(matrix, startPosition, lights, direction);

    // set last to true for possibly dead-effect
    lights[lights.length - 1].last = true;
    // calculate average value
    this.lightTime$.next(lights.reduce((accumulator, obj) => accumulator + obj.timer, 0) / lights.length * 2);

    // emit all lights
    setTimeout(() => {
      lights.forEach(light => this.lightOnEvent$.emit(light));
    }, this.timeout);

    return destroy;
  }

  turnOffLight(): void {
    this.lightOff$.next(true);
    this.lightTime$.next(0);
  }

  addLight(lights: Light[], timer: number, position: Field, directionType: DirectionType): void {
    lights.push({
      timer,
      cellId: MatrixQuery.getCellID(position.x, position.y),
      directionType,
      last: false
    });
  }

  private drawStraight(direction: Direction, timer: number, nextPosition: Field, lights: Light[]): void {
    if ([DirectionType.UP, DirectionType.DOWN].includes(direction.type)) {
      this.addLight(lights, timer / 2, nextPosition, DirectionType.UP);
      this.addLight(lights, timer / 2, nextPosition, DirectionType.DOWN);
    } else {
      this.addLight(lights, timer / 2, nextPosition, DirectionType.RIGHT);
      this.addLight(lights, timer / 2, nextPosition, DirectionType.LEFT);
    }
  }

  private drawCorner(oldDirection: Direction, nextDirection: Direction,
                     timer: number,
                     nextPosition: Field,
                     lights: Light[]): void {

    if (oldDirection.type === DirectionType.LEFT && nextDirection.type === DirectionType.UP
      || oldDirection.type === DirectionType.DOWN && nextDirection.type === DirectionType.RIGHT) {
      // rotation: 0
      this.addLight(lights, timer / 2, nextPosition, DirectionType.RIGHT);
      this.addLight(lights, timer / 2, nextPosition, DirectionType.UP);
    }

    if (oldDirection.type === DirectionType.UP && nextDirection.type === DirectionType.RIGHT
      || oldDirection.type === DirectionType.LEFT && nextDirection.type === DirectionType.DOWN) {
      // rotation: 1
      this.addLight(lights, timer / 2, nextPosition, DirectionType.RIGHT);
      this.addLight(lights, timer / 2, nextPosition, DirectionType.DOWN);
    }

    if (oldDirection.type === DirectionType.UP && nextDirection.type === DirectionType.LEFT
      || oldDirection.type === DirectionType.RIGHT && nextDirection.type === DirectionType.DOWN) {
      // rotation: 2
      this.addLight(lights, timer / 2, nextPosition, DirectionType.DOWN);
      this.addLight(lights, timer / 2, nextPosition, DirectionType.LEFT);
    }

    if (oldDirection.type === DirectionType.DOWN && nextDirection.type === DirectionType.LEFT
      || oldDirection.type === DirectionType.RIGHT && nextDirection.type === DirectionType.UP) {
      // rotation: 3
      this.addLight(lights, timer / 2, nextPosition, DirectionType.UP);
      this.addLight(lights, timer / 2, nextPosition, DirectionType.LEFT);
    }

  }

  private drawDestroyOrBlock(direction: Direction, timer: number, nextPosition: Field, lights: Light[]): void {
    switch (direction.type) {
      case DirectionType.UP:
        this.addLight(lights, timer / 2, nextPosition, DirectionType.DOWN);
        break;
      case DirectionType.RIGHT:
        this.addLight(lights, timer / 2, nextPosition, DirectionType.LEFT);
        break;
      case DirectionType.DOWN:
        this.addLight(lights, timer / 2, nextPosition, DirectionType.UP);
        break;
      case DirectionType.LEFT:
        this.addLight(lights, timer / 2, nextPosition, DirectionType.RIGHT);
        break;
    }
  }

}

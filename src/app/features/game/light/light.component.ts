import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Light } from './light.model';
import { MatrixQuery } from '../state/matrix/matrix.query';
import { ActionQuery } from '../state/action/action.query';
import { LightService } from './light.service';
import { DirectionType } from './direction.model';

@Component({
  selector: 'app-light',
  templateUrl: './light.component.html',
  styleUrls: ['./light.component.scss']
})
export class LightComponent implements OnInit, OnDestroy {

  private onDestroy$ = new Subject<void>();

  @Input() coordinateX!: number;
  @Input() coordinateY!: number;

  showUPLight: boolean = false;
  showRIGHTLight: boolean = false;
  showDOWNLight: boolean = false;
  showLEFTLight: boolean = false;

  // destroy effect
  particles = Array<number>(100).fill(0);
  isDead = false;
  showDeadEffect = false;
  deadEffectTest = false;

  history$ = this.actionQuery.isHistory$;

  constructor(
    private lightService: LightService,
    private actionQuery: ActionQuery
  ) {
  }

  ngOnInit(): void {
    // test dead effect
    // if (this.coordinateX === MatrixStore.WIDTH_NUMBER && this.coordinateY === 1) {
    //   this.deadEffectTest = true;
    // }

    this.lightService.lightOnEvent$.pipe(takeUntil(this.onDestroy$)).subscribe(light => {
      if (light?.cellId === MatrixQuery.getCellID(this.coordinateX, this.coordinateY)) {
        setTimeout(() => {
          this.showLight(light);
        }, light.timer);
      }
    });

    this.lightService.lightOff$.pipe(takeUntil(this.onDestroy$)).subscribe(() => this.turnOff());

    this.actionQuery.selectActive().pipe(takeUntil(this.onDestroy$)).subscribe(action => {
      if (action?.destroy) {
        if (action.destroy.position.x === this.coordinateX && action.destroy.position.y === this.coordinateY) {
          this.isDead = true;
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  showLight(light: Light | undefined): void {
    if (light?.cellId === MatrixQuery.getCellID(this.coordinateX, this.coordinateY)) {
      if (this.isDead && light.last) this.showDeadEffect = true;

      switch (light.directionType) {
        case DirectionType.UP:
          this.showUPLight = true;
          break;
        case DirectionType.RIGHT:
          this.showRIGHTLight = true;
          break;
        case DirectionType.DOWN:
          this.showDOWNLight = true;
          break;
        case DirectionType.LEFT:
          this.showLEFTLight = true;
          break;
      }
    }
  }

  private turnOff(): void {
    this.showUPLight = false;
    this.showRIGHTLight = false;
    this.showDOWNLight = false;
    this.showLEFTLight = false;
    this.isDead = false;
    this.showDeadEffect = false;
  }
}

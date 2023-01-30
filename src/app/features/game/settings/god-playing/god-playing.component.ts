import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Player } from '../../state/player/player.model';
import { PlayerQuery } from '../../state/player/player.query';

@Component({
  selector: 'app-god-playing',
  templateUrl: './god-playing.component.html',
  styleUrls: ['./god-playing.component.scss']
})
export class GodPlayingComponent implements OnInit, OnDestroy {

  private onDestroy$ = new Subject<void>();

  @Input() set currentGod(current: Player) {
    this.god.patchValue(current);
  }

  @Output() godChange$ = new EventEmitter<Player>();

  players!: Player[];

  formGroup: FormGroup = this.formBuilder.group({
    god: []
  });

  constructor(
    private formBuilder: FormBuilder,
    private playerQuery: PlayerQuery
  ) {
  }

  ngOnInit(): void {
    this.players = [
      this.playerQuery.getPlayer1(), this.playerQuery.getPlayer2()
    ];

    this.god.valueChanges.pipe(takeUntil(this.onDestroy$)).subscribe(god => {
      this.godChange$.emit(god);
    })
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  get god(): FormControl {
    return this.formGroup?.controls['god'] as FormControl;
  }

}

import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { GameManagerQuery } from '../../../core/state/game-manager/game-manager.query';
import { map, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';
import { PlayerQuery } from '../state/player/player.query';
import { GameManagerService } from '../../../core/state/game-manager/game-manager.service';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { AngularFirestore } from '@angular/fire/compat/firestore';


@Component({
  selector: 'app-poll',
  templateUrl: './poll.component.html',
  styleUrls: ['./poll.component.scss']
})
export class PollComponent implements OnInit, OnDestroy {

  public static readonly LOCAL_STORAGE_KEY = 'divine-light-poll';

  private onDestroy$ = new Subject<void>();

  @Input() open!: boolean;
  @Output() openChange = new EventEmitter<boolean>();

  displayModal: boolean = false;

  step: 'start' | 'dqn' | 'minimax' | 'questions' | 'end' = 'start'

  player1$ = this.playerQuery.player$(this.playerQuery.getPlayer1().id);
  player2$ = this.playerQuery.player$(this.playerQuery.getPlayer2().id);

  wins$ = this.playerQuery.selectAll().pipe(
    map(
      players => {
        let sum = 0;
        if (this.gameManagerQuery.polling$.value) {
          for (let i = 0; i < players.length; i++) {
            const player = players[i];
            sum += player.wins;
          }
        }

        return sum;
      }
    ));

  formGroup = this.formBuilder.group({
    question01: [null, Validators.required],
    question02: [null, Validators.required],
    question03: [null, Validators.required],
    question04: [null, Validators.required],
    question05: [null, Validators.required],
    question06: [null, Validators.required],
    question07: [null, Validators.required],
    question08: [null, Validators.required],
    question09: [null],
  });

  isSaving = false;

  constructor(
    private gameManagerQuery: GameManagerQuery,
    private router: Router,
    private playerQuery: PlayerQuery,
    private gameManagerService: GameManagerService,
    private formBuilder: FormBuilder,
    private angularFirestore: AngularFirestore,
  ) {
  }

  ngOnInit(): void {
    const item = localStorage.getItem(PollComponent.LOCAL_STORAGE_KEY);
    if (item) this.step = item as any;

    this.gameManagerQuery.polling$.pipe(takeUntil(this.onDestroy$)).subscribe({
      next: state => {
        this.displayModal = state;
      }
    });

    this.wins$.pipe(takeUntil(this.onDestroy$)).subscribe({
      next: wins => {
        if (wins >= 3) {
          if (this.step !== 'questions') this.next();
          this.displayModal = true;
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  escape(): void {
    this.openChange.next(false)
  }

  back(): void {
    if (this.step === 'end') this.step = 'questions';
    else if (this.step === 'questions') this.step = 'dqn';
    else if (this.step === 'dqn') this.step = 'minimax';
    else if (this.step === 'minimax') this.step = 'start';

    localStorage.setItem(PollComponent.LOCAL_STORAGE_KEY, this.step);
  }

  next(): void {
    if (this.step === 'start') this.step = 'minimax';
    else if (this.step === 'minimax') this.step = 'dqn';
    else if (this.step === 'dqn') this.step = 'questions';
    else if (this.step === 'questions') this.step = 'end';

    localStorage.setItem(PollComponent.LOCAL_STORAGE_KEY, this.step);
  }

  close(): void {
    this.gameManagerQuery.polling$.next(false);
  }

  play(algorithm: string): void {
    switch (algorithm) {
      case 'minimax': {
        if (this.playerQuery.getPlayer2().botType !== 'minimax') this.gameManagerService.newGame();
        this.router.navigate([], {
          queryParams: {
            mode: 'p1vb',
            camaxtli: 'p1',
            nanahuatzin: 'p2',
            botTypeP2: 'minimax',
            rematch: 'manual',
            autoSwitch: true
          }
        });
        break;
      }
      case 'dqn': {
        if (this.playerQuery.getPlayer2().botType !== 'dqn') this.gameManagerService.newGame();
        this.router.navigate([], {
          queryParams: {
            mode: 'p1vb',
            camaxtli: 'p1',
            nanahuatzin: 'p2',
            botTypeP2: 'dqn',
            rematch: 'manual',
            autoSwitch: true
          }
        });
        break;
      }
    }

    this.displayModal = false;
  }

  send(): void {
    this.isSaving = true;

    const pollCollection = this.angularFirestore.collection(GameManagerService.FIRE_STORE_DEFINITIONS.poll.name);
    const poll = {...this.formGroup.value};
    pollCollection.add({...poll}).then(() => {
      this.formGroup.reset();
      this.formGroup.markAsUntouched();
      this.formGroup.markAsPristine();
      this.isSaving = false;
      this.next();
    });
  }

  get question01(): FormControl {
    return this.formGroup.controls.question01 as FormControl;
  }

  get question02(): FormControl {
    return this.formGroup.controls.question02 as FormControl;
  }

  get question03(): FormControl {
    return this.formGroup.controls.question03 as FormControl;
  }

  get question04(): FormControl {
    return this.formGroup.controls.question04 as FormControl;
  }

  get question05(): FormControl {
    return this.formGroup.controls.question05 as FormControl;
  }
  get question06(): FormControl {
    return this.formGroup.controls.question06 as FormControl;
  }

  get question07(): FormControl {
    return this.formGroup.controls.question07 as FormControl;
  }

  get question08(): FormControl {
    return this.formGroup.controls.question08 as FormControl;
  }

  get question09(): FormControl {
    return this.formGroup.controls.question09 as FormControl;
  }

}

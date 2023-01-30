import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subject } from 'rxjs';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-bot-level',
  templateUrl: './bot-level.component.html',
  styleUrls: ['./bot-level.component.scss']
})
export class BotLevelComponent implements OnInit, OnDestroy {

  private onDestroy$ = new Subject<void>();

  @Input() set currentAlgorithm(currentAlgorithm: 'random' | 'minimax' | 'mcts' | 'dqn' | 'custom' | undefined) {
    console.log('aktueller algorithm: ' + currentAlgorithm);

    if (currentAlgorithm === undefined) {
      this.botAlgorithm.patchValue('random');
      this.algorithmChange$.next('random');
    }
    else {
      const algorithm = this.algorithm.find(m => m.value === currentAlgorithm);
      this.botAlgorithm.patchValue(algorithm);
    }
  }

  @Output() algorithmChange$ = new EventEmitter<'random' | 'minimax' | 'mcts' | 'dqn' | 'custom' | undefined>();

  algorithm = [
    {label: 'Random', value: 'random'},
    {label: 'Minimax', value: 'minimax'},
    {label: 'Monte Carlo Tree Search', value: 'mcts'},
    {label: 'Deep Q-Learning', value: 'dqn'},
    {label: 'Custom Tree Search', value: 'custom'}
  ];

  formGroup: FormGroup = this.formBuilder.group({
    botAlgorithm: undefined,
  });

  constructor(
    private formBuilder: FormBuilder
  ) { }

  ngOnInit(): void {
    this.botAlgorithm.valueChanges.pipe(takeUntil(this.onDestroy$)).subscribe(a => {
      this.algorithmChange$.next(a.value);
    });
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  get botAlgorithm(): FormControl {
    return this.formGroup?.controls['botAlgorithm'] as FormControl;
  }

}

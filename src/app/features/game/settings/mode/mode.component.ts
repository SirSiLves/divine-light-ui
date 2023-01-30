import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-mode',
  templateUrl: './mode.component.html',
  styleUrls: ['./mode.component.scss']
})
export class ModeComponent implements OnInit, OnDestroy {

  private onDestroy$ = new Subject<void>();

  @Input() set currentMode(currentMode: string) {
    const mode = this.modes.find(m => m.value === currentMode);
    this.mode.patchValue(mode);
  }

  @Output() modeChange$ = new EventEmitter<'p1vp2' | 'p1vb' | 'bvb'>();


  modes = [
    {label: 'Player vs Player', value: 'p1vp2'},
    {label: 'Player vs Computer', value: 'p1vb'},
    {label: 'Computer vs Computer', value: 'bvb'}
  ];

  formGroup: FormGroup = this.formBuilder.group({
    mode: []
  });

  constructor(
    private formBuilder: FormBuilder
  ) {
  }

  ngOnInit(): void {
    this.mode.valueChanges.pipe(takeUntil(this.onDestroy$)).subscribe(m => {
      this.modeChange$.next(m.value);
    });
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  get mode(): FormControl {
    return this.formGroup?.controls['mode'] as FormControl;
  }


}

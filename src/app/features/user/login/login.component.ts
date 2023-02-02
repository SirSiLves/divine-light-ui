import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthenticationService } from '../../../core/authentiction/authentication.service';
import { animate, style, transition, trigger } from '@angular/animations';
import { Router } from '@angular/router';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  animations: [
    trigger('fade', [
      transition(':enter', [
        style({opacity: '0'}),
        animate('250ms ease-out', style({opacity: '1'})),
      ]),
    ]),
  ]
})
export class LoginComponent implements OnInit, OnDestroy {

  private onDestroy$ = new Subject<void>();

  user$ = this.authenticationService.user$;
  searched = false;

  formGroup = this.formBuilder.group({
    user: ['', [Validators.required, Validators.min(3)]],
    password: ['', [Validators.required, Validators.min(3)]]
  });

  constructor(
    private formBuilder: FormBuilder,
    private authenticationService: AuthenticationService,
    private router: Router
  ) {
  }

  ngOnInit(): void {
    this.authenticationService.user$.pipe(takeUntil(this.onDestroy$)).subscribe(user => {
      if (!user) {
        this.searched = false;
        this.formGroup.reset();
      } else {
        this.router.navigateByUrl('/user/profile');
      }
    });
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  get user(): FormControl {
    return this.formGroup.controls.user as FormControl;
  }

  get password(): FormControl {
    return this.formGroup.controls.password as FormControl;
  }

  login(): void {
    this.authenticationService.login({
      id: this.user.value,
      password: this.password.value
    });

    this.formGroup.markAsUntouched();
    this.searched = true;
  }

}

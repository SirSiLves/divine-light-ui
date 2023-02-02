import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthenticationService } from '../../../core/authentiction/authentication.service';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  animations: [
    trigger('fade', [
      transition(':enter', [
        style({opacity: '0'}),
        animate('250ms ease-out', style({opacity: '1'})),
      ]),
    ]),
  ]
})
export class ProfileComponent implements OnInit, OnDestroy {

  private onDestroy$ = new Subject<void>();

  private user$ = this.authenticationService.user$;

  formGroup = this.formBuilder.group({
    firstName: {value: null, disabled: true},
    lastName: {value: null, disabled: true},
    role: {value: null, disabled: true},
    id: {value: null, disabled: true}
  });

  constructor(
    private router: Router,
    private authenticationService: AuthenticationService,
    private formBuilder: FormBuilder
  ) {
  }

  ngOnInit(): void {
    this.user$.pipe(takeUntil(this.onDestroy$)).subscribe(user => {
      if (user) {
        this.firstName.patchValue(user.firstName);
        this.lastName.patchValue(user.lastName);
        this.role.patchValue(user.role);
        this.id.patchValue(user.id);
      } else {
        this.formGroup.reset();
      }
    });
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  logout(): void {
    this.authenticationService.logout();
    this.router.navigate(['/user/login']);
  }

  get firstName(): FormControl {
    return this.formGroup.controls.firstName as FormControl;
  }

  get lastName(): FormControl {
    return this.formGroup.controls.lastName as FormControl;
  }

  get role(): FormControl {
    return this.formGroup.controls.role as FormControl;
  }

  get id(): FormControl {
    return this.formGroup.controls.id as FormControl;
  }


}

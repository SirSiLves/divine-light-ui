import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthenticationService } from '../../../core/authentiction/authentication.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit, OnDestroy {

  private onDestroy$ = new Subject<void>();

  private user$ = this.authenticationService.user$;

  formGroup = this.formBuilder.group({
    vorname: {value: null, disabled: true},
    nachname: {value: null, disabled: true},
    rolle: {value: null, disabled: true}
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
        this.vorname.patchValue(user.vorname);
        this.nachname.patchValue(user.nachname);
        this.rolle.patchValue(user.rolle);
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

  get vorname(): FormControl {
    return this.formGroup.controls.vorname as FormControl;
  }

  get nachname(): FormControl {
    return this.formGroup.controls.nachname as FormControl;
  }

  get rolle(): FormControl {
    return this.formGroup.controls.rolle as FormControl;
  }


}

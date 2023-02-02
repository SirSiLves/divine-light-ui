import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserRoutingModule } from './user-routing.module';
import { CardModule } from 'primeng/card';
import { RippleModule } from 'primeng/ripple';
import { ButtonModule } from 'primeng/button';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { DividerModule } from 'primeng/divider';
import { LoginComponent } from './login/login.component';
import { ProfileComponent } from './profile/profile.component';
import { SharedModule } from '../../shared/shared.module';


@NgModule({
  declarations: [
    ProfileComponent,
    LoginComponent
  ],
  imports: [
    CommonModule,
    UserRoutingModule,
    CardModule,
    RippleModule,
    ButtonModule,
    ReactiveFormsModule,
    InputTextModule,
    FormsModule,
    PasswordModule,
    DividerModule,
    SharedModule
  ]
})
export class UserModule { }

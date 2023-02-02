import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthenticationService } from '../../core/authentiction/authentication.service';
import { ProfileComponent } from './profile/profile.component';

const routes: Routes = [
  {
    path: 'profile', component: ProfileComponent,
    canActivate: [AuthenticationService]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule { }

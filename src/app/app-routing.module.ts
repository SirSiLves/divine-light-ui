import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InfoComponent } from './features/info/info.component';
import { AboutComponent } from './features/about/about.component';
import { HowToPlayComponent } from './features/how-to-play/how-to-play.component';
import { HowItWasBuiltComponent } from './features/how-it-was-built/how-it-was-built.component';
import { DsgvoComponent } from './features/dsgvo/dsgvo.component';
import { ImpressumComponent } from './features/impressum/impressum.component';
import { AuthenticationService } from './core/authentiction/authentication.service';
import { LoginComponent } from './features/user/login/login.component';

const routes: Routes = [
  {path: 'news', component: InfoComponent},
  {path: 'about', component: AboutComponent},
  {path: 'how-to-play', component: HowToPlayComponent},
  {path: 'how-it-was-built', component: HowItWasBuiltComponent},
  {path: 'dsgvo', component: DsgvoComponent},
  {path: 'impressum', component: ImpressumComponent},
  {
    path: 'game', loadChildren: () => import('./features/game/game.module').then(m => m.GameModule),
  },
  {
    path: 'user', loadChildren: () => import('./features/user/user.module').then(m => m.UserModule),
    canLoad: [AuthenticationService]
  },
  {
    path: 'login', component: LoginComponent
  },
  {path: '', pathMatch: 'full', redirectTo: 'news'},
  {path: '**', redirectTo: 'news'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}

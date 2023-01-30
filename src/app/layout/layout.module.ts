import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { LayoutComponent } from './layout.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { ButtonModule } from 'primeng/button';
import { MenuComponent } from './menu/menu.component';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { GameModule } from '../features/game/game.module';
import { ToastModule } from 'primeng/toast';
import { ProgressBarModule } from 'primeng/progressbar';
import { RippleModule } from 'primeng/ripple';

@NgModule({
    imports: [
        CommonModule,
        ButtonModule,
        RouterModule,
        TranslateModule,
        GameModule,
        ToastModule,
        ProgressBarModule,
        RippleModule
    ],
  exports: [
    LayoutComponent
  ],
  declarations: [
    LayoutComponent,
    HeaderComponent,
    FooterComponent,
    MenuComponent,
  ]
})
export class LayoutModule {
}

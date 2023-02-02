import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { RippleModule } from 'primeng/ripple';
import { ButtonModule } from 'primeng/button';
import { RouterModule } from '@angular/router';
import { InputErrorMessageComponent } from './components/input-error-message/input-error-message.component';
import { TranslateModule } from '@ngx-translate/core';
import { InputTextModule } from 'primeng/inputtext';


@NgModule({
  declarations: [
    InputErrorMessageComponent,
  ],
  imports: [
    CommonModule,
    CardModule,
    RippleModule,
    ButtonModule,
    RouterModule,
    ButtonModule,
    RippleModule,
    TranslateModule,
    InputTextModule,

  ],
  exports: [
    InputErrorMessageComponent,
  ]
})
export class SharedModule {
}

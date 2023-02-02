import { Component, HostBinding } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-input-error-message',
  templateUrl: './input-error-message.component.html',
  styleUrls: ['./input-error-message.component.scss'],
  animations: [
    trigger('error', [
      transition(':enter', [
        style({opacity: 0, height: 0, overflow: 'hidden'}),
        animate('150ms ease-out', style({opacity: 1, height: '*'})),
      ]),
      transition(':leave', [
        style({opacity: 1, height: '*', overflow: 'hidden'}),
        animate('100ms ease-in', style({opacity: 0, height: 0}))
      ])
    ])
  ]
})
export class InputErrorMessageComponent {
  @HostBinding('@error') errorAnimation = undefined;
}

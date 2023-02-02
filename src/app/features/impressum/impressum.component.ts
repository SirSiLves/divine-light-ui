import { Component } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-impressum',
  templateUrl: './impressum.component.html',
  styleUrls: ['./impressum.component.scss'],
  animations: [
    trigger('fade', [
      transition(':enter', [
        style({opacity: '0'}),
        animate('250ms ease-out', style({opacity: '1'})),
      ]),
    ]),
  ]
})
export class ImpressumComponent {

  constructor() {
  }


}

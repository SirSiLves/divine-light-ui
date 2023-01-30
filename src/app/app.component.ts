import { Component } from '@angular/core';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'divine-light-ui';

  items!: MenuItem[];
  activeItem!: MenuItem;

  constructor() {
  }

  ngOnInit(): void {
    this.items = [
      {label: 'Home', icon: 'pi pi-fw pi-home', routerLink: ['/inprogress']},
      {label: 'Datenschutzerklärung', icon: 'pi pi-fw pi-file', routerLink: ['/dsgvo']},
      {label: 'Impressum', icon: 'pi pi-fw pi-file', routerLink: ['/impressum']},
    ];

    this.activeItem = this.items[0];
  }

}

import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';

declare let Email: any;

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(
    private messageService: MessageService,
    private translateService: TranslateService
  ) {
  }


  send(body: string): void {
    Email.send({
      Host: "smtp.elasticemail.com",
      Username: "register@ruosch.me",
      Password: "EECDDC148E18C1C570C22BC38ABFEAE9D76B",
      To: 'register@ruosch.me',
      From: "register@ruosch.me",
      Subject: "Training completed",
      Body: body
    }).then(
      (message: any) => {
        this.messageService.add({
          severity: 'info',
          detail: this.translateService.instant('core.email.status') + ' ' + message,
          sticky: true
        });
      }
    );
  }
}

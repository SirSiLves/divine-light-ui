import { CommonModule } from '@angular/common';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { CardModule } from 'primeng/card';
import { TabMenuModule } from 'primeng/tabmenu';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { environment } from '../../environments/environment';
import { AkitaNgDevtools } from '@datorama/akita-ngdevtools';
import { AkitaNgRouterStoreModule } from '@datorama/akita-ng-router-store';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AccordionModule } from 'primeng/accordion';
import { TableModule } from 'primeng/table';
import { HowItWasBuiltComponent } from '../features/how-it-was-built/how-it-was-built.component';
import { InfoComponent } from '../features/info/info.component';
import { AboutComponent } from '../features/about/about.component';
import { HowToPlayComponent } from '../features/how-to-play/how-to-play.component';
import { DsgvoComponent } from '../features/dsgvo/dsgvo.component';
import { ImpressumComponent } from '../features/impressum/impressum.component';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { themeInitializer, ThemeService } from './state/theme/theme.service';
import { languageInitializer, LanguageService } from './state/language/language.service';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';



@NgModule({
  declarations: [
    HowItWasBuiltComponent,
    InfoComponent,
    AboutComponent,
    HowToPlayComponent,
    DsgvoComponent,
    ImpressumComponent,
  ],
  imports: [
    CommonModule,
    BrowserAnimationsModule,
    environment.production ? [] : AkitaNgDevtools.forRoot(),
    AkitaNgRouterStoreModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    TabMenuModule,
    CardModule,
    HttpClientModule,
    AccordionModule,
    TableModule
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: themeInitializer,
      deps: [ThemeService],
      multi: true
    },
    {
      provide: APP_INITIALIZER,
      useFactory: languageInitializer,
      deps: [LanguageService],
      multi: true
    },
    MessageService,
  ]
})
export class CoreModule {
}

export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http, "/assets/translations/", ".json");
}

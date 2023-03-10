import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { enableProdMode } from '@angular/core';
import { environment } from './environments/environment';
import * as Sentry from "@sentry/angular-ivy";
import { BrowserTracing } from '@sentry/tracing';

if (environment.production) {
  enableProdMode();
}

Sentry.init({
  dsn: "https://bc93c4f21323459d9475cf84b728ee4c@o386758.ingest.sentry.io/4504816238657536",
  integrations: [
    new BrowserTracing({
      tracePropagationTargets: ["localhost", "https://yourserver.io/api"],
      routingInstrumentation: Sentry.routingInstrumentation,
    }),
  ],

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
});

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));

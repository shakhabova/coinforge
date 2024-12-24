import { NG_EVENT_PLUGINS } from "@taiga-ui/event-plugins";
import { provideAnimations } from "@angular/platform-browser/animations";
import { ApplicationConfig } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { providePrimeNG } from 'primeng/config';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient } from "@angular/common/http";
import Aura from '@primeng/themes/aura';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(), 
    provideRouter(routes, withComponentInputBinding()), 
    provideAnimationsAsync('noop'), 
    NG_EVENT_PLUGINS, 
    provideHttpClient(),
    providePrimeNG({
      theme: {
        preset: Aura,
      },
    }),
  ]
};

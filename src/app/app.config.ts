import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { provideRouter } from '@angular/router';
import { provideTransloco } from '@jsverse/transloco';
import { TranslocoHttpLoader } from './transloco-loader';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    //provideHttpClient(withInterceptors([authInterceptor])),
    provideHttpClient(),
    provideAnimations(),
    provideTransloco({
      loader: TranslocoHttpLoader,
      config: {
        availableLangs: [
          { id: 'es', label: 'Español' },
          { id: 'en', label: 'Inglés' },
        ],
        reRenderOnLangChange: true,
        fallbackLang: 'en',
        defaultLang: 'es',
        missingHandler: {
          useFallbackTranslation: false,
        },
      },
    }),
  ],
};

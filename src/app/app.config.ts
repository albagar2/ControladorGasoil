import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withDebugTracing } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { routes } from './app.routes';
import { authInterceptor } from './interceptors/auth.interceptor';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withDebugTracing()),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
    provideCharts(withDefaultRegisterables())
  ]
};

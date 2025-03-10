import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { HttpRequestInterceptor } from './app/_helpers/http.interceptor';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app/app.routes';
import { provideRouter } from '@angular/router';

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(withInterceptors([HttpRequestInterceptor])),
    provideRouter(routes), // Ajoute l'intercepteur
  ],
});

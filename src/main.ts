import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { environment } from './environments/environment';

import { AppModule } from './app/app.module';

if (environment.production) {
  window.console.log = () => { }
}
platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));

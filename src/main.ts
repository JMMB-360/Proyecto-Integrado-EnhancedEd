import { importProvidersFrom } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { MenuComponent } from './app/menu/menu.component';
import '@fortawesome/fontawesome-free/js/all.min.js';

bootstrapApplication(MenuComponent, {
  providers: [importProvidersFrom(HttpClientModule)]
})
  .catch(err => console.error(err));
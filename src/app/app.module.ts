import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { MediaRecord } from './media-record.component';

@NgModule({
  imports: [BrowserModule, FormsModule],
  declarations: [AppComponent, MediaRecord],
  bootstrap: [AppComponent],
})
export class AppModule {}

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { OptionsComponent } from './options/options.component';
import { BackgroundComponent } from './background/background.component';
import { PopupComponent } from './popup/popup.component';
import { NotFoundComponent } from './not-found.component';

import { PageQueryGuard } from './page-query.guard';

@NgModule({
  declarations: [
    AppComponent,
    BackgroundComponent,
    OptionsComponent,
    PopupComponent,
    NotFoundComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    AppRoutingModule
  ],
  providers: [
    PageQueryGuard
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

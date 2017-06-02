import { BrowserModule } from '@angular/platform-browser';
import { NgModule , APP_INITIALIZER } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { OptionsComponent } from './options/options.component';
import { BackgroundComponent } from './background/background.component';
import { PopupComponent } from './popup/popup.component';
import { NotFoundComponent } from './not-found.component';

import { PageQueryGuard } from './page-query.guard';
import { LoggerService } from './logger.service';
import { IDXDataDefinitionService, IDXDataManipulationService } from './indexed-db.service';
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
    PageQueryGuard,
    LoggerService,
    IDXDataDefinitionService,
    IDXDataManipulationService,
    {
      provide: APP_INITIALIZER,
      useFactory: (dml: IDXDataManipulationService) => () => {
        return dml.setDB();
      },
      deps: [IDXDataManipulationService],
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

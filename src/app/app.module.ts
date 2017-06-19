import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule, APP_INITIALIZER } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { OptionsComponent } from './options/options.component';
import { NavBarComponent } from './options/nav-bar/nav-bar.component';
import { BackgroundComponent } from './background/background.component';
import { PopupComponent } from './popup/popup.component';
import { NotFoundComponent } from './not-found.component';

import { WidgetModule } from './widgets/widget.module';
import { SettingsService } from './providers/settings.service';
import { PageQueryGuard } from './providers/page-query.guard';
import { LoggerService } from './providers/logger.service';
import { IDXDataDefinitionService, IDXDataManipulationService, IDXSchema } from './providers/indexed-db.service';
import { ShowManagerComponent } from './options/show-manager/show-manager.component';
import { SettingsComponent } from './options/settings/settings.component';

export function indexedDBFactory(ddl: IDXDataDefinitionService, dml: IDXDataManipulationService): Function {
  const schema: IDXSchema = {
        'dbName': 'testDB',
        'version': 1,
        'revision': {
        1: [{'name': 'settings',
            'operation': 'CREATE',
            'primaryField': 'Name',
            'autoIncrement': false,
            'indexes': null,
          }]
        },
        'seedData': {1:
                      {'settings':
                        [{'Name': 'update_time', 'Value': (new Date()).getTime() } // will be used for show update
                        , {'Name': 'enable_notification', 'Value': 1}
                        , {'Name': 'default_country', 'Value': 'US'}
                        , {'Name': 'override_episode_summary_link', 'Value': ''}
                        , {'Name': 'ui', 'Value': null}
                        , {'Name': 'badge_flag', 'Value': 'shows'}
                        , {'Name': 'shows_order', 'Value': 'airdate'}
                        , {'Name': 'animate_icon', 'Value': 1}
                        , {'Name': 'compact_flag', 'Value': 0}
                        , {'Name': 'enable_banner', 'Value': 0}
                        , {'Name': 'data_structure_version', 'Value': 5}
                        ]
                      }
                    }
      };
  // this is setting db inside IDXDataManipulationService, all other services which require db
  // can now get singleton instance of IDXDataManipulationService with db already set.
  return () => ddl.Open(schema).then(db => {
      return dml.setDB(db);
  });
}

@NgModule({
  declarations: [
    AppComponent,
    BackgroundComponent,
    OptionsComponent,
    PopupComponent,
    NotFoundComponent,
    NavBarComponent,
    ShowManagerComponent,
    SettingsComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpModule,
    WidgetModule,
    AppRoutingModule
  ],
  providers: [
    PageQueryGuard,
    LoggerService,
    SettingsService,
    IDXDataDefinitionService,
    IDXDataManipulationService,
    {
      provide: APP_INITIALIZER,
      useFactory: indexedDBFactory,
      deps: [IDXDataDefinitionService, IDXDataManipulationService],
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

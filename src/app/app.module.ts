import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule, APP_INITIALIZER } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { DatePipe } from '@angular/common';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { OptionsComponent } from './options/options.component';
import { NavBarComponent } from './options/nav-bar/nav-bar.component';
import { BackgroundComponent } from './background/background.component';

import { PopupComponent } from './popup/popup.component';
import { PopupEpisodeListComponent } from './popup/episode-list/episode-list.component';
import { ShowListComponent } from './popup/show-list/show-list.component';
import { SearchListComponent } from './popup/search-list/search-list.component';

import { SearchSummaryComponent } from './popup/search-summary/search-summary.component';
import { NotFoundComponent } from './not-found.component';
import { DropboxComponent } from './dropbox/dropbox.component';
import { ShowManagerComponent } from './options/show-manager/show-manager.component';
import { ShowDetailComponent } from './show-detail/show-detail.component';
import { EpisodeListComponent } from './show-detail/episode-list/episode-list.component';
import { SettingsComponent } from './options/settings/settings.component';
import { ShowSummaryBannerComponent } from './show-summary-banner/show-summary-banner.component';
import { EpisodeDropdownListComponent } from './show-summary-banner/episode-dropdown-list/episode-dropdown-list.component';
import { HelpComponent } from './options/help/help.component';

import { WidgetModule } from './widgets/widget.module';
import {
  SettingsService,
  ShowsService,
  DropboxService,
  PageQueryGuard,
  LoggerService,
  CommonService,
  MigrationService,
  TheTvDbService,
  TvMazeService,
} from './providers';

import { IDXDataDefinitionService, IDXDataManipulationService, IDXSchema } from './providers/indexed-db.service';

export function indexedDBFactory(ddl: IDXDataDefinitionService, dml: IDXDataManipulationService): Function {
  const schema: IDXSchema = {
        'dbName': 'testDB',
        'version': 3,
        'revision': {
        1: [{'name': 'settings',
            'operation': 'CREATE',
            'primaryField': 'Name',
            'autoIncrement': false,
            'indexes': null,
          }],
        2: [{'name': 'searches',
            'operation': 'CREATE',
            'primaryField': 'show_id',
            'autoIncrement': false,
            'indexes': null,
            },
            {'name': 'subscribed_shows',
              'operation': 'CREATE',
              'primaryField': 'show_id',
              'autoIncrement': false,
              'indexes': [{
                name: 'next_update_time_Index',
                field: 'next_update_time',
                operation: 'CREATE',
                unique: false,
                multiEntry: false
              }]
            },
            {'name': 'subscribed_episodes',
              'operation': 'CREATE',
              'primaryField': 'episode_id',
              'autoIncrement': false,
              'indexes': [{
                  name: 'show_id_Index',
                  field: 'show_id',
                  operation: 'CREATE',
                  unique: false,
                  multiEntry: false
                },
                {
                  name: 'local_showtime_Index',
                  field: 'local_showtime',
                  operation: 'CREATE',
                  unique: false,
                  multiEntry: false
                }]
            },
            {'name': 'notification',
              'operation': 'CREATE',
              'primaryField': 'id',
              'autoIncrement': false,
              'indexes': [{
                name: 'notify_time_Index',
                field: 'notify_time',
                operation: 'CREATE',
                unique: false,
                multiEntry: false
              },
              {
                name: 'show_id_Index',
                field: 'show_id',
                operation: 'CREATE',
                unique: false,
                multiEntry: false
              }]
            }
           ],
        3: [{'name': 'user_shows',
              'operation': 'CREATE',
              'primaryField': 'show_id',
              'autoIncrement': false,
              'indexes': [{
                name: 'next_update_time_Index',
                field: 'next_update_time',
                operation: 'CREATE',
                unique: false,
                multiEntry: false
              }]
            },
            {'name': 'user_episodes',
              'operation': 'CREATE',
              'primaryField': 'episode_id',
              'autoIncrement': false,
              'indexes': [{
                  name: 'show_id_Index',
                  field: 'show_id',
                  operation: 'CREATE',
                  unique: false,
                  multiEntry: false
                },
                {
                  name: 'local_showtime_Index',
                  field: 'local_showtime',
                  operation: 'CREATE',
                  unique: false,
                  multiEntry: false
                }]
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
    PopupEpisodeListComponent,
    ShowListComponent,
    SearchListComponent,
    

    NotFoundComponent,
    NavBarComponent,
    ShowManagerComponent,
    SettingsComponent,
    HelpComponent,
    DropboxComponent,
    ShowSummaryBannerComponent,
    ShowDetailComponent,
    SearchSummaryComponent,
    EpisodeListComponent,
    EpisodeDropdownListComponent
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
    DatePipe,
    PageQueryGuard,
    LoggerService,
    CommonService,
    DropboxService,
    IDXDataDefinitionService,
    IDXDataManipulationService,
    {
      provide: APP_INITIALIZER,
      useFactory: indexedDBFactory,
      deps: [IDXDataDefinitionService, IDXDataManipulationService],
      multi: true
    },
    SettingsService,
    ShowsService,
    MigrationService,
    TheTvDbService,
    TvMazeService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

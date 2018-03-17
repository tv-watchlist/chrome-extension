import { NgModule } from '@angular/core';
import { Routes, RouterModule , CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { PopupComponent } from './popup/popup.component';
import { PopupEpisodeListComponent } from './popup/episode-list/episode-list.component';
import { ShowListComponent } from './popup/show-list/show-list.component';
import { SearchListComponent } from './popup/search-list/search-list.component';

import { OptionsComponent } from './options/options.component';
import { BackgroundComponent } from './background/background.component';
import { AppComponent } from './app.component';
import { NotFoundComponent } from './not-found.component';
import { Observable } from 'rxjs/Observable';
import { PageQueryGuard } from './providers/page-query.guard';
import { SettingsComponent } from './options/settings/settings.component';
import { HelpComponent } from './options/help/help.component';
import { DropboxComponent } from './dropbox/dropbox.component';
import { ShowManagerComponent } from './options/show-manager/show-manager.component';


const routes: Routes = [
  { path: 'popup', 
    component: PopupComponent,
    children: [
      { path: '', redirectTo: 'show-list', pathMatch: 'full'  },
      { path: 'show-list', component: ShowListComponent },
      { path: 'episode-list', component: PopupEpisodeListComponent },
      { path: 'search-list', component: SearchListComponent },
    ] 
  },
  { path: 'options', component: OptionsComponent,
    children: [
      { path: '', redirectTo: 'show-manager', pathMatch: 'full'  },
      { path: 'show-manager', component: ShowManagerComponent },
      { path: 'settings', component: SettingsComponent },
      { path: 'help', component: HelpComponent },
      { path: '**', component: NotFoundComponent  }
    ]
  },
  { path: 'background', component: BackgroundComponent },
  { path: 'dropbox', component: DropboxComponent },
  { path: '', redirectTo: 'options', pathMatch: 'full' },
  { path: '**', component: NotFoundComponent, canActivate: [PageQueryGuard]  }
];


@NgModule({
  imports: [RouterModule.forRoot(routes,{ useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }


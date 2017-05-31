import { NgModule } from '@angular/core';
import { Routes, RouterModule , CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { PopupComponent } from './popup/popup.component';
import { OptionsComponent } from './options/options.component';
import { BackgroundComponent } from './background/background.component';
import { AppComponent } from './app.component';
import { NotFoundComponent } from './not-found.component';
import { Observable } from 'rxjs/Observable';
import { PageQueryGuard } from './page-query.guard';


const routes: Routes = [
  { path: 'popup', component: PopupComponent },
  { path: 'options', component: OptionsComponent },
  { path: 'background', component: BackgroundComponent },
  { path: '', redirectTo: 'options', pathMatch: 'full' },
  { path: '**', component: NotFoundComponent, canActivate: [PageQueryGuard]  }
];


@NgModule({
  imports: [RouterModule.forRoot(routes)], // { useHash: true }
  exports: [RouterModule]
})
export class AppRoutingModule { }


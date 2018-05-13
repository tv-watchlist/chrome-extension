import { Injectable } from '@angular/core';
import { Routes, RouterModule , CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot ,Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable()
export class PageQueryGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot,
              state: RouterStateSnapshot): Observable<boolean>|boolean {
    const page = route.queryParams['page'];
    if (!!page) {
        const query = {};
        for (const key in route.queryParams) {
          if (route.queryParams.hasOwnProperty(key) && key !== 'page') {
            query[key] = route.queryParams[key];
          }
        }
        // console.log('PageQueryGuard', page, route.queryParams, route.fragment);
        this.router.navigate(['/' + page], { fragment: route.fragment, queryParams: query});
        return false;
    }
    return true;
  }
}

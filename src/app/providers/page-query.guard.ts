import { Injectable } from '@angular/core';
import { Routes, RouterModule , CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot ,Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class PageQueryGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot,
              state: RouterStateSnapshot): Observable<boolean>|boolean {

    const page = route.queryParams['page'];
    console.log('PageQueryGuard', page);
    if (!!page) {
        this.router.navigate(['/' + page]);
        return false;
    }
    return true;
  }
}

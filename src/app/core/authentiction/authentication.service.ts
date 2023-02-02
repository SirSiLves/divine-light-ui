import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { ActivatedRouteSnapshot, Route, Router, RouterStateSnapshot, UrlSegment, UrlTree } from '@angular/router';
import { users } from './user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  private userData$ = new BehaviorSubject<any>(undefined);
  user$ = this.userData$.asObservable();

  // FIXME remove
  private readonly users = users;

  constructor(
    private router: Router
  ) {
    // FIXME remove
    // this.userData$.next(users[0]);
  }

  canLoad(route: Route, segments: UrlSegment[]): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    return this.userData$.pipe(map(user => !!user || this.router.parseUrl('/login')));
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.userData$.pipe(map(user => !!user || this.router.parseUrl('/login')));
  }

  getUser(): any {
    return this.userData$.value;
  }

  setUser(user: any): void {
    this.userData$.next(user);
  }

  logout(): void {
    this.userData$.next(undefined);
  }

  login(user: any): boolean {
    const exist = this.users.filter(u => u.id === user.id && u.password === user.password);

    if (exist && exist.length === 1) {
      this.setUser(exist[0]);
      return true;
    } else {
      this.logout();
      return false;
    }
  }




}

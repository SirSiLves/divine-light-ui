import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { ActivatedRouteSnapshot, Route, Router, RouterStateSnapshot, UrlSegment, UrlTree } from '@angular/router';
import { users } from './user.model';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat';
import { credentials } from '../config/credentials';


@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  // TODO encrypt firebase login

  private userData$ = new BehaviorSubject<any>(undefined);
  user$ = this.userData$.asObservable();

  private readonly LOCAL_STORAGE_KEY = 'divine-light-user';

  // FIXME remove after firebase
  private readonly users = users;

  constructor(
    private router: Router,
    private angularFirestore: AngularFirestore,
    private angularFireAuth: AngularFireAuth
  ) {
    const localStorageUser = localStorage.getItem(this.LOCAL_STORAGE_KEY);
    if (localStorageUser) {
      const exist = this.users.filter(u => u.id === localStorageUser);
      if (exist && exist.length === 1) {
        this.userData$.next(exist[0]);
      }
    }
  }

  signIn(): Promise<firebase.auth.UserCredential> {
    return this.angularFireAuth.signInWithEmailAndPassword(
      credentials.authenticationConfig.user,
      credentials.authenticationConfig.password
    );
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
    localStorage.setItem(this.LOCAL_STORAGE_KEY, user.id);
    this.userData$.next(user);
  }

  logout(): void {
    localStorage.removeItem(this.LOCAL_STORAGE_KEY);
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

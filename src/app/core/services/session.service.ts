import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { UserTokenData } from '../models/userTokenData';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  private isLogin = new BehaviorSubject<boolean>(false);

  constructor(private readonly router: Router) {}

  public setIsLogin(value: boolean): void {
    this.isLogin.next(value);
  }

  public getIsLogin(): Observable<boolean> {
    return this.isLogin.asObservable();
  }

  saveSession(key: string, value: string) {
    localStorage.setItem(key, value);
  }

  readSession(key: string): UserTokenData | null {
    if (localStorage.getItem(key) == null) {
      return null;
    }
    return jwtDecode(localStorage.getItem(key)!);
  }

  deleteSession() {
    localStorage.clear();
    //window.location.href = '';
  }
}

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
    const token = localStorage.getItem(key);

    if (token == null) {
      return null;
    }

    try {
      const decodedToken = jwtDecode<UserTokenData>(token);
      const currentTimestamp = Math.floor(Date.now() / 1000);

      if (!decodedToken.exp || decodedToken.exp <= currentTimestamp) {
        localStorage.removeItem(key);
        return null;
      }

      return decodedToken;
    } catch {
      localStorage.removeItem(key);
      return null;
    }
  }

  deleteSession() {
    localStorage.clear();
    //window.location.href = '';
  }
}

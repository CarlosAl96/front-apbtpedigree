import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { UserTokenData } from '../models/userTokenData';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  constructor(private readonly router: Router) {}
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

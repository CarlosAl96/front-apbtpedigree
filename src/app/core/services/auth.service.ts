import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { AuthResponse } from '../models/authResponse';
import { ApiResponse } from '../models/apiResponse';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private loginUrl: string = `${environment.api_url}users/auth`;
  private registerUrl: string = `${environment.api_url}users/store`;
  private logoutUrl: string = `${environment.api_url}users/logout`;
  private usersInfo: string = `${environment.api_url}usersInfo`;

  constructor(private http: HttpClient) {}

  public login(request: any): Observable<ApiResponse<AuthResponse>> {
    return this.http
      .post<ApiResponse<AuthResponse>>(this.loginUrl, request)
      .pipe(catchError(this.handleError));
  }

  public logout(id: number): Observable<ApiResponse<AuthResponse>> {
    return this.http
      .post<ApiResponse<AuthResponse>>(this.logoutUrl, { id })
      .pipe(catchError(this.handleError));
  }

  public register(request: any): Observable<ApiResponse<any>> {
    return this.http
      .post<ApiResponse<any>>(this.registerUrl, request)
      .pipe(catchError(this.handleError));
  }

  public getUsersLoggedAndSubs(): Observable<ApiResponse<any>> {
    return this.http
      .get<ApiResponse<any>>(this.usersInfo)
      .pipe(catchError(this.handleError));
  }

  handleError(error: HttpErrorResponse) {
    return throwError(() => error.error.response || 'Ocurrió un error');
  }
}

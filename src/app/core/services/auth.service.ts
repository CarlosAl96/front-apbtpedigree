import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
  HttpParams,
} from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { AuthResponse } from '../models/authResponse';
import { ApiResponse } from '../models/apiResponse';
import { QueryPagination } from '../models/queryPagination';
import { User } from '../models/user';
import { ResponsePagination } from '../models/responsePagination';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private usersUrl: string = `${environment.api_url}users`;
  private loginUrl: string = `${environment.api_url}users/auth`;
  private registerUrl: string = `${environment.api_url}users/store`;
  private logoutUrl: string = `${environment.api_url}users/logout`;
  private usersInfo: string = `${environment.api_url}usersInfo`;
  private resetPasswordUrl: string = `${environment.api_url}users/passwordReset`;

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

  public getUsers(
    query: QueryPagination
  ): Observable<ApiResponse<ResponsePagination<User[]>>> {
    const httpParams = new HttpParams().appendAll({ ...query });
    const options = httpParams
      ? { params: httpParams, header: new HttpHeaders() }
      : { header: new HttpHeaders() };

    return this.http
      .get<ApiResponse<ResponsePagination<User[]>>>(this.usersUrl, options)
      .pipe(catchError(this.handleError));
  }

  public searchUsers(search: string): Observable<ApiResponse<User[]>> {
    const httpParams = new HttpParams().appendAll({ search });
    const options = httpParams
      ? { params: httpParams, header: new HttpHeaders() }
      : { header: new HttpHeaders() };

    return this.http
      .get<ApiResponse<User[]>>(this.usersUrl + 'Search', options)
      .pipe(catchError(this.handleError));
  }

  public updateUser(request: any, id: number): Observable<ApiResponse<any>> {
    return this.http
      .patch<ApiResponse<any>>(this.usersUrl + '/' + id, request)
      .pipe(catchError(this.handleError));
  }

  public deleteUser(id: number): Observable<ApiResponse<any>> {
    return this.http
      .delete<ApiResponse<any>>(this.usersUrl + `/${id}`)
      .pipe(catchError(this.handleError));
  }

  public forumBan(request: any, id: number): Observable<ApiResponse<any>> {
    return this.http
      .patch<ApiResponse<any>>(this.usersUrl + '/' + id + '/forumBan', request)
      .pipe(catchError(this.handleError));
  }

  public disableOrEnableUser(
    request: any,
    id: number
  ): Observable<ApiResponse<any>> {
    return this.http
      .patch<ApiResponse<any>>(this.usersUrl + '/' + id + '/disable', request)
      .pipe(catchError(this.handleError));
  }

  public getUsersLoggedAndSubs(): Observable<ApiResponse<any>> {
    return this.http
      .get<ApiResponse<any>>(this.usersInfo)
      .pipe(catchError(this.handleError));
  }

  public getUserByUsername(username: string): Observable<ApiResponse<User>> {
    return this.http
      .get<ApiResponse<User>>(this.usersUrl + '/' + username + '/getByUsername')
      .pipe(catchError(this.handleError));
  }

  public resetPassword(request: any): Observable<ApiResponse<any>> {
    return this.http
      .post<ApiResponse<any>>(this.resetPasswordUrl, request)
      .pipe(catchError(this.handleError));
  }

  public updatePassword(
    request: any,
    token: string
  ): Observable<ApiResponse<any>> {
    return this.http
      .post<ApiResponse<any>>(this.resetPasswordUrl + '/' + token, request)
      .pipe(catchError(this.handleError));
  }

  public updatePasswordFromMyAccount(
    request: any,
    id: number
  ): Observable<ApiResponse<any>> {
    return this.http
      .patch<ApiResponse<any>>(
        this.usersUrl + '/' + id + '/updatePassword',
        request
      )
      .pipe(catchError(this.handleError));
  }

  handleError(error: HttpErrorResponse) {
    return throwError(() => error);
  }
}

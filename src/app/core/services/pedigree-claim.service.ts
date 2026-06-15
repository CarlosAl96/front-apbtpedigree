import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { ApiResponse } from '../models/apiResponse';
import { PedigreeClaim } from '../models/pedigreeClaim';

@Injectable({
  providedIn: 'root',
})
export class PedigreeClaimService {
  private pedigreeClaimsUrl: string = `${environment.api_url}pedigreeClaims`;

  constructor(private http: HttpClient) {}

  public getClaims(admin: boolean = false): Observable<ApiResponse<PedigreeClaim[]>> {
    const url = admin
      ? `${this.pedigreeClaimsUrl}/admin`
      : this.pedigreeClaimsUrl;

    return this.http
      .get<ApiResponse<PedigreeClaim[]>>(url, {
        headers: new HttpHeaders(),
      })
      .pipe(catchError(this.handleError));
  }

  public createClaim(request: {
    pedigreeId: number;
    message?: string;
  }): Observable<ApiResponse<any>> {
    return this.http
      .post<ApiResponse<any>>(this.pedigreeClaimsUrl, request)
      .pipe(catchError(this.handleError));
  }

  public approveClaim(id: number): Observable<ApiResponse<any>> {
    return this.http
      .put<ApiResponse<any>>(`${this.pedigreeClaimsUrl}/${id}/approve`, {})
      .pipe(catchError(this.handleError));
  }

  public denyClaim(id: number): Observable<ApiResponse<any>> {
    return this.http
      .put<ApiResponse<any>>(`${this.pedigreeClaimsUrl}/${id}/deny`, {})
      .pipe(catchError(this.handleError));
  }

  public deleteClaim(id: number): Observable<ApiResponse<any>> {
    return this.http
      .delete<ApiResponse<any>>(`${this.pedigreeClaimsUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  handleError(error: HttpErrorResponse) {
    return throwError(() => error.error || 'Ocurrió un error');
  }
}

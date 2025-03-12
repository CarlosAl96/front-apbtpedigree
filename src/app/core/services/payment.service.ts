import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
  HttpParams,
} from '@angular/common/http';
import { ApiResponse } from '../models/apiResponse';
import { catchError, Observable, throwError } from 'rxjs';
import { QueryPagination } from '../models/queryPagination';
import { ResponsePagination } from '../models/responsePagination';
import { Payment } from '../models/payment';

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  private paymentsUrl: string = `${environment.api_url}payment`;

  constructor(private http: HttpClient) {}

  public makePayment(request: any): Observable<ApiResponse<any>> {
    return this.http
      .post<ApiResponse<any>>(this.paymentsUrl, request)
      .pipe(catchError(this.handleError));
  }
  public makeOrderPayment(request: any): Observable<ApiResponse<any>> {
    return this.http
      .post<ApiResponse<any>>(this.paymentsUrl + '/order', request)
      .pipe(catchError(this.handleError));
  }
  public getPayments(
    query: QueryPagination
  ): Observable<ApiResponse<ResponsePagination<Payment[]>>> {
    const httpParams = new HttpParams().appendAll({ ...query });
    const options = httpParams
      ? { params: httpParams, header: new HttpHeaders() }
      : { header: new HttpHeaders() };

    return this.http
      .get<ApiResponse<ResponsePagination<Payment[]>>>(
        this.paymentsUrl,
        options
      )
      .pipe(catchError(this.handleError));
  }

  public verifyPayment(): Observable<ApiResponse<any>> {
    return this.http
      .get<ApiResponse<any>>(this.paymentsUrl + 'Verify')
      .pipe(catchError(this.handleError));
  }

  handleError(error: HttpErrorResponse) {
    return throwError(() => error.error || 'Ocurrió un error');
  }
}

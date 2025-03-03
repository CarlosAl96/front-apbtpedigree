import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
  HttpParams,
} from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { ApiResponse } from '../models/apiResponse';
import { QueryPagination } from '../models/queryPagination';
import { ResponsePagination } from '../models/responsePagination';
import { Stream } from '../models/stream';
import { StreamMessage } from '../models/streamMessage';

@Injectable({
  providedIn: 'root',
})
export class StreamService {
  private streamsUrl: string = `${environment.api_url}stream`;
  private streamMessagesUrl: string = `${environment.api_url}streamMessage`;

  constructor(private http: HttpClient) {}

  public createStream(request: any): Observable<ApiResponse<any>> {
    return this.http
      .post<ApiResponse<any>>(this.streamsUrl, request)
      .pipe(catchError(this.handleError));
  }

  public getStreams(
    query: QueryPagination
  ): Observable<ApiResponse<ResponsePagination<Stream[]>>> {
    const httpParams = new HttpParams().appendAll({ ...query });
    const options = httpParams
      ? { params: httpParams, header: new HttpHeaders() }
      : { header: new HttpHeaders() };

    return this.http
      .get<ApiResponse<ResponsePagination<Stream[]>>>(this.streamsUrl, options)
      .pipe(catchError(this.handleError));
  }

  public getActiveStream(): Observable<ApiResponse<Stream>> {
    return this.http
      .get<ApiResponse<Stream>>(this.streamsUrl + '/getActive')
      .pipe(catchError(this.handleError));
  }

  public updateStream(request: any, id: number): Observable<ApiResponse<any>> {
    return this.http
      .patch<ApiResponse<any>>(this.streamsUrl + '/' + id, request)
      .pipe(catchError(this.handleError));
  }

  public setLiveStream(id: number, request: any): Observable<ApiResponse<any>> {
    return this.http
      .patch<ApiResponse<any>>(this.streamsUrl + '/' + id + '/live', request)
      .pipe(catchError(this.handleError));
  }

  public reAnnounceStream(id: number): Observable<ApiResponse<any>> {
    return this.http
      .patch<ApiResponse<any>>(this.streamsUrl + '/' + id + '/reAnnounce', {})
      .pipe(catchError(this.handleError));
  }

  public getMessages(
    idStream: number
  ): Observable<ApiResponse<StreamMessage[]>> {
    return this.http
      .get<ApiResponse<StreamMessage[]>>(
        this.streamMessagesUrl + '/' + idStream
      )
      .pipe(catchError(this.handleError));
  }

  public sendMessage(request: any): Observable<ApiResponse<any>> {
    return this.http
      .post<ApiResponse<any>>(this.streamMessagesUrl, request)
      .pipe(catchError(this.handleError));
  }

  handleError(error: HttpErrorResponse) {
    return throwError(() => error.error || 'Ocurrió un error');
  }
}

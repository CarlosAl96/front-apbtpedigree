import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
  HttpParams,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { BehaviorSubject, catchError, Observable, throwError } from 'rxjs';
import { QueryPaginationPedigree } from '../models/queryPaginationPedigree';
import { Pedigree } from '../models/pedigree';
import { ResponsePagination } from '../models/responsePagination';
import { ApiResponse } from '../models/apiResponse';
import { PedigreeComplete } from '../models/pedigreeComplete';
import { DogLog } from '../models/dogLog';

@Injectable({
  providedIn: 'root',
})
export class PedigreeService {
  private pedigreesUrl: string = `${environment.api_url}pedigrees`;
  private pedigreesStoreUrl: string = `${environment.api_url}pedigrees/store`;
  private pedigreesImgUrl: string = `${environment.api_url}pedigrees/updateImg`;
  private pedigreesPrivateStatusUrl: string = `${environment.api_url}pedigrees/changePermissions`;
  private pedigreesChangeOwnerUrl: string = `${environment.api_url}pedigrees/changeOwner`;

  private isSearching = new BehaviorSubject<boolean>(false);
  private searchPedigree = new BehaviorSubject<QueryPaginationPedigree>({
    orderBy: 'id ASC',
    size: 50,
    page: 0,
  });

  constructor(private http: HttpClient) {}

  setQueryPagination(value: QueryPaginationPedigree) {
    this.searchPedigree.next(value);
  }

  getQueryPagination() {
    return this.searchPedigree.asObservable();
  }

  setIsSearching(value: boolean) {
    this.isSearching.next(value);
  }

  getIsSearching() {
    return this.isSearching.asObservable();
  }

  public getPedigrees(
    query: QueryPaginationPedigree
  ): Observable<ApiResponse<ResponsePagination<Pedigree[]>>> {
    const httpParams = new HttpParams().appendAll({ ...query });
    const options = httpParams
      ? { params: httpParams, header: new HttpHeaders() }
      : { header: new HttpHeaders() };

    return this.http
      .get<ApiResponse<ResponsePagination<Pedigree[]>>>(
        this.pedigreesUrl,
        options
      )
      .pipe(catchError(this.handleError));
  }

  public getPedigreeById(
    id: number
  ): Observable<ApiResponse<PedigreeComplete>> {
    return this.http
      .get<ApiResponse<PedigreeComplete>>(`${this.pedigreesUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  public createPedigree(request: any): Observable<ApiResponse<any>> {
    return this.http
      .post<ApiResponse<any>>(this.pedigreesStoreUrl, request)
      .pipe(catchError(this.handleError));
  }

  public updatePedigree(
    request: any,
    id: number
  ): Observable<ApiResponse<any>> {
    return this.http
      .put<ApiResponse<any>>(this.pedigreesUrl + `/${id}`, request)
      .pipe(catchError(this.handleError));
  }

  public updateCurrentImg(
    request: any,
    id: number
  ): Observable<ApiResponse<any>> {
    return this.http
      .put<ApiResponse<any>>(this.pedigreesImgUrl + `/${id}`, request)
      .pipe(catchError(this.handleError));
  }

  public updatePrivateStatus(
    request: any,
    id: number
  ): Observable<ApiResponse<any>> {
    return this.http
      .put<ApiResponse<any>>(this.pedigreesPrivateStatusUrl + `/${id}`, request)
      .pipe(catchError(this.handleError));
  }

  public changePedigreeOwner(
    request: any,
    id: number
  ): Observable<ApiResponse<any>> {
    return this.http
      .put<ApiResponse<any>>(this.pedigreesChangeOwnerUrl + `/${id}`, request)
      .pipe(catchError(this.handleError));
  }

  public deletePedigree(id: number): Observable<ApiResponse<any>> {
    return this.http
      .delete<ApiResponse<any>>(this.pedigreesUrl + `/${id}`)
      .pipe(catchError(this.handleError));
  }

  public getLogs(id: number): Observable<ApiResponse<DogLog[]>> {
    return this.http
      .get<ApiResponse<DogLog[]>>(`${this.pedigreesUrl}/${id}/logs`)
      .pipe(catchError(this.handleError));
  }

  handleError(error: HttpErrorResponse) {
    return throwError(() => error.error || 'Ocurrió un error');
  }
}

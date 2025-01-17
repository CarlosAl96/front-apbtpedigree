import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
  HttpParams,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { QueryPagination } from '../models/queryPagination';
import { ForumCategory } from '../models/forumCategory';
import { ResponsePagination } from '../models/responsePagination';
import { ApiResponse } from '../models/apiResponse';
import { catchError, Observable, throwError } from 'rxjs';
import { ForumTopic } from '../models/forumTopic';

@Injectable({
  providedIn: 'root',
})
export class ForumService {
  private forumCategoriesUrl: string = `${environment.api_url}categories`;
  private createCategoryUrl: string = `${environment.api_url}categories/store`;
  private forumTopicsUrl: string = `${environment.api_url}topics`;

  constructor(private http: HttpClient) {}

  public getCategories(
    query: QueryPagination
  ): Observable<ApiResponse<ResponsePagination<ForumCategory[]>>> {
    const httpParams = new HttpParams().appendAll({ ...query });
    const options = httpParams
      ? { params: httpParams, header: new HttpHeaders() }
      : { header: new HttpHeaders() };

    return this.http
      .get<ApiResponse<ResponsePagination<ForumCategory[]>>>(
        this.forumCategoriesUrl,
        options
      )
      .pipe(catchError(this.handleError));
  }

  public getCategoryById(id: number): Observable<ApiResponse<ForumCategory>> {
    return this.http
      .get<ApiResponse<ForumCategory>>(this.forumCategoriesUrl + '/' + id)
      .pipe(catchError(this.handleError));
  }

  public createCategory(form: FormData): Observable<any> {
    return this.http
      .post<any>(this.createCategoryUrl, form)
      .pipe(catchError(this.handleError));
  }

  public updateCategory(form: FormData, id: number): Observable<any> {
    return this.http
      .patch<any>(this.forumCategoriesUrl + '/' + id, form)
      .pipe(catchError(this.handleError));
  }

  public deleteCategory(id: number): Observable<any> {
    return this.http
      .delete<any>(this.forumCategoriesUrl + '/' + id)
      .pipe(catchError(this.handleError));
  }

  public getTopics(
    query: QueryPagination,
    idCategories: number
  ): Observable<ApiResponse<ResponsePagination<ForumTopic[]>>> {
    const httpParams = new HttpParams().appendAll({ ...query, idCategories });
    const options = httpParams
      ? { params: httpParams, header: new HttpHeaders() }
      : { header: new HttpHeaders() };

    return this.http
      .get<ApiResponse<ResponsePagination<ForumTopic[]>>>(
        this.forumTopicsUrl,
        options
      )
      .pipe(catchError(this.handleError));
  }

  handleError(error: HttpErrorResponse) {
    return throwError(() => error.error.response || 'Ocurrió un error');
  }
}

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
import { ForumPost } from '../models/forumPost';

@Injectable({
  providedIn: 'root',
})
export class ForumService {
  private forumCategoriesUrl: string = `${environment.api_url}categories`;
  private forumCategoriesInfoUrl: string = `${environment.api_url}categoriesInfo`;
  private createCategoryUrl: string = `${environment.api_url}categories/store`;
  private forumTopicsUrl: string = `${environment.api_url}topics`;
  private createTopicUrl: string = `${environment.api_url}topics/store`;
  private forumPostsUrl: string = `${environment.api_url}posts`;

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

  public getCategoriesInfo(): Observable<ApiResponse<any>> {
    return this.http
      .get<ApiResponse<any>>(this.forumCategoriesInfoUrl)
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

  public updateOrder(option: string, id: number): Observable<any> {
    return this.http
      .patch<any>(this.forumCategoriesUrl + '/' + id + '/order', {
        option: option,
      })
      .pipe(catchError(this.handleError));
  }

  public lockOrUnlockCategory(id: number): Observable<any> {
    return this.http
      .patch<any>(this.forumCategoriesUrl + '/' + id + '/lock', {})
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

  public getTopicById(
    id: number,
    addview: boolean
  ): Observable<ApiResponse<ForumTopic>> {
    const httpParams = new HttpParams().appendAll({ addview: addview });
    const options = httpParams
      ? { params: httpParams, header: new HttpHeaders() }
      : { header: new HttpHeaders() };

    return this.http
      .get<ApiResponse<ForumTopic>>(this.forumTopicsUrl + '/' + id, options)
      .pipe(catchError(this.handleError));
  }

  public createTopic(form: FormData): Observable<any> {
    return this.http
      .post<any>(this.createTopicUrl, form)
      .pipe(catchError(this.handleError));
  }

  public updateTopic(form: FormData, id: number): Observable<any> {
    return this.http
      .patch<any>(this.forumTopicsUrl + '/' + id, form)
      .pipe(catchError(this.handleError));
  }

  public markAllAsViewed(idCtaegory: number): Observable<any> {
    return this.http
      .patch<any>(this.forumTopicsUrl + '/' + idCtaegory + '/markAll', {})
      .pipe(catchError(this.handleError));
  }

  public setStickyTopic(id: number): Observable<any> {
    return this.http
      .patch<any>(this.forumTopicsUrl + '/' + id + '/sticky', {})
      .pipe(catchError(this.handleError));
  }

  public setAnnouncementTopic(id: number): Observable<any> {
    return this.http
      .patch<any>(this.forumTopicsUrl + '/' + id + '/announcement', {})
      .pipe(catchError(this.handleError));
  }

  public lockOrUnlockTopic(id: number): Observable<any> {
    return this.http
      .patch<any>(this.forumTopicsUrl + '/' + id + '/lock', {})
      .pipe(catchError(this.handleError));
  }

  public deleteTopic(id: number): Observable<any> {
    return this.http
      .delete<any>(this.forumTopicsUrl + '/' + id)
      .pipe(catchError(this.handleError));
  }

  public getPosts(
    query: QueryPagination,
    idTopic: number
  ): Observable<ApiResponse<ResponsePagination<ForumPost[]>>> {
    const httpParams = new HttpParams().appendAll({ ...query, idTopic });
    const options = httpParams
      ? { params: httpParams, header: new HttpHeaders() }
      : { header: new HttpHeaders() };

    return this.http
      .get<ApiResponse<ResponsePagination<ForumPost[]>>>(
        this.forumPostsUrl,
        options
      )
      .pipe(catchError(this.handleError));
  }

  public getPostById(id: number): Observable<ApiResponse<ForumPost>> {
    return this.http
      .get<ApiResponse<ForumPost>>(this.forumPostsUrl + '/' + id)
      .pipe(catchError(this.handleError));
  }

  public createPost(form: FormData): Observable<any> {
    return this.http
      .post<any>(this.forumPostsUrl + '/store', form)
      .pipe(catchError(this.handleError));
  }

  public updatePost(form: FormData, id: number): Observable<any> {
    return this.http
      .patch<any>(this.forumPostsUrl + '/' + id, form)
      .pipe(catchError(this.handleError));
  }

  public deletePost(id: number): Observable<any> {
    return this.http
      .delete<any>(this.forumPostsUrl + '/' + id)
      .pipe(catchError(this.handleError));
  }

  handleError(error: HttpErrorResponse) {
    return throwError(() => error.error.response || 'Ocurrió un error');
  }
}

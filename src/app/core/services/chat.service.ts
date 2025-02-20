import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, Observable, throwError } from 'rxjs';
import { Chat } from '../models/chat';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
  HttpParams,
} from '@angular/common/http';
import { environment } from '../../../environments/environment.development';
import { ApiResponse } from '../models/apiResponse';
import { QueryPagination } from '../models/queryPagination';
import { Message } from '../models/message';
import { ResponsePagination } from '../models/responsePagination';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private chatEmpty: Chat = {
    id: -1,
    id_user_one: 0,
    id_user_two: 0,
    username_one: '',
    username_two: '',
    img_one: '',
    img_two: '',
    viewed_one: false,
    viewed_two: false,
    is_deleted_one: false,
    is_deleted_two: false,
    last_message: {
      id: 0,
      id_chat: 0,
      id_sender: 0,
      id_receiver: 0,
      username_sender: '',
      img_sender: '',
      message: '',
      created_at: new Date(),
      img: null,
    },
    created_at: new Date(),
    updated_at: new Date(),
  };
  private chatSelected = new BehaviorSubject<Chat>(this.chatEmpty);

  private getChatsUrl: string = `${environment.api_url}chat/get`;
  private deleteChatUrl: string = `${environment.api_url}chat/delete/`;
  private viewedChatUrl: string = `${environment.api_url}chat/view/`;
  private deleteMessageUrl: string = `${environment.api_url}message/delete/`;
  private messagesUrl: string = `${environment.api_url}message`;

  constructor(private http: HttpClient) {}

  public setChatSelected(value: Chat): void {
    this.chatSelected.next(value);
  }

  public resetChatSelected(): void {
    this.chatSelected.next(this.chatEmpty);
  }

  public getChatSelected(): Observable<Chat> {
    return this.chatSelected.asObservable();
  }

  public getChats(): Observable<ApiResponse<Chat[]>> {
    return this.http
      .get<ApiResponse<Chat[]>>(this.getChatsUrl)
      .pipe(catchError(this.handleError));
  }

  public markAsViewedChat(id: number): Observable<any> {
    return this.http
      .patch<any>(this.viewedChatUrl + id, {})
      .pipe(catchError(this.handleError));
  }

  public getMessages(
    query: QueryPagination,
    idChat: number
  ): Observable<ApiResponse<ResponsePagination<Message[]>>> {
    const httpParams = new HttpParams().appendAll({
      ...query,
      id_chat: idChat,
    });

    const options = httpParams
      ? { params: httpParams, header: new HttpHeaders() }
      : { header: new HttpHeaders() };

    return this.http
      .get<ApiResponse<ResponsePagination<Message[]>>>(
        this.messagesUrl + '/get',
        options
      )
      .pipe(catchError(this.handleError));
  }

  public sendMessage(data: any, im_first: boolean): Observable<any> {
    data.im_first = im_first;
    return this.http
      .post<any>(this.messagesUrl + '/store', data)
      .pipe(catchError(this.handleError));
  }

  public deleteChat(id: number): Observable<any> {
    return this.http
      .delete<any>(this.deleteChatUrl + id)
      .pipe(catchError(this.handleError));
  }

  public deleteMessage(id: number): Observable<any> {
    return this.http
      .delete<any>(this.deleteMessageUrl + id)
      .pipe(catchError(this.handleError));
  }

  handleError(error: HttpErrorResponse) {
    return throwError(() => error.error.response || 'Ocurrió un error');
  }
}

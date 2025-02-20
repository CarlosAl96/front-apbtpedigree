import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private socket: Socket;

  constructor() {
    this.socket = io(environment.server);
  }

  onMessage(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('messages', (ids) => {
        observer.next(ids);
      });
    });
  }

  onChat(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('getChats', (ids) => {
        observer.next(ids);
      });
    });
  }

  disconnect() {
    this.socket.disconnect();
  }
}

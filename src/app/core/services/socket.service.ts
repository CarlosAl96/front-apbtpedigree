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
    this.socket = io(environment.server, {});
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

  onForum(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('forum', (ids) => {
        observer.next(ids);
      });
    });
  }

  onLogin(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('login', (id) => {
        observer.next(id);
      });
    });
  }

  onLive(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('live', (res) => {
        observer.next(res);
      });
    });
  }

  onUnlive(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('unlive', (res) => {
        observer.next(res);
      });
    });
  }

  onAnnounce(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('announce', (res) => {
        observer.next(res);
      });
    });
  }

  onReprogramed(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('reprogramed', (res) => {
        observer.next(res);
      });
    });
  }

  onStreamMessage(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('streamMessage', (res) => {
        observer.next(res);
      });
    });
  }
}

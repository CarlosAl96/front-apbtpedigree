import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { SessionService } from './session.service';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private socket: Socket;

  constructor(private readonly sessionService: SessionService) {
    this.socket = io(environment.server, {});

    setInterval(() => {
      if (this.sessionService.readSession('USER_TOKEN')) {
        const userId =
          this.sessionService.readSession('USER_TOKEN')?.user.id ?? 0;
        const username =
          this.sessionService.readSession('USER_TOKEN')?.user.username ?? '';
        this.socket.emit('heartbeat', { userId, username });
      }
    }, 3000);
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

  onLoginInfo(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('online-users-count', (count) => {
        observer.next(count);
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

  onStreamMessageDeleted(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('streamMessageDeleted', (res) => {
        observer.next(res);
      });
    });
  }

  onStreamChatBan(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('streamChatBan', (res) => {
        observer.next(res);
      });
    });
  }

  emitLogin(id: number, username: string): void {
    this.socket.emit('register-user', { userId: id, username });
  }

  public disconnect(): void {
    this.socket.disconnect();
  }
}

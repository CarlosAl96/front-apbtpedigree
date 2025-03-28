import { Component, OnInit } from '@angular/core';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { SessionService } from '../../../core/services/session.service';
import { User } from '../../../core/models/user';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment.development';
import { BadgeModule } from 'primeng/badge';
import { SocketService } from '../../../core/services/socket.service';
import { ChatService } from '../../../core/services/chat.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [TranslocoModule, BadgeModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent implements OnInit {
  private subscription: Subscription | null = null;
  public user!: User | undefined;
  public urlImg: string = `${environment.uploads_url}users/`;
  public currentDate: string = '';
  public chatsCount: number = 0;

  constructor(
    private readonly translocoService: TranslocoService,
    public router: Router,
    private readonly sessionService: SessionService,
    private readonly authService: AuthService,
    private readonly socketService: SocketService,
    private readonly chatService: ChatService
  ) {
    this.user = this.sessionService.readSession('USER_TOKEN')?.user;

    if (this.user) {
      this.getChatsCount();
      this.socketService.onChat().subscribe({
        next: (res) => {
          if (res.id_one == this.user?.id || res.id_two == this.user?.id) {
            this.getChatsCount();
          }
        },
      });
    }

    if (this.user?.picture) {
      this.urlImg += this.user?.picture;
    }
  }

  ngOnInit(): void {
    this.subscription?.unsubscribe();
    this.subscription = this.translocoService.langChanges$.subscribe((lang) => {
      this.currentDate = this.getCurrentDateInLocale(lang);
    });
  }

  public getChatsCount(): void {
    this.chatService.getChatsCountUnviewed().subscribe({
      next: (res) => {
        this.chatsCount = res.response;
        console.log(res);
      },
      error: (err) => {
        console.error('Error fetching chat count:', err);
      },
    });
  }

  private getCurrentDateInLocale(locale: string): string {
    const currentDate = new Date();

    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    };

    const formatter = new Intl.DateTimeFormat(locale, options);
    return formatter.format(currentDate);
  }

  public logout(): void {
    const id = this.user?.id || 0;

    this.authService.logout(id).subscribe({
      next: (res) => {
        this.sessionService.deleteSession();
        this.user = undefined;
        window.location.href = '/auth';
      },
    });
  }
}

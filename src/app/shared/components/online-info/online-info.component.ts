import { Component } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { CardModule } from 'primeng/card';
import { AuthService } from '../../../core/services/auth.service';
import { SessionService } from '../../../core/services/session.service';
import { User } from '../../../core/models/user';
import { RouterLink } from '@angular/router';
import { SocketService } from '../../../core/services/socket.service';

@Component({
  selector: 'app-online-info',
  standalone: true,
  imports: [TranslocoModule, CardModule, RouterLink],
  templateUrl: './online-info.component.html',
  styleUrl: './online-info.component.scss',
})
export class OnlineInfoComponent {
  public loggeds: number = 0;
  public subs: number = 0;
  public user!: User | undefined;

  constructor(
    private readonly authService: AuthService,
    private readonly sessionService: SessionService,
    private readonly socketService: SocketService
  ) {
    this.user = this.sessionService.readSession('USER_TOKEN')?.user;
    this.getUsersLoggedInfo();
    this.socketService.onLogin().subscribe({
      next: (res) => {
        console.log(res);
        this.getUsersLoggedInfo();
      },
    });
  }

  public getUsersLoggedInfo(): void {
    this.authService.getUsersLoggedAndSubs().subscribe({
      next: (res) => {
        this.loggeds = res.response.logged;
        this.subs = res.response.subs;
      },
      error: (error) => {
        console.log(error);
      },
    });
  }
}

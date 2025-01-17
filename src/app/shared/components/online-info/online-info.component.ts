import { Component } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { CardModule } from 'primeng/card';
import { AuthService } from '../../../core/services/auth.service';
import { SessionService } from '../../../core/services/session.service';
import { User } from '../../../core/models/user';

@Component({
  selector: 'app-online-info',
  standalone: true,
  imports: [TranslocoModule, CardModule],
  templateUrl: './online-info.component.html',
  styleUrl: './online-info.component.scss',
})
export class OnlineInfoComponent {
  public loggeds: number = 0;
  public subs: number = 0;
  public user!: User | undefined;

  constructor(
    private readonly authService: AuthService,
    private readonly sessionService: SessionService
  ) {
    this.user = this.sessionService.readSession('USER_TOKEN')?.user;

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

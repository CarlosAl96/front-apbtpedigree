import { Component } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { CardModule } from 'primeng/card';
import { User } from '../../../core/models/user';
import { SessionService } from '../../../core/services/session.service';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [TranslocoModule, CardModule],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss',
})
export class HomePageComponent {
  public user!: User | undefined;

  constructor(private readonly sessionService: SessionService) {
    this.user = this.sessionService.readSession('USER_TOKEN')?.user;
  }
}

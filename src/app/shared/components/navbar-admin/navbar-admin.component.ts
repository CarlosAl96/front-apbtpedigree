import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { environment } from '../../../../environments/environment.development';
import { SessionService } from '../../../core/services/session.service';
import { AuthService } from '../../../core/services/auth.service';
import { Subscription } from 'rxjs';
import { User } from '../../../core/models/user';

@Component({
  selector: 'app-navbar-admin',
  standalone: true,
  imports: [TranslocoModule],
  templateUrl: './navbar-admin.component.html',
  styleUrl: './navbar-admin.component.scss',
})
export class NavbarAdminComponent {
  private subscription: Subscription | null = null;
  public user!: User | undefined;
  public urlImg: string = `${environment.uploads_url}users/`;
  public currentDate: string = '';

  constructor(
    private readonly translocoService: TranslocoService,
    public router: Router,
    private readonly sessionService: SessionService,
    private readonly authService: AuthService
  ) {
    this.user = this.sessionService.readSession('USER_TOKEN')?.user;

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

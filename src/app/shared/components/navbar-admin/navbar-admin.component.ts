import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { environment } from '../../../../environments/environment.development';
import { SessionService } from '../../../core/services/session.service';
import { AuthService } from '../../../core/services/auth.service';
import { Subscription } from 'rxjs';
import { User } from '../../../core/models/user';
import { SocketService } from '../../../core/services/socket.service';
import { PedigreeClaimService } from '../../../core/services/pedigree-claim.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-navbar-admin',
  standalone: true,
  imports: [TranslocoModule],
  templateUrl: './navbar-admin.component.html',
  styleUrl: './navbar-admin.component.scss',
})
export class NavbarAdminComponent implements OnInit, OnDestroy {
  private readonly subscriptions = new Subscription();
  public user!: User | undefined;
  public urlImg: string = `${environment.uploads_url}users/`;
  public currentDate: string = '';
  public pendingClaims: number = 0;

  constructor(
    private readonly translocoService: TranslocoService,
    public router: Router,
    private readonly sessionService: SessionService,
    private readonly authService: AuthService,
    private readonly socketService: SocketService,
    private readonly pedigreeClaimService: PedigreeClaimService,
    private readonly toastService: ToastService
  ) {
    this.user = this.sessionService.readSession('USER_TOKEN')?.user;

    if (this.user?.picture) {
      this.urlImg += this.user?.picture;
    }
  }

  ngOnInit(): void {
    this.subscriptions.add(
      this.translocoService.langChanges$.subscribe((lang) => {
        this.currentDate = this.getCurrentDateInLocale(lang);
      })
    );
    this.loadPendingClaims();
    this.subscriptions.add(
      this.socketService.onPedigreeClaimCreated().subscribe((claim) => {
        this.loadPendingClaims();
        this.toastService.setMessage({
          severity: 'info',
          summary: this.translocoService.translate(
            'pedigreeClaims.notification.title'
          ),
          detail: this.translocoService.translate(
            claim.count > 1
              ? 'pedigreeClaims.notification.createdMany'
              : 'pedigreeClaims.notification.created',
            {
              user: claim.requesterUsername,
              id: claim.pedigreeId,
              count: claim.count,
            }
          ),
        });
      })
    );
    this.subscriptions.add(
      this.socketService
        .onPedigreeClaimUpdated()
        .subscribe(() => this.loadPendingClaims())
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
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

  private loadPendingClaims(): void {
    this.pedigreeClaimService.getClaims(true).subscribe({
      next: (res) => {
        this.pendingClaims = res.response.filter(
          (claim) => claim.status === 'pending'
        ).length;
      },
    });
  }
}

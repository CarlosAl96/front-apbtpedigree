import { AfterViewInit, Component, OnInit } from '@angular/core';
import {
  ActivatedRoute,
  NavigationEnd,
  NavigationStart,
  Router,
  RouterOutlet,
} from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { ToastService } from './core/services/toast.service';
import { MessageService } from 'primeng/api';
import { SocketService } from './core/services/socket.service';
import { DialogService } from 'primeng/dynamicdialog';
import { PaymentService } from './core/services/payment.service';
import { StreamPayPopupComponent } from './shared/components/stream-pay-popup/stream-pay-popup.component';
import { TranslocoService } from '@jsverse/transloco';
import { User } from './core/models/user';
import { SessionService } from './core/services/session.service';
import { LanguageService } from './core/services/language.service';
import { AuthService } from './core/services/auth.service';
import { SessionClosedComponent } from './shared/components/session-closed/session-closed.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastModule],
  providers: [MessageService, DialogService],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit, AfterViewInit {
  public user!: User | undefined;

  constructor(
    private readonly toastService: ToastService,
    private readonly messageService: MessageService,
    private readonly dialogService: DialogService,
    private readonly socketService: SocketService,
    private readonly paymentService: PaymentService,
    private readonly translocoService: TranslocoService,
    private readonly sessionService: SessionService,
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly languageService: LanguageService
  ) {
    this.user = this.sessionService.readSession('USER_TOKEN')?.user;

    this.toastService.getMessage().subscribe((message) => {
      if (message.severity != '') {
        this.messageService.add(message);
      }
    });

    this.translocoService.setActiveLang(
      this.languageService.getSavedLanguage()
    );
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      if (this.user) {
        this.verifyPayment();
      }
    }, 500);
  }
  ngOnInit(): void {
    this.socketService.onLive().subscribe({
      next: (res) => {
        this.verifyPayment();
      },
    });
    this.socketService.onAnnounce().subscribe({
      next: (res) => {
        this.verifyPayment();
      },
    });
    this.socketService.onReprogramed().subscribe({
      next: (res) => {
        this.verifyPayment(true);
      },
    });
    this.socketService.onLogin().subscribe({
      next: (res) => {
        if (res.id == this.user?.id) {
          this.authService.getSessionStatus().subscribe({
            next: (res) => {
              console.log(res);
            },
            error: (error) => {
              console.log(error);
              this.dialogService.open(SessionClosedComponent, {
                header: this.translocoService.translate('login.sessionEnded'),
                width: '50rem',
              });
            },
          });
        }
      },
    });
  }

  private verifyPayment(repro: boolean = false): void {
    this.paymentService.verifyPayment().subscribe({
      next: (res) => {
        if (res.response.isAdmin) {
          return;
        } else {
          if (repro) {
            res.response.repro = true;
          }
          if (this.router.url != '/stream') {
            this.dialogService.open(StreamPayPopupComponent, {
              data: res.response,
              header: this.translocoService.translate('stream.streamAnnounced'),
              width: '50rem',
            });
          }
        }
      },
      error: (error) => {},
    });
  }
}

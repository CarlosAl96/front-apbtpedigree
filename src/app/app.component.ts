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
    this.route.paramMap.subscribe((params) => {
      console.log(Number(params.get('id')));
    });
    this.router.events.subscribe((event) => {
      if (
        event instanceof NavigationEnd &&
        window.matchMedia('(min-height: 1080px)').matches
      ) {
        if (this.router.url.includes('/pedigree/my-pedigrees/')) {
          if (this.router.url == '/pedigree/my-pedigrees/0') {
            this.resetZoom();
          }
        } else {
          this.resetZoom();
        }
      }
    });

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

  private resetZoom(): void {
    const reloaded = sessionStorage.getItem('reloaded');
    if (!reloaded) {
      sessionStorage.setItem('reloaded', 'true');
      location.reload();
    } else {
      sessionStorage.removeItem('reloaded');
    }
    const viewportMeta = document.querySelector('meta[name="viewport"]');

    if (viewportMeta) {
      viewportMeta.setAttribute(
        'content',
        'width=device-width, initial-scale=0.1, maximum-scale=1.0, user-scalable=no'
      );

      setTimeout(() => {
        viewportMeta.setAttribute(
          'content',
          'width=device-width, initial-scale=0.1, maximum-scale=1.0, user-scalable=yes'
        );
      }, 500);
    }
  }
}

import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { ToastService } from './core/services/toast.service';
import { MessageService } from 'primeng/api';
import { SocketService } from './core/services/socket.service';
import { DialogService } from 'primeng/dynamicdialog';
import { PaymentService } from './core/services/payment.service';
import { StreamPayPopupComponent } from './shared/components/stream-pay-popup/stream-pay-popup.component';
import { TranslocoService } from '@jsverse/transloco';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastModule],
  providers: [MessageService, DialogService],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnDestroy, OnInit, AfterViewInit {
  constructor(
    private readonly toastService: ToastService,
    private readonly messageService: MessageService,
    private readonly dialogService: DialogService,
    private readonly socketService: SocketService,
    private readonly paymentService: PaymentService,
    private readonly translocoService: TranslocoService
  ) {
    this.toastService.getMessage().subscribe((message) => {
      if (message.severity != '') {
        this.messageService.add(message);
      }
    });
  }
  ngAfterViewInit(): void {
    setTimeout(() => {
      this.verifyPayment();
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
  }
  ngOnDestroy(): void {
    this.socketService.disconnect();
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
          this.dialogService.open(StreamPayPopupComponent, {
            data: res.response,
            header: this.translocoService.translate('stream.streamAnnounced'),
            width: '50rem',
          });
        }
      },
      error: (error) => {},
    });
  }
}

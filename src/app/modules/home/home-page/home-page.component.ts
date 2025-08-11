import { Component, OnInit } from '@angular/core';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { CardModule } from 'primeng/card';
import { User } from '../../../core/models/user';
import { SessionService } from '../../../core/services/session.service';
import { PaymentService } from '../../../core/services/payment.service';
import { DialogService } from 'primeng/dynamicdialog';
import { StreamPayPopupComponent } from '../../../shared/components/stream-pay-popup/stream-pay-popup.component';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [TranslocoModule, CardModule],
  providers: [DialogService],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss',
})
export class HomePageComponent implements OnInit {
  public user!: User | undefined;

  constructor(
    private readonly sessionService: SessionService,
    private readonly paymentService: PaymentService,
    private readonly dialogService: DialogService,
    private readonly translocoService: TranslocoService
  ) {
    this.user = this.sessionService.readSession('USER_TOKEN')?.user;
  }

  async ngOnInit(): Promise<void> {
    await this.verifyPayment();
  }

  private async verifyPayment(repro: boolean = false): Promise<boolean> {
    return new Promise((resolve) => {
      this.paymentService.verifyPayment().subscribe({
        next: (res) => {
          if (
            res.response.isAdmin ||
            (res.response.isPaid && res.response.isLive)
          ) {
            resolve(true);
          } else {
            if (repro) {
              res.response.repro = true;
            }
            this.dialogService.open(StreamPayPopupComponent, {
              data: res.response,
              header: this.translocoService.translate('stream.streamAnnounced'),
              width: '50rem',
            });
            resolve(false);
          }
        },
        error: (error) => {
          resolve(true);
        },
      });
    });
  }
}

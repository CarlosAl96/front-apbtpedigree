import { Component, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Stream } from '../../../core/models/stream';
import { DateHourFormatPipe } from '../../../core/pipes/date-hour-format.pipe';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { TagModule } from 'primeng/tag';
import {
  ICreateOrderRequest,
  IPayPalConfig,
  NgxPayPalModule,
} from 'ngx-paypal';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment.development';
import { PaymentService } from '../../../core/services/payment.service';
import { StreamService } from '../../../core/services/stream.service';
import { ToastService } from '../../../core/services/toast.service';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-stream-pay-popup',
  standalone: true,
  imports: [
    DateHourFormatPipe,
    TranslocoModule,
    TagModule,
    NgxPayPalModule,
    ButtonModule,
    ProgressSpinnerModule,
  ],
  templateUrl: './stream-pay-popup.component.html',
  styleUrl: './stream-pay-popup.component.scss',
})
export class StreamPayPopupComponent implements OnInit {
  public isLive: boolean = false;
  public isPaid: boolean = false;
  public isFree: boolean = false;
  public repro: boolean = false;
  public stream: Stream;
  public payPalConfig?: IPayPalConfig;

  constructor(
    private readonly refDialog: DynamicDialogRef,
    private readonly config: DynamicDialogConfig,
    private readonly router: Router,
    private readonly paymentService: PaymentService,
    private readonly toastService: ToastService,
    private readonly translocoService: TranslocoService
  ) {
    this.stream = this.config.data.stream;
    this.isLive = this.config.data.isLive;
    this.isPaid = this.config.data.isPaid;
    this.isFree = this.config.data.isFree;
    this.repro = this.config.data.repro;

    console.log(this.config.data);
  }
  ngOnInit(): void {
    if (!this.isFree) {
      this.initConfig();
    }
  }

  private initConfig(): void {
    this.paymentService.makeOrderPayment(this.stream).subscribe({
      next: (res) => {
        this.payPalConfig = {
          currency: 'USD',
          fundingSource: 'PAYPAL',
          clientId: environment.paypal_client_id,
          createOrderOnServer: (data) => {
            return res.response.id;
          },
          advanced: {
            commit: 'true',
          },
          style: { label: 'paypal', layout: 'vertical' },
          onApprove: (data, actions) => {
            actions.order.get().then((details: any) => {
              console.log(
                'onApprove - you can get full order details inside onApprove: ',
                details
              );
            });
          },
          onClientAuthorization: (data) => {
            this.paymentService
              .makePayment({ order: res.response.id, stream: this.stream })
              .subscribe({
                next: (data) => {
                  this.toastService.setMessage({
                    severity: 'success',
                    summary: this.translocoService.translate('toast.success'),
                    detail: this.translocoService.translate(
                      'toast.paymentCreated'
                    ),
                  });
                  this.isPaid = true;
                },
                error: (error) => {
                  this.toastService.setMessage({
                    severity: 'error',
                    summary: this.translocoService.translate('toast.error'),
                    detail:
                      this.translocoService.translate('toast.paymentError'),
                  });
                },
              });
          },
          onError: (err) => {
            console.log('OnError', err);
            this.toastService.setMessage({
              severity: 'error',
              summary: this.translocoService.translate('toast.error'),
              detail: this.translocoService.translate('toast.paymentError'),
            });
          },
        };
      },
    });
  }

  public goToStream(): void {
    this.refDialog.close();
    window.location.href = '/stream';
  }
}

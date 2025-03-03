import { Component, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Stream } from '../../../core/models/stream';
import { DateHourFormatPipe } from '../../../core/pipes/date-hour-format.pipe';
import { TranslocoModule } from '@jsverse/transloco';
import { TagModule } from 'primeng/tag';
import {
  ICreateOrderRequest,
  IPayPalConfig,
  NgxPayPalModule,
} from 'ngx-paypal';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment.development';

@Component({
  selector: 'app-stream-pay-popup',
  standalone: true,
  imports: [
    DateHourFormatPipe,
    TranslocoModule,
    TagModule,
    NgxPayPalModule,
    ButtonModule,
  ],
  templateUrl: './stream-pay-popup.component.html',
  styleUrl: './stream-pay-popup.component.scss',
})
export class StreamPayPopupComponent implements OnInit {
  public isLive: boolean = false;
  public isPaid: boolean = false;
  public repro: boolean = false;
  public stream: Stream;
  public payPalConfig?: IPayPalConfig;

  constructor(
    private readonly refDialog: DynamicDialogRef,
    private readonly config: DynamicDialogConfig,
    private readonly router: Router
  ) {
    this.stream = this.config.data.stream;
    this.isLive = this.config.data.isLive;
    this.isPaid = this.config.data.isPaid;
    this.repro = this.config.data.repro;
  }
  ngOnInit(): void {
    this.initConfig();
  }

  private initConfig(): void {
    this.payPalConfig = {
      currency: 'USD',
      clientId: environment.paypal_client_id,
      createOrderOnClient: (data: any) =>
        <ICreateOrderRequest>{
          intent: 'CAPTURE',
          purchase_units: [
            {
              amount: {
                currency_code: 'USD',
                value: '10.00',
              },
            },
          ],
        },
      onApprove: (data, actions) => {
        console.log('Pago aprobado, capturando...');
        actions.order?.capture().then((details: any) => {
          console.log('Pago completado:', details);
          alert(
            `Pago realizado con éxito por ${details.payer.name.given_name}`
          );
        });
      },
      onError: (err) => {
        console.error('Error en el pago:', err);
      },
    };
  }

  public goToStream(): void {
    this.refDialog.close();
    this.router.navigate(['stream']);
  }
}

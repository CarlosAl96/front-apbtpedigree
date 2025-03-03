import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { PaymentService } from '../services/payment.service';
import { DialogService } from 'primeng/dynamicdialog';
import { StreamPayPopupComponent } from '../../shared/components/stream-pay-popup/stream-pay-popup.component';
import { TranslocoService } from '@jsverse/transloco';
import { NoStreamOrEndedComponent } from '../../shared/components/no-stream-or-ended/no-stream-or-ended.component';
import { map, tap } from 'rxjs';

export const isPayedGuard: CanActivateFn = (route, state) => {
  const paymentService = inject(PaymentService);
  const dialogService = inject(DialogService);
  const translocoService = inject(TranslocoService);

  return paymentService.verifyPayment().pipe(
    map((res) => {
      if (
        res.response.isAdmin ||
        (res.response.isPaid && res.response.isLive)
      ) {
        return true;
      } else {
        dialogService.open(StreamPayPopupComponent, {
          data: res.response,
          header: translocoService.translate('stream.streamAnnounced'),
          width: '50rem',
        });
        return false;
      }
    }),
    tap({
      error: () => {
        dialogService.open(NoStreamOrEndedComponent, {
          data: { ended: false },
          header: translocoService.translate('stream.noStreamActive'),
          width: '50rem',
        });
      },
    })
  );
};

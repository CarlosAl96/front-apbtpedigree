import { Component } from '@angular/core';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { MessagesModule } from 'primeng/messages';
import { Message } from 'primeng/api';
import { SessionService } from '../../core/services/session.service';
import { PasswordModule } from 'primeng/password';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { ToastService } from '../../core/services/toast.service';
import { DialogService } from 'primeng/dynamicdialog';
import { PaymentService } from '../../core/services/payment.service';
import { StreamPayPopupComponent } from '../../shared/components/stream-pay-popup/stream-pay-popup.component';
import { SocketService } from '../../core/services/socket.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CardModule,
    InputTextModule,
    ButtonModule,
    ReactiveFormsModule,
    MessagesModule,
    PasswordModule,
    TranslocoModule,
  ],
  providers: [DialogService],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  public formGroup!: FormGroup;
  public loading: boolean = false;
  public error!: Message[];

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly socketService: SocketService,
    private readonly authService: AuthService,
    private readonly sessionService: SessionService,
    private readonly toastService: ToastService,
    private readonly translocoService: TranslocoService,
    private readonly paymentService: PaymentService,
    private readonly dialogService: DialogService
  ) {
    this.formGroup = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  public login(event: any): void {
    event.preventDefault();

    if (this.formGroup.valid) {
      this.loading = true;
      this.authService.login(this.formGroup.value).subscribe({
        next: (res) => {
          this.error = [];
          console.log(res);

          this.sessionService.saveSession('USER_TOKEN', res.response.token);
          this.toastService.setMessage({
            severity: 'success',
            summary: this.translocoService.translate('toast.success'),
            detail: this.translocoService.translate('toast.login', {
              user: this.formGroup.controls['username'].value,
            }),
          });

          this.sessionService.setIsLogin(true);
          window.location.href = '/home';
          this.verifyPayment();
          this.loading = false;

          this.socketService.emitLogin(
            this.sessionService.readSession('USER_TOKEN')?.user.id ?? 0
          );
        },
        error: () => {
          this.error = [
            {
              severity: 'error',
              detail: this.translocoService.translate('toast.errorLogin'),
            },
          ];
          this.loading = false;
        },
      });
    } else {
      this.formGroup.controls['username'].markAsDirty();
      this.formGroup.controls['password'].markAsDirty();
    }
  }

  private verifyPayment(repro: boolean = false): void {
    this.paymentService.verifyPayment().subscribe({
      next: (res) => {
        if (
          res.response.isAdmin ||
          (res.response.isPaid && res.response.isLive)
        ) {
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

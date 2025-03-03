import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../../core/services/auth.service';
import { Message } from 'primeng/api';
import { MessagesModule } from 'primeng/messages';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    TranslocoModule,
    CardModule,
    InputTextModule,
    ButtonModule,
    ReactiveFormsModule,
    MessagesModule,
  ],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
})
export class ForgotPasswordComponent {
  public formGroup!: FormGroup;
  public loading: boolean = false;
  public message!: Message[];

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly authService: AuthService,
    private readonly translocoService: TranslocoService
  ) {
    this.formGroup = this.formBuilder.group({
      username: ['', Validators.required],
    });
  }

  public resetPassword(): void {
    if (this.formGroup.valid) {
      this.authService.resetPassword(this.formGroup.value).subscribe({
        next: (response) => {
          this.message = [
            {
              severity: 'success',
              detail: this.translocoService.translate('login.emailSended'),
            },
          ];
        },
        error: (error) => {
          if (error.status === 404) {
            this.message = [
              {
                severity: 'error',
                detail: this.translocoService.translate('login.errorUser'),
              },
            ];
          }

          if (error.status === 500) {
            this.message = [
              {
                severity: 'error',
                detail: this.translocoService.translate('login.errorReset'),
              },
            ];
          }
        },
      });
    }
  }
}

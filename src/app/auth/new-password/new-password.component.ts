import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { MessagesModule } from 'primeng/messages';
import { PasswordModule } from 'primeng/password';
import { ToastService } from '../../core/services/toast.service';
import { AuthService } from '../../core/services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Message } from 'primeng/api';

@Component({
  selector: 'app-new-password',
  standalone: true,
  imports: [
    CardModule,

    ButtonModule,
    ReactiveFormsModule,
    MessagesModule,
    PasswordModule,
    TranslocoModule,
  ],
  templateUrl: './new-password.component.html',
  styleUrl: './new-password.component.scss',
})
export class NewPasswordComponent {
  public formGroup!: FormGroup;
  public loading: boolean = false;
  public error!: Message[];
  public token: string = '';
  constructor(
    private readonly toastService: ToastService,
    private readonly formBuilder: FormBuilder,
    private readonly router: Router,
    private readonly authService: AuthService,
    private readonly translocoService: TranslocoService,
    private readonly route: ActivatedRoute
  ) {
    this.route.paramMap.subscribe((params) => {
      this.token = params.get('token') as string;
    });

    this.formGroup = this.formBuilder.group({
      password: ['', Validators.required],
      password2: ['', Validators.required],
    });
  }

  public createNewPassword(event: any): void {
    event.preventDefault();

    if (this.formGroup.valid) {
      if (this.formGroup.value.password !== this.formGroup.value.password2) {
        this.error = [
          {
            severity: 'error',
            detail: this.translocoService.translate(
              'errorMessages.noMatchPassword'
            ),
          },
        ];
        return;
      }
      this.loading = true;
      this.authService
        .updatePassword(this.formGroup.value, this.token)
        .subscribe({
          next: (res) => {
            this.error = [];
            this.toastService.setMessage({
              severity: 'success',
              summary: this.translocoService.translate('toast.success'),
              detail: this.translocoService.translate('toast.passwordChanged'),
            });
            window.location.href = '/auth';
            this.loading = false;
          },
          error: () => {
            this.error = [
              {
                severity: 'error',
                detail: this.translocoService.translate(
                  'login.errorNewPassword'
                ),
              },
            ];
            this.loading = false;
          },
        });
    } else {
      this.formGroup.controls['password'].markAsDirty();
      this.formGroup.controls['password2'].markAsDirty();
    }
  }
}

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
import { TranslocoModule } from '@jsverse/transloco';

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
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  public formGroup!: FormGroup;
  public loading: boolean = false;
  public error!: Message[];

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly router: Router,
    private readonly authService: AuthService,
    private readonly sessionService: SessionService
  ) {
    this.formGroup = this.formBuilder.group({
      email: ['', Validators.required],
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
          this.sessionService.saveSession('USER_TOKEN', res.response.token);
          this.router.navigate(['/admin/usuarios']);
          this.loading = false;
        },
        error: () => {
          this.error = [
            {
              severity: 'error',
              detail: 'Nombre de usuario o contraseña incorrectos',
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
}

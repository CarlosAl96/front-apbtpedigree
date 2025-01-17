import { Component } from '@angular/core';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { MessagesModule } from 'primeng/messages';
import { Message } from 'primeng/api';
import { PasswordModule } from 'primeng/password';
import { ToastService } from '../../core/services/toast.service';
import { FileSelectEvent, FileUploadModule } from 'primeng/fileupload';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    TranslocoModule,
    CardModule,
    InputTextModule,
    ButtonModule,
    ReactiveFormsModule,
    MessagesModule,
    PasswordModule,
    FileUploadModule,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  public formGroup!: FormGroup;
  public loading: boolean = false;
  public error!: Message[];
  public errorUsername!: Message[];
  public errorPassword!: Message[];
  public errorEmail!: Message[];
  public files: any[] = [];

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly router: Router,
    private readonly authService: AuthService,
    private readonly toastService: ToastService,
    private readonly translocoService: TranslocoService
  ) {
    this.formGroup = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      password2: ['', Validators.required],
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      email: ['', Validators.required],
      phone_number: [''],
      street: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      country: ['', Validators.required],
      zip_code: ['', Validators.required],
    });
  }

  public register(event: any): void {
    event.preventDefault();

    this.markFormControlsAsDirty(this.formGroup);

    if (
      this.formGroup.controls['password'].value !=
      this.formGroup.controls['password2'].value
    ) {
      this.loading = false;
      this.errorPassword = [
        {
          severity: 'error',
          detail: this.translocoService.translate(
            'errorMessages.noMatchPassword'
          ),
        },
      ];
      return;
    }

    if (this.formGroup.valid) {
      this.loading = true;

      const formData: FormData = new FormData();

      Object.keys(this.formGroup.controls).forEach((key) => {
        formData.append(key, this.formGroup.get(key)?.value);
      });

      if (this.files.length) {
        formData.append('picture', this.files[0]);
      } else {
        formData.append('picture', '');
      }

      this.authService.register(formData).subscribe({
        next: () => {
          this.error = [];
          this.errorUsername = [];
          this.errorEmail = [];
          this.errorPassword = [];
          this.loading = false;
          this.toastService.setMessage({
            severity: 'success',
            summary: this.translocoService.translate('toast.success'),
            detail: this.translocoService.translate('toast.register'),
          });
          this.router.navigate(['/auth']);
        },
        error: (error) => {
          this.loading = false;

          console.log(error.error);

          if (error.error == 'email') {
            this.error = [];
            this.errorUsername = [];
            this.errorEmail = [
              {
                severity: 'error',
                detail: this.translocoService.translate(
                  'errorMessages.alreadyEmail'
                ),
              },
            ];
            return;
          }
          if (error.error == 'username') {
            this.error = [];
            this.errorEmail = [];
            this.errorUsername = [
              {
                severity: 'error',
                detail: this.translocoService.translate(
                  'errorMessages.alreadyUser'
                ),
              },
            ];

            return;
          }

          this.errorEmail = [];
          this.errorUsername = [];
          this.error = [
            {
              severity: 'error',
              detail: this.translocoService.translate(
                'errorMessages.errorRegister'
              ),
            },
          ];
        },
      });
    }
  }

  public onSelectFile(event: FileSelectEvent): void {
    this.files = event.currentFiles;
  }

  private markFormControlsAsDirty(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((field) => {
      const control = formGroup.get(field);
      if (control) control.markAsDirty({ onlySelf: true });
    });
  }
}

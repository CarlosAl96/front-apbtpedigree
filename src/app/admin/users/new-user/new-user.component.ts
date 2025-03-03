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
import { FileSelectEvent, FileUploadModule } from 'primeng/fileupload';
import { InputTextModule } from 'primeng/inputtext';
import { MessagesModule } from 'primeng/messages';
import { PasswordModule } from 'primeng/password';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { Message } from 'primeng/api';
import { User } from '../../../core/models/user';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { DropdownModule } from 'primeng/dropdown';
import { combineLatest } from 'rxjs';
import { DropOption } from '../../../core/models/dropOption';
import { environment } from '../../../../environments/environment.development';

@Component({
  selector: 'app-new-user',
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
    DropdownModule,
  ],
  templateUrl: './new-user.component.html',
  styleUrl: './new-user.component.scss',
})
export class NewUserComponent {
  public formGroup!: FormGroup;
  public loading: boolean = false;
  public error!: Message[];
  public user!: User;
  public errorUsername!: Message[];
  public errorPassword!: Message[];
  public errorEmail!: Message[];
  public userTypes: DropOption[] = [];
  public files: any[] = [];
  public option: string = '';
  public urlImg: string = `${environment.uploads_url}users/`;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly authService: AuthService,
    private readonly toastService: ToastService,
    private readonly translocoService: TranslocoService,
    private readonly refDialog: DynamicDialogRef,
    public readonly config: DynamicDialogConfig
  ) {
    this.formGroup = this.formBuilder.group({
      username: ['', Validators.required],
      password: [''],
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      email: ['', Validators.required],
      phone_number: [''],
      street: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      country: ['', Validators.required],
      zip_code: ['', Validators.required],
      type: [0, Validators.required],
    });

    this.translocoService.langChanges$.subscribe((res) => {
      combineLatest([
        this.translocoService.selectTranslate('users.user'),
        this.translocoService.selectTranslate('users.admin'),
        this.translocoService.langChanges$,
      ]).subscribe(([user, admin]) => {
        this.userTypes = [
          { name: user, code: 0 },
          { name: admin, code: 1 },
        ];
      });
    });

    this.user = this.config.data;
    if (this.user) {
      this.option = 'edit';
      this.setFormToEdit();
    }
  }

  public register(event: any): void {
    event.preventDefault();

    this.markFormControlsAsDirty(this.formGroup);

    if (this.option == '' && this.formGroup.controls['password'].value == '') {
      this.loading = false;
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
      }

      if (formData.get('type') == '1') {
        formData.set('is_superuser', 'true');
      }

      formData.delete('type');

      if (this.option == 'edit') {
        this.authService.updateUser(formData, this.user.id).subscribe({
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
            this.refDialog.close();
          },
          error: (error) => {
            this.loading = false;

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
      } else {
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
            this.refDialog.close();
          },
          error: (error) => {
            this.loading = false;

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
  }

  public onSelectFile(event: FileSelectEvent): void {
    this.files = event.currentFiles;
  }

  private setFormToEdit(): void {
    this.formGroup.patchValue({
      username: this.user.username,
      first_name: this.user.first_name,
      last_name: this.user.last_name,
      email: this.user.email,
      phone_number: this.user.phone_number,
      street: this.user.street,
      city: this.user.city,
      state: this.user.state,
      country: this.user.country,
      zip_code: this.user.zip_code,
      type: this.user.is_superuser ? 1 : 0,
    });
  }

  private markFormControlsAsDirty(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((field) => {
      const control = formGroup.get(field);
      if (control) control.markAsDirty({ onlySelf: true });
    });
  }
}

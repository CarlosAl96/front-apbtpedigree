import { Component, OnInit } from '@angular/core';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { CardModule } from 'primeng/card';
import { InplaceModule } from 'primeng/inplace';
import { User } from '../../../core/models/user';
import { ToastService } from '../../../core/services/toast.service';
import { SessionService } from '../../../core/services/session.service';
import { Message } from 'primeng/api';
import { InputSwitchModule } from 'primeng/inputswitch';
import { environment } from '../../../../environments/environment.development';
import { PasswordModule } from 'primeng/password';
import { FileSelectEvent, FileUploadModule } from 'primeng/fileupload';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { MessagesModule } from 'primeng/messages';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [
    TranslocoModule,
    CardModule,
    PasswordModule,
    InplaceModule,
    InputSwitchModule,
    FileUploadModule,
    ReactiveFormsModule,
    InputTextModule,
    FormsModule,
    MessagesModule,
  ],

  templateUrl: './account.component.html',
  styleUrl: './account.component.scss',
})
export class AccountComponent implements OnInit {
  public user!: User | undefined;
  public urlImg: string = `${environment.uploads_url}users/`;
  public loadingPassword: boolean = false;
  public loadingPermissions: boolean = false;
  public loadingChanges: boolean = false;
  public loadingPicture: boolean = false;
  public formPermissions!: FormGroup;
  public formInfo!: FormGroup;
  public formPassword!: FormGroup;
  public errorPassword!: Message[];
  public files: any[] = [];
  public username: string = '';
  public imageSrc: string | ArrayBuffer | null = null;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly translocoService: TranslocoService,
    private readonly toastService: ToastService,
    private readonly sessionService: SessionService,
    private readonly authService: AuthService
  ) {
    this.username =
      this.sessionService.readSession('USER_TOKEN')?.user.username ?? '';

    this.getByUsername();

    this.formPassword = this.formBuilder.group({
      oldPassword: ['', Validators.required],
      newPassword: ['', Validators.required],
      repeatPassword: ['', Validators.required],
    });

    this.formPermissions = this.formBuilder.group({
      show_email: [false, Validators.required],
      show_phone: [false, Validators.required],
      show_location: [false, Validators.required],
    });

    this.formInfo = this.formBuilder.group({
      phone_number: [''],
      street: [''],
      city: [''],
      state: [''],
      country: [''],
      zip_code: [''],
    });
  }
  ngOnInit(): void {}

  private getByUsername(): void {
    this.authService.getUserByUsername(this.username).subscribe({
      next: (res) => {
        this.user = res.response;
        this.setFormValues();
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  public updateUser(event: any): void {
    event.preventDefault();

    this.markFormControlsAsDirty(this.formInfo);

    if (this.formInfo.valid) {
      this.loadingChanges = true;
      this.authService
        .updateUser(this.formInfo.value, this.user?.id ?? 0)
        .subscribe({
          next: (res) => {
            this.toastService.setMessage({
              severity: 'success',
              summary: this.translocoService.translate('toast.success'),
              detail: this.translocoService.translate('toast.updateMessage'),
            });
            this.loadingChanges = false;
          },
          error: (error) => {
            this.toastService.setMessage({
              severity: 'error',
              summary: this.translocoService.translate('toast.error'),
              detail: this.translocoService.translate('toast.updateError'),
            });
            this.loadingChanges = false;
          },
        });
    }
  }

  public changePassword(event: any): void {
    event.preventDefault();

    this.markFormControlsAsDirty(this.formPassword);

    if (
      this.formPassword.value.newPassword !==
      this.formPassword.value.repeatPassword
    ) {
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

    if (this.formPassword.valid) {
      this.loadingPassword = true;
      this.authService
        .updatePasswordFromMyAccount(
          this.formPassword.value,
          this.user?.id ?? 0
        )
        .subscribe({
          next: (res) => {
            this.toastService.setMessage({
              severity: 'success',
              summary: this.translocoService.translate('toast.success'),
              detail: this.translocoService.translate('toast.passwordChanged'),
            });
            this.loadingPassword = false;
            this.errorPassword = [];
          },
          error: (error) => {
            this.errorPassword = [
              {
                severity: 'error',
                detail: this.translocoService.translate(
                  'toast.errorChangePassword'
                ),
              },
            ];
            this.loadingPassword = false;
          },
        });
    }
  }

  public updatePicture(): void {
    const formData: FormData = new FormData();
    if (this.files.length) {
      formData.append('picture', this.files[0]);
      this.loadingPicture = true;
      this.authService.updateUser(formData, this.user?.id ?? 0).subscribe({
        next: (res) => {
          this.toastService.setMessage({
            severity: 'success',
            summary: this.translocoService.translate('toast.success'),
            detail: this.translocoService.translate('toast.updateMessage'),
          });
          this.loadingPicture = false;
        },
        error: (error) => {
          this.toastService.setMessage({
            severity: 'error',
            summary: this.translocoService.translate('toast.error'),
            detail: this.translocoService.translate('toast.updateError'),
          });
          this.loadingPicture = false;
        },
      });
    }
  }

  public changePermissions(event: any): void {
    event.preventDefault();

    this.markFormControlsAsDirty(this.formPermissions);

    if (this.formPermissions.valid) {
      this.loadingPermissions = true;
      this.authService
        .updateUser(this.formPermissions.value, this.user?.id ?? 0)
        .subscribe({
          next: (res) => {
            this.toastService.setMessage({
              severity: 'success',
              summary: this.translocoService.translate('toast.success'),
              detail: this.translocoService.translate('toast.updateMessage'),
            });
            this.loadingPermissions = false;
          },
          error: (error) => {
            this.toastService.setMessage({
              severity: 'error',
              summary: this.translocoService.translate('toast.error'),
              detail: this.translocoService.translate('toast.updateError'),
            });
            this.loadingPermissions = false;
          },
        });
    }
  }

  public onSelectFile(event: FileSelectEvent): void {
    this.files = event.currentFiles;

    if (this.files.length) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imageSrc = e.target.result;
      };
      reader.readAsDataURL(this.files[0]);
    }
  }

  private setFormValues() {
    this.formInfo.patchValue({
      phone_number: this.user?.phone_number,
      street: this.user?.street,
      city: this.user?.city,
      state: this.user?.state,
      country: this.user?.country,
      zip_code: this.user?.zip_code,
    });

    this.formPermissions.patchValue({
      show_email: this.user?.show_email == 0 ? false : true,
      show_phone: this.user?.show_phone == 0 ? false : true,
      show_location: this.user?.show_location == 0 ? false : true,
    });
  }

  private markFormControlsAsDirty(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((field) => {
      const control = formGroup.get(field);
      if (control) control.markAsDirty({ onlySelf: true });
    });
  }
}

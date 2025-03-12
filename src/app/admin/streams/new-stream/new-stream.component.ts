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
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { Stream } from '../../../core/models/stream';
import { ToastService } from '../../../core/services/toast.service';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { StreamService } from '../../../core/services/stream.service';
import { CalendarModule } from 'primeng/calendar';
import { InputNumberModule } from 'primeng/inputnumber';
@Component({
  selector: 'app-new-stream',
  standalone: true,
  imports: [
    TranslocoModule,
    CardModule,
    InputTextModule,
    ButtonModule,
    ReactiveFormsModule,
    InputTextareaModule,
    CalendarModule,
    InputNumberModule,
  ],
  templateUrl: './new-stream.component.html',
  styleUrl: './new-stream.component.scss',
})
export class NewStreamComponent {
  public formGroup!: FormGroup;
  public loading: boolean = false;
  public stream!: Stream;
  public option: string = '';

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly toastService: ToastService,
    private readonly refDialog: DynamicDialogRef,
    private readonly config: DynamicDialogConfig,
    private readonly streamService: StreamService,
    private readonly translocoService: TranslocoService
  ) {
    this.formGroup = this.formBuilder.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      url: ['', Validators.required],
      price: [15, Validators.required],
      proposed_start_date: [new Date(), Validators.required],
      proposed_end_date: [new Date(), Validators.required],
    });

    this.stream = this.config.data.stream;
    this.option = this.config.data.option;

    if (this.stream) {
      this.setFormToEdit();
    }
  }

  public createOrEdit() {
    this.loading = true;
    if (this.option == 'edit') {
      this.editStream();
    } else {
      this.saveStream();
    }
  }

  public saveStream(): void {
    this.markFormControlsAsDirty(this.formGroup);

    if (this.formGroup.valid) {
      this.streamService.createStream(this.formGroup.value).subscribe({
        next: (res) => {
          this.loading = false;
          this.toastService.setMessage({
            severity: 'success',
            summary: this.translocoService.translate('toast.success'),
            detail: this.translocoService.translate('toast.streamCreated'),
          });

          this.refDialog.close();
        },
        error: (error) => {
          this.toastService.setMessage({
            severity: 'error',
            summary: this.translocoService.translate('toast.error'),
            detail: this.translocoService.translate('toast.streamCreatedError'),
          });
          this.loading = false;
        },
      });
    }
  }

  public editStream() {
    this.markFormControlsAsDirty(this.formGroup);

    if (this.formGroup.valid) {
      this.streamService
        .updateStream(this.formGroup.value, this.stream.id)
        .subscribe({
          next: (res) => {
            this.loading = false;
            this.toastService.setMessage({
              severity: 'success',
              summary: this.translocoService.translate('toast.success'),
              detail: this.translocoService.translate('toast.streamUpdated'),
            });
            this.refDialog.close();
          },
          error: (error) => {
            this.toastService.setMessage({
              severity: 'error',
              summary: this.translocoService.translate('toast.error'),
              detail: this.translocoService.translate(
                'toast.streamUpdatedError'
              ),
            });
            this.loading = false;
          },
        });
    }
  }

  private setFormToEdit(): void {
    this.formGroup.patchValue({
      title: this.stream.title,
      description: this.stream.description,
      url: this.stream.url,
      price: this.stream.price,
      proposed_start_date: new Date(this.stream.proposed_start_date),
      proposed_end_date: new Date(this.stream.proposed_end_date),
    });

    this.formGroup.controls['price'].disable();
  }

  private markFormControlsAsDirty(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((field) => {
      const control = formGroup.get(field);
      if (control) control.markAsDirty({ onlySelf: true });
    });
  }
}

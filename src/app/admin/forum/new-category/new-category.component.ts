import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { ButtonModule } from 'primeng/button';
import { ForumCategory } from '../../../core/models/forumCategory';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ForumService } from '../../../core/services/forum.service';
import { ToastService } from '../../../core/services/toast.service';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ChipsModule } from 'primeng/chips';

@Component({
  selector: 'app-new-category',
  standalone: true,
  imports: [
    ButtonModule,
    TranslocoModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    InputTextareaModule,
    ChipsModule,
  ],
  templateUrl: './new-category.component.html',
  styleUrl: './new-category.component.scss',
})
export class NewCategoryComponent {
  public formGroup!: FormGroup;
  public loading: boolean = false;
  public category!: ForumCategory;
  public option: string = '';

  constructor(
    private readonly forumService: ForumService,
    private readonly formBuilder: FormBuilder,
    private readonly refDialog: DynamicDialogRef,
    public readonly config: DynamicDialogConfig,
    private readonly messageService: ToastService,
    private readonly translocoService: TranslocoService
  ) {
    this.formGroup = this.formBuilder.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      moderators: ['', [Validators.required]],
    });

    this.category = this.config.data;

    if (this.category) {
      this.option = 'edit';
      this.setFormToEdit();
    }
  }

  public createOrEdit() {
    this.loading = true;
    if (this.option == 'edit') {
      this.editCategory();
    } else {
      this.saveCategory();
    }
  }

  public saveCategory(): void {
    this.markFormControlsAsDirty(this.formGroup);
    console.log(this.formGroup.value);

    if (this.formGroup.valid) {
      const obj: any = this.formGroup.value;

      obj.moderators = JSON.stringify(obj.moderators);
      this.loading = true;

      this.forumService.createCategory(this.formGroup.value).subscribe({
        next: (res) => {
          this.loading = false;
          this.messageService.setMessage({
            severity: 'success',
            summary: this.translocoService.translate('toast.success'),
            detail: this.translocoService.translate('toast.categoryCreated'),
          });

          this.refDialog.close();
        },
        error: (error) => {
          this.messageService.setMessage({
            severity: 'error',
            summary: this.translocoService.translate('toast.error'),
            detail: this.translocoService.translate(
              'toast.categoryCreatedError'
            ),
          });
          this.loading = false;
        },
      });
    }
  }

  public editCategory() {
    this.markFormControlsAsDirty(this.formGroup);

    if (this.formGroup.valid) {
      this.loading = true;

      const obj: any = this.formGroup.value;

      obj.moderators = JSON.stringify(obj.moderators);

      this.forumService.updateCategory(obj, this.category.id).subscribe({
        next: (res) => {
          this.loading = false;
          this.messageService.setMessage({
            severity: 'success',
            summary: this.translocoService.translate('toast.success'),
            detail: this.translocoService.translate('toast.categoryEdited'),
          });
          this.refDialog.close();
        },
        error: (error) => {
          this.messageService.setMessage({
            severity: 'error',
            summary: this.translocoService.translate('toast.error'),
            detail: this.translocoService.translate(
              'toast.categoryCreatedError'
            ),
          });
          this.loading = false;
        },
      });
    }
  }

  private setFormToEdit(): void {
    this.formGroup.patchValue({
      name: this.category.name,
      description: this.category.description,
      moderators: this.category.moderators.split(', '),
    });
  }

  private markFormControlsAsDirty(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((field) => {
      const control = formGroup.get(field);
      if (control) control.markAsDirty({ onlySelf: true });
    });
  }
}

import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { CardModule } from 'primeng/card';
import { ToastService } from '../../../../core/services/toast.service';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { FileSelectEvent, FileUploadModule } from 'primeng/fileupload';
import { Pedigree } from '../../../../core/models/pedigree';
import { environment } from '../../../../../environments/environment.development';
import { PedigreeService } from '../../../../core/services/pedigree.service';
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-upload-picture',
  standalone: true,
  imports: [
    TranslocoModule,
    CardModule,
    ButtonModule,
    FileUploadModule,
    ConfirmDialogModule,
  ],
  providers: [ConfirmationService],
  templateUrl: './upload-picture.component.html',
  styleUrl: './upload-picture.component.scss',
})
export class UploadPictureComponent implements OnInit {
  @Input('pedigree') pedigree!: Pedigree;
  @Input('isFromPedigreeSearch') isFromPedigreeSearch: boolean = false;

  public files: any[] = [];
  public urlImg: string = `${environment.uploads_url}pedigrees/`;
  public loading: boolean = false;

  constructor(
    private readonly router: Router,
    private readonly toastService: ToastService,
    private readonly pedigreeService: PedigreeService,
    private readonly translocoService: TranslocoService,
    private readonly confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    if (this.pedigree) {
      this.urlImg += this.pedigree.img;
    }
  }

  public uploadImg(): void {
    const formData: FormData = new FormData();

    if (this.files.length) {
      if (this.pedigree.img) {
        formData.append('old_img', this.pedigree.img);
      }

      formData.append('img', this.files[0]);

      this.pedigreeService
        .updateCurrentImg(formData, this.pedigree.id)
        .subscribe({
          next: () => {
            this.loading = false;
            this.toastService.setMessage({
              severity: 'success',
              summary: this.translocoService.translate('toast.success'),
              detail: this.translocoService.translate('toast.pedigreeEdited'),
            });

            location.reload();
          },
          error: () => {
            this.loading = false;
          },
        });
    }
  }

  public deleteCurrentImg(): void {
    const formData: FormData = new FormData();

    formData.append('old_img', this.pedigree.img);

    this.pedigree.img = '';

    this.confirmationService.confirm({
      header: this.translocoService.translate(
        'yourPedigrees.uploadDeleteImg.delete'
      ),
      message: this.translocoService.translate(
        'yourPedigrees.uploadDeleteImg.confirm'
      ),
      acceptIcon: 'pi pi-trash mr-2',
      rejectIcon: 'pi pi-times mr-2',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      acceptLabel: this.translocoService.translate('buttons.yes'),
      rejectLabel: this.translocoService.translate('buttons.no'),
      accept: () => {
        this.pedigreeService
          .updateCurrentImg(formData, this.pedigree.id)
          .subscribe({
            next: () => {
              this.loading = false;
              this.toastService.setMessage({
                severity: 'success',
                summary: this.translocoService.translate('toast.success'),
                detail: this.translocoService.translate('toast.pedigreeEdited'),
              });
            },
            error: () => {
              this.loading = false;
            },
          });
      },
      reject: () => {},
    });
  }

  public onSelectFile(event: FileSelectEvent): void {
    this.files = event.currentFiles;
  }

  public goBack(): void {
    location.reload();
  }
}

import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { Pedigree } from '../../../../core/models/pedigree';
import { ToastService } from '../../../../core/services/toast.service';
import { PedigreeService } from '../../../../core/services/pedigree.service';

@Component({
  selector: 'app-delete-pedigree',
  standalone: true,
  imports: [TranslocoModule, CardModule, ButtonModule, ConfirmDialogModule],
  providers: [ConfirmationService],
  templateUrl: './delete-pedigree.component.html',
  styleUrl: './delete-pedigree.component.scss',
})
export class DeletePedigreeComponent {
  @Input('pedigree') pedigree!: Pedigree;
  @Input('isFromPedigreeSearch') isFromPedigreeSearch: boolean = false;

  constructor(
    private readonly confirmationService: ConfirmationService,
    private readonly toastService: ToastService,
    private readonly pedigreeService: PedigreeService,
    private readonly translocoService: TranslocoService,
    private readonly router: Router
  ) {}

  public deletePedigree(): void {
    this.confirmationService.confirm({
      message: this.translocoService.translate(
        'yourPedigrees.deletePedigree.confirm'
      ),
      header: this.translocoService.translate('yourPedigrees.menu.deleteDog'),
      acceptIcon: 'pi pi-trash mr-2',
      rejectIcon: 'pi pi-times mr-2',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      acceptLabel: this.translocoService.translate('buttons.yes'),
      rejectLabel: this.translocoService.translate('buttons.no'),
      accept: () => {
        this.pedigreeService.deletePedigree(this.pedigree.id).subscribe({
          next: () => {
            this.toastService.setMessage({
              severity: 'success',
              summary: this.translocoService.translate('toast.success'),
              detail: this.translocoService.translate('toast.pedigreeDeleted'),
            });

            this.router.navigate(['/pedigree/my-pedigrees/0']);
          },
          error: () => {
            this.toastService.setMessage({
              severity: 'error',
              summary: this.translocoService.translate('toast.error'),
              detail: this.translocoService.translate(
                'toast.pedigreeDeletedError'
              ),
            });
          },
        });
      },
      reject: () => {},
    });
  }
  public goBack(): void {
    location.reload();
  }
}

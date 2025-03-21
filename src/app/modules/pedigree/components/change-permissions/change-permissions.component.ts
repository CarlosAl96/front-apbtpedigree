import { Component, HostListener, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { CardModule } from 'primeng/card';
import { InputSwitchModule } from 'primeng/inputswitch';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ButtonModule } from 'primeng/button';
import { Pedigree } from '../../../../core/models/pedigree';
import { ConfirmationService } from 'primeng/api';
import { ToastService } from '../../../../core/services/toast.service';
import { FormsModule } from '@angular/forms';
import { PedigreeService } from '../../../../core/services/pedigree.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-change-permissions',
  standalone: true,
  imports: [
    TranslocoModule,
    CardModule,
    InputSwitchModule,
    ButtonModule,
    ConfirmDialogModule,
    FormsModule,
  ],
  providers: [ConfirmationService],
  templateUrl: './change-permissions.component.html',
  styleUrl: './change-permissions.component.scss',
})
export class ChangePermissionsComponent implements OnInit {
  @Input('pedigree') pedigree!: Pedigree;
  @Input('isFromPedigreeSearch') isFromPedigreeSearch: boolean = false;
  @HostListener('window:popstate', ['$event'])
  onPopState(event: any) {
    if (this.isFromPedigreeSearch) {
      this.goBack();
      this.location.forward();
    }
  }

  public modelPedigreeStatus: boolean = false;

  constructor(
    private readonly confirmationService: ConfirmationService,
    private readonly toastService: ToastService,
    private readonly router: Router,
    private readonly translocoService: TranslocoService,
    private readonly pedigreeService: PedigreeService,
    private readonly location: Location
  ) {}

  ngOnInit(): void {
    this.modelPedigreeStatus = !this.pedigree.private;
  }

  public changePermissions(): void {
    this.confirmationService.confirm({
      message: this.pedigree.private
        ? this.translocoService.translate(
            'yourPedigrees.changePermissions.confirm'
          )
        : this.translocoService.translate(
            'yourPedigrees.changePermissions.confirm'
          ),
      header: this.translocoService.translate(
        'yourPedigrees.menu.changePermissions'
      ),
      icon: 'pi pi-exclamation-triangle',
      acceptIcon: 'pi pi-check mr-2',
      rejectIcon: 'pi pi-times mr-2',
      acceptLabel: this.translocoService.translate('buttons.yes'),
      rejectLabel: this.translocoService.translate('buttons.no'),
      accept: () => {
        this.pedigree.private = !this.pedigree.private;
        this.modelPedigreeStatus = !this.pedigree.private;

        const obj: any = {
          private: this.pedigree.private,
        };

        this.pedigreeService
          .updatePrivateStatus(obj, this.pedigree.id)
          .subscribe({
            next: () => {
              this.toastService.setMessage({
                severity: 'success',
                summary: this.translocoService.translate('toast.success'),
                detail: this.translocoService.translate('toast.pedigreeEdited'),
              });
            },
            error: () => {},
          });
      },
      reject: () => {},
    });
  }

  public goBack(): void {
    window.history.back();
  }
}

import { Component, OnDestroy, OnInit } from '@angular/core';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { DatePipe } from '@angular/common';
import { PedigreeClaim } from '../../core/models/pedigreeClaim';
import { PedigreeClaimService } from '../../core/services/pedigree-claim.service';
import { ToastService } from '../../core/services/toast.service';
import { SocketService } from '../../core/services/socket.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-pedigree-claims-admin',
  standalone: true,
  imports: [
    TranslocoModule,
    CardModule,
    ButtonModule,
    ConfirmDialogModule,
    TableModule,
    TagModule,
    ProgressSpinnerModule,
    DatePipe,
  ],
  providers: [ConfirmationService],
  templateUrl: './pedigree-claims-admin.component.html',
  styleUrl: './pedigree-claims-admin.component.scss',
})
export class PedigreeClaimsAdminComponent implements OnInit, OnDestroy {
  private readonly subscriptions = new Subscription();
  public claims: PedigreeClaim[] = [];
  public isLoading: boolean = false;

  constructor(
    private readonly pedigreeClaimService: PedigreeClaimService,
    private readonly confirmationService: ConfirmationService,
    private readonly toastService: ToastService,
    private readonly translocoService: TranslocoService,
    private readonly socketService: SocketService
  ) {}

  ngOnInit(): void {
    this.getClaims();
    this.subscriptions.add(
      this.socketService
        .onPedigreeClaimCreated()
        .subscribe(() => this.getClaims())
    );
    this.subscriptions.add(
      this.socketService
        .onPedigreeClaimUpdated()
        .subscribe(() => this.getClaims())
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  public approve(claim: PedigreeClaim): void {
    this.confirmationService.confirm({
      header: this.translocoService.translate('pedigreeClaims.approve'),
      message: this.translocoService.translate(
        'pedigreeClaims.confirmApprove',
        { id: claim.pedigree_id, user: claim.requester_username }
      ),
      icon: 'pi pi-check-circle',
      acceptLabel: this.translocoService.translate('buttons.yes'),
      rejectLabel: this.translocoService.translate('buttons.no'),
      accept: () => {
        this.pedigreeClaimService.approveClaim(claim.id).subscribe({
          next: () => this.onActionSuccess('pedigreeClaims.toast.approved'),
          error: (error) => this.onActionError(error),
        });
      },
    });
  }

  public deny(claim: PedigreeClaim): void {
    this.confirmationService.confirm({
      header: this.translocoService.translate('pedigreeClaims.deny'),
      message: this.translocoService.translate('pedigreeClaims.confirmDeny', {
        id: claim.pedigree_id,
        user: claim.requester_username,
      }),
      icon: 'pi pi-times-circle',
      acceptButtonStyleClass: 'p-button-warning',
      acceptLabel: this.translocoService.translate('buttons.yes'),
      rejectLabel: this.translocoService.translate('buttons.no'),
      accept: () => {
        this.pedigreeClaimService.denyClaim(claim.id).subscribe({
          next: () => this.onActionSuccess('pedigreeClaims.toast.denied'),
          error: (error) => this.onActionError(error),
        });
      },
    });
  }

  public delete(claim: PedigreeClaim): void {
    this.confirmationService.confirm({
      header: this.translocoService.translate('pedigreeClaims.delete'),
      message: this.translocoService.translate('pedigreeClaims.confirmDelete', {
        id: claim.id,
      }),
      icon: 'pi pi-trash',
      acceptButtonStyleClass: 'p-button-danger',
      acceptLabel: this.translocoService.translate('buttons.yes'),
      rejectLabel: this.translocoService.translate('buttons.no'),
      accept: () => {
        this.pedigreeClaimService.deleteClaim(claim.id).subscribe({
          next: () => this.onActionSuccess('pedigreeClaims.toast.deleted'),
          error: (error) => this.onActionError(error),
        });
      },
    });
  }

  public getPedigreeName(claim: PedigreeClaim): string {
    return this.buildFullName(
      claim.pedigree_beforeNameTitles,
      claim.pedigree_name,
      claim.pedigree_afterNameTitles
    );
  }

  public getRequesterName(claim: PedigreeClaim): string {
    const fullName = [
      claim.requester_first_name,
      claim.requester_last_name,
    ]
      .filter(Boolean)
      .join(' ');

    return fullName || claim.requester_username || '-';
  }

  public getStatusSeverity(status: string): 'success' | 'warning' | 'danger' {
    if (status === 'approved') {
      return 'success';
    }

    if (status === 'denied') {
      return 'danger';
    }

    return 'warning';
  }

  private getClaims(): void {
    this.isLoading = true;
    this.pedigreeClaimService.getClaims(true).subscribe({
      next: (res) => {
        this.claims = res.response;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  private onActionSuccess(messageKey: string): void {
    this.toastService.setMessage({
      severity: 'success',
      summary: this.translocoService.translate('toast.success'),
      detail: this.translocoService.translate(messageKey),
    });
    this.getClaims();
  }

  private onActionError(error: any): void {
    this.toastService.setMessage({
      severity: 'error',
      summary: this.translocoService.translate('toast.error'),
      detail: error.response || error,
    });
  }

  private buildFullName(
    before: string | null | undefined,
    name: string | null | undefined,
    after: string | null | undefined
  ): string {
    if (!name) {
      return '-';
    }

    return `${before && before !== 'null' ? before + ' ' : ''}${name}${
      after && after !== 'null' ? ' ' + after : ''
    }`;
  }
}

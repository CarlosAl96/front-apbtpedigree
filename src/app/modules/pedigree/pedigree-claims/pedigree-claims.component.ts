import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { DateHourFormatPipe } from '../../../core/pipes/date-hour-format.pipe';
import { PedigreeClaim } from '../../../core/models/pedigreeClaim';
import { PedigreeClaimService } from '../../../core/services/pedigree-claim.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-pedigree-claims',
  standalone: true,
  imports: [
    TranslocoModule,
    FormsModule,
    CardModule,
    ButtonModule,
    InputNumberModule,
    InputTextModule,
    TableModule,
    TagModule,
    ProgressSpinnerModule,
    DateHourFormatPipe,
  ],
  templateUrl: './pedigree-claims.component.html',
  styleUrl: './pedigree-claims.component.scss',
})
export class PedigreeClaimsComponent implements OnInit {
  public claims: PedigreeClaim[] = [];
  public pedigreeId!: number;
  public message: string = '';
  public isLoading: boolean = false;
  public isSaving: boolean = false;

  constructor(
    private readonly pedigreeClaimService: PedigreeClaimService,
    private readonly toastService: ToastService,
    private readonly translocoService: TranslocoService
  ) {}

  ngOnInit(): void {
    this.getClaims();
  }

  public createClaim(): void {
    if (!this.pedigreeId) {
      return;
    }

    this.isSaving = true;
    this.pedigreeClaimService
      .createClaim({ pedigreeId: this.pedigreeId, message: this.message })
      .subscribe({
        next: () => {
          this.pedigreeId = undefined as any;
          this.message = '';
          this.isSaving = false;
          this.toastService.setMessage({
            severity: 'success',
            summary: this.translocoService.translate('toast.success'),
            detail: this.translocoService.translate(
              'pedigreeClaims.toast.created'
            ),
          });
          this.getClaims();
        },
        error: (error) => {
          this.isSaving = false;
          this.toastService.setMessage({
            severity: 'error',
            summary: this.translocoService.translate('toast.error'),
            detail: error.response || error,
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
    this.pedigreeClaimService.getClaims().subscribe({
      next: (res) => {
        this.claims = res.response;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
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

import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { DatePipe } from '@angular/common';
import { PedigreeClaim } from '../../../core/models/pedigreeClaim';
import { PedigreeClaimService } from '../../../core/services/pedigree-claim.service';
import { ToastService } from '../../../core/services/toast.service';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { PedigreeService } from '../../../core/services/pedigree.service';
import { Pedigree } from '../../../core/models/pedigree';
import { debounceTime, Subject, Subscription } from 'rxjs';
import { environment } from '../../../../environments/environment.development';

type PedigreeClaimSearchResult = Pedigree & { claimDisplayName: string };

@Component({
  selector: 'app-pedigree-claims',
  standalone: true,
  imports: [
    TranslocoModule,
    FormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    TableModule,
    TagModule,
    ProgressSpinnerModule,
    DatePipe,
    DropdownModule,
    MultiSelectModule,
  ],
  templateUrl: './pedigree-claims.component.html',
  styleUrl: './pedigree-claims.component.scss',
})
export class PedigreeClaimsComponent implements OnInit, OnDestroy {
  private readonly searchTerms = new Subject<string>();
  private readonly subscriptions = new Subscription();
  private searchRequestId: number = 0;
  public claims: PedigreeClaim[] = [];
  public pedigreeImagesUrl: string = `${environment.uploads_url}pedigrees/`;
  public searchOption: 'registeredName' | 'dogId' = 'registeredName';
  public searchOptions: Array<'registeredName' | 'dogId'> = [
    'registeredName',
    'dogId',
  ];
  public searchValue: string = '';
  public searchResults: PedigreeClaimSearchResult[] = [];
  public selectedPedigrees: PedigreeClaimSearchResult[] = [];
  public message: string = '';
  public isLoading: boolean = false;
  public isSearching: boolean = false;
  public searchPerformed: boolean = false;
  public hasSearchResults: boolean = false;
  public isSaving: boolean = false;

  constructor(
    private readonly pedigreeClaimService: PedigreeClaimService,
    private readonly pedigreeService: PedigreeService,
    private readonly toastService: ToastService,
    private readonly translocoService: TranslocoService
  ) {}

  ngOnInit(): void {
    this.getClaims();
    this.subscriptions.add(
      this.searchTerms
        .pipe(debounceTime(300))
        .subscribe((value) => {
          if (value === this.searchValue.trim()) {
            this.searchPedigrees(value);
          }
        })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  public createClaim(): void {
    if (this.selectedPedigrees.length === 0) {
      return;
    }

    const selectedCount = this.selectedPedigrees.length;
    this.isSaving = true;
    this.pedigreeClaimService
      .createClaim({
        pedigreeIds: this.selectedPedigrees.map((pedigree) => pedigree.id),
        message: this.message,
      })
      .subscribe({
        next: () => {
          this.searchValue = '';
          this.searchResults = [];
          this.selectedPedigrees = [];
          this.searchPerformed = false;
          this.hasSearchResults = false;
          this.message = '';
          this.isSaving = false;
          this.toastService.setMessage({
            severity: 'success',
            summary: this.translocoService.translate('toast.success'),
            detail: this.translocoService.translate(
              'pedigreeClaims.toast.createdMany',
              { count: selectedCount }
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

  public onPedigreeFilter(value: string): void {
    this.searchValue = value;
    const normalizedValue = value.trim();

    if (!normalizedValue) {
      this.searchRequestId++;
      this.isSearching = false;
      this.searchPerformed = false;
      this.hasSearchResults = false;
      this.searchResults = [...this.selectedPedigrees];
      return;
    }

    this.isSearching = true;
    this.searchPerformed = true;
    this.searchTerms.next(normalizedValue);
  }

  public onSearchOptionChange(): void {
    this.searchResults = [...this.selectedPedigrees];
    this.hasSearchResults = false;

    if (this.searchValue.trim()) {
      this.searchPedigrees(this.searchValue.trim());
    }
  }

  private searchPedigrees(value: string): void {
    const requestId = ++this.searchRequestId;
    const query: any = {
      orderBy: 'id ASC',
      size: 50,
      page: 0,
      [this.searchOption]: value,
    };

    this.pedigreeService.getPedigrees(query).subscribe({
      next: (res) => {
        if (requestId !== this.searchRequestId) {
          return;
        }

        const selectedIds = new Set(
          this.selectedPedigrees.map((pedigree) => pedigree.id)
        );
        const newResults = res.response.data
          .filter((pedigree) => !selectedIds.has(pedigree.id))
          .map((pedigree) => ({
            ...pedigree,
            claimDisplayName: `#${pedigree.id} - ${this.buildFullName(
              pedigree.beforeNameTitles,
              pedigree.name,
              pedigree.afterNameTitles
            )}`,
          }));

        this.hasSearchResults = res.response.data.length > 0;
        this.searchResults = [...this.selectedPedigrees, ...newResults];
        this.isSearching = false;
      },
      error: () => {
        if (requestId !== this.searchRequestId) {
          return;
        }

        this.hasSearchResults = false;
        this.searchResults = [...this.selectedPedigrees];
        this.isSearching = false;
      },
    });
  }

  public removeSelectedPedigree(pedigreeId: number): void {
    this.selectedPedigrees = this.selectedPedigrees.filter(
      (pedigree) => pedigree.id !== pedigreeId
    );
  }

  public getPedigreeImageUrl(pedigree: Pedigree): string {
    if (!pedigree.img) {
      return './assets/images/logo-pedigree.png';
    }

    return pedigree.img.startsWith('http')
      ? pedigree.img
      : this.pedigreeImagesUrl + pedigree.img;
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

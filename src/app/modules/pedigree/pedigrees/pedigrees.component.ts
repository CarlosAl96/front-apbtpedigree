import { Component } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { PedigreeService } from '../../../core/services/pedigree.service';
import { QueryPaginationPedigree } from '../../../core/models/queryPaginationPedigree';
import { Pedigree } from '../../../core/models/pedigree';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { PaginatorModule } from 'primeng/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { LoadingService } from '../../../core/services/loading.service';
import { InputGroupModule } from 'primeng/inputgroup';
import { FightColorPipe } from '../../../core/pipes/fight-color.pipe';
import { fullnameTransformPedigreeList } from '../../../shared/utils/fullname-transform';

@Component({
  selector: 'app-pedigrees',
  standalone: true,
  imports: [
    CardModule,
    ButtonModule,
    TranslocoModule,
    TableModule,
    PaginatorModule,
    ProgressSpinnerModule,
    InputGroupModule,
    FightColorPipe,
  ],
  templateUrl: './pedigrees.component.html',
  styleUrl: './pedigrees.component.scss',
})
export class PedigreesComponent {
  public pedigrees: Pedigree[] = [];
  public totalRows: number = 0;
  public totalPages: number = 0;
  public page: number = 1;
  public isSearching: boolean = false;
  public isLoading: boolean = true;
  public queryPagination: QueryPaginationPedigree = {
    orderBy: 'id ASC',
    size: 50,
    page: 0,
  };

  constructor(
    private readonly pedigreeService: PedigreeService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly loadingService: LoadingService
  ) {
    this.route.queryParams.subscribe((params) => {
      if (params['size'] && params['page'] && params['orderBy']) {
        this.queryPagination.size = Number(params['size']);
        this.queryPagination.page = Number(params['page']);
        this.page = Number(params['page']) + 1;
        this.queryPagination.orderBy = params['orderBy'];

        if (params['registeredName']) {
          this.queryPagination.registeredName = params[
            'registeredName'
          ] as string;
        } else if (params['dogId']) {
          this.queryPagination.dogId = Number(params['dogId']);
        } else if (params['registrationNumber']) {
          this.queryPagination.registrationNumber = params[
            'registrationNumber'
          ] as string;
        } else if (params['callname']) {
          this.queryPagination.callname = params['callname'] as string;
        } else if (params['breeder']) {
          this.queryPagination.breeder = params['breeder'] as string;
        } else if (params['owner']) {
          this.queryPagination.owner = params['owner'] as string;
        } else if (params['userId']) {
          this.queryPagination.userId = Number(params['userId']);
        }
        this.isSearching = true;
        this.getPedigrees(this.queryPagination);
      } else {
        this.isSearching = false;
      }
    });
  }

  public onPageChange(page: number): void {
    this.queryPagination.page = page - 1;
    const queryString = new URLSearchParams(
      this.queryPagination as any
    ).toString();
    window.location.href = `/pedigree?${queryString}`;
  }

  private getPedigrees(query: QueryPaginationPedigree): void {
    this.pedigrees = [];
    this.isLoading = true;
    this.pedigreeService.getPedigrees(query).subscribe({
      next: (res) => {
        this.pedigrees = fullnameTransformPedigreeList(res.response.data);
        this.totalRows = res.response.totalRows;
        this.totalPages = Math.ceil(this.totalRows / this.queryPagination.size);

        console.log('pedigrees', this.pedigrees);

        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
      },
    });
  }

  public goToNewDog(): void {
    window.location.href = '/pedigree/new';
  }

  public goToPedigree(id: number): void {
    window.location.href = '/pedigree/view/' + id;
  }

  public customSort(event: TableLazyLoadEvent): void {
    if (event.sortField) {
      this.queryPagination.orderBy = `${event.sortField} ${
        event.sortOrder == 1 ? 'ASC' : 'DESC'
      }`;
      this.queryPagination.page = 0;
      const queryString = new URLSearchParams(
        this.queryPagination as any
      ).toString();
      window.location.href = `/pedigree?${queryString}`;
    }
  }
}

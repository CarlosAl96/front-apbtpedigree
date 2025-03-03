import { Component, EventEmitter, Output } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { CardModule } from 'primeng/card';
import { QueryPaginationPedigree } from '../../../core/models/queryPaginationPedigree';
import { SessionService } from '../../../core/services/session.service';
import { User } from '../../../core/models/user';
import { Pedigree } from '../../../core/models/pedigree';
import { PedigreeService } from '../../../core/services/pedigree.service';
import { InputNumberModule } from 'primeng/inputnumber';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { LoadingService } from '../../../core/services/loading.service';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { InputGroupModule } from 'primeng/inputgroup';
import { FightColorPipe } from '../../../core/pipes/fight-color.pipe';
import { fullnameTransformPedigreeList } from '../../utils/fullname-transform';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-menu-pedigrees',
  standalone: true,
  imports: [
    TranslocoModule,
    CardModule,
    InputNumberModule,
    FormsModule,
    ButtonModule,
    ProgressSpinnerModule,
    InputGroupModule,
    FightColorPipe,
  ],
  templateUrl: './menu-pedigrees.component.html',
  styleUrl: './menu-pedigrees.component.scss',
})
export class MenuPedigreesComponent {
  @Output() isResults: EventEmitter<boolean> = new EventEmitter<boolean>();

  public rowsCount: number = 12300;
  public idPedigreeActive: number = 0;
  public user!: User | undefined;
  public pedigrees: Pedigree[] = [];
  public totalRows: number = 0;
  public totalPages: number = 0;
  public isLoading: boolean = true;
  public page: number = 1;
  public queryPagination: QueryPaginationPedigree = {
    orderBy: 'id ASC',
    page: 0,
    size: 50,
  };

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly sessionService: SessionService,
    private readonly pedigreeService: PedigreeService,
    private readonly loadingService: LoadingService
  ) {
    this.user = this.sessionService.readSession('USER_TOKEN')?.user;

    this.route.paramMap.subscribe((params) => {
      this.idPedigreeActive = Number(params.get('id'));
    });

    this.route.queryParams.subscribe((params) => {
      if (params['size'] && params['page'] && params['orderBy']) {
        this.queryPagination.size = Number(params['size']);
        this.queryPagination.page = Number(params['page']);
        this.page = Number(params['page']) + 1;
        this.queryPagination.orderBy = params['orderBy'];
      }
    });

    if (this.user) {
      this.queryPagination.userId = this.user.id;
      this.getPedigrees(this.queryPagination);
    }

    this.loadingService.getIsLoading().subscribe((res) => {
      this.isLoading = res;
    });
  }

  private getPedigrees(query: QueryPaginationPedigree): void {
    this.pedigreeService.getPedigrees(query).subscribe((res) => {
      if (res) {
        this.pedigrees = fullnameTransformPedigreeList(res.response.data);
        this.totalRows = res.response.totalRows;
        this.totalPages = Math.ceil(this.totalRows / this.queryPagination.size);

        if (this.pedigrees.length == 0) {
          this.isResults.emit(false);
        } else {
          this.isResults.emit(true);
        }
      }
    });
  }

  public onPageChange(page: number): void {
    this.queryPagination.page = page - 1;
    this.router.navigate(['pedigree/my-pedigrees/' + this.idPedigreeActive], {
      queryParams: this.queryPagination,
    });
  }

  public onClickPedigree(id: number): void {
    this.idPedigreeActive = id;
    this.router.navigate(['pedigree/my-pedigrees/' + this.idPedigreeActive], {
      queryParams: this.queryPagination,
    });
  }
}

import { Component, OnInit } from '@angular/core';
import { SessionService } from '../../../core/services/session.service';
import { User } from '../../../core/models/user';
import {
  LangDefinition,
  TranslocoModule,
  TranslocoService,
} from '@jsverse/transloco';
import { Subscription, take } from 'rxjs';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ActivatedRoute, Router } from '@angular/router';
import { QueryPaginationPedigree } from '../../../core/models/queryPaginationPedigree';
import { LanguageService } from '../../../core/services/language.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    DropdownModule,
    FormsModule,
    InputTextModule,
    ButtonModule,
    TranslocoModule,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit {
  public user!: User | undefined;
  public availableLangs: any[] = [];
  private subscription: Subscription | null = null;
  public activeLang: string = 'en';
  public modelSearch: string = '';
  public modelSearchOption: string = 'registeredName';
  public queryPagination: QueryPaginationPedigree = {
    orderBy: 'id ASC',
    size: 50,
    page: 0,
  };
  public searchOptions: string[] = [
    'registeredName',
    'dogId',
    'registrationNumber',
    'callname',
    'breeder',
    'owner',
  ];

  constructor(
    private readonly sessionService: SessionService,
    private readonly translocoService: TranslocoService,
    public readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly languageService: LanguageService
  ) {
    this.availableLangs =
      this.translocoService.getAvailableLangs() as LangDefinition[];
  }

  ngOnInit(): void {
    this.user = this.sessionService.readSession('USER_TOKEN')?.user;
    this.activeLang = this.languageService.getSavedLanguage();
    if (this.router.url.startsWith('/pedigree?')) {
      this.route.queryParams.subscribe((params) => {
        if (params['size'] && params['page'] && params['orderBy']) {
          if (params['registeredName']) {
            this.modelSearch = params['registeredName'];
            this.modelSearchOption = 'registeredName';
          } else if (params['dogId']) {
            this.modelSearch = params['dogId'];
            this.modelSearchOption = 'dogId';
          } else if (params['registrationNumber']) {
            this.modelSearchOption = 'registrationNumber';
            this.modelSearch = params['registrationNumber'];
          } else if (params['callname']) {
            this.modelSearchOption = 'callname';
            this.modelSearch = params['callname'];
          } else if (params['breeder']) {
            this.modelSearchOption = 'breeder';
            this.modelSearch = params['breeder'];
          } else if (params['owner']) {
            this.modelSearchOption = 'owner';
            this.modelSearch = params['owner'];
          } else if (params['userId']) {
            this.modelSearchOption = 'userId';
            this.modelSearch = params['userId'];
          }
        }
      });
    }
  }

  public changeLang(event: any): void {
    this.subscription?.unsubscribe();
    this.subscription = this.translocoService
      .load(event.value)
      .pipe(take(1))
      .subscribe(() => {
        this.translocoService.setActiveLang(event.value);
      });

    this.languageService.setLanguage(event.value);
  }

  public goToAdmin(): void {
    window.location.href = '/admin';
  }

  public goToUserMode(): void {
    window.location.href = '/';
  }

  public search(): void {
    this.queryPagination = { orderBy: 'id ASC', size: 50, page: 0 };

    if (this.modelSearchOption === 'registeredName') {
      this.queryPagination.registeredName = this.modelSearch as string;
    } else if (this.modelSearchOption === 'dogId') {
      this.queryPagination.dogId = Number(this.modelSearch);
    } else if (this.modelSearchOption === 'registrationNumber') {
      this.queryPagination.registrationNumber = this.modelSearch as string;
    } else if (this.modelSearchOption === 'callname') {
      this.queryPagination.callname = this.modelSearch as string;
    } else if (this.modelSearchOption === 'breeder') {
      this.queryPagination.breeder = this.modelSearch as string;
    } else if (this.modelSearchOption === 'owner') {
      this.queryPagination.owner = this.modelSearch as string;
    } else if (this.modelSearchOption === 'userId') {
      this.queryPagination.userId = Number(this.modelSearch);
    }

    const queryString = new URLSearchParams(
      this.queryPagination as any
    ).toString();
    window.location.href = `/pedigree/0?${queryString}`;
  }
}

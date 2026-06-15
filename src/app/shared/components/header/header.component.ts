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
import { AdminChatButtonComponent } from '../admin-chat-button/admin-chat-button.component';
import { UppercaseInputDirective } from '../../directives/uppercase-input.directive';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    DropdownModule,
    FormsModule,
    InputTextModule,
    ButtonModule,
    AutoCompleteModule,
    TranslocoModule,
    AdminChatButtonComponent,
    UppercaseInputDirective,
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
  public filteredUsers: User[] = [];
  public selectedOwnerUser: User | null = null;
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
    private readonly languageService: LanguageService,
    private readonly authService: AuthService
  ) {
    this.availableLangs =
      this.translocoService.getAvailableLangs() as LangDefinition[];
  }

  ngOnInit(): void {
    this.user = this.sessionService.readSession('USER_TOKEN')?.user;
    this.activeLang = this.languageService.getSavedLanguage();
    if (
      this.router.url.startsWith('/pedigree') &&
      !this.router.url.startsWith('/pedigree/my-pedigrees/')
    ) {
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
            this.modelSearchOption = 'owner';
            this.modelSearch = params['userId'];
            this.selectedOwnerUser = this.buildOwnerUser(
              Number(params['userId']),
              params['ownerName'] || `ID ${params['userId']}`
            );
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
      this.modelSearch = this.normalizeSearchValue(
        this.modelSearchOption,
        this.modelSearch
      );
      this.queryPagination.registeredName = this.modelSearch as string;
    } else if (this.modelSearchOption === 'dogId') {
      this.modelSearch = this.normalizeSearchValue(
        this.modelSearchOption,
        this.modelSearch
      );
      this.queryPagination.dogId = Number(this.modelSearch);
    } else if (this.modelSearchOption === 'registrationNumber') {
      this.modelSearch = this.normalizeSearchValue(
        this.modelSearchOption,
        this.modelSearch
      );
      this.queryPagination.registrationNumber = this.modelSearch as string;
    } else if (this.modelSearchOption === 'callname') {
      this.modelSearch = this.normalizeSearchValue(
        this.modelSearchOption,
        this.modelSearch
      );
      this.queryPagination.callname = this.modelSearch as string;
    } else if (this.modelSearchOption === 'breeder') {
      this.modelSearch = this.normalizeSearchValue(
        this.modelSearchOption,
        this.modelSearch
      );
      this.queryPagination.breeder = this.modelSearch as string;
    } else if (this.modelSearchOption === 'owner') {
      if (!this.selectedOwnerUser?.id) {
        return;
      }

      this.queryPagination.userId = this.selectedOwnerUser.id;
      this.queryPagination.ownerName = this.selectedOwnerUser.username;
    } else if (this.modelSearchOption === 'userId') {
      this.queryPagination.userId = Number(this.modelSearch);
    }

    const queryString = new URLSearchParams(
      this.queryPagination as any
    ).toString();
    window.location.href = `/pedigree?${queryString}`;
  }

  public onSearchOptionChange(): void {
    this.modelSearch = '';
    this.filteredUsers = [];
    this.selectedOwnerUser = null;
  }

  public searchUsers(query: string): void {
    this.authService.searchUsers(query || '').subscribe({
      next: (res) => {
        this.filteredUsers = res.response;
      },
      error: () => {
        this.filteredUsers = [];
      },
    });
  }

  public clearOwnerSearch(): void {
    this.selectedOwnerUser = null;
    this.filteredUsers = [];
  }

  public isSearchDisabled(): boolean {
    if (this.modelSearchOption === 'owner') {
      return !this.selectedOwnerUser?.id;
    }

    return this.modelSearch === '';
  }

  public getUserDisplayName(user: User): string {
    return [user.first_name, user.last_name].filter(Boolean).join(' ');
  }

  private normalizeSearchValue(searchOption: string, value: string): string {
    return searchOption === 'dogId' || searchOption === 'userId'
      ? value
      : value.toUpperCase();
  }

  private buildOwnerUser(id: number, username: string): User {
    return { id, username } as User;
  }
}

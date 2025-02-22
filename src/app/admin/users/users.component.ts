import { Component, OnInit } from '@angular/core';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { DateHourFormatPipe } from '../../core/pipes/date-hour-format.pipe';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { User } from '../../core/models/user';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ToastService } from '../../core/services/toast.service';
import { ConfirmationService } from 'primeng/api';
import { AuthService } from '../../core/services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { QueryPagination } from '../../core/models/queryPagination';
import { DropdownChangeEvent, DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { DropOption } from '../../core/models/dropOption';
import { combineLatest } from 'rxjs';
import { NewUserComponent } from './new-user/new-user.component';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CardModule,
    ButtonModule,
    TranslocoModule,
    TableModule,
    PaginatorModule,
    DateHourFormatPipe,
    ConfirmDialogModule,
    DropdownModule,
    FormsModule,
    InputTextModule,
    TooltipModule,
  ],
  providers: [DialogService, ConfirmationService],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss',
})
export class UsersComponent implements OnInit {
  public dialogRef!: DynamicDialogRef;
  public totalRows: number = 0;
  public first: number = 0;
  public users: User[] = [];
  public isLoading: boolean = false;
  public modelActive: number = 2;
  public modelSearch: string = '';
  public activeOptions: DropOption[] = [];
  public queryPagination: QueryPagination = {
    orderBy: 'id ASC',
    size: 50,
    page: 0,
    active: 2,
  };

  constructor(
    private readonly dialogService: DialogService,
    private readonly messageService: ToastService,
    private readonly confirmationService: ConfirmationService,
    private readonly translocoService: TranslocoService,
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {
    this.translocoService.langChanges$.subscribe((res) => {
      combineLatest([
        this.translocoService.selectTranslate('activeOptions.alls'),
        this.translocoService.selectTranslate('activeOptions.active'),
        this.translocoService.selectTranslate('activeOptions.inactive'),
        this.translocoService.selectTranslate('activeOptions.forumBanned'),
        this.translocoService.selectTranslate('activeOptions.subscribers'),
        this.translocoService.langChanges$,
      ]).subscribe(([alls, active, inactive, forumBanned, subscribers]) => {
        this.activeOptions = [
          { name: alls, code: 2 },
          { name: active, code: 1 },
          { name: inactive, code: 0 },
          { name: subscribers, code: 4 },
          { name: forumBanned, code: 3 },
        ];
      });
    });

    this.route.queryParams.subscribe((params) => {
      if (params['size'] && params['page'] && params['orderBy']) {
        this.queryPagination.size = Number(params['size']);
        this.queryPagination.page = Number(params['page']);
        this.queryPagination.orderBy = params['orderBy'];

        this.first = this.queryPagination.page * this.queryPagination.size;
        if (params['search']) {
          this.queryPagination.search = params['search'] as string;
          this.modelSearch = this.queryPagination.search;
        }

        if (params['active']) {
          this.queryPagination.active = Number(params['active']);
          this.modelActive = this.queryPagination.active;
        }
      }
    });
  }

  ngOnInit(): void {
    this.getUsers(this.queryPagination);
  }

  private getUsers(query: QueryPagination): void {
    this.users = [];
    this.isLoading = true;
    this.authService.getUsers(query).subscribe({
      next: (res) => {
        this.users = res.response.data;
        console.log(this.users);

        this.totalRows = res.response.totalRows;
        this.isLoading = false;
      },
      error: (error) => {
        console.log(error);
        this.isLoading = false;
      },
    });
  }

  public showCreateModal(): void {
    this.dialogRef = this.dialogService.open(NewUserComponent, {
      header: this.translocoService.translate('buttons.newUser'),
      width: '70rem',
    });

    this.onCloseModal();
  }

  public showEditModal(forumCategory: User): void {
    this.dialogRef = this.dialogService.open(NewUserComponent, {
      data: forumCategory,
      header: this.translocoService.translate('buttons.editUser'),
      width: '70rem',
    });

    this.onCloseModal();
  }

  private onCloseModal(): void {
    this.dialogRef.onClose.subscribe(() => {
      this.getUsers(this.queryPagination);
    });
  }

  public deleteUser(id: number): void {
    this.confirmationService.confirm({
      message: this.translocoService.translate('users.deleteMessage'),
      header: this.translocoService.translate('users.delete'),
      icon: 'pi pi-exclamation-triangle',
      acceptIcon: 'pi pi-trash mr-2',
      rejectIcon: 'pi pi-times mr-2',
      acceptButtonStyleClass: 'p-button-danger',
      acceptLabel: this.translocoService.translate('buttons.yes'),
      rejectLabel: this.translocoService.translate('buttons.no'),
      accept: () => {
        this.authService.deleteUser(id).subscribe({
          next: (res) => {
            this.users = this.users.filter((user) => user.id !== id);
            this.getUsers(this.queryPagination);
            this.messageService.setMessage({
              severity: 'success',
              summary: this.translocoService.translate('toast.success'),
              detail: this.translocoService.translate('toast.deleteMessage2'),
            });
          },
          error: (error) => {
            this.messageService.setMessage({
              severity: 'error',
              summary: this.translocoService.translate('toast.error'),
              detail: this.translocoService.translate('toast.deleteError'),
            });
          },
        });
      },
      reject: () => {},
    });
  }

  public forumBan(id: number, value: boolean): void {
    this.confirmationService.confirm({
      message: value
        ? this.translocoService.translate('users.unbanMessage')
        : this.translocoService.translate('users.banMessage'),
      header: value
        ? this.translocoService.translate('users.forumUnban')
        : this.translocoService.translate('users.forumBan'),
      icon: 'pi pi-exclamation-triangle',
      acceptIcon: value ? 'pi pi-volume-up mr-2' : 'pi pi-volume-off mr-2',
      rejectIcon: 'pi pi-times mr-2',
      acceptButtonStyleClass: value ? '' : 'p-button-warning',
      acceptLabel: this.translocoService.translate('buttons.yes'),
      rejectLabel: this.translocoService.translate('buttons.no'),
      accept: () => {
        this.authService.forumBan({ value: !value }, id).subscribe({
          next: (res) => {
            this.queryPagination.page = 0;
            this.users = this.users.map((user) => {
              if (user.id === id) {
                user.forum_ban = !value;
              }
              return user;
            });
            this.messageService.setMessage({
              severity: 'success',
              summary: this.translocoService.translate('toast.success'),
              detail: this.translocoService.translate('toast.updateMessage'),
            });
          },
          error: (error) => {
            this.messageService.setMessage({
              severity: 'error',
              summary: this.translocoService.translate('toast.error'),
              detail: this.translocoService.translate('toast.updateError'),
            });
          },
        });
      },
      reject: () => {},
    });
  }

  public disableUser(id: number, value: boolean): void {
    this.confirmationService.confirm({
      message: value
        ? this.translocoService.translate('users.desactivateUser')
        : this.translocoService.translate('users.activateUser'),
      header: value
        ? this.translocoService.translate('activeOptions.desactivateUser')
        : this.translocoService.translate('activeOptions.activateUser'),
      icon: 'pi pi-exclamation-triangle',
      acceptIcon: value ? 'pi pi-ban mr-2' : 'pi pi-check mr-2',
      rejectIcon: 'pi pi-times mr-2',
      acceptButtonStyleClass: value ? 'p-button-danger' : '',
      acceptLabel: this.translocoService.translate('buttons.yes'),
      rejectLabel: this.translocoService.translate('buttons.no'),
      accept: () => {
        this.authService.disableOrEnableUser({ value: !value }, id).subscribe({
          next: (res) => {
            this.queryPagination.page = 0;
            this.users = this.users.map((user) => {
              if (user.id === id) {
                user.is_enabled = !value;
              }
              return user;
            });
            this.messageService.setMessage({
              severity: 'success',
              summary: this.translocoService.translate('toast.success'),
              detail: this.translocoService.translate('toast.updateMessage'),
            });
          },
          error: (error) => {
            this.messageService.setMessage({
              severity: 'error',
              summary: this.translocoService.translate('toast.error'),
              detail: this.translocoService.translate('toast.updateError'),
            });
          },
        });
      },
      reject: () => {},
    });
  }

  public search(): void {
    this.queryPagination = { orderBy: 'id ASC', size: 50, page: 0 };
    this.queryPagination.search = this.modelSearch as string;
    this.router.navigate(['admin/users'], {
      queryParams: this.queryPagination,
    });
  }

  public onChangeActiveOptions(event: DropdownChangeEvent) {
    this.queryPagination.active = event.value;
    this.router.navigate(['admin/users'], {
      queryParams: this.queryPagination,
    });
  }

  public onPageChange(event: any): void {
    this.queryPagination.page = event.page;
    this.router.navigate(['admin/users'], {
      queryParams: this.queryPagination,
    });
  }
}

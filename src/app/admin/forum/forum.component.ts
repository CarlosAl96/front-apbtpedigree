import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ForumCategory } from '../../core/models/forumCategory';
import { ForumService } from '../../core/services/forum.service';
import { QueryPagination } from '../../core/models/queryPagination';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { TableModule } from 'primeng/table';
import { PaginatorModule } from 'primeng/paginator';
import { DateHourFormatPipe } from '../../core/pipes/date-hour-format.pipe';
import { ToastService } from '../../core/services/toast.service';
import { ConfirmationService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { NewCategoryComponent } from './new-category/new-category.component';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SocketService } from '../../core/services/socket.service';

@Component({
  selector: 'app-forum',
  standalone: true,
  imports: [
    CardModule,
    ButtonModule,
    TranslocoModule,
    TableModule,
    PaginatorModule,
    DateHourFormatPipe,
    ConfirmDialogModule,
  ],
  providers: [DialogService, ConfirmationService],
  templateUrl: './forum.component.html',
  styleUrl: './forum.component.scss',
})
export class ForumComponent implements OnDestroy {
  public forumCategories: ForumCategory[] = [];
  public dialogRef!: DynamicDialogRef;
  public totalRows: number = 0;
  public first: number = 0;
  public queryPagination: QueryPagination = {
    size: 50,
    page: 0,
  };

  constructor(
    private readonly forumService: ForumService,
    private readonly dialogService: DialogService,
    private readonly messageService: ToastService,
    private readonly confirmationService: ConfirmationService,
    private readonly translocoService: TranslocoService,
    private readonly socketService: SocketService
  ) {
    this.getCategories(this.queryPagination);

    this.socketService.onForum().subscribe({
      next: (res) => {
        this.getCategories(this.queryPagination);
      },
    });
  }

  private getCategories(query: QueryPagination): void {
    this.forumService.getCategories(query).subscribe({
      next: (res) => {
        this.forumCategories = res.response.data;
        this.totalRows = res.response.totalRows;

        this.forumCategories.map((category) => {
          category.last_post_info = this.getLastPostInfo(category.last_post);
          category.moderators = this.getModerators(category.moderators);
        });

        this.forumCategories.map(
          (category) =>
            (category.last_post = this.getLastPostInfo(category.last_post))
        );
      },
      error: (error) => {},
    });
  }

  public showCreateModal(): void {
    this.dialogRef = this.dialogService.open(NewCategoryComponent, {
      header: this.translocoService.translate('buttons.newCategory'),
      width: '50rem',
    });

    this.onCloseModal();
  }

  public showEditModal(forumCategory: ForumCategory): void {
    this.dialogRef = this.dialogService.open(NewCategoryComponent, {
      data: forumCategory,
      header: this.translocoService.translate('buttons.editCategory'),
      width: '50rem',
    });

    this.onCloseModal();
  }

  private onCloseModal(): void {
    this.dialogRef.onClose.subscribe(() => {
      this.getCategories(this.queryPagination);
    });
  }

  public deleteCategory(id: number): void {
    this.confirmationService.confirm({
      message: this.translocoService.translate('forum.deleteQuestion'),
      header: this.translocoService.translate('forum.deleteCategory'),
      icon: 'pi pi-exclamation-triangle',
      acceptIcon: 'pi pi-trash mr-2',
      rejectIcon: 'pi pi-times mr-2',
      acceptButtonStyleClass: 'p-button-danger',
      acceptLabel: this.translocoService.translate('buttons.yes'),
      rejectLabel: this.translocoService.translate('buttons.no'),
      accept: () => {
        this.forumService.deleteCategory(id).subscribe({
          next: (res) => {
            this.queryPagination.page = 0;
            this.getCategories(this.queryPagination);
            this.messageService.setMessage({
              severity: 'success',
              summary: this.translocoService.translate('toast.success'),
              detail: this.translocoService.translate('toast.categoryDeleted'),
            });
          },
          error: (error) => {
            this.messageService.setMessage({
              severity: 'error',
              summary: this.translocoService.translate('toast.error'),
              detail: this.translocoService.translate(
                'toast.categoryDeletedError'
              ),
            });
          },
        });
      },
      reject: () => {},
    });
  }

  public lockCategory(id: number, value: boolean): void {
    this.confirmationService.confirm({
      message: value
        ? this.translocoService.translate('forum.unlockQuestion')
        : this.translocoService.translate('forum.lockQuestion'),
      header: value
        ? this.translocoService.translate('forum.unlockCategory')
        : this.translocoService.translate('forum.lockCategory'),
      icon: 'pi pi-exclamation-triangle',
      acceptIcon: value ? 'pi pi-lock-open mr-2' : 'pi pi-lock mr-2',
      rejectIcon: 'pi pi-times mr-2',
      acceptButtonStyleClass: value ? '' : 'p-button-warning',
      acceptLabel: this.translocoService.translate('buttons.yes'),
      rejectLabel: this.translocoService.translate('buttons.no'),
      accept: () => {
        this.forumCategories.map((category) => {
          if (category.id === id) {
            category.is_locked = !value;
          }
        });
        this.forumService.lockOrUnlockCategory(id).subscribe({
          next: (res) => {
            this.queryPagination.page = 0;
            this.getCategories(this.queryPagination);
            this.messageService.setMessage({
              severity: 'success',
              summary: this.translocoService.translate('toast.success'),
              detail: this.translocoService.translate('toast.categoryEdited'),
            });
          },
          error: (error) => {
            this.messageService.setMessage({
              severity: 'error',
              summary: this.translocoService.translate('toast.error'),
              detail: this.translocoService.translate(
                'toast.categoryEditedError'
              ),
            });
          },
        });
      },
      reject: () => {},
    });
  }

  public onPageChange(event: any): void {
    this.queryPagination.page = event.page;
    this.first = this.queryPagination.page * this.queryPagination.size;
    this.getCategories(this.queryPagination);
  }

  public getLastPostInfo(lastPost: string): any {
    if (lastPost) {
      const jsonObject = JSON.parse(lastPost);
      return jsonObject;
    }
    return null;
  }

  public getModerators(moderators: string): any {
    if (moderators) {
      const jsonObject = JSON.parse(moderators);
      return jsonObject.join(', ');
    }
    return null;
  }

  ngOnDestroy() {
    this.socketService.disconnect();
  }
}

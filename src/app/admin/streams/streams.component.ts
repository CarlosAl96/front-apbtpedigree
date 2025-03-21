import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { Stream } from '../../core/models/stream';
import { QueryPagination } from '../../core/models/queryPagination';
import { ToastService } from '../../core/services/toast.service';
import { ConfirmationService } from 'primeng/api';
import { StreamService } from '../../core/services/stream.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NewStreamComponent } from './new-stream/new-stream.component';
import { DateHourFormatPipe } from '../../core/pipes/date-hour-format.pipe';

@Component({
  selector: 'app-streams',
  standalone: true,
  imports: [
    CardModule,
    ButtonModule,
    TranslocoModule,
    TableModule,
    PaginatorModule,
    ConfirmDialogModule,
    FormsModule,
    InputTextModule,
    TooltipModule,
    DateHourFormatPipe,
  ],
  providers: [ConfirmationService, DialogService],
  templateUrl: './streams.component.html',
  styleUrl: './streams.component.scss',
})
export class StreamsComponent implements OnInit {
  public dialogRef!: DynamicDialogRef;
  public totalRows: number = 0;
  public first: number = 0;
  public streams: Stream[] = [];
  public streamActive!: Stream | null;
  public isLoading: boolean = false;
  public modelSearch: string = '';
  public queryPagination: QueryPagination = {
    size: 50,
    page: 0,
  };
  constructor(
    private readonly dialogService: DialogService,
    private readonly messageService: ToastService,
    private readonly confirmationService: ConfirmationService,
    private readonly translocoService: TranslocoService,
    private readonly streamService: StreamService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {
    this.route.queryParams.subscribe((params) => {
      if (params['size'] && params['page']) {
        this.queryPagination.size = Number(params['size']);
        this.queryPagination.page = Number(params['page']);

        this.first = this.queryPagination.page * this.queryPagination.size;
        if (params['search']) {
          this.queryPagination.search = params['search'] as string;
          this.modelSearch = this.queryPagination.search;
        }
      }
    });
  }

  ngOnInit(): void {
    this.getStreams(this.queryPagination);
    this.getActiveStream();
  }

  private getStreams(query: QueryPagination): void {
    this.isLoading = true;
    this.streamService.getStreams(query).subscribe({
      next: (res) => {
        this.streams = res.response.data;

        this.totalRows = res.response.totalRows;
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
      },
    });
  }

  private getActiveStream(): void {
    this.streamService.getActiveStream().subscribe({
      next: (res) => {
        this.streamActive = res.response;
      },
      error: (error) => {},
    });
  }

  public showCreateModal(): void {
    const data: any = {
      option: 'create',
    };
    this.dialogRef = this.dialogService.open(NewStreamComponent, {
      data: data,
      header: this.translocoService.translate('buttons.newStream'),
      width: '40rem',
    });

    this.onCloseModal();
  }

  public showEditModal(stream: Stream): void {
    const data: any = {
      stream: stream,
      option: 'edit',
    };
    this.dialogRef = this.dialogService.open(NewStreamComponent, {
      data: data,
      header: this.translocoService.translate('buttons.editStream'),
      width: '40rem',
    });

    this.onCloseModal();
  }

  private onCloseModal(): void {
    this.dialogRef.onClose.subscribe(() => {
      this.getStreams(this.queryPagination);
      this.getActiveStream();
    });
  }

  public setLiveStream(): void {
    this.confirmationService.confirm({
      message: !this.streamActive?.is_live
        ? this.translocoService.translate('stream.liveStreamQuestion')
        : this.translocoService.translate('stream.endStreamQuestion'),
      header: !this.streamActive?.is_live
        ? this.translocoService.translate('stream.liveStream')
        : this.translocoService.translate('stream.endStream'),
      icon: 'pi pi-exclamation-triangle',
      acceptIcon: !this.streamActive?.is_live
        ? 'pi pi-play-circle mr-2'
        : 'pi pi-stop-circle mr-2',
      rejectIcon: 'pi pi-times mr-2',
      acceptButtonStyleClass: !this.streamActive?.is_live
        ? 'p-button-success'
        : 'p-button-danger',
      acceptLabel: this.translocoService.translate('buttons.yes'),
      rejectLabel: this.translocoService.translate('buttons.no'),
      accept: () => {
        const request: any = {
          value: !this.streamActive?.is_live,
          init: new Date(),
          end: new Date(),
        };

        this.streamService
          .setLiveStream(this.streamActive?.id ?? 0, request)
          .subscribe({
            next: (res) => {
              this.getStreams(this.queryPagination);

              if (this.streamActive != null) {
                if (this.streamActive?.is_live) {
                  this.streamActive = null;
                } else {
                  this.streamActive.is_live = true;
                }
              }

              this.messageService.setMessage({
                severity: 'success',
                summary: this.translocoService.translate('toast.success'),
                detail: this.translocoService.translate('toast.streamUpdated'),
              });
            },
            error: (error) => {
              this.messageService.setMessage({
                severity: 'error',
                summary: this.translocoService.translate('toast.error'),
                detail: this.translocoService.translate(
                  'toast.streamUpdatedError'
                ),
              });
            },
          });
      },
      reject: () => {},
    });
  }

  public reAnnounceStream(id: number): void {
    this.confirmationService.confirm({
      message: this.translocoService.translate('stream.reAnnounceQuestion'),
      header: this.translocoService.translate('stream.reAnnounce'),
      icon: 'pi pi-exclamation-triangle',
      acceptIcon: 'pi pi-megaphone mr-2',
      rejectIcon: 'pi pi-times mr-2',
      acceptButtonStyleClass: 'p-button-danger',
      acceptLabel: this.translocoService.translate('buttons.yes'),
      rejectLabel: this.translocoService.translate('buttons.no'),
      accept: () => {
        this.streamService.reAnnounceStream(id).subscribe({
          next: (res) => {
            this.getStreams(this.queryPagination);
            this.getActiveStream();
            this.messageService.setMessage({
              severity: 'success',
              summary: this.translocoService.translate('toast.success'),
              detail: this.translocoService.translate('toast.streamUpdated'),
            });
          },
          error: (error) => {
            this.messageService.setMessage({
              severity: 'error',
              summary: this.translocoService.translate('toast.error'),
              detail: this.translocoService.translate(
                'toast.streamUpdatedError'
              ),
            });
          },
        });
      },
      reject: () => {},
    });
  }

  public search(): void {
    this.queryPagination = { size: 50, page: 0 };
    this.queryPagination.search = this.modelSearch as string;

    const queryString = new URLSearchParams(
      this.queryPagination as any
    ).toString();
    window.location.href = `/admin/streams?${queryString}`;
  }

  public onPageChange(event: any): void {
    this.queryPagination.page = event.page;

    const queryString = new URLSearchParams(
      this.queryPagination as any
    ).toString();
    window.location.href = `/admin/streams?${queryString}`;
  }
}

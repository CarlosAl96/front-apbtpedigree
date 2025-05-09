import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { DropOption } from '../../../core/models/dropOption';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ForumCategory } from '../../../core/models/forumCategory';
import { ForumTopic } from '../../../core/models/forumTopic';
import { ForumService } from '../../../core/services/forum.service';
import { QueryPagination } from '../../../core/models/queryPagination';
import { combineLatest, Subscription } from 'rxjs';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastService } from '../../../core/services/toast.service';
import { PaginatorModule } from 'primeng/paginator';
import { InputTextModule } from 'primeng/inputtext';
import { User } from '../../../core/models/user';
import { SessionService } from '../../../core/services/session.service';
import { SocketService } from '../../../core/services/socket.service';

@Component({
  selector: 'app-topics-list',
  standalone: true,
  imports: [
    TranslocoModule,
    CardModule,
    DropdownModule,
    ButtonModule,
    TableModule,
    ReactiveFormsModule,
    FormsModule,
    ConfirmDialogModule,
    PaginatorModule,
    InputTextModule,
  ],
  providers: [ConfirmationService],
  templateUrl: './topics-list.component.html',
  styleUrl: './topics-list.component.scss',
})
export class TopicsListComponent implements OnInit {
  public idCategory: number = 0;
  public modelCategory: number = 0;
  public modelPrevious: string = '';
  public modelSearch: string = '';
  public isLoading: boolean = false;
  public forumCategory!: ForumCategory;
  public forumCategories: ForumCategory[] = [];
  public previousOptions: DropOption[] = [
    { name: 'All topics', code: '' },
    { name: '1 Days', code: '1_days' },
    { name: '2 Days', code: '2_days' },
    { name: '3 Days', code: '3_days' },
    { name: '4 Days', code: '4_days' },
    { name: '5 Days', code: '5_days' },
    { name: '6 Days', code: '6_days' },
    { name: '7 Days', code: '7_days' },
    { name: '1 Year', code: '1_year' },
  ];
  public user!: User | undefined;
  public topics: ForumTopic[] = [];
  public first: number = 0;
  public totalRows: number = 0;
  private subscription: Subscription | null = null;
  private currentLang: string = '';
  public queryPagination: QueryPagination = {
    size: 10,
    page: 0,
  };

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly forumService: ForumService,
    private readonly translocoService: TranslocoService,
    private readonly confirmationService: ConfirmationService,
    private readonly messageService: ToastService,
    private readonly sessionService: SessionService,
    private readonly socketService: SocketService
  ) {
    this.user = this.sessionService.readSession('USER_TOKEN')?.user;

    this.getCategories();
    this.route.paramMap.subscribe((params) => {
      this.idCategory = Number(params.get('idCategory'));
      this.isLoading = true;
      this.modelCategory = this.idCategory;
      this.getCategory(this.idCategory);
    });

    this.socketService.onForum().subscribe({
      next: (res) => {
        console.log(res);

        if (res.id_category == this.idCategory) {
          this.getTopicsFromCategory(this.idCategory);
        }
      },
    });

    this.translocoService.langChanges$.subscribe((res) => {
      combineLatest([
        this.translocoService.selectTranslate('forum.previous.all'),
        this.translocoService.selectTranslate('forum.previous.1days'),
        this.translocoService.selectTranslate('forum.previous.2days'),
        this.translocoService.selectTranslate('forum.previous.3days'),
        this.translocoService.selectTranslate('forum.previous.4days'),
        this.translocoService.selectTranslate('forum.previous.5days'),
        this.translocoService.selectTranslate('forum.previous.6days'),
        this.translocoService.selectTranslate('forum.previous.7days'),
        this.translocoService.selectTranslate('forum.previous.1year'),
        this.translocoService.langChanges$,
      ]).subscribe(
        ([
          all,
          days_1,
          days_2,
          days_3,
          days_4,
          days_5,
          days_6,
          days_7,
          year_1,
        ]) => {
          this.previousOptions = [
            { name: all, code: '' },
            { name: days_1, code: '1_days' },
            { name: days_2, code: '2_days' },
            { name: days_3, code: '3_days' },
            { name: days_4, code: '4_days' },
            { name: days_5, code: '5_days' },
            { name: days_6, code: '6_days' },
            { name: days_7, code: '7_days' },
            { name: year_1, code: '1_year' },
          ];
        }
      );
    });

    this.route.queryParams.subscribe((params) => {
      if (params['size'] && params['page']) {
        this.queryPagination.size = Number(params['size']);
        this.queryPagination.page = Number(params['page']);

        this.first = this.queryPagination.page * this.queryPagination.size;
        if (params['search']) {
          this.queryPagination.search = params['search'] as string;
          this.modelSearch = this.queryPagination.search;
        }

        if (params['previous']) {
          this.queryPagination.previous = params['previous'] as string;
          this.modelPrevious = this.queryPagination.previous;
        }
      }
    });
  }
  ngOnInit(): void {
    this.subscription?.unsubscribe();
    this.subscription = this.translocoService.langChanges$.subscribe((lang) => {
      this.currentLang = lang;
    });

    this.getTopicsFromCategory(this.idCategory);
  }

  private getCategory(id: number) {
    this.forumService.getCategoryById(id).subscribe({
      next: (res) => {
        this.forumCategory = res.response;
        this.forumCategory.moderators = this.getModerators(
          this.forumCategory.moderators
        );
      },
      error: (error) => {},
    });
  }

  private getCategories(): void {
    this.forumService.getCategories({ size: 100000, page: 0 }).subscribe({
      next: (res) => {
        this.forumCategories = res.response.data;
      },
      error: (error) => {},
    });
  }

  private getTopicsFromCategory(idCategory: number): void {
    this.forumService.getTopics(this.queryPagination, idCategory).subscribe({
      next: (res) => {
        this.totalRows = res.response.totalRows;
        this.topics = res.response.data;

        this.topics.map((topic) => {
          topic.last_post_info = this.getLastPostInfo(topic.last_post);
          topic.is_popular = this.getIsPopular(topic.views, topic.replies);
        });
      },
      error: (error) => {},
    });
  }

  public changeCategory(): void {
    if (this.modelCategory > 0) {
      window.location.href = `/forum/topics/${this.modelCategory}`;
    }
  }

  public changePreviousOption(): void {
    this.queryPagination.previous = this.modelPrevious;
    this.queryPagination.page = 0;

    const queryString = new URLSearchParams(
      this.queryPagination as any
    ).toString();
    window.location.href = `/forum/topics/${this.idCategory}?${queryString}`;
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
      return jsonObject;
    }
    return [];
  }

  public goToNewTopic(): void {
    window.location.href = `/forum/topics/new/${this.forumCategory.id}`;
  }

  public goToLastPost(idTopic: number): void {
    const query: QueryPagination = {
      size: 20,
      page: 0,
      order: 'ASC',
    };
    const queryString = new URLSearchParams({
      ...query,
      opt: 'last',
    } as any).toString();
    window.location.href = `/forum/posts/${idTopic}?${queryString}`;
  }

  public goToEditTopic(idTopic: number): void {
    window.location.href = `/forum/topics/new/${this.forumCategory.id}?opt=edit&id=${idTopic}`;
  }

  public setSticky(idTopic: number, value: boolean): void {
    this.confirmationService.confirm({
      message: value
        ? this.translocoService.translate('forum.unstickyTopicQuestion')
        : this.translocoService.translate('forum.stickyTopicQuestion'),
      header: value
        ? this.translocoService.translate('forum.unstickyTopic')
        : this.translocoService.translate('forum.stickyTopic'),
      icon: 'pi pi-exclamation-triangle',
      acceptIcon: 'pi pi-check mr-2',
      rejectIcon: 'pi pi-times mr-2',
      acceptLabel: this.translocoService.translate('buttons.yes'),
      rejectLabel: this.translocoService.translate('buttons.no'),
      accept: () => {
        this.topics.map((topic) => {
          if (topic.id === idTopic) {
            topic.sticky = !value;
          }
        });
        this.forumService.setStickyTopic(idTopic).subscribe({
          next: (res) => {
            this.messageService.setMessage({
              severity: 'success',
              summary: this.translocoService.translate('toast.success'),
              detail: this.translocoService.translate('toast.updateTopic'),
            });
          },
          error: (error) => {
            this.messageService.setMessage({
              severity: 'error',
              summary: this.translocoService.translate('toast.error'),
              detail: this.translocoService.translate('toast.updateTopicError'),
            });
          },
        });
      },
      reject: () => {},
    });
  }

  public setAnnouncement(idTopic: number, value: boolean): void {
    this.confirmationService.confirm({
      message: value
        ? this.translocoService.translate('forum.unannouncementTopicQuestion')
        : this.translocoService.translate('forum.announcementTopicQuestion'),
      header: value
        ? this.translocoService.translate('forum.unannouncementTopic')
        : this.translocoService.translate('forum.announcementTopic'),
      icon: 'pi pi-exclamation-triangle',
      acceptIcon: 'pi pi-check mr-2',
      rejectIcon: 'pi pi-times mr-2',
      acceptLabel: this.translocoService.translate('buttons.yes'),
      rejectLabel: this.translocoService.translate('buttons.no'),
      accept: () => {
        this.topics.map((topic) => {
          if (topic.id === idTopic) {
            topic.is_announcement = !value;
          }
        });
        this.forumService.setAnnouncementTopic(idTopic).subscribe({
          next: (res) => {
            this.messageService.setMessage({
              severity: 'success',
              summary: this.translocoService.translate('toast.success'),
              detail: this.translocoService.translate('toast.updateTopic'),
            });
          },
          error: (error) => {
            this.messageService.setMessage({
              severity: 'error',
              summary: this.translocoService.translate('toast.error'),
              detail: this.translocoService.translate('toast.updateTopicError'),
            });
          },
        });
      },
      reject: () => {},
    });
  }

  public lockTopic(idTopic: number, value: boolean): void {
    this.confirmationService.confirm({
      message: value
        ? this.translocoService.translate('forum.unlockTopicQuestion')
        : this.translocoService.translate('forum.lockTopicQuestion'),
      header: value
        ? this.translocoService.translate('forum.unlockTopic')
        : this.translocoService.translate('forum.lockTopic'),
      icon: 'pi pi-exclamation-triangle',
      acceptIcon: value ? 'pi pi-lock-open mr-2' : 'pi pi-lock mr-2',
      rejectIcon: 'pi pi-times mr-2',
      acceptButtonStyleClass: value ? '' : 'p-button-warning',
      acceptLabel: this.translocoService.translate('buttons.yes'),
      rejectLabel: this.translocoService.translate('buttons.no'),
      accept: () => {
        this.topics.map((topic) => {
          if (topic.id === idTopic) {
            topic.is_locked = !value;
          }
        });
        this.forumService.lockOrUnlockTopic(idTopic).subscribe({
          next: (res) => {
            this.messageService.setMessage({
              severity: 'success',
              summary: this.translocoService.translate('toast.success'),
              detail: this.translocoService.translate('toast.updateTopic'),
            });
          },
          error: (error) => {
            this.messageService.setMessage({
              severity: 'error',
              summary: this.translocoService.translate('toast.error'),
              detail: this.translocoService.translate('toast.updateTopicError'),
            });
          },
        });
      },
      reject: () => {},
    });
  }

  public deleteTopic(idTopic: number): void {
    this.confirmationService.confirm({
      message: this.translocoService.translate('forum.deleteTopicQuestion'),
      header: this.translocoService.translate('forum.deleteTopic'),
      icon: 'pi pi-exclamation-triangle',
      acceptIcon: 'pi pi-check mr-2',
      rejectIcon: 'pi pi-times mr-2',
      acceptButtonStyleClass: 'p-button-danger',
      acceptLabel: this.translocoService.translate('buttons.yes'),
      rejectLabel: this.translocoService.translate('buttons.no'),
      accept: () => {
        this.forumService.deleteTopic(idTopic).subscribe({
          next: (res) => {
            this.messageService.setMessage({
              severity: 'success',
              summary: this.translocoService.translate('toast.success'),
              detail: this.translocoService.translate('toast.deleteTopic'),
            });
            const queryString = new URLSearchParams(
              this.queryPagination as any
            ).toString();
            window.location.href = `/forum/topics/${this.idCategory}?${queryString}`;
          },
          error: (error) => {
            this.messageService.setMessage({
              severity: 'error',
              summary: this.translocoService.translate('toast.error'),
              detail: this.translocoService.translate('toast.deleteTopicError'),
            });
          },
        });
      },
      reject: () => {},
    });
  }

  public onPageChange(event: any): void {
    this.queryPagination.page = event.page;
    const queryString = new URLSearchParams(
      this.queryPagination as any
    ).toString();
    window.location.href = `/forum/topics/${this.idCategory}?${queryString}`;
  }

  public search(): void {
    this.queryPagination = { size: 50, page: 0 };
    this.queryPagination.search = this.modelSearch as string;
    const queryString = new URLSearchParams(
      this.queryPagination as any
    ).toString();
    window.location.href = `/forum/topics/${this.idCategory}?${queryString}`;
  }

  public markAllAsViewed(): void {
    this.forumService.markAllAsViewed(this.idCategory).subscribe({
      next: (res) => {
        this.topics = this.topics.map((topic) => {
          topic.new_posts = false;
          return topic;
        });
      },
    });
  }

  public getDateInLocale(date: string, hours: boolean): string {
    const dateAux = new Date(date.replace('Z', ''));

    let options: Intl.DateTimeFormatOptions = {};

    if (hours) {
      options = {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        hour12: true,
      };
    } else {
      options = {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };
    }

    const formatter = new Intl.DateTimeFormat(this.currentLang, options);
    return formatter.format(dateAux);
  }

  private getIsPopular(views: number, replies: number): boolean {
    if (views > 1000 && replies > 300) {
      return true;
    }
    return false;
  }
}

import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DropOption } from '../../../core/models/dropOption';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { CardModule } from 'primeng/card';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TooltipModule } from 'primeng/tooltip';
import { ForumCategory } from '../../../core/models/forumCategory';
import { ForumTopic } from '../../../core/models/forumTopic';
import { User } from '../../../core/models/user';
import { ForumService } from '../../../core/services/forum.service';
import { ToastService } from '../../../core/services/toast.service';
import { SessionService } from '../../../core/services/session.service';
import { PaginatorModule } from 'primeng/paginator';
import { QueryPagination } from '../../../core/models/queryPagination';
import { combineLatest, Subscription } from 'rxjs';
import { ForumPost } from '../../../core/models/forumPost';
import { environment } from '../../../../environments/environment.development';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmationService } from 'primeng/api';
import { SocketService } from '../../../core/services/socket.service';

@Component({
  selector: 'app-posts-list',
  standalone: true,
  imports: [
    TranslocoModule,
    CardModule,
    DropdownModule,
    ButtonModule,
    TableModule,
    ReactiveFormsModule,
    FormsModule,
    TooltipModule,
    PaginatorModule,
    InputTextModule,
    ConfirmDialogModule,
    RouterLink,
  ],
  providers: [ConfirmationService],
  templateUrl: './posts-list.component.html',
  styleUrl: './posts-list.component.scss',
})
export class PostsListComponent implements OnInit, OnDestroy {
  @ViewChild('scroll') scroll!: ElementRef;
  @ViewChild('scrollDown') scrollDown!: ElementRef;

  public idTopic: number = 0;
  public last: boolean = false;
  public modelCategory: number = 0;
  public modelPrevious: string = '';
  public modelSearch: string = '';
  public modelOrder: string = 'ASC';
  public isLoading: boolean = false;
  public user!: User | undefined;
  public topic!: ForumTopic;
  public forumCategories: ForumCategory[] = [];
  public urlImg: string = `${environment.uploads_url}users/`;
  private subscription: Subscription | null = null;
  private currentLang: string = '';
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
  public orderOptions: DropOption[] = [
    { name: 'Oldest First', code: 'ASC' },
    { name: 'Newest First', code: 'DESC' },
  ];

  public first: number = 0;
  public totalRows: number = 0;
  public queryPagination: QueryPagination = {
    size: 20,
    page: 0,
    order: 'ASC',
  };
  public posts: ForumPost[] = [];

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly forumService: ForumService,
    private readonly translocoService: TranslocoService,
    private readonly messageService: ToastService,
    private readonly sessionService: SessionService,
    private readonly confirmationService: ConfirmationService,
    private readonly socketService: SocketService
  ) {
    this.getCategories();

    this.socketService.onForum().subscribe({
      next: (res) => {
        if (res.id_topic == this.idTopic) {
          this.getPostsFromTopic(this.idTopic);
        }
      },
    });

    this.user = this.sessionService.readSession('USER_TOKEN')?.user;

    this.route.paramMap.subscribe((params) => {
      this.idTopic = Number(params.get('idTopic'));
      this.getTopicById(this.idTopic);
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
        this.translocoService.selectTranslate('forum.order.oldest'),
        this.translocoService.selectTranslate('forum.order.newest'),
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
          oldest,
          newest,
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

          this.orderOptions = [
            { name: oldest, code: 'ASC' },
            { name: newest, code: 'DESC' },
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

        if (params['order']) {
          this.queryPagination.order = params['order'] as string;
          this.modelOrder = this.queryPagination.order;
        }
        if (params['opt']) {
          this.last = true;
        }
      }
    });
  }
  ngOnInit(): void {
    this.subscription?.unsubscribe();
    this.subscription = this.translocoService.langChanges$.subscribe((lang) => {
      this.currentLang = lang;
    });

    this.getPostsFromTopic(this.idTopic);
  }

  private getCategories(): void {
    this.forumService.getCategories({ size: 100000, page: 0 }).subscribe({
      next: (res) => {
        this.forumCategories = res.response.data;
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  private getTopicById(id: number): void {
    this.forumService.getTopicById(id, true).subscribe({
      next: (res) => {
        this.topic = res.response;
        this.modelCategory = this.topic.id_categories;
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  private getPostsFromTopic(idTopic: number): void {
    this.forumService.getPosts(this.queryPagination, idTopic).subscribe({
      next: (res) => {
        this.totalRows = res.response.totalRows;
        this.posts = res.response.data;

        this.posts.map((post) => {
          post.location = this.getLocation(
            post.city ?? '',
            post.state ?? '',
            post.country ?? ''
          );
          post.stars = this.getStarts(post.posts ?? 0);
          post.level = this.getUserLevel(post.posts ?? 0);
          post.message = this.wrapBlockquotes(post.message);
        });

        if (this.last) {
          this.last = false;
          const lastPage: number =
            Math.ceil(this.totalRows / this.queryPagination.size) - 1;
          this.queryPagination.page = lastPage;
          this.first = lastPage * this.queryPagination.size;
          this.getPostsFromTopic(idTopic);
          setTimeout(() => {
            this.scrollDownFn();
          }, 200);
        }
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  public deletePost(idPost: number): void {
    this.confirmationService.confirm({
      message: this.translocoService.translate('forum.deletePostQuestion'),
      header: this.translocoService.translate('forum.deletePost'),
      icon: 'pi pi-exclamation-triangle',
      acceptIcon: 'pi pi-trash mr-2',
      rejectIcon: 'pi pi-times mr-2',
      acceptButtonStyleClass: 'p-button-danger',
      acceptLabel: this.translocoService.translate('buttons.yes'),
      rejectLabel: this.translocoService.translate('buttons.no'),
      accept: () => {
        this.forumService.deletePost(idPost).subscribe({
          next: (res) => {
            this.messageService.setMessage({
              severity: 'success',
              summary: this.translocoService.translate('toast.success'),
              detail: this.translocoService.translate('toast.deletePost'),
            });
            this.router.navigate(['forum/posts/' + this.idTopic], {
              queryParams: this.queryPagination,
            });
          },
          error: (error) => {
            this.messageService.setMessage({
              severity: 'error',
              summary: this.translocoService.translate('toast.error'),
              detail: this.translocoService.translate('toast.deletePostError'),
            });
          },
        });
      },
      reject: () => {},
    });
  }

  public changeCategory(): void {
    if (this.modelCategory > 0) {
      this.router.navigateByUrl(`forum/topics/${this.modelCategory}`);
    }
  }

  public changePreviousOption(): void {
    this.queryPagination.previous = this.modelPrevious;
    this.queryPagination.order = this.modelOrder;
    this.queryPagination.page = 0;
    this.router.navigate(['forum/posts/' + this.idTopic], {
      queryParams: this.queryPagination,
    });
  }

  public onPageChange(event: any): void {
    this.queryPagination.page = event.page;
    this.router.navigate(['forum/posts/' + this.idTopic], {
      queryParams: this.queryPagination,
    });
  }

  public search(): void {
    this.queryPagination = { size: 20, page: 0 };
    this.queryPagination.search = this.modelSearch as string;
    this.router.navigate(['forum/posts/' + this.idTopic], {
      queryParams: this.queryPagination,
    });
  }

  private getLocation(city: string, state: string, country: string): string {
    return [city, state, country].filter((value) => value).join(' - ');
  }

  private getStarts(posts: number): number {
    const maxPosts: number = 300;
    const maxStars: number = 5;

    if (posts >= maxPosts) {
      return maxStars;
    }

    return Math.ceil((posts / maxPosts) * maxStars);
  }

  public getStarsArray(stars: number): number[] {
    return Array(stars).fill(0);
  }

  public getUserLevel(posts: number): string {
    if (posts >= 300) return 'senior';
    if (posts >= 200) return 'advanced';
    if (posts >= 100) return 'mid';
    if (posts >= 50) return 'junior';
    return 'newbie';
  }

  public getDateInLocale(date: string, hours: boolean): string {
    const dateAux = new Date(date);

    let options: Intl.DateTimeFormatOptions = {};

    if (hours) {
      options = {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
      };
    } else {
      options = {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      };
    }

    const formatter = new Intl.DateTimeFormat(this.currentLang, options);
    return formatter.format(dateAux);
  }

  public goToNewTopic(): void {
    this.router.navigateByUrl(`forum/topics/new/${this.topic.id_categories}`);
  }

  public goToNewPost(): void {
    this.router.navigateByUrl(`forum/posts/new/${this.topic.id}`);
  }

  public scrollUp(): void {
    this.scroll.nativeElement.scrollIntoView({ behavior: 'smooth' });
  }

  public scrollDownFn(): void {
    this.scrollDown.nativeElement.scrollIntoView({ behavior: 'smooth' });
  }

  public sendMail(email: string): void {
    window.location.href = `mailto:${email}`;
  }

  public goToEdit(id: number): void {
    this.router.navigateByUrl(
      `forum/posts/new/${this.topic.id}?opt=edit&id=${id}`
    );
  }

  public goToQuote(id: number): void {
    this.router.navigateByUrl(
      `forum/posts/new/${this.topic.id}?id_post_reply=${id}`
    );
  }

  public goToChat(username: string): void {
    this.router.navigateByUrl(`messages/?user=${username}`);
  }

  public isModerator(username: string): boolean {
    const category: ForumCategory = this.forumCategories.filter(
      (cat) => (cat.id = this.modelCategory)
    )[0];

    if (category) {
      return category.moderators.includes(username);
    }

    return false;
  }

  public wrapBlockquotes(content: string): string {
    const firstBlockquoteIndex = content.indexOf('<blockquote>');
    const lastBlockquoteIndex = content.lastIndexOf('</blockquote>');

    if (firstBlockquoteIndex === -1 || lastBlockquoteIndex === -1) {
      return content;
    }

    let first: string = content.substring(0, firstBlockquoteIndex);
    first += '<div class="blockquote">';

    let mid: string = content.substring(
      firstBlockquoteIndex + '</blockquote>'.length - 1,
      lastBlockquoteIndex + '</blockquote>'.length
    );
    mid = first + mid + '</div>';

    let last: string = content.substring(
      lastBlockquoteIndex + '</blockquote>'.length,
      content.length
    );

    last = mid + last;

    return last;
  }

  ngOnDestroy() {
    this.socketService.disconnect();
  }
}

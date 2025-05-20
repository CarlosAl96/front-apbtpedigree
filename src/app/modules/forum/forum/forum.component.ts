import { Component } from '@angular/core';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ForumCategory } from '../../../core/models/forumCategory';
import { ForumService } from '../../../core/services/forum.service';
import { QueryPagination } from '../../../core/models/queryPagination';
import { SocketService } from '../../../core/services/socket.service';
import { SessionService } from '../../../core/services/session.service';
import { User } from '../../../core/models/user';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-forum',
  standalone: true,
  imports: [TranslocoModule, CardModule, TableModule],
  templateUrl: './forum.component.html',
  styleUrl: './forum.component.scss',
})
export class ForumComponent {
  public forumCategories: ForumCategory[] = [];
  public totalRows: number = 0;
  public categoriesInfo!: any;
  public user!: User | undefined;
  private subscription: Subscription | null = null;
  private currentLang: string = '';
  public loggeds: number = 0;
  public queryPagination: QueryPagination = {
    size: 50,
    page: 0,
  };

  constructor(
    private readonly translocoService: TranslocoService,
    private readonly forumService: ForumService,
    private readonly socketService: SocketService,
    private readonly sessionService: SessionService
  ) {
    this.getCategories(this.queryPagination);
    this.getCategoriesInfo();
    this.user = this.sessionService.readSession('USER_TOKEN')?.user;

    this.subscription?.unsubscribe();
    this.subscription = this.translocoService.langChanges$.subscribe((lang) => {
      this.currentLang = lang;
    });

    this.socketService.onForum().subscribe({
      next: (res) => {
        this.getCategories(this.queryPagination);
        this.getCategoriesInfo();
      },
    });

    this.socketService.onLogin().subscribe({
      next: (res) => {
        this.getCategoriesInfo();
      },
    });

    this.socketService.onLoginInfo().subscribe({
      next: (res) => {
        this.loggeds = res;
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
      },
      error: (error) => {},
    });
  }

  private getCategoriesInfo(): void {
    this.forumService.getCategoriesInfo().subscribe({
      next: (res) => {
        this.categoriesInfo = res.response;
      },
      error: (error) => {},
    });
  }

  public onPageChange(event: any): void {
    this.queryPagination.page = event.page;
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
      return jsonObject;
    }
    return null;
  }

  public markAllAsViewed(): void {
    this.forumService.markAllForumsAsViewed().subscribe({
      next: (res) => {
        this.forumCategories.map((category) => {
          category.new_posts = false;
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

  public goToCategory(categoryId: number): void {
    window.location.href = '/forum/topics/' + categoryId;
  }
}

import { Component, OnDestroy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ForumCategory } from '../../../core/models/forumCategory';
import { ForumService } from '../../../core/services/forum.service';
import { QueryPagination } from '../../../core/models/queryPagination';
import { DateHourFormatPipe } from '../../../core/pipes/date-hour-format.pipe';
import { SocketService } from '../../../core/services/socket.service';
import { SessionService } from '../../../core/services/session.service';
import { User } from '../../../core/models/user';

@Component({
  selector: 'app-forum',
  standalone: true,
  imports: [
    TranslocoModule,
    CardModule,
    TableModule,
    DateHourFormatPipe,
    RouterLink,
  ],
  templateUrl: './forum.component.html',
  styleUrl: './forum.component.scss',
})
export class ForumComponent implements OnDestroy {
  public forumCategories: ForumCategory[] = [];
  public totalRows: number = 0;
  public categoriesInfo!: any;
  public user!: User | undefined;
  public queryPagination: QueryPagination = {
    size: 50,
    page: 0,
  };

  constructor(
    private readonly router: Router,
    private readonly forumService: ForumService,
    private readonly socketService: SocketService,
    private readonly sessionService: SessionService
  ) {
    this.getCategories(this.queryPagination);
    this.getCategoriesInfo();
    this.user = this.sessionService.readSession('USER_TOKEN')?.user;

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
      error: (error) => {
        console.log(error);
      },
    });
  }

  private getCategoriesInfo(): void {
    this.forumService.getCategoriesInfo().subscribe({
      next: (res) => {
        this.categoriesInfo = res.response;
        console.log(this.categoriesInfo);
      },
      error: (error) => {
        console.log(error);
      },
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

  public goToLastPost(idTopic: number): void {
    const query: QueryPagination = {
      size: 20,
      page: 0,
      order: 'ASC',
    };
    this.router.navigate(['forum/posts/' + idTopic], {
      queryParams: { ...query, opt: 'last' },
    });
  }

  public goToCategory(categoryId: number): void {
    this.router.navigateByUrl(`forum/topics/${categoryId}`);
  }

  ngOnDestroy() {
    this.socketService.disconnect();
  }
}

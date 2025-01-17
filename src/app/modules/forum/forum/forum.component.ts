import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ForumCategory } from '../../../core/models/forumCategory';
import { ForumService } from '../../../core/services/forum.service';
import { QueryPagination } from '../../../core/models/queryPagination';
import { DateHourFormatPipe } from '../../../core/pipes/date-hour-format.pipe';

@Component({
  selector: 'app-forum',
  standalone: true,
  imports: [TranslocoModule, CardModule, TableModule, DateHourFormatPipe],
  templateUrl: './forum.component.html',
  styleUrl: './forum.component.scss',
})
export class ForumComponent {
  public forumCategories: ForumCategory[] = [];
  public totalRows: number = 0;
  public queryPagination: QueryPagination = {
    size: 50,
    page: 0,
  };

  public forum: any[] = [
    {
      id: 1,
      title: 'Titulo 1',
      description:
        'Lorem ipsum dolor sit amet consectetur adipisicing elit. Magni, eius provident! Magni delectus asperiores minima, architecto animi facilis. Sint voluptatem asperiores quia nostrum, in voluptatibus non praesentium voluptatum officiis quod?',
      topics: 230,
      posts: 1564,
      last_post: new Date(),
      author: 'DarkSoul',
    },
    {
      id: 2,
      title: 'Titulo 1',
      description: 'Descripcion',
      topics: 230,
      posts: 1564,
      last_post: new Date(),
      author: 'DarkSoul',
    },
    {
      id: 3,
      title: 'Titulo 1',
      description: 'Descripcion',
      topics: 230,
      posts: 1564,
      last_post: new Date(),
      author: 'DarkSoul',
    },
    {
      id: 4,
      title: 'Titulo 1',
      description: 'Descripcion',
      topics: 230,
      posts: 1564,
      last_post: new Date(),
      author: 'DarkSoul',
    },
    {
      id: 5,
      title: 'Titulo 1',
      description: 'Descripcion',
      topics: 230,
      posts: 1564,
      last_post: new Date(),
      author: 'DarkSoul',
    },
    {
      id: 6,
      title: 'Titulo 1',
      description: 'Descripcion',
      topics: 230,
      posts: 1564,
      last_post: new Date(),
      author: 'DarkSoul',
    },
    {
      id: 7,
      title: 'Titulo 1',
      description: 'Descripcion',
      topics: 230,
      posts: 1564,
      last_post: new Date(),
      author: 'DarkSoul',
    },
  ];

  constructor(
    private readonly router: Router,
    private readonly forumService: ForumService
  ) {
    this.getCategories(this.queryPagination);
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
      return jsonObject.join(', ');
    }
    return null;
  }

  public goToCategory(categoryId: number): void {
    this.router.navigateByUrl(`forum/topics/${categoryId}`);
  }
}

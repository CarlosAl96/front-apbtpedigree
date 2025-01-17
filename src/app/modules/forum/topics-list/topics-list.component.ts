import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DropdownChangeEvent, DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { DropOption } from '../../../core/models/dropOption';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ForumCategory } from '../../../core/models/forumCategory';
import { ForumTopic } from '../../../core/models/forumTopic';
import { ForumService } from '../../../core/services/forum.service';
import { QueryPagination } from '../../../core/models/queryPagination';
import { DateHourFormatPipe } from '../../../core/pipes/date-hour-format.pipe';

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
    DateHourFormatPipe,
  ],
  templateUrl: './topics-list.component.html',
  styleUrl: './topics-list.component.scss',
})
export class TopicsListComponent {
  public idCategory: number = 0;
  public modelCategory: number = 0;
  public modelPrevious: string = '';
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
  public topics: ForumTopic[] = [];
  public totalRows: number = 0;
  public queryPagination: QueryPagination = {
    size: 50,
    page: 0,
  };

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly forumService: ForumService
  ) {
    this.getCategories();
    this.route.paramMap.subscribe((params) => {
      this.idCategory = Number(params.get('idCategory'));
      this.isLoading = true;
      this.modelCategory = this.idCategory;
      this.getCategory(this.idCategory);
      this.getTopicsFromCategory(this.idCategory, this.modelPrevious);
    });
  }

  private getCategory(id: number) {
    this.forumService.getCategoryById(id).subscribe({
      next: (res) => {
        this.forumCategory = res.response;
      },
      error: (error) => {
        console.log(error);
      },
    });
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

  private getTopicsFromCategory(idCategory: number, previous: string): void {
    this.forumService.getTopics(this.queryPagination, idCategory).subscribe({
      next: (res) => {
        this.totalRows = res.response.totalRows;
        this.topics = res.response.data;

        this.topics.map((topic) => {
          topic.last_post_info = this.getLastPostInfo(topic.last_post);
        });
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  public changeCategory(): void {
    if (this.modelCategory > 0) {
      this.router.navigateByUrl(`forum/topics/${this.modelCategory}`);
    }
  }

  public changePreviousOption(): void {
    this.getTopicsFromCategory(this.idCategory, this.modelPrevious);
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

  public goToTopic(categoryId: number): void {
    console.log(categoryId);
    this.router.navigateByUrl(`forum/posts/${categoryId}`);
  }
}

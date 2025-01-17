import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DropOption } from '../../../core/models/dropOption';
import { TranslocoModule } from '@jsverse/transloco';
import { CardModule } from 'primeng/card';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

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
  ],
  templateUrl: './posts-list.component.html',
  styleUrl: './posts-list.component.scss',
})
export class PostsListComponent {
  public idTopic: number = 0;
  public modelCategory: number = 0;
  public modelPrevious: string = '';
  public isLoading: boolean = false;
  public forumCategories: DropOption[] = [
    { name: 'Select a forum', code: 0 },
    { name: 'Categoria 1', code: 1 },
    { name: 'Categoria 2', code: 2 },
  ];
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
  public posts: any[] = [
    {
      id: 1,
      user: {
        username: 'DarkSoul',
        picture:
          'http://localhost:4000/uploads/users/1735394428470-183090561.jpg',
        level: 'Newbie',
        location: 'The Jungle',
        stars: [1, 2, 3, 4, 5],
        joined_date: new Date().toDateString(),
        posts: 70,
      },
      post: {
        message:
          'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Labore, voluptate? Molestiae veritatis id perferendis, eius at sit fuga voluptates ab, est ut amet nihil quos magnam libero aperiam quia nemo?',
        posted_date: new Date(),
      },
    },
    {
      id: 2,
      user: {
        username: 'DarkSoul',
        picture:
          'http://localhost:4000/uploads/users/1735394428470-183090561.jpg',
        level: 'Newbie',
        stars: [1, 2],
        joined_date: new Date().toDateString(),
        posts: 70,
      },
      post: {
        message:
          'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Labore, voluptate? Molestiae veritatis id perferendis, eius at sit fuga voluptates ab, est ut amet nihil quos magnam libero aperiam quia nemo?',
        posted_date: new Date(),
      },
    },
    {
      id: 3,
      user: {
        username: 'DarkSoul',
        picture:
          'http://localhost:4000/uploads/users/1735394428470-183090561.jpg',
        level: 'Newbie',
        location: 'The Jungle',
        stars: [1, 2, 3, 4],
        joined_date: new Date().toDateString(),
        posts: 70,
      },
      post: {
        message:
          'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Labore, voluptate? Molestiae veritatis id perferendis, eius at sit fuga voluptates ab, est ut amet nihil quos magnam libero aperiam quia nemo?',
        posted_date: new Date(),
      },
    },
    {
      id: 4,
      user: {
        username: 'DarkSoul',
        level: 'Newbie',
        stars: [1],
        joined_date: new Date().toDateString(),
        posts: 70,
      },
      post: {
        message:
          'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Labore, voluptate? Molestiae veritatis id perferendis, eius at sit fuga voluptates ab, est ut amet nihil quos magnam libero aperiam quia nemo?',
        posted_date: new Date(),
      },
    },
    {
      id: 5,
      user: {
        username: 'DarkSoul',
        level: 'Newbie',
        stars: [1, 2, 3],
        joined_date: new Date().toDateString(),
        posts: 70,
      },
      post: {
        message:
          'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Labore, voluptate? Molestiae veritatis id perferendis, eius at sit fuga voluptates ab, est ut amet nihil quos magnam libero aperiam quia nemo?',
        posted_date: new Date(),
      },
    },
    {
      id: 6,
      user: {
        username: 'DarkSoul',
        level: 'Newbie',
        stars: [1, 2, 3, 4],
        joined_date: new Date().toDateString(),
        posts: 70,
      },
      post: {
        message:
          'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Labore, voluptate? Molestiae veritatis id perferendis, eius at sit fuga voluptates ab, est ut amet nihil quos magnam libero aperiam quia nemo?',
        posted_date: new Date(),
      },
    },
    {
      id: 7,
      user: {
        username: 'DarkSoul',
        level: 'Newbie',
        stars: [1, 2, 3, 4, 5],
        joined_date: new Date().toDateString(),
        posts: 70,
      },
      post: {
        message:
          'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Labore, voluptate? Molestiae veritatis id perferendis, eius at sit fuga voluptates ab, est ut amet nihil quos magnam libero aperiam quia nemo?',
        posted_date: new Date(),
      },
    },
  ];

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {
    this.route.paramMap.subscribe((params) => {
      this.idTopic = Number(params.get('idTopic'));
      this.isLoading = true;
      this.getPostsFromTopic(this.idTopic, this.modelPrevious);
    });
  }

  private getPostsFromTopic(idTopic: number, previous: string): void {
    console.log(idTopic);
  }

  public changeCategory(): void {
    if (this.modelCategory > 0) {
      this.router.navigateByUrl(`forum/topics/${this.modelCategory}`);
    }
  }

  public changePreviousOption(): void {
    this.getPostsFromTopic(this.idTopic, this.modelPrevious);
  }
}

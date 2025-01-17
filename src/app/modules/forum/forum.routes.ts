import { Routes } from '@angular/router';
import { ForumComponent } from './forum/forum.component';
import { TopicsListComponent } from './topics-list/topics-list.component';
import { PostsListComponent } from './posts-list/posts-list.component';
import { NewPostComponent } from './components/new-post/new-post.component';
import { NewTopicComponent } from './components/new-topic/new-topic.component';

export const FORUM_ROUTES: Routes = [
  { path: '', component: ForumComponent },
  { path: 'topics/:idCategory', component: TopicsListComponent },
  { path: 'posts/:idTopic', component: PostsListComponent },
  { path: 'posts/new/:idPost', component: NewPostComponent },
  { path: 'topics/new', component: NewTopicComponent },
  { path: '**', redirectTo: '' },
];

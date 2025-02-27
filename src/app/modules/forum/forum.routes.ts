import { Routes } from '@angular/router';
import { ForumComponent } from './forum/forum.component';
import { TopicsListComponent } from './topics-list/topics-list.component';
import { PostsListComponent } from './posts-list/posts-list.component';
import { NewPostComponent } from './components/new-post/new-post.component';
import { NewTopicComponent } from './components/new-topic/new-topic.component';
import { ProfileComponent } from './profile/profile.component';

export const FORUM_ROUTES: Routes = [
  { path: '', component: ForumComponent },
  { path: 'topics/:idCategory', component: TopicsListComponent },
  { path: 'posts/:idTopic', component: PostsListComponent },
  { path: 'posts/new/:idTopic', component: NewPostComponent },
  { path: 'topics/new/:idCategory', component: NewTopicComponent },
  { path: 'profile/:username', component: ProfileComponent },
  { path: '**', redirectTo: '' },
];

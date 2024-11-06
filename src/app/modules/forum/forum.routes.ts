import { Routes } from '@angular/router';
import { ForumComponent } from './forum/forum.component';

export const FORUM_ROUTES: Routes = [
  { path: '', component: ForumComponent },
  { path: '**', redirectTo: '' },
];

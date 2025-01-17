import { Routes } from '@angular/router';
import { UsersComponent } from './users/users.component';
import { ForumComponent } from './forum/forum.component';
import { DashboardComponent } from './dashboard/dashboard.component';

export const ADMIN_ROUTES: Routes = [
  { path: 'dashboard', component: DashboardComponent },
  { path: 'users', component: UsersComponent },
  { path: 'forum', component: ForumComponent },
  { path: '**', redirectTo: 'dashboard' },
];

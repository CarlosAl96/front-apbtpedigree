import { Routes } from '@angular/router';
import { UsersComponent } from './users/users.component';
import { ForumComponent } from './forum/forum.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { StreamsComponent } from './streams/streams.component';
import { PaymentsComponent } from './payments/payments.component';

export const ADMIN_ROUTES: Routes = [
  { path: 'dashboard', component: DashboardComponent },
  { path: 'users', component: UsersComponent },
  { path: 'forum', component: ForumComponent },
  { path: 'streams', component: StreamsComponent },
  { path: 'payments', component: PaymentsComponent },
  { path: '**', redirectTo: 'dashboard' },
];

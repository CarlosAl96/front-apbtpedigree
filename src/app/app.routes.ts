import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { noAuthGuard } from './core/guards/no-auth.guard';
import { LayoutComponent } from './shared/layouts/layout-no-menu/layout.component';
import { LayoutMenuComponent } from './shared/layouts/layout-menu/layout-menu.component';

export const routes: Routes = [
  {
    path: 'auth',
    component: LayoutMenuComponent,
    loadChildren: () => import('./auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: 'home',
    component: LayoutMenuComponent,
    loadChildren: () =>
      import('./modules/home/home.routes').then((m) => m.HOME_ROUTES),
  },
  {
    path: 'pedigree',
    component: LayoutComponent,
    loadChildren: () =>
      import('./modules/pedigree/pedigree.routes').then(
        (m) => m.PEDIGREE_ROUTES
      ),
  },
  {
    path: 'account',
    component: LayoutMenuComponent,
    loadChildren: () =>
      import('./modules/account/account.routes').then((m) => m.ACCOUNT_ROUTES),
  },
  {
    path: 'messages',
    component: LayoutMenuComponent,
    loadChildren: () =>
      import('./modules/messages/messages.routes').then(
        (m) => m.MESSAGES_ROUTES
      ),
  },
  {
    path: 'forum',
    component: LayoutMenuComponent,
    loadChildren: () =>
      import('./modules/forum/forum.routes').then((m) => m.FORUM_ROUTES),
  },
  {
    path: 'admin',
    component: LayoutComponent,
    loadChildren: () =>
      import('./admin/admin.routes').then((m) => m.ADMIN_ROUTES),
    //canActivate: [noAuthGuard],
  },
  { path: '**', redirectTo: 'home', pathMatch: 'full' },
];
